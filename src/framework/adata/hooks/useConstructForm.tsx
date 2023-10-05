import { useEffect, useState } from 'react';
import { RrxForm } from '../components/rrxforms/rrx-form';
import { useAuiContext } from '../../aui/AuiContext';
import {useADataContext} from "../ADataContext";

export const useConstructForm = (formId: string, formFields: any[] | undefined) => {
  const { formService } = useADataContext();
  const [freshForm, setFreshForm] = useState<RrxForm>();

  useEffect(() => {
    // fields cannot be empty!
    if (!formFields?.length) return;
    if (formService) {
      if (formService.get(formId)?.value instanceof RrxForm) {
        (formService.get(formId).value as RrxForm).setFields(formFields);
        return;
      } else {
        const form = formService.set(formId, formService.createForm(formId, formFields));
        if (form?.value) {
          setFreshForm(form.value);
        }
      }
    }
  }, [formFields, formId, formService]);

  useEffect(() => {
    return () => formService.unset(formId);
  }, [formService, formId]);

  return [freshForm];
};
