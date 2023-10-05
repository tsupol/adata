import React from 'react';
import { useState } from 'react';
import { toClassName } from 'megaloutils';
import { useAuiContext } from '../../AuiContext';
import { useUiEvent } from '../../lib/SimpleRx';
import { UiEvent } from '../../services/ui-service';
import { ModalType } from '../../services/modal-service';

const classNameAndStyle = (show: boolean, className?: string, type?: ModalType) => {
  if (type === ModalType.Modal) {
    return {
      className: toClassName('modal-container', className, show ? 'modal-show' : 'modal-hide'),
      style: { zIndex: 2 }
    };
  } else if (type === ModalType.MobilePage) {
    return {
      className: toClassName('modal-container modal-page', className, show ? 'modal-show' : 'modal-hide'),
      style: { zIndex: 2 }
    };
  } else if (type === ModalType.DrawerRight) {
    return {
      className: toClassName('drawer-container', className),
      style: { zIndex: 2, right: 0, transform: show ? 'translate3d(0, 0, 0)' : 'translate3d(100%, 0, 0)' }
    };
  } else if (type === ModalType.DrawerLeft) {
    return {
      className: toClassName('drawer-container', className),
      style: { zIndex: 2, left: 0, transform: show ? 'translate3d(0, 0, 0)' : 'translate3d(-100%, 0, 0)' }
    };
  }
  return {};
};

export const ModalTemplate = ({ modalId, children, className, type = ModalType.Modal }:
                                { modalId: string, children: any, className?: string, type?: ModalType }) => {

  const { ui } = useAuiContext();
  const [display, setDisplay] = useState('none');
  const [show, setShow] = useState(false);

  const present = () => {
    setDisplay('flex');
    setTimeout(() => setShow(true), 50);
  };

  const dismiss = () => {
    setShow(false);
  };

  useUiEvent(UiEvent.ModalPresent, (e: any) => {
    if (e.detail.key === modalId) {
      present();
    }
  });

  useUiEvent(UiEvent.ModalDismiss, (e: any) => {
    if (e.detail.key === modalId) {
      dismiss();
    }
  });

  const handleAnimationEnd = () => {
    if (!show) {
      setDisplay('none');
    }
  };

  return (
    <div className={toClassName('modal-layer')} style={{ pointerEvents: show ? 'auto' : 'none', display }}>
      <div className={toClassName('backdrop', { show })} style={{ zIndex: 1 }}
           onClick={() => ui.modals.dismiss(modalId)}></div>
      <div {...classNameAndStyle(show, className, type)}
           onTransitionEnd={handleAnimationEnd}>
        {children}
      </div>
    </div>
  );
};
