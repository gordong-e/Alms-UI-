import React from 'react';
import { motion } from 'motion/react';

export const LoadingScreen: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] bg-[#0a3c1a] flex flex-col items-center justify-center min-h-screen"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center gap-6"
      >
        <motion.div
          animate={{ 
            scale: [1, 1.05, 1],
            boxShadow: [
              "0px 0px 0px rgba(185, 240, 44, 0)",
              "0px 0px 30px rgba(185, 240, 44, 0.3)",
              "0px 0px 0px rgba(185, 240, 44, 0)"
            ]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative w-24 h-24 rounded-3xl bg-white/10 border border-white/20 p-1 flex items-center justify-center overflow-hidden shadow-2xl"
        >
          <img
            src="/logo.png"
            alt="Alms logo"
            className="w-full h-full object-cover rounded-[20px]"
          />
        </motion.div>
        
        <div className="flex flex-col items-center gap-2">
          <motion.h1 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-white text-4xl font-extrabold tracking-tight"
          >
            Alms
          </motion.h1>
          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-[#b9f02c] font-medium tracking-wide text-lg"
          >
            No Empty Bowls
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-8 flex gap-2"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ 
                y: [0, -8, 0],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
              className="w-2.5 h-2.5 rounded-full bg-white"
            />
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
