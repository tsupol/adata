import { Image } from './Image';
import { Carousel } from './Carousel';
import React from 'react';

export const DefaultViewContent = ({ data }: any) => {
  return (
    <div className="grid gap-2">
      {data.image ? <Image src={data.image.sm} alt={data.title} className="h-40 aspect-square"/> : null}
      {data.gallery ? (
        <div className="w-40 h-40">
          <Carousel images={data.gallery}></Carousel>
        </div>
      ) : null}
      {data.title ? <h2>{data.title}</h2> : null}
      {data.desc ? <h2>{data.desc}</h2> : null}
    </div>
  );
};
