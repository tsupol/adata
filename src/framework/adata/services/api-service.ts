import { StorageService } from './storage-service';
import axios, { AxiosHeaders } from 'axios';
import { SIGNED_IN_DATA } from '../adata-config';
import { Deferred, removeUndefined } from 'megaloutils';
import { CredentialService } from './credential-service';
import { IServerInfinite, IServerPagination } from '../types';
import { IApiCnf } from "../ADataContext";

export interface MegaResponse {
  config?: any;
  data: any;
  headers: AxiosHeaders;
  request: XMLHttpRequest;
  status: number;
  statusText: string;
}

export interface IApiUpdate {
  upsert?: boolean,
  returnDocument?: boolean,
}

export enum AEndpoint {
  Base = 'aapi',
  EntityFindOne = 'entity/find-one',
  EntityBatchFindOne = 'entity/batch-find-one',
  EntityFindMany = 'entity/find-many',
  EntityBatchFindMany = 'entity/batch-find-many',
  EntityInsertOne = 'entity/insert-one',
  EntityInsertMany = 'entity/insert-many',
  EntityInsertTransform = 'entity/insert-transform',
  EntityUpdateOne = 'entity/update-one',
  EntityUpdateMany = 'entity/update-many',
  EntityBatchUpdateOne = 'entity/batch-update-one',
  EntityDeleteOne = 'entity/delete-one',
  EntityDeleteMany = 'entity/delete-many',
  EntityBatchDeleteOne = 'entity/batch-delete-one',
  EntityBatchDeleteMany = 'entity/batch-delete-many',
  EntityCount = 'entity/count',
  EntityBatchCount = 'entity/batch-count',
  EntityFindOnePivot = 'entity/find-one-pivot',
  EntityUpsertPivot = 'entity/upsert-pivot',
  EntityTogglePivot = 'entity/toggle-pivot',
  EntityBatchPivotAuto = 'entity/batch-pivot-auto',
}


export enum MEndpoint {
  Base = 'mapi',
  SnapshotFindAll = 'snapshot/find-all',
  SnapshotCreate = 'snapshot/create',
  SnapshotRename = 'snapshot/rename',
  SnapshotRestore = 'snapshot/restore',
  SnapshotDelete = 'snapshot/delete',
}

export enum EndPoints {
  MemberFieldSignIn = '/auth/member-field-signin',
  MemberSignIn = '/auth/member-signin',
  HyperSignIn = '/auth/hyper-signin',
  BatchFindOne = '/api/entities/batch-find-one',
  FindOne = '/api/entities/find-one',
  FindMany = '/api/entities/find-many',
  BatchFindMany = '/api/entities/batch-find-many',
  Count = '/api/entities/count',
  BatchCount = '/api/entities/batch-count',
  BatchActions = '/api/entities/batch-actions',
  EntityPaginate = '/api/entities/paginate',
  EntityInfinite = '/api/entities/infinite',
  BatchPivotActions = '/api/entities/batch-pivot-actions',
  AddToStock = '/api/entities/add-to-stock',
  Entities = '/api/entities',
  UploadFile = '/api/files/upload',
}

enum EntitiesEndpoints {
  Aggregate = '/aggregate',
  UpdateOne = '/update-one',
  DeleteOne = '/delete-one',
  UpdateOneImage = '/update-image-one',
}

interface CQLS {
  c: string,
  q: any,
  l?: number,
  s?: any,
}

export class ApiService {

  storage: StorageService;
  credential: CredentialService;
  apiCnf: IApiCnf;

  constructor(apiCnf: IApiCnf, storage: StorageService, credential: CredentialService) {
    this.apiCnf = apiCnf;
    this.storage = storage;
    this.credential = credential;
  }

  processResponse(res: any) {
    if (res.data.r) {
      return res.data.r;
    }
    return res.data;
  }

