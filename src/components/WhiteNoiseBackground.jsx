import React from 'react';
import noiseTexture from '../assets/Bluenoise Dithering.png';
const WhiteNoiseBackground = ({ 
  opacity = 0.05, 
  zIndex = -1 
}) => {
  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: `url(${noiseTexture})`,
        opacity: opacity,
        zIndex: zIndex,
        pointerEvents: 'none',
        mixBlendMode: 'overlay'
      }}
    />
  );
};

export default WhiteNoiseBackground;