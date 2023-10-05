import dayjs from 'dayjs';
import {Observable} from "rxjs";

export const entityToListData = (v: any) => {
  return {
    _id: v._id,
    title: v.title,
    desc: v.desc,
    image: getThumbnail(v),
  };
};

export const getThumbnail = (entity: any) => {
  if (entity.image) {
    return entity.image.sm || entity.image.md || entity.image.lg;
  }
  if (entity.gallery?.length) {
    return entity.gallery[0].sm || entity.gallery[0].md || entity.gallery[0].lg;
  }
};
export const getLargestImg = (entity: any) => {
  if (entity.image) {
    return entity.image.lg || entity.image.md || entity.image.sm;
  }
  if (entity.gallery?.length) {
    return entity.gallery[0].lg || entity.gallery[0].md || entity.gallery[0].sm;
  }
};

export const getThumbnailOrPlaceholder = (entity: any) => {
  const src = getThumbnail(entity);
  if (src) return src;
  return '/assets/img/no-img.jpg';
};

export const getLargestImgOrPlaceholder = (entity: any) => {
  const src = getLargestImg(entity);
  if (src) return src;
  return '/assets/img/no-img.jpg';
};


export const shouldTranslate = (str: any) => {
  if (typeof str === 'string') {
    const match = str.match(/t\(([\w\d_-]+:[\w\d_-]+)\)/);
    if (match?.[1]) {
      return match[1];
    }
  }
  return false;
};

export const translate = (str: string, t: any) => {
  const tot = shouldTranslate(str);
  if (tot) {
    return t(tot).toString();
  }
  return str;
};

// --------------------------------------------------------------------------------
// Forms
// --------------------------------------------------------------------------------

export const formWithInitialValue = (formFields: any[], initialValues: any) => {
  const fields: any[] = [];
  for (const field of formFields) {
    const f: any = {...field};
    if (f.formFields) {
      f.formFields = formWithInitialValue(f.formFields, initialValues);
    } else if (initialValues[f.name]) {
      f.initialValue = initialValues[f.name];
    }
    fields.push(f);
  }
  return fields;
};

export const formatDate = (date: any) => {
  return dayjs(date).format('DD/MM/YY HH:mm');
};

export const patchFormField = (fields: any[], name: string, value: any) => {
  for (let field of fields) {
    if (field.name === name) {
      field = {...field, ...value};
    }
  }
  return fields;
};

export const resizeObservable = (elem: any) => {
  return new Observable((subscriber) => {
    const ro = new ResizeObserver(entries => {
      subscriber.next(entries);
    });

    // Observe one or multiple elements
    ro.observe(elem);
    return function unsubscribe() {
      ro.unobserve(elem);
    };
  });
};
