import React, { useEffect, useRef } from 'react';
import { dispatchEvent, dndMasonry } from '../../lib/mdnd/dndMasonry';
import { DROPPABLE_CLASS } from './MDNDConfigs';

export function MDNDMasonryItem({ id, cnf, className, children, content }:any) {
  const refSelf = useRef<any>();

  useEffect(() => {
    if (refSelf.current) {
      if (cnf?.draggable !== false) {
        dndMasonry(refSelf.current);
      }
    }
  }, [cnf]);

  const classname = [DROPPABLE_CLASS, className];

  const handleRemove = (e:any) => {
    e.stopPropagation();
    dispatchEvent('mdnd_remove', refSelf.current, null)
  }

  return (
    <div data-id={id} data-content={content} ref={refSelf} className={classname.join(' ')}>
      <div className="mdnd-item-close" onClick={handleRemove}>×</div>
      {children}
    </div>
  );
}
