import React, { LegacyRef, RefObject, useEffect, useRef } from 'react';
import { dndTest } from '../../lib/mdnd/dnd';
import { DROPPABLE_CLASS } from './MDNDConfigs';

export function MDNDSimple({ id, meta, cnf, children }:any) {
  const refZone = useRef<any>();

  const handleDrop = (e:any) => {
    if (e.detail?.target === refZone.current) {

      // setDataState({ structure: { ...structure, e.detail?.src?.dataset?.mdnd } });
      // onDrop({ src: e.detail?.src });
    }
  };

  useEffect(() => {
    document.addEventListener('mdnd_drop', handleDrop);
    return () => window.removeEventListener("mdnd_drop", handleDrop);
  }, []);

  useEffect(() => {
    if (refZone.current) {
      if (cnf.draggable !== false) {
        dndTest(refZone.current);
      }
    }
  }, [refZone.current]);

  return (
    <div id={id} ref={refZone} className={`relative border w-full border-border p-2 ${DROPPABLE_CLASS}`}>
      <div className="absolute w-full h-full top-0 left-0 z-0 opacity-30" style={{ backgroundColor: cnf.color }}></div>
      <h2>{meta.title}</h2>
      <div className="w-full max-w-sm bg-bg-z2 grid gap-2">
        {children}
      </div>
    </div>
  );
}
