import React from 'react';
import { toClassName } from 'megaloutils';
import { Icon } from './Icon';

interface CardNoticeProps {
  children: any,
  type?: 'danger' | 'info' | 'success' | 'warning'
}

export const CardNotice: React.FC<CardNoticeProps> = ({ children, type = 'info' }) => {

  const icon =
    type === 'info' ? <Icon name="information-circle-outline"/> :
      type === 'danger' ? <Icon name="close-circle-outline"/> :
        type === 'warning' ? <Icon name="warning-outline"/> :
          type === 'success' ? <Icon name="checkmark-circle-outline"/> : null;

  return (
    <div className={toClassName('notice', `notice-${type}`)}>
      {icon ? (
        <div className="notice-icon">
          {icon}
        </div>
      ) : null}
      <div className="notice-content">
        {children}
      </div>
    </div>
  );
};
