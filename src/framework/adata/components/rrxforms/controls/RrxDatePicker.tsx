import React, { useState } from 'react';
// import Calendar from 'react-calendar';
import { forceArray } from 'megaloutils';
import dayjs from 'dayjs';
import { useAuiContext } from '../../../../aui/AuiContext';
import { useObservableSubscribe } from '../../../../aui/hooks/useObservable';

const parseDate = (v: any) => {
  if (!v) return '';
  const parsed = dayjs(v).format('DD/MM/YY');
  if (parsed === 'Invalid Date') {
    return '';
  }
  return dayjs(v).format('DD/MM/YY');
};

export const RrxDatePicker = (props: any) => {
  const { form, name, id, moreClassNames, onBlur, placeholder, type, disabled } = props;
  const [displayValue, setDisplayValue] = useState(parseDate(form?.controls[name]?.value));
  const { ui } = useAuiContext();

  useObservableSubscribe(form.controls[name].valueChanges, async (v: any) => {
    setDisplayValue(parseDate(v));
  }, [name]);

  // const ownOnChange = (item: any) => {
  //   onChange(item);
  // };

  const className = forceArray('pointer-event-none', moreClassNames);

  const showCalendar = () => {
    ui.modals.present({
      content: () => {

        return <div>no calendar for now</div>;
        // return <Calendar onChange={ownOnChange} value={form?.controls[name]?.value}/>;
      }
    });
  };

  // moreClassNames.push('pointer-event-none');

  return (
    <div onClick={showCalendar}>
      <input
        name={name}
        type={type}
        id={id}
        className={className?.join(' ')}
        onChange={() => null}
        onBlur={onBlur}
        value={displayValue}
        placeholder={placeholder}
        disabled={disabled}
      />
    </div>
  );
};

