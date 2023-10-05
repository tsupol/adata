import React, { useEffect, useRef, useState } from 'react';
import { CropMode, IResizeConfig } from '../../lib/image-processing/image-processing-types';

export const ImageCropCanvas = ({ imgFile, setValue, cnf }: { imgFile: any, setValue: Function, cnf: IResizeConfig }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [imgForDisplay, setImgForDisplay] = useState<string>('');

  useEffect(() => {
    if (imgFile) {
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return;
      }
      const fr = new FileReader();
      fr.onload = () => {
        let img = new Image();
        let w = 0;
        let h = 0;
        if (cnf.crop) {
          w = cnf.crop.w;
          h = cnf.crop.h;
        } else {
        }
        img.onload = (e: Event) => {
          console.log('cnf', cnf);
          canvas.width = w;
          canvas.height = h;
          const imgW = img.naturalWidth;
          const imgH = img.naturalHeight;
          if (cnf.crop) {
            w = cnf.crop.w;
            h = cnf.crop.h;
            if (cnf.crop.mode === CropMode.Contain) {
              let dx = 0;
              let dy = 0;
              let dw = w;
              let dh = h;
              let cropRatio = cnf.crop.w / cnf.crop.h;
              let imgRatio = imgW / imgH;
              if (imgRatio > cropRatio) {
                const dPad = (imgRatio - cropRatio) * w;
                dx = dPad / -2;
                dw = dPad + w;
              } else {
                let invImgRatio = imgH / imgW;
                let intCropRatio = cnf.crop.h / cnf.crop.w;
                const dPad = (invImgRatio - intCropRatio) * w;
                dy = dPad / -2;
                dh = dPad + h;
              }
              ctx.drawImage(img, dx, dy, dw, dh);
            } else {
              // todo CropMode.Cover
              throw new Error('CropMode.Cover not supported yet')
            }
          } else {
            const maxLength = cnf.maxSize || 1000;
            if (imgW <= maxLength && imgH <= maxLength) {
              w = imgH;
              h = imgW;
            } else if (imgH > imgW) {
              w = maxLength;
              h = Math.round(maxLength * imgH / imgW);
            } else {
              h = maxLength;
              w = Math.round(maxLength * imgW / imgH);
            }
            ctx.drawImage(img, 0, 0, w, h);
          }
          const resultImg = canvas.toDataURL(cnf.type || 'image/jpeg', cnf.compression || .7);
          setValue(resultImg);
          setImgForDisplay(resultImg);
        };
        img.src = fr.result as string;
      };
      fr.readAsDataURL(imgFile);
    }
  }, [cnf, imgFile, setValue]);

  return (
    <div>
      {imgForDisplay && <img src={imgForDisplay} alt="uploaded"/>}
      <div className="aarr w-40 h-40">
        <canvas ref={canvasRef}/>
      </div>
    </div>
  );
};
