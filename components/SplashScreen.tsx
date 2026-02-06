
import React from 'react';
import { motion } from 'framer-motion';

interface SplashScreenProps {
  onEnter: () => void;
  avatar: string;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onEnter, avatar }) => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ y: '-100%', transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }}
      className="fixed inset-0 z-[100] bg-[#050505] flex flex-col items-center justify-center text-white"
    >
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <motion.div initial={{ y: 200, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 60 }} className="relative">
             <div className="w-40 h-64 bg-[#2a0a4d] rounded-2xl border-4 border-[#500a85] flex flex-col items-center p-4 shadow-[0_0_50px_rgba(106,13,173,0.5)]">
                 <div className="w-full aspect-square bg-[#9ca04b] border-2 border-black/50 mb-4 flex items-center justify-center font-mono text-[10px] text-[#0f380f] text-center p-1">
                    READY PLAYER ONE
                 </div>
                 <div className="w-full flex justify-between px-2 mt-auto mb-4">
                     <div className="w-8 h-8 bg-black rounded-full"></div>
                     <div className="w-8 h-8 bg-transparent flex gap-1"><div className="w-3 h-3 bg-[#ff0055] rounded-full"></div><div className="w-3 h-3 bg-[#00eaff] rounded-full mt-2"></div></div>
                 </div>
             </div>
        </motion.div>
        <motion.button 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.5 }} 
          onClick={onEnter} 
          className="mt-12 text-2xl font-black tracking-widest hover:text-[#ff5e3a] animate-pulse cursor-pointer relative z-10 bg-black/50 px-6 py-2 rounded"
        >
          点击开始
        </motion.button>
    </motion.div>
  );
};

export default SplashScreen;
