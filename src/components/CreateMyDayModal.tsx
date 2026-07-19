import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store/StoreProvider';
import { MyDayItem } from '../services/myDayService';
import { X, Image as ImageIcon, Type, Plus, Loader2 } from 'lucide-react';

interface CreateMyDayModalProps {
  onClose: () => void;
}

const BG_OPTIONS = [
  'from-blue-500 to-indigo-600',
  'from-purple-500 to-indigo-600',
  'from-amber-500 to-orange-600',
  'from-blue-500 to-cyan-600',
  'from-indigo-500 to-blue-600',
  'from-blue-500 to-blue-700',
  'from-violet-500 to-purple-700',
  'from-red-500 to-indigo-600',
];

export default function CreateMyDayModal({ onClose }: CreateMyDayModalProps) {
  const store = useStore();
  const [mode, setMode] = useState<'text' | 'image'>('text');
  const [textContent, setTextContent] = useState('');
  const [selectedBg, setSelectedBg] = useState(BG_OPTIONS[0]);
  const [imageDataUrl, setImageDataUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (isSubmitting) return;
    const items: MyDayItem[] = [];

    if (mode === 'text' && textContent.trim()) {
      items.push({
        id: 'mdi_' + Date.now(),
        type: 'text',
        content: textContent.trim(),
        bgColor: selectedBg,
        createdAt: new Date().toISOString(),
      });
    } else if (mode === 'image' && imageDataUrl) {
      items.push({
        id: 'mdi_' + Date.now(),
        type: 'image',
        content: imageDataUrl,
        createdAt: new Date().toISOString(),
      });
    } else {
      return;
    }

    setIsSubmitting(true);
    const ok = store.createMyDay(items);
    if (!ok) {
      alert('Failed to create story. Storage may be full.');
      setIsSubmitting(false);
      return;
    }
    onClose();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      e.target.value = '';
      return;
    }
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      setImageDataUrl(reader.result as string);
      setIsUploading(false);
    };
    reader.onerror = () => {
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', duration: 0.4 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative">
            <div className="gradient-primary px-5 py-4 flex items-center justify-between">
              <h2 className="text-white font-bold text-lg">Add to Your Day</h2>
              <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div className="flex gap-2">
                <button
                  onClick={() => setMode('text')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    mode === 'text'
                      ? 'gradient-primary text-white shadow-md shadow-blue-500/20'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Type className="w-4 h-4" />
                  Text
                </button>
                <button
                  onClick={() => setMode('image')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    mode === 'image'
                      ? 'gradient-primary text-white shadow-md shadow-blue-500/20'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  Photo
                </button>
              </div>

              <AnimatePresence mode="wait">
                {mode === 'text' ? (
                  <motion.div
                    key="text"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div className={`rounded-2xl bg-gradient-to-br ${selectedBg} p-6 min-h-[180px] flex items-center justify-center`}>
                      <textarea
                        className="w-full h-full min-h-[140px] bg-transparent text-white text-xl font-bold text-center placeholder-white/60 resize-none outline-none border-none"
                        placeholder="Share what's on your mind..."
                        value={textContent}
                        onChange={(e) => setTextContent(e.target.value)}
                        autoFocus
                        maxLength={280}
                      />
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Background</p>
                      <div className="flex flex-wrap gap-2">
                        {BG_OPTIONS.map((bg) => (
                          <button
                            key={bg}
                            onClick={() => setSelectedBg(bg)}
                            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${bg} transition-all ${
                              selectedBg === bg ? 'ring-2 ring-blue-500 ring-offset-2 scale-110' : 'hover:scale-105'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="image"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    {isUploading ? (
                      <div className="rounded-2xl bg-[#F8F3F0] border-2 border-dashed border-gray-300 p-10 flex flex-col items-center justify-center min-h-[200px]">
                        <Loader2 className="w-8 h-8 text-[#014BAA] animate-spin mb-3" />
                        <p className="text-sm text-gray-500">Uploading image...</p>
                      </div>
                    ) : imageDataUrl ? (
                      <div className="relative rounded-2xl overflow-hidden border border-gray-200">
                        <img src={imageDataUrl} alt="Story" className="w-full max-h-[280px] object-cover" />
                        <button
                          onClick={() => setImageDataUrl('')}
                          className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-full transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => imageInputRef.current?.click()}
                        className="w-full rounded-2xl bg-[#F8F3F0] border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50/30 p-10 flex flex-col items-center justify-center min-h-[200px] transition-colors"
                      >
                        <ImageIcon className="w-10 h-10 text-gray-400 mb-3" />
                        <p className="text-sm font-medium text-gray-600">Tap to select a photo</p>
                        <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF</p>
                      </button>
                    )}
                    <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={isSubmitting || (mode === 'text' ? !textContent.trim() : !imageDataUrl)}
                className="w-full gradient-primary text-white py-3 rounded-xl font-semibold text-sm transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Share to My Day
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}