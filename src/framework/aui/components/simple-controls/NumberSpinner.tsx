import React, { useEffect, useState } from 'react';
import { Subject } from 'rxjs';

export const NumberSpinner = (props: any) => {
  const { name, id, initialValue, value: inputValue, moreClassNames, onChange, onBlur, placeholder, type, disabled, min = 0, max = 99, step = 1 } = props;
  const [value, setValue] = useState<number>(inputValue || initialValue || 0);

  useEffect(() => {
    setValue(inputValue);
  }, [inputValue]);

  useEffect(() => {
    const destroy$ = new Subject<boolean>();
    return () => {
      destroy$.next(true);
      destroy$.unsubscribe();
    };
  }, []);

  let containerClasses = ['number-spin custom-form', disabled ? 'disabled' : ''];
  if (Array.isArray(moreClassNames)) {
    containerClasses = moreClassNames.concat(containerClasses);
  }

  const addValue = (adder: number) => {
    if (value + adder >= min && value + adder <= max) {
      const newValue = value + adder;
      setValue(newValue);
      if (onChange) {
        onChange(newValue);
      }
    }
  };

  const handleChange = (e: any) => {
    if (e.target.value === '') {
      onChange(min);
    }
    if (!isNaN(parseInt(e.target.value))) {
      if (parseInt(e.target.value) > max) {
        onChange(max);
      } else if (parseInt(e.target.value) < min) {
        onChange(min);
      } else {
        onChange(parseInt(e.target.value));
      }
    }
  };

  return (
    <div className={containerClasses.join(' ')}>
      <div className="number-spin-plus" onClick={() => addValue(-step)}>
        -
      </div>
      <input
        name={name}
        type={type}
        id={id}
        className=""
        onChange={handleChange}
        onBlur={onBlur}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
      />
      <div className="number-spin-plus" onClick={() => addValue(step)}>
        +
      </div>
    </div>
  );
};

