import { useEffect, useState } from 'react';
import { UiEvent } from '../services/ui-service';
import { useAuiContext } from '../AuiContext';

export class SimpleRx<T> {

  value: T | undefined | null;
  callbacks: ((v: any) => void)[] = [];
  otCallbacks: ((v: any) => void)[] = [];
  replay: boolean;

  constructor(initialValue?: T, replay = true) {
    this.value = initialValue;
    this.replay = replay;
  }

  subscribe(callback: (v: any) => void) {
    this.callbacks.push(callback);
    if (this.replay && this.value !== undefined) {
      callback(this.value);
    }
  }

  subscribeOnce(callback: (v: any) => void) {
    this.otCallbacks.push(callback);
    if (this.replay && this.value !== undefined) {
      callback(this.value);
    }
  }

  unsubscribe(callback: (v: any) => void) {
    for (let i = 0; i < this.callbacks.length; i++) {
      if (this.callbacks[i] === callback) {
        this.callbacks.splice(i, 1);
      }
    }
  }

  getValue() {
    return this.value;
  }

  next(newValue?: any) {
    if (newValue !== undefined) {
      this.value = newValue;
    }
    for (const callback of this.callbacks) {
      callback(this.value);
    }
    for (const callback of this.otCallbacks) {
      callback(this.value);
    }
    this.otCallbacks = [];
  }
}

export const useSrx = <T>(rx: SimpleRx<T> | undefined): [T | null] => {
  const [data, setData] = useState<T | null>(rx?.value as T);
  const callback = (data: any) => {
    setData(data);
  };

  useEffect(() => {
    if (rx instanceof SimpleRx) {
      rx.subscribe(callback);
      return () => {
        if (rx) {
          rx.unsubscribe(callback);
        }
      };
    } else if (rx) {
      if (data !== rx) {
        setData(rx);
      }
    }
  }, [rx]);
  return [data];
};

export const useSrxFn = (rx: any, fn: (v: any) => void, moreDeps: any[] = []) => {
  useEffect(() => {
    if (rx) {
      rx.subscribe(fn);
      return () => {
        rx.unsubscribe(fn);
      };
    }
  }, [fn, rx, ...moreDeps]);
  // note remove 'fn' dep for anonymous function changed every component refresh
};

export const useUiEvent = (event: UiEvent, fn: (v: any) => void, moreDeps: any[] = []) => {
  const { ui } = useAuiContext();
  useSrxFn(ui.events[event], fn, moreDeps);
};
