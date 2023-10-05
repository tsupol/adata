import React from 'react';

export const Checker = ({ children }: any) => {
  return (
    <div className="radio">
      <div className="radio-checker"></div>
      {children}
    </div>
  );
};
