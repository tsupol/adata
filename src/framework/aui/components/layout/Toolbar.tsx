import React from 'react';
import { useAuiContext } from '../../AuiContext';
import { useObservable } from '../../hooks/useObservable';

export const Toolbar = ({ children }: any) => {

  const { toolbarController } = useAuiContext();

  const [fixedTop] = useObservable(toolbarController.fixedTop);

  return (
    <div className="toolbar">
      <div className="toolbar-content">
        {children}
      </div>
      {fixedTop}
    </div>
  );
};
