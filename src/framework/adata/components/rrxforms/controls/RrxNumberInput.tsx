import React, { useState } from 'react';
import { useObservableSubscribe } from '../../../../aui/hooks/useObservable';

export const RrxNumberInput = (props: any) => {
  const { form, name, id, className, onChange, onBlur, placeholder, type, disabled, min = 0, max = 9999 } = props;
  const [value, setValue] = useState<any>(form?.controls[name]?.value || '');

  useObservableSubscribe(form.controls[name].valueChanges, async (v: any) => {
    setValue(v);
  }, [name]);

  const ownOnchange = (e: any) => {
    if (e.target.value === '' || isNaN(parseInt(e.target.value))) {
      setValue('');
      onChange('');
    } else {
      let theValue = parseInt(e.target.value);
      if (theValue < min) {
        theValue = min;
      }
      if (theValue > max) {
        theValue = max;
      }
      setValue(theValue);
      onChange(theValue);
    }
  };

  return (
    <input
      name={name}
      type={type}
      id={id}
      className={className}
      onChange={ownOnchange}
      onBlur={onBlur}
      value={value}
      placeholder={placeholder}
      disabled={disabled}
    />
  );
};

