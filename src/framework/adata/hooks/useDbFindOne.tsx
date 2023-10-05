import { useADataContext } from '../ADataContext';
import { useEffect, useState } from 'react';
import { useAuthorized } from './useAuthorized';

export const useDbFindOne = (c: string, query: any, once = false, skipQueryCheck = false) => {
  const { db } = useADataContext();
  const [data, setData] = useState<any>(undefined);
  const isAuth = useAuthorized();

  const callback = (data: any) => {
    setData(data);
  };

  useEffect(() => {
    if (isAuth) {
      // wait for query to be ready
      // ----------------------------------------
      if (query === undefined) {
        return;
      }
      if (typeof query === 'object') {
        for (const key of Object.keys(query)) {
          if (query[key] === undefined) {
            return;
          }
        }
      }
      // fetch when ready
      // ----------------------------------------
      const dc = db.findOne(c, query, callback, once);
      return () => {
        if (dc) {
          dc.unsubscribe(callback);
        }
      };
    }
  }, [db, c, query, skipQueryCheck, isAuth, once]);
  return [data];
};
