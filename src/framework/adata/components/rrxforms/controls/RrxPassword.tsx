import React, { useEffect, useRef, useState } from 'react';
import { useObservableSubscribe } from '../../../../aui/hooks/useObservable';

/**
 * Note: not ready
 * problem with cursor and deletion
 * better use type='password'
 */

export const RrxPassword = (props: any) => {
  const { form, name, id, moreClassNames, onBlur, placeholder, disabled } = props;
  const [dValue, setDValue] = useState(form?.controls[name]?.value || '');
  const [value, setValue] = useState(form?.controls[name]?.value || '');

  useObservableSubscribe(form?.controls?.[name]?.valueChanges, async (v: any) => {
    setValue(v);
    setDValue(toAsteriskPassword(v));
  }, [name]);

  const [cursor, setCursor] = useState(null);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const input = ref.current;
    if (input) input.setSelectionRange(cursor, cursor);
  }, [ref, cursor, value]);

  const handleChange = (e: any) => {
    setCursor(e.target.selectionStart);
    setDValue(e.target.value);
    form?.controls?.[name].setValue(asteriskToValue(form?.controls?.[name].getValue(), e.target.value));
  };

  return (
    <input
      ref={ref}
      name={name}
      type="input"
      id={id || name}
      className={moreClassNames?.join(' ')}
      onChange={handleChange}
      onBlur={onBlur}
      value={dValue}
      placeholder={placeholder}
      disabled={disabled}
    />
  );
};

const toAsteriskPassword = (str: string) => {
  let ast = '';
  for (let i = 0; i < str.length; i++) {
    ast += '*';
  }
  return ast;
};

const asteriskToValue = (v: string, av: string) => {
  let iTarget = 0;
  let newChar = '';
  for (let i = 0; i < av.length; i++) {
    if (av[i] !== '*') {
      iTarget = i;
      newChar = av[i];
      break;
    }
  }
  return v.substring(0, iTarget) + newChar + v.substring(iTarget, v.length);
};
