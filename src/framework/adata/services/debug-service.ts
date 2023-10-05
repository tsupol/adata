import { ApiService } from './api-service';

export class DebugService {
  api: ApiService;

  constructor(api: ApiService) {
    this.api = api;
  }

  error(slug: string, arg = '') {
    console.error(slug, arg)
    throw new Error(slug)
  }
}
