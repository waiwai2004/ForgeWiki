import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Image,
  Upload,
  Trash2,
  Download,
  FolderOpen,
  Palette,
  X,
  Clock,
  FileImage,
  Hammer,
  ShoppingBag,
  LayoutGrid
} from 'lucide-react';

interface ArtAssetItem {
  id: string;
  filename: string;
  category: string;
  url: string;
  size: number;
  uploadedAt: string;
  uploadedBy?: string;
}

interface ArtAssetLibraryProps {
  assets: Record<string, ArtAssetItem[]>;
  onUpload: (category: string, files: File[]) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onDownloadZip: (category?: string) => Promise<void>;
}

const CATEGORIES = [
  { key: 'ui', label: 'UI 素材', icon: LayoutGrid, desc: '按钮、面板等' },
  { key: 'forge', label: '锻造图标', icon: Hammer, desc: '锻造界面图标' },
  { key: 'shop', label: '商店图标', icon: ShoppingBag, desc: '商店界面图标' },
  { key: 'other', label: '其他素材', icon: Palette, desc: '其他美术资源' }
] as const;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp', 'image/gif'];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d} ${h}:${min}`;
}

export const ArtAssetLibrary: React.FC<ArtAssetLibraryProps> = ({
  assets,
  onUpload,
  onDelete,
  onDownloadZip
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('ui');
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewImage, setPreviewImage] = useState<ArtAssetItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentAssets = assets[activeCategory] ?? [];

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(f =>
      ACCEPTED_TYPES.includes(f.type) && f.size <= MAX_FILE_SIZE
    );

    if (validFiles.length === 0) return;

    setUploading(true);
    try {
      await onUpload(activeCategory, validFiles);
    } finally {
      setUploading(false);
    }
  }, [activeCategory, onUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
      e.target.value = '';
    }
  }, [handleFiles]);

  const handleDelete = async (id: string) => {
    await onDelete(id);
  };

  const totalAssetsCount = Object.values(assets).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className="border border-[#b89b5c]/40 rounded-lg bg-black/40 relative shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
      {/* Header badge */}
      <div className="absolute top-0 right-4 transform -translate-y-1/2 bg-black border border-[#b89b5c] text-[#d4a853] text-[10px] font-mono uppercase px-2 py-0.5 rounded tracking-wider flex items-center gap-1">
        <FolderOpen className="w-3 h-3" />
        <span>美术素材库</span>
      </div>

      <div className="p-5 pt-6">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-5">
          {CATEGORIES.map(({ key, label, icon: Icon }) => {
            const count = assets[key]?.length ?? 0;
            const isActive = activeCategory === key;
            return (
              <motion.button
                key={key}
                type="button"
                onClick={() => setActiveCategory(key)}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer
                  ${isActive
                    ? 'bg-[#d4a853]/20 text-[#d4a853] border border-[#d4a853]/50 shadow-[0_0_10px_rgba(212,168,83,0.15)]'
                    : 'bg-neutral-900/60 text-[#b89b5c] border border-[#b89b5c]/20 hover:border-[#b89b5c]/40 hover:text-[#e6d8b5]'
                  }
                `}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${isActive ? 'bg-[#d4a853]/25 text-[#d4a853]' : 'bg-neutral-800 text-neutral-500'}`}>
                  {count}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Action bar: upload zone + download buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          {/* Upload Zone */}
          <div
            className="flex-1"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <motion.div
              animate={{
                borderColor: isDragOver ? '#d4a853' : 'rgba(184,155,92,0.3)',
                backgroundColor: isDragOver ? 'rgba(212,168,83,0.06)' : 'rgba(0,0,0,0.4)',
                scale: isDragOver ? 1.005 : 1
              }}
              transition={{ duration: 0.2 }}
              onClick={() => fileInputRef.current?.click()}
              className="
                border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center
                cursor-pointer transition-colors min-h-[90px]
              "
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp,image/gif"
                onChange={handleInputChange}
                className="hidden"
              />
              <Upload className={`w-5 h-5 mb-1 ${isDragOver ? 'text-[#d4a853]' : 'text-[#b89b5c]/60'}`} />
              <p className={`text-xs ${isDragOver ? 'text-[#d4a853]' : 'text-[#b89b5c]'}`}>
                {uploading ? '上传中...' : isDragOver ? '释放以上传文件' : '点击或拖拽上传图片'}
              </p>
              <p className="text-[10px] text-neutral-500 mt-0.5 font-mono">PNG / JPG / SVG / WebP / GIF · 单文件 ≤ 10MB</p>
            </motion.div>
          </div>

          {/* Download Buttons */}
          <div className="flex sm:flex-col gap-2 sm:w-36">
            <motion.button
              type="button"
              onClick={() => onDownloadZip(activeCategory)}
              disabled={currentAssets.length === 0 || uploading}
              className={`
                flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded text-xs font-medium
                transition-all cursor-pointer border
                ${currentAssets.length === 0 || uploading
                  ? 'bg-neutral-900/40 text-neutral-600 border-neutral-800 cursor-not-allowed'
                  : 'bg-[#d4a853]/12 hover:bg-[#d4a853]/22 text-[#d4a853] border-[#d4a853]/35 hover:shadow-[0_0_10px_rgba(212,168,83,0.2)]'
                }
              `}
              whileHover={currentAssets.length > 0 && !uploading ? { scale: 1.02 } : {}}
              whileTap={currentAssets.length > 0 && !uploading ? { scale: 0.97 } : {}}
            >
              <Download className="w-3.5 h-3.5" />
              打包下载本类 ({currentAssets.length})
            </motion.button>

            <motion.button
              type="button"
              onClick={() => onDownloadZip()}
              disabled={totalAssetsCount === 0 || uploading}
              className={`
                flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded text-xs font-medium
                transition-all cursor-pointer border
                ${totalAssetsCount === 0 || uploading
                  ? 'bg-neutral-900/40 text-neutral-600 border-neutral-800 cursor-not-allowed'
                  : 'bg-[#d4a853]/12 hover:bg-[#d4a853]/22 text-[#d4a853] border-[#d4a853]/35 hover:shadow-[0_0_10px_rgba(212,168,83,0.2)]'
                }
              `}
              whileHover={totalAssetsCount > 0 && !uploading ? { scale: 1.02 } : {}}
              whileTap={totalAssetsCount > 0 && !uploading ? { scale: 0.97 } : {}}
            >
              <FolderOpen className="w-3.5 h-3.5" />
              全部下载 ({totalAssetsCount})
            </motion.button>
          </div>
        </div>

        {/* Asset Grid */}
        <div className="min-h-[120px]">
          {currentAssets.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12 text-neutral-500"
            >
              <Image className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-xs">暂无{CATEGORIES.find(c => c.key === activeCategory)?.label}，请上传图片</p>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {currentAssets.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className="
                      group relative bg-neutral-900/70 border border-neutral-800 rounded-lg overflow-hidden
                      hover:border-[#b89b5c]/40 transition-all cursor-pointer
                    "
                    onClick={() => setPreviewImage(item)}
                  >
                    {/* Thumbnail */}
                    <div className="aspect-square w-full overflow-hidden bg-neutral-950">
                      <img
                        src={item.url}
                        alt={item.filename}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>

                    {/* Delete button - top right */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id);
                      }}
                      className="
                        absolute top-1 right-1 p-1 rounded-full bg-black/70 backdrop-blur-sm
                        text-neutral-400 hover:text-[#a13d3d] hover:bg-black/90
                        opacity-0 group-hover:opacity-100 transition-all
                      "
                      title="删除此素材"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Info overlay at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1.5 pt-4">
                      <p className="text-[10px] text-[#e6d8b5] truncate font-medium" title={item.filename}>
                        {item.filename}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Clock className="w-2.5 h-2.5 text-neutral-500 shrink-0" />
                        <span className="text-[9px] text-neutral-500 font-mono truncate">{formatTime(item.uploadedAt)}</span>
                        <FileImage className="w-2.5 h-2.5 text-neutral-600 shrink-0 ml-auto" />
                        <span className="text-[9px] text-neutral-600 font-mono">{formatFileSize(item.size)}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Lightbox Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
            onClick={() => setPreviewImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative max-w-3xl max-h-[85vh] w-full bg-neutral-950 border border-[#b89b5c]/30 rounded-lg overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.8)]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-black/70 text-neutral-400 hover:text-white hover:bg-black/90 transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Image */}
              <div className="flex items-center justify-center bg-neutral-950 p-4 max-h-[calc(85vh-80px)] overflow-auto">
                <img
                  src={previewImage.url}
                  alt={previewImage.filename}
                  className="max-w-full max-h-[calc(85vh-100px)] object-contain rounded"
                />
              </div>

              {/* Info bar */}
              <div className="border-t border-[#b89b5c]/15 px-4 py-3 bg-black/60">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <p className="text-sm text-[#e6d8b5] font-medium truncate max-w-md">{previewImage.filename}</p>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-neutral-500 font-mono">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(previewImage.uploadedAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileImage className="w-3 h-3" />
                        {formatFileSize(previewImage.size)}
                      </span>
                      {previewImage.uploadedBy && (
                        <span>上传者: {previewImage.uploadedBy}</span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(previewImage.id);
                      setPreviewImage(null);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-[#a13d3d] border border-[#a13d3d]/30 hover:bg-[#a13d3d]/10 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    删除
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
