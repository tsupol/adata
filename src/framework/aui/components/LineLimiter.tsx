import React from 'react';
export const LineLimiter = ({ children, className, limit = 1, lineHeight = 1.6 }: any) => {
  return (
    <p className={className} style={{ lineHeight: `${lineHeight}rem`, overflow: 'hidden', maxHeight: `${limit * lineHeight}rem` }}>
      {children}
    </p>
  );
};
