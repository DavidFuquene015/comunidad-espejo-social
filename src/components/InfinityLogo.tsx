
import React from 'react';

const InfinityLogo = () => {
  return (
    <div className="flex flex-col items-center space-y-8">
      <div className="relative">
        <div className="w-32 h-16 animate-float animate-glow">
          <svg
            viewBox="0 0 200 100"
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="infinityGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00d4ff" />
                <stop offset="25%" stopColor="#5b73f0" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="75%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#d946ef" />
              </linearGradient>
            </defs>
            <path
              d="M50 50 C 50 25, 75 25, 100 50 C 125 75, 150 75, 150 50 C 150 25, 125 25, 100 50 C 75 75, 50 75, 50 50 Z"
              fill="url(#infinityGradient)"
              className="drop-shadow-2xl"
            />
          </svg>
        </div>
      </div>
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2 tracking-wider">
          LOGIN
        </h1>
      </div>
    </div>
  );
};

export default InfinityLogo;
