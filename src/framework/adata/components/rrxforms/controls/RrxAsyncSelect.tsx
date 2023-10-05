import React, { useEffect, useState } from 'react';
import { useAuiContext } from '../../../../aui/AuiContext';
import { isEmptyObject, toClassName, toggleArray } from 'megaloutils';
import { useObservableSubscribe } from '../../../../aui/hooks/useObservable';
import { SelectedValues } from '../components/SelectedValues';
import { useDebounce } from 'use-debounce';

export const RrxAsyncSelect = (props: any) => {
  const { ui } = useAuiContext();
  const { form, name, isMultiple, onChange, moreClassNames, placeholder, disabled, searchFn, optionsFn } = props;
  const [value, setValue] = useState<any>(form?.controls[name]?.value || isMultiple ? [] : '');
  const [optionHash, setOptionHash] = useState<any>({});

  useObservableSubscribe(form.controls[name].valueChanges, async (v: any) => {
    setValue(v);
  }, [name]);

  useEffect(() => {
    // because new value or initial value set outside don't have optionHash yet
    if (isEmptyObject(optionHash) && value) {
      if (typeof optionsFn === 'function') {
        const seek: string[] = [];
        if (Array.isArray(value)) {
          for (const item of value) {
            if (!optionHash[item]) {
              seek.push(item);
            }
          }
        } else if (value) {
          seek.push(value);
        }
        if (seek.length) {
          optionsFn(seek).then((v: any) => {
            setOptionHash((prev: any) => ({ ...prev, ...v }));
          });
        }
      }
    }
  }, [value, optionsFn, optionHash]);

  const removeValue = (v: any) => {
    if (isMultiple) {
      onChange(toggleArray(value, v));
    } else {
      onChange('');
    }
  };

  const handleSelect = (v: any) => {
    setOptionHash((prev: any) => ({ ...prev, [v.value]: v.label }));
    if (isMultiple) {
      form.controls[name].setValue(toggleArray(value, v.value));
    } else {
      form.controls[name].setValue(v.value);
    }
  };

  const showOptions = () => {
    ui.modals.present({
      component: () => {
        return <SearchOptions searchFn={searchFn} onSelect={handleSelect}/>;
      }
    });
  };

  return (
    <div className={toClassName('select-container', moreClassNames, { disabled })} onClick={() => showOptions()}>
      {!value ? <div className="placeholder-container">{placeholder}</div> : null}
      <div className="selected-options">
        <SelectedValues optionHash={optionHash} value={value} toggleValue={removeValue}/>
      </div>
      <div className="select-arrow"></div>
    </div>
  );
};

const SearchOptions = ({ searchFn, onSelect }: any) => {
  const { t } = useAuiContext();
  const [options, setOptions] = useState([]);
  const [value, setValue] = useState('');
  const [debouncedValue] = useDebounce(value, 500);
  const onChange = (e: any) => {
    setValue(e.target.value);
  };

  useEffect(() => {
    if (searchFn) {
      searchFn(debouncedValue).then((v: any) => setOptions(v));
    }
  }, [debouncedValue, searchFn]);

  return (
    <div className="custom-form">
      <div className="p-1">
        <input
          name="search"
          onChange={onChange}
          value={value}
          placeholder={t('data:search') as string}
        />
      </div>
      <Options options={options} onSelect={onSelect}/>
    </div>
  );
};

const Options = ({ options, onSelect }: any) => {
  const { t } = useAuiContext();
  return (
    <div className="select-options">
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
