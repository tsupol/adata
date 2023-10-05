import React, { useEffect, useRef, useState } from 'react';
import { Subject, takeUntil } from 'rxjs';

export const RrxTextarea = (props: any) => {
  const { form, name, id, moreClassNames, onChange, onBlur, placeholder, disabled } = props;
  const [value, setValue] = useState(form?.controls[name]?.value || '');

  const [cursor, setCursor] = useState(null);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const input = ref.current;
    if (input) input.setSelectionRange(cursor, cursor);
  }, [ref, cursor, value]);

  const handleChange = (e: any) => {
    setCursor(e.target.selectionStart);
    onChange && onChange(e);
  };

  useEffect(() => {
    const destroy$ = new Subject<boolean>();
    form.controls[name].valueChanges.pipe(
      takeUntil(destroy$)
    ).subscribe((v: any) => {
      setValue(v);
    });
    return () => {
      destroy$.next(true);
      destroy$.unsubscribe();
    };
  }, [form.controls, name]);

  return (
    <textarea
      ref={ref}
      name={name}
      id={id}
      className={moreClassNames?.join(' ')}
      onChange={handleChange}
      onBlur={onBlur}
      value={value}
      placeholder={placeholder}
      disabled={disabled}
    />
  );
};

