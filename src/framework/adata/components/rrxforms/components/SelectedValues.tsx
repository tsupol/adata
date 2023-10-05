import React from 'react';

export const SelectedValues = ({ optionHash, value, toggleValue }: any) => {

  const handleRemove = (val: any, e: any) => {
    e.preventDefault();
    e.stopPropagation();
    toggleValue(val);
  };

  if (value === undefined) return null;
  const theValue = Array.isArray(value) ? value : [value];

  return (
    <div className="m-select-values">
      <div className="mason-1">
        {theValue.map((v: any) => {
          const label = optionHash[v];
          if (!label) return null;
          return (
            <div className="mason-item" key={v}>
              <div className="m-select-value">
                {(typeof label === 'string' || typeof label === 'number') ? <div className="m-select-label">{label}</div> : label}
                <div className="m-select-remove cursor-pointer"
                     onClick={(e) => handleRemove(v, e)}>✕
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
