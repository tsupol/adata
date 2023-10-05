import React, {useEffect, useState} from 'react';
import {Subject, takeUntil} from 'rxjs';
import {toClassName} from 'megaloutils';

export const RrxNumberSpinner = (props: any) => {
  const {
    form,
    name,
    id,
    initialValue,
    moreClassNames,
    onChange,
    onBlur,
    placeholder,
    type,
    disabled,
    min = 0,
    max = 99,
    step = 1
  } = props;
  const [value, setValue] = useState<any>(initialValue === undefined ? '' : initialValue);

  useEffect(() => {
    const destroy$ = new Subject<boolean>();
    form.controls[name].valueChanges.pipe(
      takeUntil(destroy$)
    ).subscribe((v: any) => {
      setValue(v === undefined ? '' : v);
    });
    return () => {
      destroy$.next(true);
      destroy$.unsubscribe();
    };
  }, [form.controls, name]);


  const addValue = (adder: number) => {
    const theValue = parseInt(value);
    if (theValue + adder >= min && theValue + adder <= max) {
      const newValue = theValue + adder;
      setValue(newValue);
      if (onChange) {
        onChange(newValue);
      }
    }
  };

  const ownOnchange = (e: any) => {
    if (e.target.value === '') {
      onChange(undefined);
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
    <div className={toClassName('number-spin', disabled, moreClassNames)}>
      <div className="number-spin-plus" onClick={() => addValue(-step)}>
        -
      </div>
      <input
        name={name}
        type={type}
        id={id}
        className=""
        onChange={ownOnchange}
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

