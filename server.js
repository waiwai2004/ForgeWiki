import express from 'express';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '50mb' }));

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

// API Routes

// GET all resources
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

// GET single resource type
app.get('/api/resources/:type', async (req, res) => {
  try {
    const result = await pool.query('SELECT data FROM resources WHERE type = $1', [req.params.type]);
    if (result.rows.length === 0) {
      return res.json([]);
    }
    res.json(result.rows[0].data);
  } catch (err) {
    console.error(`Failed to fetch ${req.params.type}:`, err);
    res.status(500).json({ error: `Failed to fetch ${req.params.type}` });
  }
});

// PUT - Replace all data for a resource type
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

// POST - Save all resources at once (bulk update)
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

// DELETE - Clear a resource type
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
