import { Image } from '../Image';
import React from 'react';

interface ListContentHorizontalProps {
  img1?: any;
  img2?: any;
  leftContent?: any;
  rightContent?: any;
}

export const ListContentHorizontal: React.FC<ListContentHorizontalProps> = ({ img1, img2, leftContent, rightContent }) => {
  return (
    <div className="flex w-full">
      {img1 ? <Image className="li-hor-img" src={img1}/> : null}
      {img2 ? <Image className="li-hor-img" src={img2}/> : null}
      <div className="li-hor-content flex w-full">
        {leftContent ?? null}
        <div className="ml-auto">
          {rightContent ?? null}
        </div>
      </div>
    </div>
  );
};
