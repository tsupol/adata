import React, { useEffect, useRef, useState } from 'react';
import { useSrxFn } from '../lib/SimpleRx';
import { UiEvent } from '../services/ui-service';
import { useAuiContext } from '../AuiContext';

export const AnimatedRevealPrefix = 'anim-reveal-';

export const AnimatedReveal = ({ children, uiKey, defaultIsOpen = false }: any) => {

  const { ui } = useAuiContext();

  const containerRef = useRef<HTMLElement>();
  const innerRef = useRef<HTMLElement>();

  const [isOpen, setIsOpen] = useState<boolean>(defaultIsOpen);
  const [className] = useState<any>(['relative']);
  const [style, setStyle] = useState<any>({});

  useSrxFn(ui.events[UiEvent.General], (e: any) => {
    if (e.detail.key === `${AnimatedRevealPrefix}${uiKey}`) {
      setIsOpen(prev => !prev);
    }
  });

  useEffect(() => {
    if (isOpen) {
      setStyle({ height: innerRef.current?.offsetHeight + 'px', opacity: 1, transition: 'height .25s, opacity .25s' });
    } else {
      setStyle({ height: '0', pointerEvents: 'none', opacity: 0, transition: 'height .25s' });
    }
  }, [isOpen]);


  return (
    <div className={className.join(' ')}
         style={style}
         ref={containerRef as React.RefObject<HTMLDivElement>}
    >
      <div className="absolute w-full">
        <div ref={innerRef as React.RefObject<HTMLDivElement>}>
          {children}
        </div>
      </div>
    </div>
  );
};
