import React from 'react';
import { motion } from 'framer-motion';

const Particle = ({ delay = 0 }) => (
  <motion.div
    className="absolute w-1 h-1 bg-purple-400 rounded-full opacity-30"
    initial={{ x: 0, y: 0, opacity: 0 }}
    animate={{
      x: [0, Math.random() * 100 - 50],
      y: [0, Math.random() * 100 - 50],
      opacity: [0, 0.6, 0],
    }}
    transition={{
      duration: 4,
      delay,
      repeat: Number.POSITIVE_INFINITY,
      repeatType: "loop",
    }}
    style={{
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
    }}
  />
);

const FloatingOrb = ({ delay = 0, size = 'w-2 h-2' }) => (
  <motion.div
    className={`absolute ${size} bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20`}
    initial={{ x: 0, y: 0, scale: 0 }}
    animate={{
      x: [0, Math.random() * 200 - 100],
      y: [0, Math.random() * 200 - 100],
      scale: [0, 1, 0],
      rotate: [0, 360],
    }}
    transition={{
      duration: 8,
      delay,
      repeat: Number.POSITIVE_INFINITY,
      repeatType: "loop",
      ease: "easeInOut",
    }}
    style={{
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
    }}
  />
);

export default function ParticleBackground() {
  return (
    <div className="particle-container">
      {/* Small particles */}
      {Array.from({ length: 50 }, (_, i) => (
        <Particle key={`particle-${i}`} delay={i * 0.1} />
      ))}
      
      {/* Floating orbs */}
      {Array.from({ length: 15 }, (_, i) => (
        <FloatingOrb 
          key={`orb-${i}`} 
          delay={i * 0.5} 
          size={i % 3 === 0 ? 'w-3 h-3' : 'w-2 h-2'} 
        />
      ))}
      
      {/* Large ambient glow */}
      <motion.div
        className="absolute w-96 h-96 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full opacity-5 blur-3xl"
        animate={{
          x: [0, 100, -100, 0],
          y: [0, -100, 100, 0],
          scale: [1, 1.2, 0.8, 1],
        }}
        transition={{
          duration: 20,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "loop",
          ease: "easeInOut",
        }}
        style={{
          left: '20%',
          top: '20%',
        }}
      />
      
      <motion.div
        className="absolute w-80 h-80 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full opacity-5 blur-3xl"
        animate={{
          x: [0, -150, 150, 0],
          y: [0, 150, -150, 0],
          scale: [0.8, 1.3, 0.9, 0.8],
        }}
        transition={{
          duration: 25,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "loop",
          ease: "easeInOut",
        }}
        style={{
          right: '20%',
          bottom: '20%',
        }}
      />
    </div>
  );
}