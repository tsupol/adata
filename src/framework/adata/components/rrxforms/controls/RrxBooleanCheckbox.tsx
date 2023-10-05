import React, {useEffect, useState} from 'react';
import {Subject, takeUntil} from 'rxjs';
import {toClassName} from 'megaloutils';
import {useAuiContext} from "../../../../aui/AuiContext";

export const RrxBooleanCheckbox = (props: any) => {
  const {adapter} = useAuiContext();
  const {form, name, label, className, onChange, disabled} = props;
  const [value, setValue] = useState(form.controls[name].value);

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

  const handleClick = () => {
    if (onChange) {
      onChange(!form.controls[name].value);
    }
  };

  return (
    <div className={toClassName('checkbox checkbox-plain', className, {checked: !!value}, {disabled})}
         onClick={handleClick}>
      <div className="checkbox-checker">
        {adapter?.checkmark}
      </div>
      {label}
    </div>
  );
};

