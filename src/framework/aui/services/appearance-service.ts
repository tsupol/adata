import { BehaviorSubject, shareReplay, Subject, takeUntil } from "rxjs";
import { StorageService } from "../../adata/services/storage-service";
import { IAdapter, IUiCnf } from "../AuiContext";

enum StorageKey {
  themeMode = 'themeMode',
  lang = 'lang',
}

export class AppearanceService {
  destroy$ = new Subject<boolean>();
  storage: StorageService;
  uiCnf: IUiCnf;
  adapter: IAdapter;
  themeModeSubject: any = new BehaviorSubject('');
  themeMode$ = this.themeModeSubject.pipe(shareReplay(1), takeUntil(this.destroy$));

  langSubject: any = new BehaviorSubject('en');
  lang$ = this.langSubject.pipe(shareReplay(1), takeUntil(this.destroy$));

  constructor(storage: StorageService, uiCnf: IUiCnf, adapter: IAdapter) {
    this.adapter = adapter;
    this.uiCnf = uiCnf;
    this.storage = storage;
    this.initTheme();
    this.initLang();
  }

  async getThemeMode() {
    return await this.storage.get(StorageKey.themeMode);
  }

  async initTheme() {
    const themeMode = (await this.getThemeMode()) || this.uiCnf.themeMode;
    this.updateTheme(themeMode);
    this.themeModeSubject.next(themeMode);
  }

  updateTheme(themeMode: string) {
    document.documentElement.setAttribute('data-theme', themeMode);
  }

  async setThemeMode(themeMode: string) {
    this.themeModeSubject.next(themeMode);
    this.updateTheme(themeMode);
    await this.storage.set(StorageKey.themeMode, themeMode);
  }

  // Dark Mode
  // ----------------------------------------

  async getLang() {
    return (await this.storage.get(StorageKey.lang)) || this.uiCnf.lang;
  }

  async setLang(lang: string) {
    this.updateLang(lang);
    await this.storage.set(StorageKey.lang, lang);
    this.langSubject.next(lang);
  }

  async initLang() {
    const lang = await this.getLang();
    this.updateLang(lang);
    this.langSubject.next(lang);
  }

  updateLang(lang: string) {
    if (this.adapter) {
      this.adapter.changeLanguage(lang);
    }
  }

  destroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