  async hyperSignIn(username: string, password: string) {
    const storedHyperUser = await this.storage.get(SIGNED_IN_DATA);
    const memberMatch = username.match(/^\w?(\d+)/);
    if (memberMatch) {
      username = memberMatch[1];
    }
    const signingIn = { username, password };
    const alreadySignedIn = storedHyperUser?.access_token;
    const res = await axios.post(this.apiCnf.serverUrl + EndPoints.HyperSignIn, {
      signingIn,
      alreadySignedIn,
      svt: this.apiCnf.credential
    });
    if (res.data?.access_token) {
      const cred = removeUndefined({
        access_token: res.data.access_token,
        user: res.data.user,
        member: res.data.member,
      });
      await this.credential.signIn(cred);
      return cred;
    }
    return null;
  }

  async memberFieldSignIn(username: string, password: string, field: string) {
    const res = await axios.post(this.apiCnf.serverUrl + EndPoints.MemberFieldSignIn, {
      username,
      password,
      field,
      svt: this.apiCnf.credential
    });
    if (res.data?.access_token) {
      const cred = removeUndefined({
        access_token: res.data.access_token,
        member: {
          _id: res.data._id
        },
      });
      await this.credential.signIn(cred);
      return cred;
    }
    return null;
  }

  async signOut() {
    await this.credential.signOut();
  }

  async getHeader() {
    const loggedUser = await this.storage.get(SIGNED_IN_DATA);
    if (!loggedUser) {
      console.info('[getHeader] credential not found');
      return { headers: {} };
    }
    return {
      headers: {
        'Authorization': `Bearer ${loggedUser.access_token}`
      }
    };
  }

  async mGet(url: string) {
    return await axios.get(`${this.apiCnf.serverUrl}/${MEndpoint.Base}/${url}`, await this.getHeader());
  }

  async mPost(url: string, formData: any) {
    return await axios.post(`${this.apiCnf.serverUrl}/${MEndpoint.Base}/${url}`, formData, await this.getHeader());
  }

  // --------------------------------------------------------------------------------
  // Legacy
  // --------------------------------------------------------------------------------

  async download(url: string, fileName: string) {
    const res = await axios.get(this.apiCnf.serverUrl + url, { ...await this.getHeader(), responseType: 'blob' });
    // create file link in browser's memory
    const href = window.URL.createObjectURL(res.data);
    // create "a" HTML element with href to file & click
    const link = document.createElement('a');
    link.href = href;
    link.setAttribute('download', fileName); //or any other extension
    document.body.appendChild(link);
    link.click();
    // clean up "a" element & remove ObjectURL
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
  }

  // Normal
  // ----------------------------------------
  async get(url: string) {
    return await axios.get(this.apiCnf.serverUrl + url, await this.getHeader());
  }

  async post(url: string, formData: any) {
    return await axios.post((this.apiCnf.serverUrl || '') + url, formData, await this.getHeader());
  }

  async put(url: string, formData: any) {
    return await axios.put((this.apiCnf.serverUrl || '') + url, formData, await this.getHeader());
  }

  async delete(url: string) {
    return await axios.delete((this.apiCnf.serverUrl || '') + url, await this.getHeader());
  }

  // AApi
  // ----------------------------------------

  async aGet(url: string) {
    return await axios.get(`${this.apiCnf.serverUrl}/${AEndpoint.Base}/${url}`, await this.getHeader());
  }


  async aPost(url: string, formData: any) {
    return await axios.post(`${this.apiCnf.serverUrl}/${AEndpoint.Base}/${url}`, formData, await this.getHeader());
  }

  async aPut(url: string, formData: any) {
    return await axios.put(`${this.apiCnf.serverUrl}/${AEndpoint.Base}/${url}`, formData, await this.getHeader());
  }

  async aDelete(url: string) {
    return await axios.delete(`${this.apiCnf.serverUrl}/${AEndpoint.Base}/${url}`, await this.getHeader());
  }

  // Extended
  // ----------------------------------------

  async findOne(c: string, q: any) {
    return this.processResponse(await this.aPost(AEndpoint.EntityFindOne, { c, q }));
  }

