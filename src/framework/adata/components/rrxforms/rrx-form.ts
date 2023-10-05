import {BehaviorSubject, debounceTime, distinctUntilChanged, map, shareReplay, skip, Subject, takeUntil} from 'rxjs';
import {isEmptyObject, randomString, removeUndefined, sleep} from 'megaloutils';
import {UiEvent, UiService} from '../../../aui/services/ui-service';
import {SimpleRx} from '../../../aui/lib/SimpleRx';
import {FormControl} from './RrxControl';

export interface IFormField {
  name: string,
  key?: string,
  id?: string,
  label?: any,
  className?: string,
  renderer?: (v: any) => any,
  formFields?: IFormField[],
  control?: FormControl,
  placeholder?: string,
  options?: any[] | any,
  hideError?: boolean,
  validators?: any[],
  labelFn?: (v: any) => any,
  searchFn?: (v: any) => any,
}

type IndexedFormControl = {
  [key: string]: RrxFormControl,
};

enum Status {
  Invalid = 'INVALID',
  Valid = 'VALID',
}

export class RrxForm {

  valueChangeSubject: any = new BehaviorSubject({});
  valueChanges = this.valueChangeSubject.pipe(
    map((v: any) => removeUndefined(v)),
    debounceTime(1),
    shareReplay(1)
  );
  statusSubject: any = new BehaviorSubject(false);
  status = this.statusSubject.pipe(
    skip(1),
    debounceTime(1),
    distinctUntilChanged(),
    shareReplay(1)
  );
  controls: IndexedFormControl = {};
  valid = false;
  value: any = {};
  touched = false; // todo
  fields: any[] = [];
  fieldsRx = new SimpleRx<any[]>([]);
  destroy$ = new Subject<boolean>();
  ui: UiService;
  formId: string;
  formDebugId = randomString(6, '#A');

  constructor(formId: string, fields: any[], ui: UiService) {
    this.ui = ui;
    this.formId = formId;

    this.fieldsRx.subscribe((newFields: any) => {
      this.fieldsChanged(newFields);
      this.fields = [...newFields];
    });
    this.fieldsRx.next(fields);

    this.valueChanges.subscribe((data: any) => {
      ui.dispatchUiEvent({key: formId, data}, UiEvent.FormChanged);
    });

    this.ui.dispatchUiEvent({
      key: this.formId,
      data: this.value,
    }, UiEvent.FormInitialized);

  }

  fieldAddControl(field: any) {
    this.controls[field.name] = new RrxFormControl(this, field.name, field.initialValue, {
      validators: field.validators
    });

    // subscribe controls
    const control = this.controls[field.name];
    control.status.pipe(takeUntil(control.destroy$)).subscribe((status: any) => {
      if (status === Status.Invalid) {
        this.valid = false;
      } else if (status === Status.Valid) {
        let allPass = true;
        for (const cKey of Object.keys(this.controls)) {
          if (this.controls[cKey].statusSubject.getValue() !== Status.Valid) {
            allPass = false;
            break;
          }
        }
        this.valid = allPass;
      }
      this.statusSubject.next(this.valid ? Status.Valid : Status.Invalid);
    });

    // validates controls for the first time
    control.validate();
  }

  fieldRemoveControl(name: any) {
    this.controls[name].destroy();
    delete this.controls[name];
  }

  setFields(newFields: any) {
    this.fieldsRx.next(newFields);
  }

  fieldsChanged(newFields: any[]) {
    const oldFieldDict: any = {};
    for (const key of Object.keys(this.controls)) {
      oldFieldDict[key] = 1;
    }
    const newFieldDict = this.recursiveGetFieldsDict(newFields);
    // add
    for (const newKey of Object.keys(newFieldDict)) {
      if (!oldFieldDict[newKey]) {
        this.fieldAddControl(newFieldDict[newKey]);
      }
    }
    // remove
    for (const oldKey of Object.keys(oldFieldDict)) {
      if (!newFieldDict[oldKey]) {
        this.fieldRemoveControl(oldKey);
      }
    }
  }

  recursiveGetFieldsDict(fields: any[]) {
    let fieldDict: any = {};
    for (const field of fields) {
      if (field.formFields && field.renderer) {
        fieldDict = {...fieldDict, ...this.recursiveGetFieldsDict(field.formFields)};
      } else {
        fieldDict[field.name] = field;
      }
    }
    return fieldDict;
  }

