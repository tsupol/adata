import React, { useState } from 'react';
import { Popover } from 'react-tiny-popover';
import { findInArray, toClassName, toggleArray } from 'megaloutils';
import { useObservable } from '../../../../aui/hooks/useObservable';
import { useAuiContext } from "../../../../aui/AuiContext";

const SearchOptions = ({ onSearch, search, options, value, onSelect }: any) => {
  const { t } = useAuiContext();
  const values = Array.isArray(value) ? value : [value];
  const searchRe = new RegExp(search, 'i');
  return (
    <div className="select-options-container custom-form">
      <div className="option-search-input">
        <input type="text" name="option-search" className="input" value={search} onChange={onSearch}/>
      </div>
      <div className="select-options">
        {
          options.length ? options.filter((v: any) => {
            if (!search) return true;
            return searchRe.test(v.value) || searchRe.test(v.label);
          }).map((v: any) => {
            const classes = ['select-option'];
            if (values?.includes(v.value)) {
              classes.push('selected');
            }
            return (
              <div className={classes.join(' ')} key={v.value} onClick={() => onSelect(v.value)}>
                {v.label}
              </div>
            );
          }) : (
            <div className="options-empty">{t('data:no_options')}</div>
          )
        }
      </div>
    </div>
  );
};

const SelectedValues = ({ value, setValue, options }: any) => {

  const handleRemove = (toRemove: any, e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setValue([...toggleArray(value, toRemove)]);
  };

  if (!value?.length) return null;

  return (
    <div className="m-select-values">
      <div className="mason-1">
        {value.map((v: any) => {
          const option = findInArray(options, 'value', v);
          if (!option) return null;
          return (
            <div className="mason-item" key={option.value}>
              <div className="m-select-value">
                <div className="m-select-label -mt-0.5">{option.label}</div>
                <div className="m-select-remove"
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

// note: cannot select input bug in popover
export const RrxMultiSelect = (props: any) => {
  const { form, name, moreClassNames, disabled, options, onChange } = props;
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [value] = useObservable(form.controls[name].valueChanges);
  const [search, setSearch] = useState('');

  const handleSearch = (e: any) => {
    const value = typeof e === 'string' ? e : e.target.value;
    setSearch(value);
  };

  const showOptions = (show?: boolean) => {
    if (show) {
      if (!isPopoverOpen) {
        setIsPopoverOpen(true);
        handleSearch('');
      }
    }
  };

  const handleSelect = (value: any) => {
    const arr = [...toggleArray(form.controls[name].value, value)];
    onChange(arr);
  };

  return (
    <div className={toClassName('m-select cursor-pointer', moreClassNames, { disabled })}
         onClick={() => showOptions(true)}>
      {/* --- Popover --- */}
      <Popover
        containerClassName="z-50"
        isOpen={isPopoverOpen}
        align="end"
        positions={['bottom', 'top']} // preferred positions by priority
        padding={4}
        onClickOutside={() => setIsPopoverOpen(false)}
        content={<SearchOptions onSearch={handleSearch} search={search} options={options} value={value}
                                onSelect={handleSelect}/>}
      >
        <div className="relative input h-auto flex items-center">
          <SelectedValues options={options} value={value} setValue={onChange}/>
        </div>
      </Popover>

    </div>
  );
};

