import { BehaviorSubject, debounceTime, distinctUntilChanged, map, shareReplay, Subject, takeUntil } from 'rxjs';
import { DbService } from './db-service';
import { ApiService } from './api-service';
import { Deferred, toggleArray } from 'megaloutils';
import { SimpleRx } from '../../aui/lib/SimpleRx';

// const MAX_OPTIONS_COUNT = 8;

export class OptionsService {
  db: DbService;
  api: ApiService;
  destroy$ = new Subject<boolean>();

  constructor(db: DbService, api: ApiService) {
    this.db = db;
    this.api = api;
  }

  createOptionsController(props: any) {
    return new OptionsController(props, this.db, this.api);
  }

  destroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}

type OptionItem = {
  value: any,
  label: any,
}

export class OptionsController {
  db: DbService;
  api: ApiService;
  props: any;
  destroy$ = new Subject<boolean>();
  optionsCache: any = {};
  displaySubject: any = new BehaviorSubject<OptionItem[]>([]);
  display$ = this.displaySubject.pipe(
    debounceTime(100),
    distinctUntilChanged(),
    map((vs: any[]) => vs.map((v: any) => {
      return {
        value: v.value,
        label: this.labelFn(v)
      };
    })),
    shareReplay(1),
    takeUntil(this.destroy$)
  );
  valueSubject: any = new BehaviorSubject([]);
  value$ = this.valueSubject.pipe(
    debounceTime(100),
    distinctUntilChanged(),
    shareReplay(1),
    takeUntil(this.destroy$)
  );
  searchSrtSubject: any = new BehaviorSubject<OptionItem[]>([]);
  searchStr$ = this.searchSrtSubject.pipe(
    debounceTime(500),
    shareReplay(1),
    takeUntil(this.destroy$)
  );
  optionsSubject: any = new BehaviorSubject<OptionItem[]>([]);
  filteredOptionsSubject: any = new BehaviorSubject<OptionItem[]>([]);
  filteredOptions$ = this.filteredOptionsSubject.pipe(
    debounceTime(100),
    map((vs: any[]) => vs.map((v: any) => ({
      value: v.value,
      label: this.labelFn(v)
    }))),
    shareReplay(1),
    takeUntil(this.destroy$)
  );
  isMultiple: boolean;
  instruction: any;
  dataController: OptionDataController;
  touched = false;
  labelFn = (v: any) => {
    if (typeof v.label === 'string') {
      return v.label;
    } else if (v.label?.title) {
      return v.label.title;
    }
    return v.value;
  };

  constructor(props: any, db: DbService, api: ApiService) {
    this.props = props;
    this.db = db;
    this.api = api;
    this.isMultiple = props.isMultiple;
    this.instruction = props.options || {};
    if (this.instruction?.$db) {
      this.dataController = new dbDataController(this.instruction.$db, db, this);
    } else if (this.instruction?.$search) {
      this.dataController = new searchDataController(this.instruction.$search, db, this);
    } else {
      this.dataController = new basicDataController(this.instruction, db, this);
    }
    const initValue = props.isMultiple ? (props.initialValue || []) : props.initialValue ? [props.initialValue] : [];
    this.valueSubject.next(initValue);
    this.dataController.processInitialValue(initValue);
    this.dataController.initOptions();
    this.searchStr$.subscribe((str: string) => {
      this.dataController.handleSearch(str);
    });
    this.value$.subscribe((v: any[]) => {
      if (v) {
        this.displaySubject.next(v.map((value) => ({
          value,
          label: this.optionsCache[value]
        })));
        if (this.touched) {
          this.submitValue(v);
        }
      }
    });

    // override
    if (props.labelFn) {
      this.labelFn = this.props.labelFn;
    }
  }

  submitValue(v: any[]) {
    if (this.props.isMultiple) {
      this.props.onChange(v);
    } else {
      this.props.onChange(v?.[0] || '');
    }
  }

  onSelect(value: any) {
    const options = this.optionsSubject.getValue();
    let newValue = [];
    if (this.isMultiple) {
      newValue = toggleArray(this.valueSubject.getValue(), value);
    } else {
      newValue = [value];
    }
    if (!this.optionsCache[value]) {
      for (const option of options) {
        if (option.value === value) {
          this.optionsCache[value] = option.label;
          break;
        }
      }
    }
    this.touched = true;
    this.valueSubject.next(newValue);
  }

  toggleValue(v: any, e: any) {
    e.preventDefault();
    e.stopPropagation();
    const newValue = toggleArray(this.valueSubject.getValue(), v);
    this.valueSubject.next([...newValue]);
  }

  getValue() {
    if (this.isMultiple) {
      return this.valueSubject.getValue();
    }
    return this.valueSubject.getValue()?.[0];
  }

  destroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}

// --------------------------------------------------------------------------------
// Data Controllers
// --------------------------------------------------------------------------------

interface OptionDataController {
  processInitialValue: (v: any[]) => void;
  initOptions: () => void;
  handleSearch: (v: string) => void;
}

class dbDataController implements OptionDataController {
  db: DbService;
  optionsController: OptionsController;
  cnf: any;
  searchFields = ['title'];

  constructor(cnf: any, db: DbService, optionsController: OptionsController) {
    this.cnf = cnf;
    this.db = db;
    this.optionsController = optionsController;
    if (cnf.searchFields) {
      this.searchFields = cnf.searchFields;
    }
  }

  async processInitialValue(initValue: any[]) {
    if (initValue?.length) {
      const cnf = this.cnf;
      const cache: any = {};
      const promises = [];
      const deferred = new Deferred();
      for (const value of initValue) {
        promises.push(deferred.promise);
        this.db.findOne(cnf.c, value, (v: any) => {
          cache[value] = v;
          deferred.resolve();
        }, true);
      }
      await Promise.all(promises);
      this.optionsController.optionsCache = cache;
    }
  }

  initOptions() {
    const { c, q } = this.cnf;
    this.db.findAll({
      c, q, callback: (list: any[]) => {
        const options = list.map(v => ({
          value: v._id,
          label: v
        }));
        this.optionsController.optionsSubject.next(options);
        this.optionsController.filteredOptionsSubject.next(options);
      }
    });
  }

  handleSearch(str: string) {
    const options = this.optionsController.optionsSubject.getValue();
    const searchRe = new RegExp(str, 'i');
    const filtered = options.filter((opt: any) => {
      for (const field of this.searchFields) {
        if (searchRe.test(opt.label[field])) {
          return true;
        }
      }
      return false;
    });
    this.optionsController.filteredOptionsSubject.next(filtered);
  }
}


class basicDataController implements OptionDataController {
  db: DbService;
  optionsController: OptionsController;
  cnf: any;
  optionsRx = new SimpleRx<any[]>([]);

  constructor(cnf: any, db: DbService, optionsController: OptionsController) {
    this.optionsController = optionsController;
    this.cnf = cnf;
    this.db = db;
    if (cnf instanceof SimpleRx) {
      this.optionsRx = cnf;
    } else if (Array.isArray(cnf)) {
      this.optionsRx.next(cnf);
    }
    this.optionsRx.subscribe((v: any[]) => this.handleOptions(v));
  }

  async processInitialValue(initValue: any[]) {
    if (initValue?.length) {
      let tickCount = 0;
      const myInterval = setInterval(() => {
        const options = this.optionsRx.getValue();
        if (options?.length) {
          for (const option of options) {
            this.optionsController.optionsCache[option.value] = option.label;
          }
          clearInterval(myInterval);
        }
        if (tickCount > 20) {
          clearInterval(myInterval);
        }
        tickCount++;
      }, 200);
    }
  }

  initOptions() {
    return true
  }

  handleSearch(str: string) {
    const options = this.optionsController.optionsSubject.getValue();
    const searchRe = new RegExp(str, 'i');
    if (options?.[0]?.label && typeof options[0].label !== 'string') {
      throw new Error('cannot search. label is not string');
    }
    const filtered = options.filter((opt: any) => searchRe.test(opt.label));
    this.optionsController.filteredOptionsSubject.next(filtered);
  }

  handleOptions(options: any[]) {
    this.optionsController.optionsSubject.next(options);
  }

  destroy() {
    this.optionsRx.unsubscribe(this.handleOptions);
  }
}

class searchDataController implements OptionDataController {
  db: DbService;
  optionsController: OptionsController;
  cnf: any;

  constructor(cnf: any, db: DbService, optionsController: OptionsController) {
    this.cnf = cnf;
    this.db = db;
    this.optionsController = optionsController;
  }

  async processInitialValue(initialValue: any[]) {
    const cnf = this.cnf;
    const cache: any = {};
    const promises = [];
    const deferred = new Deferred();
    for (const value of initialValue) {
      promises.push(deferred.promise);
      this.db.findOne(cnf.c, value, (v: any) => {
        cache[value] = v;
        deferred.resolve();
      }, true);
    }
    await Promise.all(promises);
    this.optionsController.optionsCache = cache;
  }

  initOptions() {
    const { c, q } = this.cnf;
    this.db.findAll({
      c, q, callback: (list: any[]) => {
        this.optionsController.optionsSubject.next(
          list.map((v) => this.optionsController.labelFn(v))
        );
      }
    });
  }

  handleSearch(str: string) {
    console.log('str', str);
    // todo
  }
}

// search db {c,q,l,s}
// custom api
