import React from 'react';
import { RrxControl } from './RrxControl';
import { toClassName } from 'megaloutils';
import { useSrx } from '../../../aui/lib/SimpleRx';
import { useAuiContext } from '../../../aui/AuiContext';
import { RrxForm } from './rrx-form';
import {useADataContext} from "../../ADataContext";

interface IFormDisplayCnf {
  usePlaceholderAsLabel: boolean;
}

const recursiveRenderFields = (form: RrxForm, fields: any[], cnf?: IFormDisplayCnf) => {
  const components: any[] = [];
  if (Array.isArray(fields)) {
    for (const field of fields) {
      if (field.renderer) {
        try {
          components.push(field.renderer(recursiveRenderFields(form, field.formFields, cnf)));
        } catch (e) {
          console.log('e', e);
        }
      } else {
        const overrides: any = {};
        if (cnf) {
          if (cnf.usePlaceholderAsLabel) {
            overrides.label = false;
            overrides.placeholder = field.placeholder || field.label || field.name;
          }
        }
        components.push(
          <div
            key={field.name}
            className={toClassName('custom-form', `fc-${field.name}`, field.className)}
            // style={{ gridArea: field.name }}
          >
            {form.controls[field.name] ? <RrxControl
              {...field}
              form={form}
              control={field.control || 'input'}
              label={field.label}
              name={field.name}
              {...overrides}
            /> : null}
          </div>
        );
      }
    }
  }
  return components;
};

export const RrxFormDisplay = ({
                                 className,
                                 children,
                                 id,
                                 cnf
                               }:
                                 {
                                   className?: string,
                                   children?: any,
                                   id: string,
                                   cnf?: IFormDisplayCnf
                                 }) => {
  const { formService } = useADataContext();
  const [form] = useSrx(formService.get(id));
  const [fields] = useSrx(form?.fieldsRx);

  if (!(form && fields)) return null;

  return (
    <div className={toClassName(className)}>
      {recursiveRenderFields(form, fields, cnf)}
      {children}
    </div>
  );
};