  async findMany(formData: CQLS) {
    return this.processResponse(await this.aPost(AEndpoint.EntityFindMany, formData));
  }

  async batchFindOne(listDict: any) {
    return this.processResponse(await this.aPost(AEndpoint.EntityBatchFindOne, { list: listDict }));
  }

  async batchFindMany(listDict: any) {
    return this.processResponse(await this.aPost(AEndpoint.EntityBatchFindMany, { list: listDict }));
  }

  async count(c: string, q: any) {
    return this.processResponse(await this.aPost(AEndpoint.EntityCount, { c, q }));
  }

  async batchCount(listDict: any) {
    return this.processResponse(await this.aPost(AEndpoint.EntityBatchCount, { list: listDict }));
  }

  async insertOne(c: string, v: any, cnf?: IApiUpdate) {
    if (!(v && Object.keys(v)?.length)) {
      throw new Error('v must not be empty');
    }
    if (v.password) {
      return this.processResponse(await this.aPost(AEndpoint.EntityInsertTransform, removeUndefined({ c, v, cnf })));
    }
    return this.processResponse(await this.aPost(AEndpoint.EntityInsertOne, removeUndefined({ c, v, cnf })));
  }

  async insertMany(c: string, list: any[], cnf?: IApiUpdate) {
    return this.processResponse(await this.aPost(AEndpoint.EntityInsertMany, removeUndefined({ c, list, cnf })));
  }

  async updateOne(c: string, q: any, update: any, cnf?: IApiUpdate) { // updateParams e.g. { $set: {}}
    return this.processResponse(await this.aPost(AEndpoint.EntityUpdateOne, removeUndefined({
      c,
      q,
      update,
      cnf
    })));
  }

  async updateMany(c: string, q: any, update: any, cnf?: IApiUpdate) { // updateParams e.g. { $set: {}}
    return this.processResponse(await this.aPost(AEndpoint.EntityUpdateMany, removeUndefined({
      c,
      q,
      update,
      cnf
    })));
  }

  async deleteOne(c: string, q: any) {
    return this.processResponse(await this.aPost(AEndpoint.EntityDeleteOne, removeUndefined({ c, q })));
  }

  async deleteMany(c: string, q: any) {
    return this.processResponse(await this.aPost(AEndpoint.EntityDeleteMany, removeUndefined({ c, q })));
  }

  async findOnePivot(c: string, q: any) {
    return this.processResponse(await this.aPost(AEndpoint.EntityFindOnePivot, removeUndefined({ c, q })));
  }

  async upsertPivot(c: string, q: any, v: any) {
    return this.processResponse(await this.aPost(AEndpoint.EntityUpsertPivot, removeUndefined({ c, q, v })));
  }

  async togglePivot(c: string, q: any, v: any) {
    return this.processResponse(await this.aPost(AEndpoint.EntityTogglePivot, removeUndefined({ c, q, v })));
  }

  // --------------------------------------------------------------------------------
  // To del...
  // --------------------------------------------------------------------------------

  // async bulkActions(listArray: any[]) {
  //   return this.processResponse(await this.post(EndPoints.BatchActions, { list: listArray }));
  // }

  async batchPivotActions(listArray: any[]) {
    return this.processResponse(await this.aPost(AEndpoint.EntityBatchPivotAuto, { list: listArray }));
  }

  async aggregate(c: string, pipeline: any[]) {
    return this.processResponse(await this.post(`${EndPoints.Entities}/${c}${EntitiesEndpoints.Aggregate}`, { pipeline }));
  }

  async paginate(params: IServerPagination) {
    return this.processResponse(await this.post(EndPoints.EntityPaginate, removeUndefined(params)));
  }

  async infinite(params: IServerInfinite) {
    return this.processResponse(await this.post(EndPoints.EntityInfinite, removeUndefined(params)));
  }

  async insert(c: string, data: any) {
    return this.processResponse(await this.post(`${EndPoints.Entities}/${c}`, { data }));
  }


