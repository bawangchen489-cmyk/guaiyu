
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, User, Lock, ShieldCheck, Zap, AlertCircle } from 'lucide-react';
import { ThemeType } from '../types';
import { DEFAULT_AVATAR_URL } from '../constants';
import * as authService from '../services/authService';

// 管理员密码 (生产环境应使用环境变量)
const ADMIN_PASSWORD = 'guaiyu..';

interface LoginViewProps {
  onLogin: (codename: string, name: string, avatar: string) => void;
  onGuest: () => void;
  theme: ThemeType;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin, onGuest, theme }) => {
  const [password, setPassword] = useState('');
  const [nickName, setNickName] = useState('');
  const [avatar, setAvatar] = useState(DEFAULT_AVATAR_URL);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDark = theme === 'dark';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsScanning(true);
      try {
        const avatarUrl = await authService.uploadAvatar(e.target.files[0]);
        setAvatar(avatarUrl);
      } catch (err) {
        console.error('头像上传失败:', err);
        // 上传失败时用本地预览作为临时头像
        setAvatar(URL.createObjectURL(e.target.files[0]));
      } finally {
        setTimeout(() => setIsScanning(false), 1500);
      }
    }
  };

  const handleLogin = () => {
    if (password !== ADMIN_PASSWORD) {
      setError('密码错误，仅限管理员登录');
      return;
    }
    if (!nickName.trim()) {
      setError('请输入昵称');
      return;
    }
    setError('');
    onLogin('ADMIN', nickName.trim(), avatar);
  };

  const glitchVariants = {
    animate: {
      x: [0, -2, 2, -1, 1, 0],
      y: [0, 1, -1, 0],
      filter: [
        'drop-shadow(0 0 0 transparent)',
        'drop-shadow(2px 0px 0px #ff0055)',
        'drop-shadow(-2px 0px 0px #00eaff)',
        'drop-shadow(0 0 0 transparent)'
      ],
      transition: {
        duration: 0.2,
        repeat: Infinity,
        repeatType: "mirror" as const,
        repeatDelay: 3
      }
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#050505]' : 'bg-gray-100'} flex items-center justify-center p-6 pt-24 overflow-hidden relative`}>

      {/* 3D 动态网格背景 */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute bottom-0 left-0 right-0 h-[60vh] opacity-30"
          style={{
            perspective: '500px',
            background: `linear-gradient(to bottom, transparent, ${isDark ? '#ff5e3a22' : '#ff5e3a11'})`
          }}
        >
          <motion.div
            animate={{ backgroundPosition: ['0px 0px', '0px 40px'] }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-full h-[200%] absolute top-0 left-0"
            style={{
              backgroundImage: `linear-gradient(${isDark ? '#ff5e3a44' : '#ff5e3a22'} 1px, transparent 1px), linear-gradient(90deg, ${isDark ? '#ff5e3a44' : '#ff5e3a22'} 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
              transform: 'rotateX(60deg) translateY(-25%)',
              transformOrigin: 'top center'
            }}
          />
        </div>
      </div>

      <motion.div
        initial={{ y: 50, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        className={`w-full max-w-xl ${isDark ? 'bg-black/80' : 'bg-white/90'} backdrop-blur-xl border-4 ${isDark ? 'border-white/10' : 'border-black/5'} p-8 md:p-12 rounded-[3.5rem] shadow-[0_0_100px_rgba(255,94,58,0.15)] relative z-10`}
      >
        <div className="absolute top-6 left-6 w-8 h-8 border-t-4 border-l-4 border-[#ff5e3a]"></div>
        <div className="absolute top-6 right-6 w-8 h-8 border-t-4 border-r-4 border-[#ff5e3a]"></div>
        <div className="absolute bottom-6 left-6 w-8 h-8 border-b-4 border-l-4 border-[#ff5e3a]"></div>
        <div className="absolute bottom-6 right-6 w-8 h-8 border-b-4 border-r-4 border-[#ff5e3a]"></div>

        <div className="text-center mb-8">
          <motion.div
            variants={glitchVariants}
            animate="animate"
            className="inline-block p-4 bg-[#ff5e3a] rounded-3xl mb-4 shadow-[0_8px_0_#992d15,0_20px_40px_rgba(255,94,58,0.3)]"
          >
            <Lock className="w-8 h-8 text-white" />
          </motion.div>
          <motion.h1
            variants={glitchVariants}
            animate="animate"
            className={`text-4xl md:text-5xl font-black italic tracking-tighter ${isDark ? 'text-white' : 'text-black'} mb-2`}
          >
            ADMIN LOGIN
          </motion.h1>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-[#ff5e3a] rounded-full animate-ping"></div>
            <p className="text-[#ff5e3a] font-mono text-[10px] uppercase tracking-[0.3em] font-bold">管理员专属入口</p>
          </div>
        </div>

        <div className="grid md:grid-cols-5 gap-8 items-center">
          {/* 左侧头像区域 */}
          <div className="md:col-span-2 flex flex-col items-center">
            <div className="relative group">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-4 border-2 border-dashed border-[#ff5e3a]/30 rounded-full"
              />

              <div
                className="relative w-36 h-36 cursor-pointer overflow-hidden rounded-full border-4 border-[#ff5e3a] shadow-[0_0_30px_rgba(255,94,58,0.4)]"
                onClick={() => fileInputRef.current?.click()}
              >
                <img src={avatar} className={`w-full h-full object-cover transition-all duration-500 ${isScanning ? 'brightness-150 blur-sm' : 'group-hover:scale-110'}`} />

                <AnimatePresence>
                  {isScanning && (
                    <motion.div
                      initial={{ top: '-10%' }}
                      animate={{ top: '110%' }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="absolute left-0 right-0 h-1 bg-[#00eaff] shadow-[0_0_15px_#00eaff] z-20"
                    />
                  )}
                </AnimatePresence>

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>

              <motion.div
                whileHover={{ scale: 1.2, rotate: 90 }}
                className="absolute -bottom-1 -right-1 bg-[#ff5e3a] p-2.5 rounded-2xl border-4 border-white dark:border-[#111] shadow-xl"
              >
                <Zap className="w-4 h-4 text-white fill-current" />
              </motion.div>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            <p className={`mt-4 text-[10px] font-black tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'} uppercase`}>管理员头像</p>
          </div>

          {/* 右侧输入区域 */}
          <div className="md:col-span-3 space-y-5">
            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#ff5e3a]" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="管理员密码"
                className={`w-full pl-14 pr-12 py-4 rounded-2xl border-2 font-black text-lg transition-all outline-none ${isDark ? 'bg-black/50 border-white/5 text-white focus:border-[#ff5e3a] focus:bg-black' : 'bg-gray-50 border-transparent focus:border-[#ff5e3a] focus:bg-white'}`}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#ff5e3a] text-xs font-bold"
              >
                {showPassword ? '隐藏' : '显示'}
              </button>
              <span className="absolute -top-2 left-6 px-2 bg-black text-[#ff5e3a] text-[8px] font-black uppercase tracking-widest border border-[#ff5e3a]/30">Password</span>
            </div>

            <div className="relative group">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#ff5e3a]" />
              <input
                type="text"
                placeholder="管理员昵称"
                className={`w-full pl-14 pr-6 py-4 rounded-2xl border-2 font-black text-lg transition-all outline-none ${isDark ? 'bg-black/50 border-white/5 text-white focus:border-[#ff5e3a] focus:bg-black' : 'bg-gray-50 border-transparent focus:border-[#ff5e3a] focus:bg-white'}`}
                value={nickName}
                onChange={(e) => { setNickName(e.target.value); setError(''); }}
              />
              <span className="absolute -top-2 left-6 px-2 bg-black text-[#ff5e3a] text-[8px] font-black uppercase tracking-widest border border-[#ff5e3a]/30">Nickname</span>
            </div>

            {/* 错误提示 */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2 text-red-500 text-sm font-bold bg-red-500/10 px-4 py-2 rounded-xl"
                >
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="pt-2 grid grid-cols-5 gap-3">
              <button
                onClick={handleLogin}
                disabled={!password || !nickName}
                className="col-span-3 bg-[#ff5e3a] hover:bg-[#ff451a] disabled:opacity-20 text-white font-black py-4 rounded-2xl text-md flex items-center justify-center gap-2 shadow-[0_6px_0_#992d15] hover:shadow-[0_2px_0_#992d15] hover:translate-y-1 active:translate-y-2 active:shadow-none transition-all group"
              >
                管理员登录 <ShieldCheck className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              </button>

              <button
                onClick={onGuest}
                className={`col-span-2 py-4 rounded-2xl font-black text-sm border-2 ${isDark ? 'border-white/5 text-white hover:bg-white/5' : 'border-black/5 text-black hover:bg-black/5'} transition-all`}
              >
                返回首页
              </button>
            </div>
          </div>
        </div>

        <p className={`text-center mt-10 text-[9px] font-bold uppercase tracking-widest ${isDark ? 'text-gray-700' : 'text-gray-400'}`}>
          仅限管理员访问 · Admin Access Only
        </p>
      </motion.div>
    </div>
  );
};

export default LoginView;
