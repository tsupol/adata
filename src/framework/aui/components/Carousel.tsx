import React from "react";
import {Swiper, SwiperSlide} from "swiper/react";
import "swiper/css";
import "swiper/css/keyboard";
import "swiper/css/scrollbar";
import "swiper/css/zoom";
import {Keyboard, Scrollbar, Zoom} from "swiper/modules";
import {useAuiContext} from "../AuiContext";
import {toClassName} from "megaloutils";

export const Carousel = ({slides, className, style, images, alt = ""}: any) => {

  const {getImagePath} = useAuiContext();
  const theSlides = slides ? slides : images ? images.map((img: any) => {
    return getImagePath(img.lg || img.md || img.sm);
  }) : [];

  // trying to auto fit parent (set dimension on <img>)
  // ----------------------------------------
  // const ref = useRef<HTMLInputElement>(null);
  // const [parentRect, setParentRect] = useState<any>();
  //
  // useEffect(() => {
  //   const destroy$ = new Subject<boolean>();
  //   if (ref.current?.parentElement?.parentElement) {
  //     const sub = resizeObservable(ref.current?.parentElement?.parentElement).pipe(
  //       debounceTime(1000),
  //       takeUntil(destroy$)
  //     ).subscribe((a: any) => {
  //       if (a?.[0]?.contentRect) {
  //         setParentRect(a[0].contentRect);
  //       }
  //     });
  //   }
  // }, [ref.current]);

  return (
    <Swiper
      modules={[Keyboard, Scrollbar, Zoom]}
      keyboard={true}
      scrollbar={true}
      zoom={true}
    >
      {theSlides && theSlides.map((slide: any, i: number) => {
        return (
          <SwiperSlide key={i}>
            <div className={toClassName("swiper-zoom-container")}>
              <img src={slide} alt={alt} style={style} className={className}/>
            </div>
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
};

const pxOrAuto = (v: any) => {
  console.log('v', v);
  if (v) {
    return v + 'px';
  }
  return 'auto';
};
