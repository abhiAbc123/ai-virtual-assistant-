import React, { useEffect, useRef } from 'react';
import { useAssistant } from '../context/AssistantContext';

export const HologramVisualizer = ({ size = 380 }) => {
  const canvasRef = useRef(null);
  const { assistantState, soundFrequency } = useAssistant();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let angleOffset = 0;

    // Clean floating subtle particle system
    const particleCount = 28;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * size,
      y: Math.random() * size,
      radius: Math.random() * 1.5 + 0.8,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.5 + 0.2,
    }));

    const render = () => {
      ctx.clearRect(0, 0, size, size);
      const centerX = size / 2;
      const centerY = size / 2;
      const baseRadius = size * 0.38;

      // Draw subtle particles
      particles.forEach((p) => {
        p.x += p.speedX * (assistantState === 'speaking' ? 2 : 1);
        p.y += p.speedY * (assistantState === 'speaking' ? 2 : 1);

        if (p.x < 0) p.x = size;
        if (p.x > size) p.x = 0;
        if (p.y < 0) p.y = size;
        if (p.y > size) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(37, 99, 235, ${p.alpha * 0.35})`;
        ctx.fill();
      });

      // Rotating Outer Radar Arc 1
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angleOffset);
      ctx.beginPath();
      ctx.arc(0, 0, baseRadius + 14, 0, Math.PI * 1.3);
      ctx.strokeStyle = 'rgba(37, 99, 235, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([10, 8]);
      ctx.stroke();
      ctx.restore();

      // Rotating Outer Radar Arc 2 (Counter)
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(-angleOffset * 1.2);
      ctx.beginPath();
      ctx.arc(0, 0, baseRadius + 22, Math.PI * 0.3, Math.PI * 1.7);
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.2)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([16, 8, 4, 8]);
      ctx.stroke();
      ctx.restore();

      // Radial Frequency Bars
      const numBars = 64;
      const isSpeaking = assistantState === 'speaking';
      const isListening = assistantState === 'listening';
      const isProcessing = assistantState === 'processing';

      for (let i = 0; i < numBars; i++) {
        const rad = (i * 2 * Math.PI) / numBars;
        let barHeight = 4;

        if (isSpeaking) {
          barHeight = 6 + Math.sin(i * 0.4 + angleOffset * 6) * 14 + (soundFrequency || 0.4) * 16;
        } else if (isListening) {
          barHeight = 5 + Math.cos(i * 0.8 + angleOffset * 4) * 10;
        } else if (isProcessing) {
          barHeight = 4 + Math.sin(i * 0.3 + angleOffset * 8) * 8;
        } else {
          barHeight = 3 + Math.sin(i * 0.2 + angleOffset * 2) * 4;
        }

        const startX = centerX + Math.cos(rad) * (baseRadius + 2);
        const startY = centerY + Math.sin(rad) * (baseRadius + 2);
        const endX = centerX + Math.cos(rad) * (baseRadius + 2 + barHeight);
        const endY = centerY + Math.sin(rad) * (baseRadius + 2 + barHeight);

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);

        if (isSpeaking) {
          ctx.strokeStyle = `rgba(37, 99, 235, ${0.4 + (barHeight / 30)})`;
        } else if (isListening) {
          ctx.strokeStyle = `rgba(5, 150, 105, ${0.4 + (barHeight / 20)})`;
        } else if (isProcessing) {
          ctx.strokeStyle = `rgba(217, 119, 6, ${0.4 + (barHeight / 20)})`;
        } else {
          ctx.strokeStyle = 'rgba(37, 99, 235, 0.2)';
        }

        ctx.lineWidth = 2;
        ctx.stroke();
      }

      angleOffset += assistantState === 'speaking' ? 0.03 : 0.01;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [assistantState, soundFrequency, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10"
    />
  );
};
