import { CropMode } from './image-processing-types';

export const getCropResizeImage = (imgFile: any, cnf: any, callback: (v: any) => void) => {

  if (imgFile) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }
    const fr = new FileReader();
    fr.onload = () => {
      const img = new Image();
      img.onload = () => {
        const imgW = img.naturalWidth;
        const imgH = img.naturalHeight;
        if (cnf.crop) {
          const w = cnf.crop.w;
          const h = cnf.crop.h;
          canvas.width = w;
          canvas.height = h;
          if (cnf.crop.mode === CropMode.Contain) {
            let dx = 0;
            let dy = 0;
            let dw = w;
            let dh = h;
            const cropRatio = cnf.crop.w / cnf.crop.h;
            const imgRatio = imgW / imgH;
            if (imgRatio > cropRatio) {
              const dPad = (imgRatio - cropRatio) * w;
              dx = dPad / -2;
              dw = dPad + w;
            } else {
              const invImgRatio = imgH / imgW;
              const intCropRatio = cnf.crop.h / cnf.crop.w;
              const dPad = (invImgRatio - intCropRatio) * w;
              dy = dPad / -2;
              dh = dPad + h;
            }
            ctx.drawImage(img, dx, dy, dw, dh);
          } else {
            // todo CropMode.Cover
            throw new Error('CropMode.Cover not supported yet');
          }
        } else {
          let w = imgW;
          let h = imgH;
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
          canvas.width = w;
          canvas.height = h;
          ctx.drawImage(img, 0, 0, w, h);
        }
        const resultImg = canvas.toDataURL(cnf.type || 'image/jpeg', cnf.compression || .7);
        callback(resultImg);
      };
      img.src = fr.result as string;
    };
    fr.readAsDataURL(imgFile);
  }
};
