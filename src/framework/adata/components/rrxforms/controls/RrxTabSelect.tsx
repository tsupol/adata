import React, { useState } from 'react';
import { toClassName } from 'megaloutils';
import { useObservableSubscribe } from '../../../../aui/hooks/useObservable';

export const RrxTabSelect = (props: any) => {
  const { form, name, className, onChange, disabled, options } = props;
  const [value, setValue] = useState(form?.controls[name]?.value || '');
  useObservableSubscribe(form?.controls?.[name]?.valueChanges, async (v: any) => {
    setValue(v);
  }, [name]);

  return (
    <div className={toClassName('tab-select', className, { disabled })}>
      {options && options.map((o: any) => (
        <div
          className={toClassName('tab-select-item', { checked: value === o.value })}
          onClick={() => onChange(o.value)}
          key={typeof o.value === 'string' ? o.value : JSON.stringify(o.value)}>
          {o.label}
        </div>
      ))}
    </div>
  );
};

