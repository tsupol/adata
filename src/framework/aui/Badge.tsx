import React from 'react';
import {toClassName} from "megaloutils";

export const Badge = ({ value, className }: { value: any, className?: string }) => {
  return (
    <div className={toClassName('badge', className)}>{value}</div>
  );
};
