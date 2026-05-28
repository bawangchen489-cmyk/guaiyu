import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, RotateCcw, AlertTriangle, Inbox } from 'lucide-react';
import { Project, ThemeType } from '../types';

interface RecycleBinViewProps {
  deletedProjects: Project[];
  onRestore: (id: number | string) => void;
  onPermanentDelete: (id: number | string) => void;
  theme: ThemeType;
}

export default function RecycleBinView({ deletedProjects, onRestore, onPermanentDelete, theme }: RecycleBinViewProps) {
  const isDark = theme === 'dark';

  const [confirmDeleteId, setConfirmDeleteId] = React.useState<number | string | null>(null);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0a0a0a] text-white' : 'bg-gray-50 text-black'} pt-24 pb-20 px-4`}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDark ? 'bg-red-500/10' : 'bg-red-50'}`}>
            <Trash2 className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black">回收站</h1>
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              已删除的作品 · {deletedProjects.length} 个
            </p>
          </div>
        </div>

        {/* Empty State */}
        {deletedProjects.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-32 gap-4"
          >
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
              <Inbox className={`w-10 h-10 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
            </div>
            <p className={`text-lg font-bold ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>回收站是空的</p>
            <p className={`text-sm ${isDark ? 'text-gray-700' : 'text-gray-400'}`}>删除的作品会出现在这里</p>
          </motion.div>
        )}

        {/* Deleted Projects Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {deletedProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className={`rounded-2xl overflow-hidden ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'} shadow-lg`}
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover opacity-60 grayscale"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600'}`}>
                      已删除
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className={`font-bold text-lg mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{project.title}</h3>
                  <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{project.category}</p>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => onRestore(project.id)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all
                        ${isDark
                          ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'
                          : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200'
                        }`}
                    >
                      <RotateCcw className="w-4 h-4" />
                      恢复
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(project.id)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all
                        ${isDark
                          ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
                          : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                        }`}
                    >
                      <Trash2 className="w-4 h-4" />
                      永久删除
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Confirm Permanent Delete Modal */}
      <AnimatePresence>
        {confirmDeleteId !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              onClick={() => setConfirmDeleteId(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`relative z-10 w-full max-w-sm rounded-3xl p-6 ${isDark ? 'bg-[#1a1a1a] border border-white/10' : 'bg-white border border-gray-200'} shadow-2xl`}
            >
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-black">永久删除？</h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  此操作不可撤销，作品将被彻底删除，无法恢复。
                </p>
                <div className="flex gap-3 w-full mt-2">
                  <button
                    onClick={() => setConfirmDeleteId(null)}
                    className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${isDark ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    取消
                  </button>
                  <button
                    onClick={() => { onPermanentDelete(confirmDeleteId); setConfirmDeleteId(null); }}
                    className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold text-sm shadow-lg shadow-red-600/30 hover:bg-red-500 transition-all"
                  >
                    永久删除
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
