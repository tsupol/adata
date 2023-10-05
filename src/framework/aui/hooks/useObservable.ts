import { useEffect, useState } from 'react';
import { Subject, takeUntil } from 'rxjs';

export const useObservable = (observable: any): any [] => {
  const [state, setState] = useState(undefined);
  useEffect(() => {
    if (observable) {
      const subscription = observable.subscribe((result: any) => {
        setState(result);
      });
      return () => subscription.unsubscribe();
    }
  }, [observable]);
  return [state];
};

export const useObservableSubscribe = (observable: any, callback: (v: any) => void, scope: any[] = []) => {
  useEffect(() => {
    const destroy$ = new Subject<boolean>();
    if (observable) {
      const subscription = observable.pipe(takeUntil(destroy$)).subscribe(callback);
      return () => {
        subscription.unsubscribe();
      };
    }
    return () => {
      destroy$.next(true);
      destroy$.complete();
    };
  }, [observable, ...scope]);
};
