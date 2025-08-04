
import React from 'react';

const ParticleBackground = () => {
  const particles = Array.from({ length: 50 }, (_, i) => i);

  return (
    <div className="particle-container">
      {particles.map((particle) => (
        <div
          key={particle}
          className="floating-particle"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 6}s`,
            animationDuration: `${6 + Math.random() * 4}s`,
          }}
        />
      ))}
    </div>
  );
};

export default ParticleBackground;
