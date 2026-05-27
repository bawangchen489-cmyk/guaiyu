
import React, { useState } from 'react';
import { ArrowLeft, Heart, Share2, Check, Trash2, MessageCircle, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Project, ThemeType, Comment } from '../types';
import { DEFAULT_AVATAR_URL } from '../constants';

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.max(0, now - then);
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return '刚刚';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}天前`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}个月前`;
  return `${Math.floor(months / 12)}年前`;
}

interface ProjectDetailViewProps {
  project: Partial<Project> | null;
  isLiked: boolean;
  onLike: () => void;
  onDelete?: (id: string | number) => void;
  onBack: () => void;
  avatar: string;
  theme: ThemeType;
  isAdmin?: boolean;
  comments?: Comment[];
  onAddComment?: (content: string, userName: string) => void;
  onDeleteComment?: (commentId: number) => void;
}

const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({ project, isLiked, onLike, onDelete, onBack, avatar, theme, isAdmin, comments = [], onAddComment, onDeleteComment }) => {
  const [showCopyMsg, setShowCopyMsg] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [guestName, setGuestName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !onAddComment) return;
    setIsSubmitting(true);
    try {
      await onAddComment(commentText.trim(), guestName.trim() || '游客');
      setCommentText('');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 安全的内容解析器：按行分割，避免对超长 Base64 字符串使用正则导致灵魂掉
  const renderContent = (text: string | undefined) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, index) => {
      const trimmed = line.trim();
      // 匹配 markdown 图片/视频语法：![...](...)  注意：不用正则，用字符串查找
      if (trimmed.startsWith('![') && trimmed.includes('](') && trimmed.endsWith(')')) {
        const closeBracket = trimmed.indexOf('](');
        const altText = trimmed.slice(2, closeBracket);
        const mediaUrl = trimmed.slice(closeBracket + 2, trimmed.length - 1);
        const isVideo = altText.startsWith('video:') ||
          mediaUrl.startsWith('blob:') ||
          mediaUrl.includes('.mp4') ||
          mediaUrl.includes('.webm') ||
          mediaUrl.includes('.mov');
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
      return trimmed ? (
        <p key={index} className={`${isDark ? 'text-gray-400' : 'text-gray-600'} leading-loose text-lg mb-2 whitespace-pre-wrap`}>
          {line}
        </p>
      ) : null;
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

            {/* ========== 评论区 ========== */}
            <div className={`mt-16 pt-12 border-t ${isDark ? 'border-white/5' : 'border-gray-200'}`}>
              <div className="flex items-center gap-3 mb-10">
                <MessageCircle className="w-6 h-6 text-[#ff5e3a]" />
                <h3 className="text-2xl font-black italic">评论 / COMMENTS</h3>
                <span className="bg-[#ff5e3a] text-white text-xs font-black px-2.5 py-1 rounded-full min-w-[24px] text-center">
                  {comments.length}
                </span>
              </div>

              {/* 评论输入区 */}
              <div className={`${isDark ? 'bg-[#111] border-white/5' : 'bg-gray-50 border-gray-200'} border rounded-2xl p-6 mb-10`}>
                <div className="flex gap-4">
                  <div className="shrink-0 pt-1">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ff5e3a] to-[#ff2d7c] flex items-center justify-center text-white font-black text-sm">
                      {(guestName || '游')[0]}
                    </div>
                  </div>
                  <div className="flex-1 space-y-3">
                    <input
                      type="text"
                      placeholder="你的名字"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className={`w-full max-w-[200px] px-4 py-2 rounded-xl text-sm font-medium outline-none transition-all ${isDark ? 'bg-white/5 text-white placeholder-gray-500 focus:bg-white/10 border border-white/5 focus:border-[#ff5e3a]/50' : 'bg-white text-black placeholder-gray-400 focus:bg-white border border-gray-200 focus:border-[#ff5e3a]/50'}`}
                    />
                    <textarea
                      placeholder="写下你的评论..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      rows={3}
                      className={`w-full px-4 py-3 rounded-xl text-sm font-medium outline-none resize-none transition-all ${isDark ? 'bg-white/5 text-white placeholder-gray-500 focus:bg-white/10 border border-white/5 focus:border-[#ff5e3a]/50' : 'bg-white text-black placeholder-gray-400 focus:bg-white border border-gray-200 focus:border-[#ff5e3a]/50'}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                          handleSubmitComment();
                        }
                      }}
                    />
                    <div className="flex items-center justify-between">
                      <span className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Ctrl + Enter 快速发送</span>
                      <button
                        type="button"
                        onClick={handleSubmitComment}
                        disabled={!commentText.trim() || isSubmitting}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                          commentText.trim() && !isSubmitting
                            ? 'bg-[#ff5e3a] text-white shadow-lg shadow-[#ff5e3a]/20 hover:shadow-[#ff5e3a]/40 hover:-translate-y-0.5'
                            : isDark ? 'bg-white/5 text-gray-600 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <Send className="w-3.5 h-3.5" />
                        {isSubmitting ? '发送中...' : '发布评论'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 评论列表 */}
              {comments.length === 0 ? (
                <div className={`text-center py-16 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p className="font-bold text-lg">暂无评论，来说两句吧 🎨</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <AnimatePresence>
                    {comments.map((comment) => (
                      <motion.div
                        key={comment.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.3 }}
                        className={`group/comment flex gap-4 p-5 rounded-2xl transition-colors ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-gray-50'}`}
                      >
                        <div className="shrink-0">
                          <img
                            src={comment.user_avatar || DEFAULT_AVATAR_URL}
                            alt={comment.user_name}
                            className="w-10 h-10 rounded-full object-cover border-2 border-transparent"
                            onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_AVATAR_URL; }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1.5">
                            <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {comment.user_name}
                            </span>
                            <span className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                              {timeAgo(comment.created_at)}
                            </span>
                          </div>
                          <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'} whitespace-pre-wrap break-words`}>
                            {comment.content}
                          </p>
                        </div>
                        {isAdmin && onDeleteComment && (
                          <button
                            type="button"
                            onClick={() => onDeleteComment(comment.id)}
                            className={`self-start p-2 rounded-lg opacity-0 group-hover/comment:opacity-100 transition-all cursor-pointer ${isDark ? 'text-gray-600 hover:text-red-500 hover:bg-red-500/10' : 'text-gray-300 hover:text-red-500 hover:bg-red-50'}`}
                            title="删除评论"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
        </div>
    </div>
  );
};

export default ProjectDetailView;
