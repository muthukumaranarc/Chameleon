import React from 'react';
import chameleonLogoImg from '../assets/chameleon-logo.png';

export const ChameleonLogo = ({ size = 32 }) => {
  return (
    <div
      className="chameleon-logo-wrapper"
      style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <img
        src={chameleonLogoImg}
        alt="Chameleon Logo"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          mixBlendMode: 'multiply',
        }}
      />
    </div>
  );
};

export default ChameleonLogo;
