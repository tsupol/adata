import React from 'react';
import {useAuiContext} from "../AuiContext";

export const Icon = ({name, size, className, style}:
                       { name: string, size?: string, className?: string, style?: any }) => {

  const {adapter} = useAuiContext();
  if (!adapter) return null;

  adapter.iconComponentFn({
    className,
    size,
    style,
    icon: (adapter.iconList as any)[toCamelCase(name)] ?? `assets/inline-icons/${name}.svg`
  });
};

const toCamelCase = (str: string) => {
  return str.replace(/-([a-z])/g, function (g) {
    return g[1].toUpperCase();
  });
};
