import React, { useEffect, useRef, useState } from 'react';
import { useObservableSubscribe } from '../../../../aui/hooks/useObservable';

export const RrxInput = (props: any) => {
  const { form, name, id, moreClassNames, onChange, onBlur, placeholder, type, disabled } = props;
  const [value, setValue] = useState(form?.controls[name]?.value || '');

  useObservableSubscribe(form?.controls?.[name]?.valueChanges, async (v: any) => {
    setValue(v);
  }, [name]);

  const [cursor, setCursor] = useState(null);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const input = ref.current;
    if (input) input.setSelectionRange(cursor, cursor);
  }, [ref, cursor, value]);

  const handleChange = (e:any) => {
    setCursor(e.target.selectionStart);
    onChange && onChange(e);
  };

  return (
    <input
      ref={ref}
      name={name}
      type={type}
      id={id || name}
      className={moreClassNames?.join(' ')}
      onChange={handleChange}
      onBlur={onBlur}
      value={value}
      placeholder={placeholder}
      disabled={disabled}
    />
  );
};

