import { Popover } from 'react-tiny-popover';
import React, { useState } from 'react';

export const APopover = ({ children, component }: any) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  return (
    <Popover
      isOpen={isPopoverOpen}
      content={<div onClick={()=>setIsPopoverOpen(!isPopoverOpen)}>{
        component
      }</div>}
      onClickOutside={() => setIsPopoverOpen(false)}
    >
      <div
        className="cursor-pointer"
        onClick={() => setIsPopoverOpen(!isPopoverOpen)}
      >
        {children}
      </div>
    </Popover>
  );
};
