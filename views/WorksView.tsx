
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Trash2, Play } from 'lucide-react';
import { Project, ThemeType } from '../types';

interface WorksViewProps {
  onProjectClick: (project: Project) => void;
  projects: Project[];
  likedIds: number[];
  onLike: (id: number) => void;
  onDelete: (id: number | string) => void;
  theme: ThemeType;
  isAdmin: boolean;
}

const ProjectCard: React.FC<{ 
  project: Project; 
  isLiked: boolean;
  onLike: (id: number) => void;
  onDelete: (id: number | string) => void;
  onClick: (p: Project) => void; 
  theme: ThemeType;
  isAdmin: boolean;
}> = ({ project, isLiked, onLike, onDelete, onClick, theme, isAdmin }) => {
  const isDark = theme === 'dark';
  const isVideo = project.image.includes('video') || project.category === 'AI作品/视频';
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      whileInView={{ opacity: 1, y: 0 }} 
      viewport={{ once: true }} 
      className="group relative mb-8 break-inside-avoid"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`relative overflow-hidden rounded-[2.5rem] ${isDark ? 'bg-[#1a1a1a] border-white/5' : 'bg-white border-black/5 shadow-xl shadow-black/5'} border hover:border-[#ff5e3a] transition-all duration-500`}>
        
        {/* 最高优先级的按钮层 */}
        <div className="absolute top-6 right-6 flex gap-3 z-[999]">
          {/* 点赞 */}
          <button 
            type="button"
            onClick={(e) => { 
              e.preventDefault();
              e.stopPropagation(); 
              onLike(Number(project.id)); 
            }}
            className={`p-3.5 rounded-full backdrop-blur-md transition-all shadow-xl cursor-pointer pointer-events-auto border border-white/20 ${isLiked ? 'bg-[#ff5e3a] text-white' : 'bg-black/60 text-white/90 hover:bg-black/80'}`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            <span className="absolute -bottom-1 -right-1 bg-white text-black text-[10px] px-1.5 py-0.5 rounded-md font-black shadow-md">{project.likes}</span>
          </button>

          {/* 删除按钮 */}
          {isAdmin && (
            <button 
              type="button"
              onClick={(e) => { 
                e.preventDefault();
                e.stopPropagation(); 
                onDelete(project.id); 
              }}
              className={`p-3.5 rounded-full bg-red-600 text-white hover:bg-red-500 backdrop-blur-md transition-all shadow-xl border border-white/30 cursor-pointer pointer-events-auto ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}
              style={{ transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}
              title="删除此作品"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* 卡片主点击区 */}
        <div onClick={() => onClick(project)} className="relative z-10 cursor-pointer">
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
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent flex flex-col justify-end p-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
             <span className="text-[#ff5e3a] text-[10px] font-black uppercase mb-2 block tracking-widest">{project.category}</span>
             <h3 className="text-2xl font-black text-white tracking-tight leading-tight">{project.title}</h3>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const WorksView: React.FC<WorksViewProps> = ({ onProjectClick, projects, likedIds, onLike, onDelete, theme, isAdmin }) => {
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
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-8 space-y-8">
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
