import React, { useEffect, useRef, useState } from 'react';
import { isEmptyObject, toClassName, toggleArray } from 'megaloutils';
import { useObservableSubscribe } from '../../../../aui/hooks/useObservable';
import { SelectedValues } from '../components/SelectedValues';
import { useSrx } from '../../../../aui/lib/SimpleRx';
import { Popover } from 'react-tiny-popover';
import {useAuiContext} from "../../../../aui/AuiContext";

export const RrxSelect = (props: any) => {
  const { form, name, isMultiple, moreClassNames, optionsClassName, placeholder, disabled, options: inputOptions } = props;
  const [value, setValue] = useState<any>(form?.controls[name]?.value || isMultiple ? [] : '');
  const [optionHash, setOptionHash] = useState<any>({});
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const [options] = useSrx<any>(inputOptions);

  useObservableSubscribe(form.controls[name].valueChanges, async (v: any) => {
    setValue(v);
  }, [name]);

  useEffect(() => {
    // because new value or initial value set outside don't have optionHash yet
    if (isEmptyObject(optionHash) && hasValue(value) && options?.length) {
      try {
        const hash: any = {};
        if (Array.isArray(value)) {
          for (const option of options) {
            for (const v of value) {
              if (option.value === v) {
                hash[v] = option.label;
              }
            }
          }
        } else {
          for (const option of options) {
            if (option.value === value) {
              hash[value] = option.label;
            }
          }
        }
        setOptionHash(hash);
      } catch (err) {
        console.error('err', err);
      }
    }
  }, [value, options, optionHash]);

  const hasValue = (v: any) => {
    if (Array.isArray(v)) {
      return !!v.length;
    }
    return !!v;
  };

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
    // ui.modals.present({
    //   component: () => {
    //     return <SearchOptions searchFn={searchFn} onSelect={handleSelect}/>;
    //   }
    // });
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
          {!value ? <div className="placeholder-container">{placeholder}</div> : null}
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
      {options?.length > 8 ? (
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
