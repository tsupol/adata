import { Image } from '../../../../aui/components/Image';
import React from 'react';

interface ThumbnailOptionProps {
  imgSrc: string,
  label: any,
}

export const ThumbnailOption = ({imgSrc, label}:ThumbnailOptionProps) => {
  return (
    <div className="flex">
      <Image src={imgSrc} imgClassName="option-label-img"/>
      <div className="option-label-content">
        {label}
      </div>
    </div>
  )
}
