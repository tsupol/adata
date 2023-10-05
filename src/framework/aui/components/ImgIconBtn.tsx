import React from 'react';
import { toClassName } from 'megaloutils';

interface ImgIconBtnProps {
  img: string,
  icon?: JSX.Element,
  children: string,
  onClick?: () => any,
  className?: string,
}

export const ImgIconBtn = ({ img, icon, children, onClick, className }: ImgIconBtnProps) => {
  return (
    <div className={toClassName('flex ml-auto cursor-pointer p-2 rounded-md overflow-hidden', className)} onClick={onClick}>
      {img ? <img className="aspect-square w-10 shrink-0" src={img} alt="evidence"/> : null}
      <div className="flex-center px-2">
        {icon ? icon : null}
        <div className="ml-2 font-emphasis">{children}</div>
      </div>
    </div>
  );
};

