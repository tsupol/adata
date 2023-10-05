import { useEffect, useState } from 'react';
import { useADataContext } from '../ADataContext';

interface IUseGetMany {
  c: string,
  q: any,
  l?: number,
  s?: any,
}

export const useDbFindMany = ({ c, q, l, s }: IUseGetMany) => {

  const { db } = useADataContext();
  const [data, setData] = useState<any>();

  useEffect(() => {
    db.findMany({
      c,
      q,
      l,
      s,
      once: true,
      callback: (v: any) => {
        setData(v);
      },
    });
  }, [db, c, q, l, s, setData]);

  return [data];
};
