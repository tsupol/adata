import React, { useEffect, useRef, useState } from 'react';
import { toClassName, toggleArray } from 'megaloutils';
import { useObservableSubscribe } from '../../../../aui/hooks/useObservable';
import { SelectedValues } from '../components/SelectedValues';
import { Popover } from 'react-tiny-popover';
import {useAuiContext} from "../../../../aui/AuiContext";

export const RrxPlainSelect = (props: any) => {
  const { form, name, isMultiple, moreClassNames, optionsClassName, placeholder, options, disabled } = props;
  const [value, setValue] = useState<any>(form?.controls[name]?.value || isMultiple ? [] : '');
  const [optionHash, setOptionHash] = useState<any>({});
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  useObservableSubscribe(form.controls[name].valueChanges, async (v: any) => {
    setValue(v);
  }, [name]);

  const handleSelect = (v: any) => {
    setOptionHash((prev: any) => ({ ...prev, [v.value]: v.label }));
    if (isMultiple) {
      form.controls[name].setValue(toggleArray(form.controls[name].value, v.value || v));
    } else {
      form.controls[name].setValue(v.value);
    }
  };

  const showOptions = (show: boolean) => {
    setIsPopoverOpen(show);
  };

  return (
    <div className={toClassName('select-container', moreClassNames, { disabled })} onClick={() => showOptions(true)}>
      <Popover
        containerClassName="select-pop-container"
        isOpen={isPopoverOpen}
        align="end"
        positions={['bottom', 'top']} // preferred positions by priority
        padding={4}
        onClickOutside={() => setIsPopoverOpen(false)}
        content={<SearchOptions options={options} onSelect={handleSelect} optionsClassName={optionsClassName}/>}
      >
        <div>
          {value === undefined || value?.length === 0 ? <div className="placeholder-container">{placeholder}</div> : null}
          <div className="selected-options">
            <SelectedValues optionHash={optionHash} value={value} toggleValue={handleSelect}/>
          </div>
          <div className="select-arrow"></div>
        </div>
      </Popover>
    </div>
  );
};

const SearchOptions = ({ options, onSelect, optionsClassName }: any) => {
  const { t } = useAuiContext();
  const inputRef = useRef<HTMLInputElement>();
  const [searchStr, setSearchStr] = useState('');
  const onChange = (e: any) => {
    setSearchStr(e.target.value);
  };

  useEffect(() => {
    inputRef?.current?.focus();
  }, []);

  return (
    <div className="custom-form">
      {options?.length > 12 ? (
        <div className="p-1 bg-z2">
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            name="search"
            onChange={onChange}
            value={searchStr}
            placeholder={t('data:search') as string}
          />
        </div>
      ) : null}
      <Options options={options} onSelect={onSelect} optionsClassName={optionsClassName}/>
    </div>
  );
};

const Options = ({ options, onSelect, optionsClassName }: any) => {
  const { t } = useAuiContext();
  return (
    <div className={toClassName('select-options aaa', optionsClassName)}>
      {
        options?.length ? options.map((v: any) => (
          <div className="select-option" key={v.value} onClick={() => onSelect(v)}>
            {v.label}
          </div>
        )) : (
          <div className="options-empty">{t('data:no_options')}</div>
        )
      }
    </div>
  );
};
