import React, {useEffect, useMemo, useRef, useState} from "react";
import {Popover} from "react-tiny-popover";
import {forceArray, toggleArray} from "megaloutils";
import {BehaviorSubject, debounceTime, Subject, takeUntil} from "rxjs";
import {useAuiContext} from "../../../../aui/AuiContext";
import {useObservableSubscribe} from "../../../../aui/hooks/useObservable";

const SearchOptions = ({onSearch, search, options, value, onSelect}: any) => {
  const values = Array.isArray(value) ? value : [value];
  return (
    <div className="relative custom-form">
      <div>
        <input type="text" name="search" className="input" value={search} onChange={onSearch}/>
      </div>
      <div className="select-options">
        {
          options.length ? options.map((v: any) => {
            const classes = ["select-option"];
            if (values?.includes(v.value)) {
              classes.push("selected");
            }
            return (
              <div className={classes.join(" ")} key={v.value} onClick={() => onSelect(v.value)}>
                {v.label}
              </div>
            );
          }) : (
            <div>no items</div>
          )
        }
      </div>
    </div>
  );
};

const SelectedValues = ({value, setValue}: any) => {
  const [displayValue, setDisplayValue] = useState<any[]>([]);

  useEffect(() => {
    setDisplayValue([]); // todo - del
  }, [value]);

  const handleRemove = (val: any, e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setValue([...toggleArray(value, val)]);
  };
  return (
    <div className="m-select-values">
      <div className="mason-1">
        {displayValue.map((v: any) => (
          <div className="mason-item" key={v.value}>
            <div className="m-select-value">
              <div className="m-select-label -mt-0.5">{v.label}</div>
              <div className="m-select-remove"
                   onClick={(e) => handleRemove(v.value, e)}>✕
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


export const RrxMultiSearchSelect = (props: any) => {
  const onSearch$ = useMemo(() => new BehaviorSubject(""), []);
  const {ui} = useAuiContext();
  const {form, name, searchCnf, isMultiple, moreClassNames, disabled} = props;
  const [value, setValue] = useState<any>(isMultiple ? [] : "");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [options, setOptions] = useState<any[]>([]);

  const [desktopMode, setDesktopMode] = useState(false);
  useObservableSubscribe(ui.breakpoints, (bp: any) => {
    setDesktopMode(!!bp?.list?.includes("md"))
  })

  // search
  useEffect(() => {
    const destroy$ = new Subject<boolean>();
    onSearch$.pipe(
      debounceTime(500),
      // switchMap((searchStr: any) => {
      //   return searchManager.search(searchStr, searchCnf?.entity || name);
      // }),
      takeUntil(destroy$)
    ).subscribe((res: any) => {
      if (Array.isArray(res)) {
        setOptions(res.map((i: any) => ({value: i._id, label: i.title || i.username})));
      }
    });
    return () => {
      destroy$.next(true);
      destroy$.unsubscribe();
    };
  }, [onSearch$]);

  // display
  useEffect(() => {
    const destroy$ = new Subject<boolean>();
    form.controls[name].valueChanges.pipe(
      takeUntil(destroy$)
    ).subscribe((v: any) => {
      if (isMultiple) {
        setValue([...v]);
      } else {
        setValue(v);
      }
    });
    return () => {
      destroy$.next(true);
      destroy$.unsubscribe();
    };
  }, [form.controls, name, isMultiple]);


  const showOptions = (show?: boolean) => {
    if (show) {
      if (!isPopoverOpen) {
        setIsPopoverOpen(true);
        handleSearch("");
      }
    }
  };

  const handleSearch = (e: any) => {
    const value = typeof e === "string" ? e : e.target.value;
    onSearch$.next(value);
    setSearch(value);
  };

  const handleSelect = (value: any) => {
    if (isMultiple) {
      const arr = toggleArray(form.controls[name].value, value);
      form.controls[name].setValue(arr);
    } else {
      form.controls[name].setValue(value);
    }
  };

  const className = forceArray("m-select cursor-pointer", moreClassNames);
  if (disabled) {
    className.push("disabled");
  }

  return (
    <div className={className.join(" ")} onClick={() => showOptions(true)}>
      {/* --- Popover --- */}
      <Popover
        containerClassName="z-50"
        isOpen={isPopoverOpen}
        align="end"
        positions={["bottom", "top"]} // preferred positions by priority
        padding={4}
        onClickOutside={() => setIsPopoverOpen(false)}
        content={<SearchOptions onSearch={handleSearch} search={search} options={options} value={value}
                                onSelect={handleSelect}/>}
      >
        <div className="relative input h-auto flex items-center">
          <SelectedValues isMultiple={isMultiple} dataId={searchCnf?.entity || name} options={options} value={value}
                          setValue={setValue}/>
        </div>
      </Popover>
    </div>
  );
};

