import { useEffect, useState } from 'react';
import { useADataContext } from '../ADataContext';

export const useDbCount = (c: string, q: any, once = true) => {

  const { db } = useADataContext();
  const [data, setData] = useState<any>();

  useEffect(() => {
    db.count(c, q, v => {
      setData(v);
    }, once);
  }, [db, c, q, setData, once]);

  return data;
};
