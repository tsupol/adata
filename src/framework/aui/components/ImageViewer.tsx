import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Keyboard, Scrollbar, Zoom } from 'swiper/modules';
import { useAuiContext } from '../AuiContext';
import { Icon } from './Icon';

export const ImageViewer = ({ images, modalId }: { images: any[], modalId: string }) => {

  const { ui } = useAuiContext();

  const close = () => {
    ui.modals.dismiss(modalId);
  };

  return (
    <div className="relative">
      <div className="absolute top-0 right-0 z-10 flex-center w-10 h-10" onClick={close}>
        <Icon name="close-outline"></Icon>
      </div>
      <Swiper
        className="h-screen"
        modules={[Keyboard, Scrollbar, Zoom]}
        keyboard={true}
        scrollbar={true}
        zoom={true}
      >
        {images && images.map((slide: any, i: number) => {
          return (
            <SwiperSlide key={i}>
              <div className="swiper-zoom-container">
                <img src={slide} alt=""/>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};
