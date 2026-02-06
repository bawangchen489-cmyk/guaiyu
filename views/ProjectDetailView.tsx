
import React, { useState } from 'react';
import { ArrowLeft, Heart, Share2, Check, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Project, ThemeType } from '../types';
import { DEFAULT_AVATAR_URL } from '../constants';

interface ProjectDetailViewProps {
  project: Partial<Project> | null;
  isLiked: boolean;
  onLike: () => void;
  onDelete?: (id: string | number) => void;
  onBack: () => void;
  avatar: string;
  theme: ThemeType;
  isAdmin?: boolean;
}

const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({ project, isLiked, onLike, onDelete, onBack, avatar, theme, isAdmin }) => {
  const [showCopyMsg, setShowCopyMsg] = useState(false);
  if (!project) return null;
  const isDark = theme === 'dark';

  const copyToClipboard = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      setShowCopyMsg(true);
      setTimeout(() => setShowCopyMsg(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: project.title || 'GUAIYU Portfolio',
      text: project.description || '',
      url: window.location.href,
    };

    const canShare = !!navigator.share && 
                     (window.location.protocol === 'http:' || window.location.protocol === 'https:');

    if (canShare) {
      try {
        await navigator.share(shareData);
      } catch (e) {
        console.warn('Navigator share failed, falling back to clipboard:', e);
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };
  
  const renderContent = (text: string | undefined) => {
    if (!text) return null;
    return text.split(/(!\[.*?\]\(.*?\))/g).map((part, index) => {
      const match = part.match(/!\[(.*?)\]\((.*?)\)/);
      if (match) {
        const altText = match[1];
        const mediaUrl = match[2];
        const isVideo = altText.startsWith('video:');
        
        if (isVideo) {
          return (
            <video 
              key={index} 
              src={mediaUrl} 
              controls 
              muted 
              loop 
              playsInline 
              className="w-full rounded-2xl my-8 shadow-lg bg-black/5"
            />
          );
        } else {
          return (
            <img 
              key={index} 
              src={mediaUrl} 
              className="w-full rounded-2xl my-8 shadow-lg" 
              alt={altText} 
            />
          );
        }
      }
      return part.trim() && <p key={index} className={`${isDark ? 'text-gray-400' : 'text-gray-600'} leading-loose text-lg mb-6 whitespace-pre-wrap`}>{part}</p>;
    });
  };

  const isCoverVideo = 
    project.image?.includes('#video') || 
    project.image?.includes('video') || 
    project.category === 'AI作品/视频';

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0a0a0a] text-white' : 'bg-white text-black'} pt-24 pb-20 px-4`}>
        <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <button onClick={onBack} className={`flex items-center gap-2 ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'} transition-colors cursor-pointer`}><ArrowLeft className="w-5 h-5"/> 返回</button>
              <div className="flex gap-4 items-center">
                {isAdmin && project.id && onDelete && (
                  <button 
                    type="button"
                    onClick={() => onDelete(project.id!)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full font-bold bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-600/20 transition-all mr-2 cursor-pointer pointer-events-auto"
                  >
                    <Trash2 className="w-4 h-4" /> 删除作品
                  </button>
                )}
                
                <button 
                  type="button"
                  onClick={onLike}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold transition-all cursor-pointer ${isLiked ? 'bg-[#ff5e3a] text-white shadow-lg shadow-[#ff5e3a]/30' : isDark ? 'bg-white/5 text-white' : 'bg-gray-100 text-black hover:bg-gray-200'}`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} /> {project.likes}
                </button>
                
                <div className="relative">
                  <button onClick={handleShare} className={`p-2.5 rounded-full cursor-pointer ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'} transition-all`}>
                    <Share2 className="w-5 h-5" />
                  </button>
                  <AnimatePresence>
                    {showCopyMsg && (
                      <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:10}} className="absolute bottom-full right-0 mb-4 whitespace-nowrap bg-[#00eaff] text-black text-[10px] font-black px-3 py-1.5 rounded-lg shadow-xl flex items-center gap-1">
                        <Check className="w-3 h-3"/> 已复制链接
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between gap-6 mb-12">
                <div>
                    <span className="bg-[#ff5e3a] text-white text-xs px-2 py-1 rounded font-bold mb-4 inline-block tracking-widest">{project.category}</span>
                    <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter">{project.title}</h1>
                    <div className="flex items-center gap-4">
                        <img src={avatar || project.avatar || DEFAULT_AVATAR_URL} className="w-12 h-12 rounded-full border-2 border-[#ff5e3a] object-cover" />
                        <div><p className="font-black">{project.author}</p><p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Designer</p></div>
                    </div>
                </div>
            </div>
            
            <div className="w-full rounded-3xl mb-16 shadow-2xl overflow-hidden bg-black/5">
              {isCoverVideo ? (
                <video src={project.image} controls autoPlay muted loop playsInline className="w-full block" />
              ) : (
                <img src={project.image} className="w-full block" alt={project.title} />
              )}
            </div>

            <div className="grid md:grid-cols-3 gap-16">
                <div className="md:col-span-2">
                  <h3 className="text-2xl font-black mb-6 italic border-b border-gray-500/10 pb-2">关于项目 / PROJECT INFO</h3>
                  {renderContent(project.description)}
                </div>
                <div className="md:col-span-1">
                    <div className={`${isDark ? 'bg-[#111] border-white/5 shadow-2xl' : 'bg-gray-50 border-gray-200'} p-8 rounded-[2rem] border sticky top-32`}>
                        <h4 className="font-black mb-6 italic tracking-widest text-sm text-[#ff5e3a]">参数 / SPECS</h4>
                        <div className="space-y-6 text-sm font-bold">
                            <div className="flex justify-between border-b border-gray-500/10 pb-2"><span className="text-gray-500 uppercase">客户</span><span className={isDark ? 'text-white' : 'text-black'}>{project.client || "个人项目"}</span></div>
                            <div className="flex justify-between border-b border-gray-500/10 pb-2"><span className="text-gray-500 uppercase">工具</span><span className={isDark ? 'text-white' : 'text-black'}>{project.tools || "Figma / Blender"}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500 uppercase">日期</span><span className={isDark ? 'text-white' : 'text-black'}>{project.date}</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default ProjectDetailView;
