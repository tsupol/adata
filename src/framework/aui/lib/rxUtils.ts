import { debounceTime, map, Observable, OperatorFunction, tap } from 'rxjs';

export const bufferDebounceTime = <T>(time = 0): OperatorFunction<T, T[]> => (source: Observable<T>) => {
  let bufferedValues: T[] = [];

  return source.pipe(
    tap(value => bufferedValues.push(value)),
    debounceTime(time),
    map(() => bufferedValues),
    tap(() => bufferedValues = []),
  );
};
