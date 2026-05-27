
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Trash2, Play, MessageCircle } from 'lucide-react';
import { Project, ThemeType } from '../types';
import { DEFAULT_AVATAR_URL } from '../constants';

interface WorksViewProps {
  onProjectClick: (project: Project) => void;
  projects: Project[];
  likedIds: number[];
  onLike: (id: number) => void;
  onDelete: (id: number | string) => void;
  theme: ThemeType;
  isAdmin: boolean;
  commentCounts?: Record<number, number>;
}

const ProjectCard: React.FC<{
  project: Project;
  isLiked: boolean;
  onLike: (id: number) => void;
  onDelete: (id: number | string) => void;
  onClick: (p: Project) => void;
  theme: ThemeType;
  isAdmin: boolean;
  commentCount: number;
}> = ({ project, isLiked, onLike, onDelete, onClick, theme, isAdmin, commentCount }) => {
  const isDark = theme === 'dark';
  const isVideo = project.image.includes('video') || project.category === 'AI作品/视频';
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative mb-6 break-inside-avoid"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`relative overflow-hidden rounded-2xl ${isDark ? 'bg-[#1a1a1a] border-white/5' : 'bg-white border-black/5 shadow-lg shadow-black/5'} border hover:border-[#ff5e3a]/50 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl ${isDark ? 'hover:shadow-[#ff5e3a]/5' : 'hover:shadow-black/10'}`}
      >
        {/* 图片区域 */}
        <div onClick={() => onClick(project)} className="relative cursor-pointer overflow-hidden">
          {isVideo ? (
            <div className="relative aspect-video">
              <video
                src={project.image}
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                muted
                loop
                autoPlay={isHovered}
                playsInline
              />
              {!isHovered && <Play className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/50 w-12 h-12" />}
            </div>
          ) : (
            <img src={project.image} alt={project.title} className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105" />
          )}

          {/* hover 遮罩 - 只显示分类标签 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        </div>

        {/* 底部信息栏 */}
        <div className={`px-5 py-4 ${isDark ? 'bg-[#1a1a1a]' : 'bg-white'}`}>
          {/* 标题 */}
          <h3
            onClick={() => onClick(project)}
            className={`font-bold text-[15px] mb-3 leading-snug cursor-pointer truncate ${isDark ? 'text-white hover:text-[#ff5e3a]' : 'text-gray-900 hover:text-[#ff5e3a]'} transition-colors`}
          >
            {project.title}
          </h3>

          {/* 作者 + 操作按钮 */}
          <div className="flex items-center justify-between">
            {/* 左：作者 */}
            <div className="flex items-center gap-2 min-w-0">
              <img
                src={project.avatar || DEFAULT_AVATAR_URL}
                className="w-6 h-6 rounded-full object-cover border border-white/10 shrink-0"
                alt={project.author}
                onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_AVATAR_URL; }}
              />
              <span className={`text-xs font-medium truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {project.author}
              </span>
            </div>

            {/* 右：评论数 + 点赞 + 删除 */}
            <div className="flex items-center gap-1 shrink-0">
              {/* 评论数 */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClick(project);
                }}
                className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-bold transition-all ${isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>{commentCount || 0}</span>
              </button>

              {/* 点赞 */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onLike(Number(project.id));
                }}
                className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isLiked
                    ? 'text-[#ff5e3a] bg-[#ff5e3a]/10'
                    : isDark
                      ? 'text-gray-400 hover:text-[#ff5e3a] hover:bg-white/5'
                      : 'text-gray-400 hover:text-[#ff5e3a] hover:bg-gray-100'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                <span>{project.likes}</span>
              </button>

              {/* 管理员删除 */}
              {isAdmin && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete(project.id);
                  }}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer opacity-0 group-hover:opacity-100 ${isDark ? 'text-gray-500 hover:text-red-500 hover:bg-red-500/10' : 'text-gray-300 hover:text-red-500 hover:bg-red-50'}`}
                  title="删除此作品"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const WorksView: React.FC<WorksViewProps> = ({ onProjectClick, projects, likedIds, onLike, onDelete, theme, isAdmin, commentCounts = {} }) => {
  const [activeFilter, setActiveFilter] = useState("全部");
  const filters = ["全部", "电商设计", "品牌设计", "包装设计", "AI作品/视频"];
  const filteredProjects = activeFilter === "全部" ? projects : projects.filter(p => p.category === activeFilter);
  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0a0a0a] text-white' : 'bg-[#f5f5f5] text-black'} pt-32 px-4 md:px-6 pb-20`}>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-black mb-12 tracking-tight">精选作品</h1>
        <div className="flex gap-4 overflow-x-auto pb-4 mb-10 scrollbar-hide">
          {filters.map(f => (
            <button key={f} onClick={() => setActiveFilter(f)} className={`text-sm font-bold whitespace-nowrap px-6 py-2.5 rounded-full transition-all ${activeFilter === f ? 'bg-[#ff5e3a] text-white shadow-lg shadow-[#ff5e3a]/20' : isDark ? 'text-gray-400 hover:text-white bg-white/5' : 'text-gray-600 hover:text-black bg-white shadow-sm border border-black/5'}`}>{f}</button>
          ))}
        </div>
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              isLiked={likedIds.includes(Number(project.id))}
              onLike={onLike}
              onDelete={onDelete}
              onClick={onProjectClick}
              theme={theme}
              isAdmin={isAdmin}
              commentCount={commentCounts[Number(project.id)] || 0}
            />
          ))}
        </div>
        {filteredProjects.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 font-bold italic">暂无该分类作品...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorksView;
