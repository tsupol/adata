import React from 'react';
import { toClassName } from 'megaloutils';

export const BackDrop = ({ show, onClick }: { show: boolean, onClick?: () => void }) => {
  return (
    <div className={toClassName('backdrop', { show })} onClick={onClick}>
    </div>
  );
};
