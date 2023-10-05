import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { getCropResizeImage } from '../../../../aui/lib/image-processing/image-crop-resize';
import { Deferred, randomString, toClassName } from 'megaloutils';
import { useAuiContext } from '../../../../aui/AuiContext';
import { useObservableSubscribe } from '../../../../aui/hooks/useObservable';
import { Icon } from '../../../../aui/components/Icon';

// Note: only for new image (not support initial value)
export const RrxImageDropzone = (props: any) => {
  const { form, name, id, moreClassNames, onChange, onBlur, placeholder, type, disabled, resize } = props;
  const [value, setValue] = useState(form?.controls[name]?.value || '');
  const { getImagePath } = useAuiContext();
  const { t } = useAuiContext();

  useObservableSubscribe(form.controls[name].valueChanges, async (v: any) => {
    setValue(v);
  }, [name]);

  const onDrop = (acceptedFiles: any) => {
    if (acceptedFiles?.length) {
      // for gallery to use
      // setValue(acceptedFiles.map((file: Blob | MediaSource) => URL.createObjectURL(file)));
      // setValue(URL.createObjectURL(acceptedFiles[0]));
      const acceptedFile = acceptedFiles[0];
      const promises: Promise<any>[] = [];
      const galleryItem: any = {
        originalFile: acceptedFile,
        isNew: true,
        uniqueKey: randomString(10, '#a'),
      };
      for (const key of Object.keys(resize)) {
        const deferred = new Deferred();
        promises.push(deferred.promise);
        getCropResizeImage(acceptedFile, resize[key], (file: any) => {
          if (!galleryItem.files) {
            galleryItem.files = {};
          }
          galleryItem.files[key] = {
            fileName: `${galleryItem.uniqueKey}-${key}.jpg`,
            file
          };
          deferred.resolve();
        });
      }
      Promise.all(promises).then(() => {
        onChange(galleryItem);
      });
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/tpng': ['.png'],
      'image/jpg': ['.jpg', '.jpeg'],
    }
  });

  return (
    <div>
      <div {...getRootProps()} className={toClassName('uploader', moreClassNames)}>
        <input
          name={name}
          type={type}
          id={id}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          {...getInputProps()}
        />
        {/*{value ?*/}
        {/*  // <p className="">uploaded: {uploaded.lg}</p>*/}
        {/*  <ImageCropCanvas imgFile={value} setValue={onChange} cnf={resize}/> :*/}
        {/*  <p className="py-4 border-4 border-dashed border-primary flex-center w-full h-full">{*/}
        {/*    placeholder || 'Upload'*/}
        {/*  }</p>*/}
        {/*}*/}
        {value ?
          <img
            className="w-full h-full max-h-40 object-contain"
            src={value.files ?
              value.files.md?.file || value.files.lg?.file || value.files.sm?.file
              : getImagePath(value.md || value.lg || value.sm)}
            alt=""
          />
          :
          <div className="uploader-placeholder">
            <div className="flex flex-col items-center">
              <Icon name="cloud-upload-outline" className="text-3xl"/>
              <div>{placeholder || t('data:upload_placeholder')}</div>
            </div>
          </div>
        }
      </div>
    </div>
  );
};

