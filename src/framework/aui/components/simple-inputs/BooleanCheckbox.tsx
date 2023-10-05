import React from 'react';
import {useAuiContext} from "../../AuiContext";

export const BooleanCheckbox = ({children, setValue, value}: any) => {

  const {adapter} = useAuiContext();

  const handleClick = () => {
    if (setValue) {
      setValue(!value);
    }
  };

  return (
    <div className={'checkbox checkbox-plain' + (value ? ' checked' : '')}
         onClick={handleClick}>
      <div className="checkbox-checker">
        {adapter?.checkmark}
      </div>
      {children}
    </div>
  );
};
