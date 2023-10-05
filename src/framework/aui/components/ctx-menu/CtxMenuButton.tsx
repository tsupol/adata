import React, { useState } from 'react';
import { Popover } from 'react-tiny-popover';
import { Icon } from '../Icon';
import { CtxMenu } from './CtxMenu';

export interface IContextMenuItem {
  label: any,
  actionId: string,
  icon?: string,
  className?: string,
}

export interface ICrudContextMenu {
  menuId: string,
  controller?: any,
  data: any,
  actions?: IContextMenuItem[]
}

export const CtxMenuButton = ({
                                prefix,
                                actions,
                                data,
                                controller,
                                children,
                                positions,
                                align,
                              }:
                                {
                                  prefix?: string,
                                  actions?: IContextMenuItem[],
                                  data?: any,
                                  controller?: any,
                                  children?: any,
                                  positions?: ('left' | 'right' | 'top' | 'bottom')[]
                                  align?: 'start' | 'center' | 'end'
                                }) => {

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  return (
    <div className="w-full">
      <Popover
        isOpen={isPopoverOpen}
        positions={positions}
        align={align}
        content={<CtxMenu prefix={prefix} actions={actions} row={data} controller={controller} setIsPopoverOpen={setIsPopoverOpen}/>}
        onClickOutside={() => setIsPopoverOpen(false)}
      >
        <div
          className="cursor-pointer"
          onClick={() => setIsPopoverOpen(!isPopoverOpen)}
        >
          {children ?? <Icon name="ellipsis-vertical" style={{ fontSize: '1.5em' }}/>}
        </div>
      </Popover>
    </div>
  );
};

