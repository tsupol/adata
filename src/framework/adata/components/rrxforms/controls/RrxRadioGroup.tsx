import React, { useState } from 'react';
import { toClassName } from 'megaloutils';
import { useObservableSubscribe } from '../../../../aui/hooks/useObservable';

export const RrxRadioGroup = (props: any) => {
  const { form, name, onChange, disabled, options } = props;

  const [value, setValue] = useState(form?.controls[name]?.value || '');

  useObservableSubscribe(form?.controls?.[name]?.valueChanges, async (v: any) => {
    setValue(v);
  }, [name]);

  return (
    <div className={toClassName('grid gap-3', { disabled })}>
      {options && options.map((o: any) => (
        <div
          className={toClassName('radio', { checked: value === o.value })}
          onClick={() => onChange(o.value)}
          key={typeof o.value === 'string' ? o.value : JSON.stringify(o.value)}>
          <div className="radio-checker"></div>
          <RadioLabel label={o.label}/>
        </div>
      ))}
    </div>
  );
};

// todo - remove auto type - moved to utils or something
// auto type styling
const RadioLabel = ({ label }: any) => {
  if (typeof label === 'string') return <>{label}</>;
  if (React.isValidElement(label)) return label;

  // --- type: address
  if (label.country && label.streetAddress) {
    return <Address addr={label}/>;
  }

  // --- type: image & caption
  if (label.image && label.caption) {
    return (
      <div className="selectable-label">
        <div className="selectable-label-image">
          {label.image}
        </div>
        <div className="selectable-label-caption">
          {label.caption}
        </div>
      </div>
    );
  }

  // --- type: icon & caption
  // if (label.icon && label.caption) {
  //   console.log('label.icon', label.icon);
  //   return (
  //     <div className="selectable-label">
  //       <div className="selectable-label-icon">
  //         <IonIcon icon={label.icon}/>
  //       </div>
  //       <div className="selectable-label-caption">
  //         {label.caption}
  //       </div>
  //     </div>
  //   );
  // }

  return <>{JSON.stringify(label)}</>;
};

const Address = ({ addr }: any) => {
  if (!addr) return null;
  return (
    <div>
      <p>{addr.fName} {addr.lName}</p>
      <p>{addr.streetAddress} {addr.city} {addr.region}, {addr.zip} {addr.country}</p>
    </div>
  );
};

