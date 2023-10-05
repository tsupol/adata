import React, { useEffect, useRef, useState } from 'react';
import { toClassName } from 'megaloutils';
import { useObservable } from '../../../../aui/hooks/useObservable';
import { Popover } from 'react-tiny-popover';
import { useADataContext } from '../../../ADataContext';
import { OptionsController } from '../../../services/options-service';
import {useAuiContext} from "../../../../aui/AuiContext";

const ShowSearchThreshold = 1

export const RrxCtrlSelect = (props: any) => {
  const { moreClassNames, disabled } = props;
  const { optionsService } = useADataContext();
  const [ctrl, setCtrl] = useState<OptionsController>();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  useEffect(() => {
    const ctrl = optionsService.createOptionsController(props);
    setCtrl(ctrl);
    return () => ctrl.destroy();
  }, [optionsService, props]);


  const showOptions = (show: boolean) => {
    setIsPopoverOpen(show);
  };

  if (!ctrl) return null;

  return (
    <div className={toClassName('select-container', moreClassNames, { disabled })} onClick={() => showOptions(true)}>
      <Popover
        containerClassName="select-pop-container"
        isOpen={isPopoverOpen}
        align="end"
        positions={['bottom', 'top']} // preferred positions by priority
        padding={4}
        onClickOutside={() => setIsPopoverOpen(false)}
        content={<SearchOptions ctrl={ctrl}/>}
      >
        <div>
          <ValueDisplay ctrl={ctrl}/>
          <div className="select-arrow"></div>
        </div>
      </Popover>
    </div>
  );
};

const ValueDisplay = ({ ctrl }: { ctrl: OptionsController }) => {
  const cProps = ctrl.props;
  const [selectedOptions] = useObservable(ctrl.display$);
  if (!selectedOptions?.length) return (
    <div className="selected-options">
      <div className="placeholder-container">{cProps.placeholder}</div>
    </div>
  );
  return (
    <div className="selected-options">
      <div className="m-select-values">
        <div className="mason-1">
          {selectedOptions.map((v: any) => {
            return (
              <div className="mason-item" key={v}>
                <div className="m-select-value">
                  {typeof v.label === 'string' || typeof v.label === 'number'
                    ? <div className="m-select-label">{v.label}</div>
                    : v.label}
                  <div className="m-select-remove cursor-pointer"
                       onClick={(e) => ctrl.toggleValue(v.value, e)}>✕
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const SearchOptions = ({ ctrl }: { ctrl: OptionsController }) => {
  const { t } = useAuiContext();
  const inputRef = useRef<HTMLInputElement>();
  const [filteredOpts] = useObservable(ctrl.filteredOptions$);
  const [options] = useObservable(ctrl.optionsSubject);
  const onChange = (e: any) => {
    ctrl.searchSrtSubject.next(e.target.value);
  };

  useEffect(() => {
    inputRef?.current?.focus();
  }, []);

  if (!filteredOpts) return null;

  return (
    <div className="custom-form">
      {options?.length > ShowSearchThreshold ? (
        <div className="p-1 bg-z2">
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            name="search"
            onChange={onChange}
            placeholder={t('data:search') as string}
          />
        </div>
      ) : null}
      <Options options={filteredOpts} ctrl={ctrl}/>
    </div>
  );
};

const Options = ({ options, ctrl }: { ctrl: OptionsController, options: any[] }) => {
  const { t } = useAuiContext();
  return (
    <div className={toClassName('select-options aaa', ctrl.props.optionsClassName)}>
      {
        options?.length ? options.map((v: any) => (
          <div className="select-option" key={v.value} onClick={() => ctrl.onSelect(v.value)}>
            {v.label}
          </div>
        )) : (
          <div className="options-empty">{t('data:no_options')}</div>
        )
      }
    </div>
  );
};
