
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Menu, X, Sun, Moon, LogOut, ShieldCheck, Lock } from 'lucide-react';
import { ViewType, ThemeType, UserInfo } from '../types';

interface NavbarProps {
  scrolled: boolean;
  onNavigate: (view: ViewType) => void;
  currentView: ViewType;
  userInfo: UserInfo;
  onLogout: () => void;
  theme: ThemeType;
  toggleTheme: () => void;
}

// 管理员入口激活序列
const ADMIN_SEQUENCE = ['a', 'd', 'm', 'i', 'n'];

const Navbar: React.FC<NavbarProps> = ({ scrolled, onNavigate, currentView, userInfo, onLogout, theme, toggleTheme }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [keySequence, setKeySequence] = useState<string[]>([]);
  const isDark = theme === 'dark';
  const isAdmin = userInfo.status === 'authenticated';
  const textColor = isDark ? 'text-white' : 'text-black';
  const navBg = (currentView === 'home' && !scrolled) ? 'bg-transparent' : isDark ? 'bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/10' : 'bg-white/90 backdrop-blur-md border-b border-black/10';

  // 使用 ref 保存最新的 onNavigate 引用
  const onNavigateRef = React.useRef(onNavigate);
  onNavigateRef.current = onNavigate;

  // 监听键盘输入，检测 "admin" 序列
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 忽略输入框中的按键
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const key = e.key.toLowerCase();
      if (key.length !== 1) return; // 只处理单字符按键

      setKeySequence(prev => {
        const newSeq = [...prev, key].slice(-5);
        if (newSeq.join('') === ADMIN_SEQUENCE.join('')) {
          // 使用 ref 确保获取最新的函数引用
          onNavigateRef.current('login');
          return [];
        }
        return newSeq;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []); // 空依赖数组，只挂载一次

  const navItems: { id: ViewType; label: string }[] = [
    { id: 'home', label: '首页' },
    { id: 'works', label: '作品展示' },
    { id: 'about', label: '关于我' }
  ];

  const handleNavigate = (view: ViewType) => {
    onNavigate(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${navBg} py-4`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <div
          onClick={() => handleNavigate('home')}
          className="cursor-pointer flex items-center gap-3 group"
        >
          <div className="relative">
            <img
              src={userInfo.avatar}
              className="w-10 h-10 rounded-full border-2 border-[#ff5e3a] object-cover transform group-hover:scale-110 transition-transform shadow-lg shadow-[#ff5e3a]/20"
              alt="Avatar Logo"
            />
            {isAdmin && (
              <div className="absolute -bottom-1 -right-1 bg-[#ff5e3a] p-0.5 rounded-full border border-white dark:border-black">
                <ShieldCheck className="w-2.5 h-2.5 text-white" />
              </div>
            )}
          </div>
          <span className={`text-xl font-black tracking-tighter ${textColor} uppercase`}>GUAIYU</span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              className={`text-sm font-bold tracking-widest uppercase transition-all relative py-1 ${currentView === item.id
                ? 'text-[#ff5e3a]'
                : `${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'}`
                }`}
            >
              {item.label}
              {currentView === item.id && (
                <motion.div
                  layoutId="nav-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff5e3a]"
                />
              )}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-black/5 text-gray-500'}`}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {isAdmin ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#ff5e3a]/30 ${isDark ? 'bg-[#ff5e3a]/10' : 'bg-[#ff5e3a]/5'} transition-all`}
              >
                <ShieldCheck className="w-4 h-4 text-[#ff5e3a]" />
                <span className={`text-xs font-bold text-[#ff5e3a]`}>管理员</span>
              </button>

              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={`absolute top-full right-0 mt-2 w-48 rounded-2xl border ${isDark ? 'bg-[#111] border-white/10 shadow-2xl shadow-black' : 'bg-white border-black/5 shadow-xl'} overflow-hidden z-50`}
                  >
                    <div className="px-4 py-3 border-b border-white/5">
                      <p className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>管理员身份</p>
                      <p className={`text-sm font-black ${textColor} truncate`}>{userInfo.name}</p>
                    </div>
                    <button
                      onClick={() => { handleNavigate('upload'); setIsUserMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold ${isDark ? 'hover:bg-white/5 text-gray-300' : 'hover:bg-black/5 text-gray-600'} transition-colors`}
                    >
                      <Upload className="w-4 h-4 text-[#ff5e3a]" /> 发布作品
                    </button>
                    <button
                      onClick={() => { onLogout(); setIsUserMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold ${isDark ? 'hover:bg-white/5 text-red-400' : 'hover:bg-red-50 text-red-500'} transition-colors border-t border-white/5`}
                    >
                      <LogOut className="w-4 h-4" /> 退出登录
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            // 游客状态 - 不显示登录按钮，但保留隐藏入口提示
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}
              title="输入 'admin' 进入管理员登录"
            >
              <Lock className="w-4 h-4 text-gray-500" />
              <span className={`text-xs font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>游客浏览</span>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className={textColor} /> : <Menu className={textColor} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={`md:hidden overflow-hidden ${isDark ? 'bg-[#0a0a0a]' : 'bg-white'} border-t border-white/5`}
          >
            <div className="flex flex-col p-6 gap-6">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`text-left text-lg font-black tracking-widest uppercase ${currentView === item.id ? 'text-[#ff5e3a]' : textColor
                    }`}
                >
                  {item.label}
                </button>
              ))}
              <div className="flex items-center justify-between pt-6 border-t border-white/5">
                <div className="flex items-center gap-4">
                  <button onClick={toggleTheme} className={textColor}>
                    {isDark ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                  </button>
                </div>
                {isAdmin ? (
                  <button onClick={onLogout} className="text-red-500 font-bold flex items-center gap-2">
                    <LogOut className="w-4 h-4" /> 退出
                  </button>
                ) : (
                  <span className="text-gray-500 text-sm font-bold">游客模式</span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
