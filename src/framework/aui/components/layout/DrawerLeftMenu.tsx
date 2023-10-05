import React from 'react';
import { useUiEvent } from '../../lib/SimpleRx';
import { UiEvent } from '../../services/ui-service';
import { useState } from 'react';
import { VerticalMenu } from './VerticalMenu';
import { toClassName } from 'megaloutils';

export const DrawerLeftMenu = ({ id, menuItems, className }: { id: string, menuItems: any[], className?: string }) => {
  const [active, setActive] = useState(false);

  useUiEvent(UiEvent.NavMenu, (e: any) => {
    if (e.detail.key === id) {
      setActive(prev => !prev);
    }
  });
  return (
    <div className={toClassName('drawer-left-menu', className, { active })}>
      <VerticalMenu menuItems={menuItems}/>
    </div>
  );
};
