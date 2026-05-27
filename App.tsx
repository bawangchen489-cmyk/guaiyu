
import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { INITIAL_PROJECTS, DEFAULT_AVATAR_URL } from './constants';
import { Project, ViewType, ThemeType, UserInfo, Comment } from './types';
import Navbar from './components/Navbar';
import SplashScreen from './components/SplashScreen';
import PersonalHomeView from './views/PersonalHomeView';
import WorksView from './views/WorksView';
import AboutView from './views/AboutView';
import UploadView from './views/UploadView';
import ProjectDetailView from './views/ProjectDetailView';
import LoginView from './views/LoginView';
import { Trash2, AlertTriangle, X } from 'lucide-react';

// Supabase services
import * as projectService from './services/projectService';
import * as authService from './services/authService';
import * as commentService from './services/commentService';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [hasEntered, setHasEntered] = useState(() => {
    return sessionStorage.getItem('guaiyu_has_entered') === 'true';
  });
  const [currentView, setCurrentView] = useState<ViewType>(() => {
    return (sessionStorage.getItem('guaiyu_current_view') as ViewType) || 'home';
  });
  const [selectedProject, setSelectedProject] = useState<Project | null>(() => {
    try {
      const saved = sessionStorage.getItem('guaiyu_selected_project');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [uploadDraft, setUploadDraft] = useState<Partial<Project> | null>(null);
  const [theme, setTheme] = useState<ThemeType>('dark');
  const [scrolled, setScrolled] = useState(false);

  // 删除确认状态
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | string | null>(null);

  // 数据加载状态
  const [dataLoading, setDataLoading] = useState(true);

  // 项目列表 - 从 Supabase 加载，不再使用 INITIAL_PROJECTS 作为默认值
  const [projects, setProjects] = useState<Project[]>([]);

  // 用户信息
  const [userInfo, setUserInfo] = useState<UserInfo>(() => {
    return authService.getCurrentUser();
  });

  const isAdmin = userInfo.status === 'authenticated';

  // 评论系统
  const [commentCounts, setCommentCounts] = useState<Record<number, number>>({});
  const [projectComments, setProjectComments] = useState<Comment[]>([]);

  // 点赞列表 (这个数据很小，存本地没问题)
  const [likedProjectIds, setLikedProjectIds] = useState<number[]>(() => {
    const saved = localStorage.getItem('guaiyu_liked_projects');
    return saved ? JSON.parse(saved) : [];
  });

  // 从 Supabase 加载项目数据（如未连接则使用 localStorage 本地缓存）
  useEffect(() => {
    async function loadProjects() {
      try {
        const supabaseProjects = await projectService.getProjects();
        setProjects(supabaseProjects);
      } catch (error) {
        console.warn('Supabase 加载失败，尝试 localStorage 本地缓存:', error);
        // 优先读本地缓存，实在没有再用初始数据
        const saved = localStorage.getItem('guaiyu_projects_list');
        if (saved) {
          try {
            setProjects(JSON.parse(saved));
          } catch {
            setProjects(INITIAL_PROJECTS);
          }
        } else {
          setProjects(INITIAL_PROJECTS);
        }
      } finally {
        setDataLoading(false);
      }
    }
    loadProjects();
  }, []);

  // 加载评论数
  useEffect(() => {
    async function loadCommentCounts() {
      try {
        const counts = await commentService.getCommentCounts();
        setCommentCounts(counts);
      } catch (error) {
        console.warn('Failed to load comment counts:', error);
      }
    }
    loadCommentCounts();
  }, []);

  // 当选中项目变化时，加载该项目的评论
  useEffect(() => {
    if (!selectedProject) {
      setProjectComments([]);
      return;
    }
    async function loadComments() {
      try {
        const comments = await commentService.getComments(selectedProject!.id);
        setProjectComments(comments);
      } catch (error) {
        console.warn('Failed to load comments:', error);
      }
    }
    loadComments();
  }, [selectedProject?.id]);

  // ✅ 修改点3：删除了那个把 projects 存入 localStorage 的 useEffect
  // 原来的代码在这里会导致 quota exceeded 错误，现在直接依靠 Supabase 数据库即可

  // 保存用户信息
  useEffect(() => {
    authService.saveUserToLocal(userInfo);
  }, [userInfo]);

  // 保存点赞列表
  useEffect(() => {
    localStorage.setItem('guaiyu_liked_projects', JSON.stringify(likedProjectIds));
  }, [likedProjectIds]);

  // 持久化 hasEntered, currentView, selectedProject 到 sessionStorage
  useEffect(() => {
    sessionStorage.setItem('guaiyu_has_entered', String(hasEntered));
  }, [hasEntered]);

  useEffect(() => {
    sessionStorage.setItem('guaiyu_current_view', currentView);
  }, [currentView]);

  useEffect(() => {
    if (selectedProject) {
      sessionStorage.setItem('guaiyu_selected_project', JSON.stringify(selectedProject));
    } else {
      sessionStorage.removeItem('guaiyu_selected_project');
    }
  }, [selectedProject]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const handleLikeToggle = async (projectId: number) => {
    const isLiked = likedProjectIds.includes(projectId);

    // 乐观更新 UI
    if (isLiked) {
      setLikedProjectIds(prev => prev.filter(id => id !== projectId));
      setProjects(pts => pts.map(p => p.id === projectId ? { ...p, likes: Math.max(0, p.likes - 1) } : p));
    } else {
      setLikedProjectIds(prev => [...prev, projectId]);
      setProjects(pts => pts.map(p => p.id === projectId ? { ...p, likes: (Number(p.likes) || 0) + 1 } : p));
    }

    // 同步到 Supabase
    try {
      if (isLiked) {
        await projectService.decrementLikes(projectId);
      } else {
        await projectService.incrementLikes(projectId);
      }
    } catch (error) {
      console.error('Failed to sync like to Supabase:', error);
    }
  };

  const confirmDelete = async () => {
    if (deleteConfirmId) {
      // 乐观更新 UI
      setProjects(prev => prev.filter(p => String(p.id) !== String(deleteConfirmId)));

      if (currentView === 'projectDetail' || currentView === 'preview') {
        setCurrentView('works');
        setSelectedProject(null);
      }

      // 同步到 Supabase
      try {
        await projectService.deleteProject(deleteConfirmId);
      } catch (error) {
        console.error('Failed to delete from Supabase:', error);
      }

      setDeleteConfirmId(null);
    }
  };

  const handleLogin = async (codename: string, name: string, avatar: string) => {
    try {
      const user = await authService.loginWithCodename(codename, name, avatar);
      setUserInfo(user);
      setCurrentView('home');
    } catch (error) {
      console.error('Login failed:', error);
      // 回退到本地登录
      setUserInfo({ codename, name, avatar, status: 'authenticated' });
      setCurrentView('home');
    }
  };

  const handleLogout = () => {
    const guestUser = authService.logout();
    setUserInfo(guestUser);
    setLikedProjectIds([]);
    setCurrentView('home');
  };

  const handlePublishProject = async (project: Project) => {
    // 乐观更新 UI
    setProjects([project, ...projects]);
    setUploadDraft(null);
    setCurrentView('works');

    // 同步到 Supabase
    try {
      const createdProject = await projectService.createProject(project);
      // 用 Supabase 返回的真实 ID 更新
      setProjects(prev => prev.map(p =>
        p.id === project.id ? { ...p, id: createdProject.id } : p
      ));
    } catch (error) {
      console.error('Failed to save project to Supabase:', error);
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <PersonalHomeView onNavigate={setCurrentView} projects={projects} avatar={userInfo.avatar} theme={theme} />;
      case 'works':
        return <WorksView projects={projects} likedIds={likedProjectIds} onLike={handleLikeToggle} onDelete={(id) => setDeleteConfirmId(id)} onProjectClick={(p) => { setSelectedProject(p); setCurrentView('projectDetail'); window.scrollTo(0, 0); }} theme={theme} isAdmin={isAdmin} commentCounts={commentCounts} />;
      case 'projectDetail': {
        const liveProject = projects.find(p => String(p.id) === String(selectedProject?.id)) || selectedProject;
        return (
          <ProjectDetailView
            project={liveProject}
            isLiked={likedProjectIds.includes(Number(selectedProject?.id))}
            onLike={() => handleLikeToggle(Number(selectedProject?.id))}
            onDelete={(id) => setDeleteConfirmId(id)}
            onBack={() => setCurrentView('works')}
            theme={theme}
            avatar={userInfo.avatar}
            isAdmin={isAdmin}
            comments={projectComments}
            onAddComment={async (content: string, userName: string) => {
              const newComment = await commentService.addComment(
                selectedProject!.id,
                userName,
                DEFAULT_AVATAR_URL,
                content
              );
              if (newComment) {
                setProjectComments(prev => [newComment, ...prev]);
                setCommentCounts(prev => ({
                  ...prev,
                  [Number(selectedProject!.id)]: (prev[Number(selectedProject!.id)] || 0) + 1
                }));
              }
            }}
            onDeleteComment={async (commentId: number) => {
              await commentService.deleteComment(commentId);
              setProjectComments(prev => prev.filter(c => c.id !== commentId));
              setCommentCounts(prev => ({
                ...prev,
                [Number(selectedProject!.id)]: Math.max(0, (prev[Number(selectedProject!.id)] || 0) - 1)
              }));
            }}
          />
        );
      }
      case 'upload':
        return (
          <UploadView
            initialData={uploadDraft}
            onBack={() => { setUploadDraft(null); setCurrentView('home'); }}
            onPreview={(d) => { setUploadDraft(d); setCurrentView('preview'); window.scrollTo(0, 0); }}
            onPublish={handlePublishProject}
            theme={theme}
          />
        );
      case 'preview':
        return (
          <ProjectDetailView
            project={{ ...uploadDraft, author: userInfo.name, avatar: userInfo.avatar, likes: 0, views: 0 } as Project}
            isLiked={false}
            onLike={() => { }}
            onBack={() => setCurrentView('upload')}
            theme={theme}
            avatar={userInfo.avatar}
          />
        );
      case 'about':
        return <AboutView avatar={userInfo.avatar} userInfo={userInfo} onAvatarUpload={async (f) => {
          try {
            const avatarUrl = await authService.uploadAvatar(f);
            // 更新 state → 触发 useEffect 自动保存到 localStorage → 刷新后保留
            setUserInfo(prev => ({ ...prev, avatar: avatarUrl }));
            // 同步更新 Supabase 用户记录
            if (userInfo.codename) {
              await authService.updateAvatar(userInfo.codename, avatarUrl);
            }
          } catch (err) {
            console.error('头像上传失败:', err);
          }
        }} theme={theme} />;
      case 'login':
        return <LoginView onLogin={handleLogin} onGuest={() => setCurrentView('home')} theme={theme} />;
      default:
        return <PersonalHomeView onNavigate={setCurrentView} projects={projects} avatar={userInfo.avatar} theme={theme} />;
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#0a0a0a]' : 'bg-gray-100'} font-sans selection:bg-[#ff5e3a] selection:text-white`}>
      <AnimatePresence>{!hasEntered && <SplashScreen onEnter={() => setHasEntered(true)} avatar={userInfo.avatar} />}</AnimatePresence>
      <Navbar onNavigate={setCurrentView} currentView={currentView} userInfo={userInfo} onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} scrolled={scrolled} />

      <main>
        <AnimatePresence mode="wait">
          <motion.div key={currentView} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {deleteConfirmId !== null && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteConfirmId(null)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className={`relative w-full max-w-sm ${theme === 'dark' ? 'bg-[#111] border-white/10 shadow-[0_0_50px_rgba(255,0,0,0.2)]' : 'bg-white border-black/5 shadow-2xl'} border-4 rounded-[2rem] p-8 overflow-hidden`}>
              <div className="absolute top-0 left-0 w-full h-2 bg-red-600"></div>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-red-600/10 text-red-600 rounded-full flex items-center justify-center mb-6"><AlertTriangle className="w-8 h-8" /></div>
                <h2 className={`text-2xl font-black mb-2 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>确认删除?</h2>
                <p className="text-gray-500 text-sm mb-8 font-medium">此作品一旦从数据库中移除将无法恢复。你确定要继续吗？</p>
                <div className="grid grid-cols-2 gap-4 w-full">
                  <button onClick={() => setDeleteConfirmId(null)} className={`py-3 rounded-xl font-black text-sm transition-all ${theme === 'dark' ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-gray-100 text-black hover:bg-gray-200'}`}>取消</button>
                  <button onClick={confirmDelete} className="py-3 rounded-xl bg-red-600 text-white font-black text-sm shadow-lg shadow-red-600/30 hover:bg-red-500 transition-all flex items-center justify-center gap-2"><Trash2 className="w-4 h-4" /> 确认删除</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className={`${theme === 'dark' ? 'bg-[#050505] border-white/5' : 'bg-white border-gray-200'} border-t py-12 text-center text-gray-500 text-sm`}><p>© 2026 陈衍文. All rights reserved.</p></footer>
    </div>
  );
}