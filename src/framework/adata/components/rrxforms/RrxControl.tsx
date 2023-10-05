import React, { useEffect, useState } from 'react';
import { RrxInput } from './controls/RrxInput';
import { Subject, takeUntil } from 'rxjs';
import { RrxMultiSearchSelect } from './controls/RrxMultiSearchSelect';
import { RrxRadioGroup } from './controls/RrxRadioGroup';
import { RrxBooleanCheckbox } from './controls/RrxBooleanCheckbox';
import { RrxTextarea } from './controls/RrxTextarea';
import { Label } from './Label';
import { RrxDropzone } from './controls/RrxDropzone';
import { RrxImageDropzone } from './controls/RrxImageDropzone';
import { RrxNumberSpinner } from './controls/RrxNumberSpinner';
import { RrxNumberInput } from './controls/RrxNumberInput';
import { RrxDatePicker } from './controls/RrxDatePicker';
import { RrxGalleryDropzone } from './controls/RrxGalleryDropzone';
import { RrxMultiSelect } from './controls/RrxMultiSelect';
import { RrxAsyncSelect } from './controls/RrxAsyncSelect';
import { RrxTabSelect } from './controls/RrxTabSelect';
import { RrxSelect } from './controls/RrxSelect';
import { RrxCtrlSelect } from './controls/RrxCtrlSelect';
import { RrxMonthSelect } from './controls/RrxMonthSelect';
import { RrxYearSelect } from './controls/RrxYearSelect';
import { RrxPassword } from './controls/RrxPassword';

export enum FormControl {
  Input = 'input',
  Password = 'password',
  TextArea = 'text-area',
  Select = 'select',
  CtrlSelect = 'ctrl-select',
  MonthSelect = 'month-select',
  YearSelect = 'year-select',
  MultiSelect = 'multi-select', // todo
  SearchSelect = 'select-search',  // todo
  AsyncSelect = 'async-search',
  RadioGroup = 'radio-group',
  TabSelect = 'tab-select',
  CheckboxGroup = 'checkbox-group',
  BooleanCheckbox = 'boolean-checkbox',
  ImageDropzone = 'image-dropzone',
  Gallery = 'gallery-dropzone',
  FileDropzone = 'file-dropzone',
  Number = 'number',
  NumberSpinner = 'number-spinner',
  DatePicker = 'date-picker',
  Hidden = 'hidden',
}

const NoLabelList = [FormControl.BooleanCheckbox];

function getControl(control: string, rest: any) {
  switch (control) {
    case FormControl.Input:
      return <RrxInput {...rest}/>;
    case FormControl.TextArea:
      return <RrxTextarea {...rest}/>;
    case FormControl.Select:
      return <RrxSelect {...rest}/>;
    case FormControl.CtrlSelect:
      return <RrxCtrlSelect {...rest}/>;
    case FormControl.MonthSelect:
      return <RrxMonthSelect {...rest}/>;
    case FormControl.YearSelect:
      return <RrxYearSelect {...rest}/>;
    case FormControl.MultiSelect:
      return <RrxMultiSelect {...rest}/>;
    case FormControl.AsyncSelect:
      return <RrxAsyncSelect {...rest}/>;
    case FormControl.SearchSelect:
      return <RrxMultiSearchSelect {...rest}/>;
    case FormControl.RadioGroup:
      return <RrxRadioGroup {...rest}/>;
    case FormControl.TabSelect:
      return <RrxTabSelect {...rest}/>;
    case FormControl.BooleanCheckbox:
      return <RrxBooleanCheckbox {...rest}/>;
    case FormControl.CheckboxGroup:
      return <RrxMultiSearchSelect {...rest}/>;
    case FormControl.ImageDropzone:
      return <RrxImageDropzone {...rest}/>;
    case FormControl.Gallery:
      return <RrxGalleryDropzone {...rest}/>;
    case FormControl.FileDropzone:
      return <RrxDropzone {...rest}/>;
    case FormControl.Number:
      return <RrxNumberInput {...rest}/>;
    case FormControl.NumberSpinner:
      return <RrxNumberSpinner {...rest}/>;
    case FormControl.DatePicker:
      return <RrxDatePicker {...rest}/>;
    case FormControl.Password:
      return <RrxPassword {...rest}/>;
    default:
      return null;
  }
}

export const RrxControl = ({ className, control, form, ...rest }: any) => {

  const [error, setError] = useState('');
  const formControl = form.controls[rest.name];

  useEffect(() => {
    const destroy$ = new Subject<boolean>();
    formControl.status.pipe(takeUntil(destroy$)).subscribe((v: any) => {
      setError(formControl.getFirstError());
    });
    return () => {
      destroy$.next(true);
      destroy$.unsubscribe();
    };
  }, [formControl]);

  rest.onBlur = () => {
    // delayed for valueChanges validation
    setTimeout(() => {
      formControl.markAsTouched();
    }, 500);
    // helpers.setTouched(true);
    // onBlur && onBlur();
  };

  rest.onChange = (e: any) => {
    if (e?.target) { // loosely check
      // from input only
      e.preventDefault && e.preventDefault();
      formControl.setValue(e.target.value);
    } else {
      formControl.setValue(e);
    }
  };

  if (control === FormControl.Hidden) {
    return null;
  }

  return (
    <div className="form-control">
      {!NoLabelList.includes(control) ? (
        <Label htmlFor={rest.name}>{rest.label}</Label>
      ) : null}
      {getControl(control, { ...rest, form })}
      {!rest.hideError && (
        <div className="field-error">
          {error}
        </div>
      )}
    </div>
  );
};
