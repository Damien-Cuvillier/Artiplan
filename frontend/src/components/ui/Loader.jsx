import React from 'react';

const Loader = ({ className = '', size = 'h-12 w-12' }) => {
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div className={`animate-spin rounded-full ${size} border-t-2 border-b-2 border-blue-500`}></div>
    </div>
  );
};

export default Loader;
