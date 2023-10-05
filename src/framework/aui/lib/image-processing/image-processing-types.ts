export enum CropMode {
  Contain,
  Cover
}

export interface ICrop {
  w: number,
  h: number,
  mode: CropMode
}

export interface IResizeConfig {
  maxSize?: number,
  compression?: string,
  type?: string,
  crop?: ICrop
}
