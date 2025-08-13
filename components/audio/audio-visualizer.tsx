'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface AudioVisualizerProps {
  isPlaying: boolean;
  duration: number;
  currentTime: number;
  className?: string;
  barCount?: number;
  height?: number;
  color?: string;
}

export function AudioVisualizer({
  isPlaying,
  duration,
  currentTime,
  className = '',
  barCount = 40,
  height = 40,
  color = 'rgba(139, 92, 246, 0.8)'
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);
  const [bars, setBars] = useState<number[]>([]);

  // Generate random bars for visualization
  const generateBars = useCallback(() => {
    return Array.from({ length: barCount }, () => Math.random() * 0.8 + 0.2);
  }, [barCount]);

  // Initialize bars
  useEffect(() => {
    setBars(generateBars());
  }, [generateBars]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = canvas.width / barCount;
      const maxBarHeight = height * 0.8;

      bars.forEach((barHeight, index) => {
        const x = index * barWidth;
        const currentBarHeight = isPlaying 
          ? maxBarHeight * barHeight * (0.5 + Math.sin(Date.now() * 0.01 + index) * 0.5)
          : maxBarHeight * barHeight * 0.3;

        // Create gradient
        const gradient = ctx.createLinearGradient(0, height, 0, height - currentBarHeight);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, color.replace('0.8', '0.3'));

        // Draw bar
        ctx.fillStyle = gradient;
        ctx.fillRect(x + barWidth * 0.1, height - currentBarHeight, barWidth * 0.8, currentBarHeight);
      });

      // Progress indicator
      if (duration > 0) {
        const progress = currentTime / duration;
        const progressX = progress * canvas.width;
        
        // Draw progress line
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(progressX, 0);
        ctx.lineTo(progressX, height);
        ctx.stroke();
      }

      if (isPlaying) {
        // Update bars occasionally for animation
        if (Math.random() < 0.1) {
          setBars(generateBars());
        }
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, bars, duration, currentTime, height, color, barCount, generateBars]);

  // Update canvas size
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateSize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [height]);

  return (
    <motion.div 
      className={`relative ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <canvas
        ref={canvasRef}
        style={{ 
          width: '100%', 
          height: `${height}px`,
          borderRadius: '8px'
        }}
        className="w-full"
      />
      
      {/* Overlay gradient for glassmorphism effect */}
      <div 
        className="absolute inset-0 rounded-lg pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
          opacity: isPlaying ? 0.5 : 0.2
        }}
      />
    </motion.div>
  );
}

// Simpler bar visualizer for smaller spaces
export function MiniVisualizer({
  isPlaying,
  className = '',
  barCount = 5,
  color = 'rgba(139, 92, 246, 0.8)'
}: {
  isPlaying: boolean;
  className?: string;
  barCount?: number;
  color?: string;
}) {
  return (
    <div className={`flex items-end space-x-0.5 ${className}`}>
      {Array.from({ length: barCount }).map((_, index) => (
        <motion.div
          key={index}
          className="w-1 bg-current rounded-full"
          style={{ color }}
          animate={isPlaying ? {
            height: [8, 16, 8],
            opacity: [0.3, 1, 0.3]
          } : {
            height: 4,
            opacity: 0.3
          }}
          transition={{
            duration: 0.8,
            repeat: isPlaying ? Infinity : 0,
            delay: index * 0.1,
            ease: 'easeInOut'
          }}
        />
      ))}
    </div>
  );
}