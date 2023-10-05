import React from 'react';
import { useDbFindOne } from '../../adata/hooks/useDbFindOne';

export const CategoryTags = ({ categories, c }: { categories: any[], c: string }) => {
  if (!categories?.length) return null;
  return <div className="mason-1">
    {categories.map((cat: any, i: number) => <CategoryTagItem key={i} categoryOid={cat} c={c}/>)}
  </div>;
};

export const CategoryTagItem = ({ categoryOid, c }: { categoryOid: any, c: string }) => {
  const [cat] = useDbFindOne(c, categoryOid);
  if (!cat) return null;
  return (
    <div className="mason-item">
      <div className="tag tag-info">{cat.title}</div>
    </div>
  );
};

