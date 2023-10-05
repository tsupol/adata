import { StorageService } from './storage-service';
import { SimpleRx } from '../../aui/lib/SimpleRx';
import { SIGNED_IN_DATA } from '../adata-config';
import { getJwtExp } from '../adata-utils';

interface ICredential {
  isChecking?: boolean;
  expired?: boolean;
  user?: any;
  member?: any;
  isLoggedIn?: boolean;
  isAdmin?: boolean;
}

export class CredentialService {
  storage: StorageService;
  credentialRx = new SimpleRx<ICredential>({
    isChecking: true,
  });

  constructor(storage: StorageService) {
    this.storage = storage;
    this.init();
  }

  async init() {
    const stored = await this.storage.get(SIGNED_IN_DATA);
    if (stored) {
      // --- Expiration
      const exp = getJwtExp(stored.access_token);
      if (!(exp && Date.now() < exp * 1000)) {
        this.storage.remove(SIGNED_IN_DATA);
        this.credentialRx.next({
          isChecking: false,
          expired: true,
        });
      } else {
        // todo - refresh token each login
        this.credentialRx.next({
          user: stored.user,
          member: stored.member,
          isLoggedIn: stored.user || stored.member,
          isAdmin: !!stored.user
        });
      }
    } else {
      this.credentialRx.next({
        isChecking: false
      });
    }
  }

  async signIn(data: any) {
    await this.storage.set(SIGNED_IN_DATA, data);
    try {
      this.credentialRx.next({
        user: data.user,
        member: data.member,
        isLoggedIn: data.user || data.member,
        isAdmin: !!data.user
      });
    } catch (err) {
      console.log('err', err);
    }
  }

  async signOut() {
    await this.storage.set(SIGNED_IN_DATA, null);
    this.credentialRx.next({
      user: null,
      member: null
    });
  }
}
