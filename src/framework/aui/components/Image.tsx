import React from 'react';
import {useAuiContext} from '../AuiContext';

const USER_IMG_COUNT = 43;
const ART_IMG_COUNT = 61;
const chars = '0123456789abcdefghigklmnopqrstuvwxyz';
const assetsRe = /^\/assets/;

const getCharNumber = (char: string) => {
  return chars.indexOf(char.toLowerCase());
};

export const getDummyImage = (title: string) => {
  if (title.indexOf('user') === 0) {
    return `https://megalo-drive.s3.ap-southeast-1.amazonaws.com/shared/img/users/user-${(title.length + getCharNumber(title[title.length - 2]) + getCharNumber(title[title.length - 1])) % USER_IMG_COUNT + 1}.jpg`;
  }
  return `https://megalo-drive.s3.ap-southeast-1.amazonaws.com/shared/img/arts/art-${(title.length + getCharNumber(title[title.length - 2]) + getCharNumber(title[title.length - 1])) % ART_IMG_COUNT + 1}.jpg`;
};

interface IImage {
  src?: string,
  alt?: string,
  className?: any,
  imgClassName?: any,
}

export const Image = ({src, className, imgClassName, alt}: IImage) => {
  const {getImagePath} = useAuiContext();
  // let imgSrc = src ? getImagePath(src) : getDummyImage(title || '');
  const imgSrc = src ? assetsRe.test(src) ? src : getImagePath(src) : 'asset/img/no-img.jpg';

  return (
    <div className={className}>
      <img src={imgSrc} className={imgClassName} alt={alt}/>
    </div>

  );
};
