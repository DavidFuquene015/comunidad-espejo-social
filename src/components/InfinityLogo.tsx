
import React from 'react';

const InfinityLogo = () => {
  return (
    <div className="flex flex-col items-center space-y-8">
      <div className="relative">
        <div className="w-20 h-20 animate-float animate-glow">
          <img
            src="/lovable-uploads/744db0f4-e151-46c4-b80b-90e4a4b16b60.png"
            alt="Infinity Logo"
            className="w-full h-full object-contain drop-shadow-2xl"
          />
        </div>
      </div>
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2 tracking-wider">
          FLORTE
        </h1>
        <p className="text-white/70 text-lg leading-relaxed max-w-md">
          Conecta con el mundo infinito de posibilidades. Únete a nuestra comunidad y descubre experiencias únicas.
        </p>
      </div>
    </div>
  );
};

export default InfinityLogo;
