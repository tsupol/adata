export interface IServerPagination {
  c: string,
  n: number,
  p: number,
  f?: any,
  s?: any,
}

export interface IServerInfinite {
  c: string,
  p: number,
  f: any,
  fp?: any, // pagedData Filter (start-indexer)
  s: any,
}


export enum Status {
  Invalid = 'invalid',
  Disabled = 'disabled',
  Pending = 'pending',
  Processing = 'processing',
  Shipping = 'shipping',
  Completed = 'completed',
  Cancelled = 'cancelled',
  Expired = 'expired',
  Refunding = "refunding",
  Refunded = "refunded",
}
