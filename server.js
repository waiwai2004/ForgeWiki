import express from 'express';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import multer from 'multer';
import archiver from 'archiver';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '50mb' }));

// Ensure upload directory exists
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer config for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const catDir = path.join(UPLOAD_DIR, req.body.category || 'other');
    if (!fs.existsSync(catDir)) fs.mkdirSync(catDir, { recursive: true });
    cb(null, catDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
  fileFilter: (req, file, cb) => {
    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// PostgreSQL connection
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize database tables
async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS resources (
        type TEXT PRIMARY KEY,
        data JSONB NOT NULL DEFAULT '[]'
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS assets (
        id SERIAL PRIMARY KEY,
        filename TEXT NOT NULL,
        original_name TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'other',
        filepath TEXT NOT NULL,
        mimetype TEXT NOT NULL,
        size INTEGER NOT NULL DEFAULT 0,
        uploaded_at TIMESTAMPTZ DEFAULT NOW(),
        uploaded_by TEXT
      )
    `);

    // Create index on category for faster queries
    await client.query(`CREATE INDEX IF NOT EXISTS idx_assets_category ON assets(category)`);

    const types = ['sets', 'items', 'weapons', 'armors', 'enemies', 'events'];
    for (const type of types) {
      await client.query(
        `INSERT INTO resources (type, data) VALUES ($1, '[]') ON CONFLICT (type) DO NOTHING`,
        [type]
      );
    }
    console.log('Database initialized');
  } finally {
    client.release();
  }
}

// ==================== Resources API ====================

app.get('/api/resources', async (req, res) => {
  try {
    const result = await pool.query('SELECT type, data FROM resources');
    const data = {};
    for (const row of result.rows) {
      data[row.type] = row.data;
    }
    res.json(data);
  } catch (err) {
    console.error('Failed to fetch resources:', err);
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

app.get('/api/resources/:type', async (req, res) => {
  try {
    const result = await pool.query('SELECT data FROM resources WHERE type = $1', [req.params.type]);
    if (result.rows.length === 0) return res.json([]);
    res.json(result.rows[0].data);
  } catch (err) {
    console.error(`Failed to fetch ${req.params.type}:`, err);
    res.status(500).json({ error: `Failed to fetch ${req.params.type}` });
  }
});

app.put('/api/resources/:type', async (req, res) => {
  try {
    await pool.query(
      `INSERT INTO resources (type, data) VALUES ($1, $2) ON CONFLICT (type) DO UPDATE SET data = $2`,
      [req.params.type, JSON.stringify(req.body)]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(`Failed to save ${req.params.type}:`, err);
    res.status(500).json({ error: `Failed to save ${req.params.type}` });
  }
});

app.post('/api/resources', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const types = ['sets', 'items', 'weapons', 'armors', 'enemies', 'events'];
    for (const type of types) {
      if (req.body[type] !== undefined) {
        await client.query(
          `INSERT INTO resources (type, data) VALUES ($1, $2) ON CONFLICT (type) DO UPDATE SET data = $2`,
          [type, JSON.stringify(req.body[type])]
        );
      }
    }
    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Failed to save all resources:', err);
    res.status(500).json({ error: 'Failed to save resources' });
  } finally {
    client.release();
  }
});

app.delete('/api/resources/:type', async (req, res) => {
  try {
    await pool.query(
      `INSERT INTO resources (type, data) VALUES ($1, '[]') ON CONFLICT (type) DO UPDATE SET data = '[]'`,
      [req.params.type]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(`Failed to clear ${req.params.type}:`, err);
    res.status(500).json({ error: `Failed to clear ${req.params.type}` });
  }
});

// ==================== Art Assets API ====================

// GET - List all assets grouped by category
app.get('/api/assets', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, filename, original_name, category, mimetype, size, uploaded_at, uploaded_by FROM assets ORDER BY uploaded_at DESC'
    );

    // Group by category
    const grouped = { ui: [], forge: [], shop: [], other: [] };
    for (const row of result.rows) {
      const asset = {
        id: String(row.id),
        filename: row.original_name,
        category: row.category,
        url: `/api/assets/file/${row.id}`,
        size: Number(row.size),
        uploadedAt: new Date(row.uploaded_at).toLocaleString('zh-CN'),
        uploadedBy: row.uploaded_by
      };
      if (grouped[row.category]) {
        grouped[row.category].push(asset);
      } else {
        grouped.other.push(asset);
      }
    }
    res.json(grouped);
  } catch (err) {
    console.error('Failed to fetch assets:', err);
    res.status(500).json({ error: 'Failed to fetch assets' });
  }
});

// POST - Upload files
app.post('/api/assets/upload', upload.array('files', 20), async (req, res) => {
  try {
    const files = req.files;
    const category = req.body.category || 'other';

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      for (const file of files) {
        await client.query(
          `INSERT INTO assets (filename, original_name, category, filepath, mimetype, size)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [file.filename, file.originalname, category, file.path, file.mimetype, file.size]
        );
      }

      await client.query('COMMIT');
      res.json({ success: true, count: files.length });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Upload failed:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// GET - Download a single file by ID
app.get('/api/assets/file/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT filepath, filename, mimetype FROM assets WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'File not found' });

    const { filepath, filename, mimetype } = result.rows[0];
    if (fs.existsSync(filepath)) {
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(filename)}"`);
      res.setHeader('Content-Type', mimetype);
      fs.createReadStream(filepath).pipe(res);
    } else {
      res.status(404).json({ error: 'File not found on disk' });
    }
  } catch (err) {
    console.error('File download failed:', err);
    res.status(500).json({ error: 'Download failed' });
  }
});

// DELETE - Delete an asset by ID
app.delete('/api/assets/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT filepath FROM assets WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Asset not found' });

    // Delete physical file
    const filepath = result.rows[0].filepath;
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }

    // Delete database record
    await pool.query('DELETE FROM assets WHERE id = $1', [req.params.id]);

    res.json({ success: true });
  } catch (err) {
    console.error('Delete failed:', err);
    res.status(500).json({ error: 'Delete failed' });
  }
});

// GET - Download as ZIP (single category or all)
app.get('/api/assets/zip', async (req, res) => {
  try {
    const category = req.query.category;
    let query, params;

    if (category && ['ui', 'forge', 'shop', 'other'].includes(category)) {
      query = 'SELECT filepath, original_name, category FROM assets WHERE category = $1 ORDER BY uploaded_at';
      params = [category];
    } else {
      query = 'SELECT filepath, original_name, category FROM assets ORDER BY category, uploaded_at';
      params = [];
    }

    const result = await pool.query(query, params);
    if (result.rows.length === 0) return res.status(404).json({ error: 'No files found' });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${category ? category + '-' : ''}art-assets.zip"`);

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);

    for (const row of result.rows) {
      if (fs.existsSync(row.filepath)) {
        const zipPath = `${row.category}/${row.original_name}`;
        archive.file(row.filepath, { name: zipPath });
      }
    }

    await archive.finalize();
  } catch (err) {
    console.error('ZIP download failed:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'ZIP download failed' });
    }
  }
});

// Serve static files in production
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 3001;

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