  async submit() {
    await this.markAllAsTouched();
    await sleep(100);
    for (const key of Object.keys(this.controls)) {
      if (this.controls[key].statusSubject._value === Status.Invalid) {
        this.ui.dispatchUiEvent({
          key: this.formId,
          data: {field: key, error: this.controls[key].error}
        }, UiEvent.FormSubmitError);
        this.valid = false;
        return;
      }
    }
    this.valid = true;
    this.ui.dispatchUiEvent({
      key: this.formId,
      data: this.value,
    }, UiEvent.FormSubmit);
    if (this.valid) return this.value;
  }

  clearValue() {
    for (const key of Object.keys(this.controls)) {
      this.controls[key].setValue(undefined);
    }
    this.value = {};
    this.valueChangeSubject.next(this.value);
  }

  setValue(values: any) {
    for (const key of Object.keys(this.controls)) {
      if (this.controls[key] === undefined) {
        throw new Error(`lacks controlName: ${key}`);
      }
    }
    this.setControlsValue(values);
    this.valueChangeSubject.next(this.value);
  }

  setControlsValue(values: any) {
    for (const key of Object.keys(values)) {
      this.value[key] = values[key];
      if (this.controls[key]) {
        this.controls[key].updateValue(values[key]);
      }
    }
  }

  patchValue(values: any) {
    this.setControlsValue(values);
    this.valueChangeSubject.next(this.value);
  }

  // only update form value and not the control value
  // patchFormValue(value: any) {
  //   for (const key of Object.keys(value)) {
  //     if (this.controls[key]) {
  //       this.value[key] = value;
  //     }
  //   }
  //   this.valueChangeSubject.next(this.values);
  // }

  async markAllAsTouched() {
    for (const key of Object.keys(this.controls)) {
      await this.controls[key].markAsTouched();
    }
  }

  getError(controlName: string) {
    return this.controls[controlName].getError();
  }

  destroy() {
    for (const key of Object.keys(this.controls)) {
      this.controls[key].destroy();
    }
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}

class RrxFormControl {
  valueChangeSubject: any = new BehaviorSubject(null);
  valueChanges = this.valueChangeSubject.pipe(
    skip(1),
    debounceTime(1),
    shareReplay(1)
  );

  statusSubject: any = new BehaviorSubject(false);
  status = this.statusSubject.pipe(
    skip(2), // + initial validation
    debounceTime(1),
    distinctUntilChanged(),
    // tap((v: any) => {
    //   console.log('v', v);
    //   this.valid = v === Status.Valid;
    // }),
    shareReplay(1)
  );

  form: RrxForm;
  name: string;
  lastValue: any = {};
  validators: any[];
  value: any;
  valid = false;
  touched = false;
  error: any = {};
  destroy$ = new Subject<boolean>();

  constructor(form: RrxForm, name: string, initialValue: any, opts: any = {}) {
    this.value = initialValue;
    this.form = form;
    this.name = name;
    this.validators = opts?.validators || [];
    if (this.validators.length === 0) {
      this.valid = true;
    }
    this.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.validate();
    });
    if (initialValue) {
      form.patchValue({[name]: initialValue});
      this.valueChanges.next(this.value);
    }
  }

  setTouched(v?: boolean) {
    if (v === undefined) this.markAsTouched();
    else this.touched = v;
  }

  getError() {
    return this.error;
  }

  getFirstError() {
    if (Object.keys(this.error)?.length) {
      return Object.keys(this.error)[0];
    }
    return '';
  }

  getValue() {
    return this.value;
  }

  setValue(value: any) {
    this.lastValue = this.value;
    this.value = value;
    this.valueChangeSubject.next(this.value);
    this.form.patchValue({[this.name]: value});
  }

  // for this form class to use
  updateValue(value: any) {
    this.lastValue = this.value;
    this.value = value;
    this.valueChangeSubject.next(this.value);
  }

  async validate() {
    let err: any = {};
    for (const validator of this.validators) {
      const result = await validator(this.value, this.form.value);
      if (result !== null) {
        err = {...err, ...result};
      }
    }
    this.error = err;
    this.statusSubject.next(isEmptyObject(err) ? Status.Valid : Status.Invalid);
  }

  // clearValidators() {
  //   return;
  // }

  // updateValueAndValidity(opts: { onlySelf?: boolean; emitEvent?: boolean; } = {}): void {
  //   return;
  // }

  async markAsTouched() {
    this.touched = true;
    await this.validate();
  }

  destroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
