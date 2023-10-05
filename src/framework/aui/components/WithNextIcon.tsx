import { Icon } from './Icon';
import React from 'react';

export const WithNextIcon = ({ children, onNext }: any) => {
  return (
    <div className="with-next-icon">
      {children}
      <div className="flex-center cursor-pointer" onClick={onNext}>
        <Icon name="chevron-forward-outline" style={{ fontSize: '1.5em' }}/>
      </div>
    </div>
  );
};
