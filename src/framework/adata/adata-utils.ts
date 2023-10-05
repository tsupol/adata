import { removeUndefined } from 'megaloutils';

export const encodeKey = ({ pageNumber, perPage, filter, sort }
                            : { pageNumber?: number, perPage?: number, filter?: any, sort?: any }) => {
  return JSON.stringify(removeUndefined({
    n: pageNumber,
    p: perPage,
    f: filter,
    s: sort,
  }));
};

export const parseJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error(e);
  }
};

export const getJwtExp = (token: string) => {
  return parseJwt(token)?.exp;
};

export const hasValue = (v: any) => {
  if (!v || v?.$e) {
    return false;
  }
  return true;
};
