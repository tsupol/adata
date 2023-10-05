import React, { useState } from 'react';
import { GalleryUploader } from '../../../../aui/components/images/GalleryUploader';
import { useObservableSubscribe } from '../../../../aui/hooks/useObservable';

// Note: only for new image (not support initial value)
export const RrxGalleryDropzone = (props: any) => {
  const { form, name, moreClassNames, onChange, placeholder, disabled, resize } = props;
  const [value, setValue] = useState<any>(form?.controls[name]?.value || undefined);

  useObservableSubscribe(form.controls[name].valueChanges, async (v: any) => {
    setValue(v || []);
  }, [name]);

  return (
    <div>
      {placeholder ? <div>{placeholder}</div> : null}
      <GalleryUploader onChange={onChange} value={value} resize={resize} disabled={disabled} className={moreClassNames}/>
    </div>
  );
};