  // returns the document
  async upsertOne(c: string, match: any, updateParams: any) { // updateParams e.g. { $set: {}}
    return this.processResponse(await this.post(`${EndPoints.Entities}/${c}${EntitiesEndpoints.UpdateOne}`, {
      match,
      data: updateParams,
      upsert: true
    }))?.value;
  }

  // returns increased stock
  async incStock(c: string, oid: string, qty: number) { // updateParams e.g. { $set: {}}
    return this.processResponse(await this.post(EndPoints.AddToStock, { c, oid, qty }))?.qty;
  }

  async updateOneImage(c: string, match: any, updateParams: any, inputFile: any, fileName: string) { // updateParams e.g. { $set: {}}
    const blobBin = atob(inputFile.split(',')[1]);
    const array = [];
    for (let i = 0; i < blobBin.length; i++) {
      array.push(blobBin.charCodeAt(i));
    }
    const file = new Blob([new Uint8Array(array)], { type: 'image/jpg' });
    const formData = new FormData();
    formData.append("file", file);
    formData.append("data", JSON.stringify(updateParams));
    formData.append("match", JSON.stringify(match));
    formData.append("fileName", fileName);
    return this.processResponse(await this.post(`${EndPoints.Entities}/${c}${EntitiesEndpoints.UpdateOneImage}`, formData));
  }

  async uploadFile(file: any, key: string) { // updateParams e.g. { $set: {}}
    const formData = new FormData();
    formData.append("file", file);
    formData.append("key", key);
    return this.processResponse(await this.post(EndPoints.UploadFile, formData));
  }

  async processAndUploadGallery(files: any[], path: string | ((v: string) => string) = '') {
    const promises: Promise<any>[] = [];
    const newGallery: any[] = [];
    for (const item of files) {
      if (item.isNew) {
        const deferred = new Deferred();
        const newGalleryItem: any = {};
        for (const key of Object.keys(item.files)) {
          const files = item.files;
          const serverPath = typeof path === 'function' ? path(files[key].fileName)
            : `${path}/${files[key].fileName}`;
          promises.push(deferred.promise);
          this.uploadFile(toFileForUpload(files[key].file), serverPath).then((res: any) => {
            deferred.resolve();
            return res;
          });
          newGalleryItem[key] = serverPath;
        }
        newGallery.push(newGalleryItem);
      } else {
        newGallery.push(item);
      }
    }
    await Promise.all(promises);
    return newGallery;
  }

  async uploadImageField(image: any, path: string | ((v: string) => string) = '') {
    const promises: Promise<any>[] = [];
    let newGalleryItem: any = {};
    if (image.isNew && Object.keys(image.files)?.length) {
      for (const key of Object.keys(image.files)) {
        const deferred = new Deferred();
        promises.push(deferred.promise);
        const serverPath = typeof path === 'function' ? path(image.files[key].fileName)
          : `${path}/${image.files[key].fileName}`;
        this.uploadFile(toFileForUpload(image.files[key].file), serverPath).then((res: any) => {
          deferred.resolve();
          return res;
        });
        newGalleryItem[key] = serverPath;
      }
    } else {
      newGalleryItem = image;
    }
    await Promise.all(promises);
    return newGalleryItem;
  }
}

export const toFileForUpload = (inputFile: any, type = 'image/jpg') => {
  const blobBin = atob(inputFile.split(',')[1]);
  const array = [];
  for (let i = 0; i < blobBin.length; i++) {
    array.push(blobBin.charCodeAt(i));
  }
  return new Blob([new Uint8Array(array)], { type });
};

export const processGallery = async (path: string, files: any[]) => {
  const newGallery: any[] = [];
  for (const item of files) {
    if (item.isNew) {
      const newGalleryItem: any = {};
      for (const key of Object.keys(item.files)) {
        newGalleryItem[key] = `${path}/${item.files[key].fileName}`;
      }
      newGallery.push(newGalleryItem);
    }
  }
  return newGallery;
};

