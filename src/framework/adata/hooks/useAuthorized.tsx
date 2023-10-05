import { useEffect, useState } from 'react';
import { useADataContext } from '../ADataContext';

export const useAuthorized = () => {
  const { credential } = useADataContext();
  const [isAuthorized, setIsAuthorized] = useState(false);
  useEffect(() => {
    const fn = (data: any) => {
      if (data?.user || data?.member) {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
    };
    credential.credentialRx.subscribe(fn);
    return () => credential.credentialRx.unsubscribe(fn);
  }, [credential]);
  return isAuthorized;
};
