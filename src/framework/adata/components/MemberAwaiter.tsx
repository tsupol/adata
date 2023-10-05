import { useADataContext } from '../ADataContext';
import { useSrx } from '../../aui/lib/SimpleRx';
import React from 'react';

export const MemberAwaiter = ({ children }: any) => {
  const { lm } = useADataContext();
  const [user] = useSrx(lm.userRx);
  if (!user) return null;
  return <>{children}</>;
};
