import React, { useEffect, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { MDNDMasonryItem } from '../mdnd/MDNDMasonryItem';
import { arrayMatchAtLeastOne, Deferred, randomString, toAlphaNumeric, toClassName, toTimeUniqueAlphaNumeric } from 'megaloutils';
import { getCropResizeImage } from '../../lib/image-processing/image-crop-resize';
import { useAuiContext } from '../../AuiContext';
import { Icon } from '../Icon';

const getItemId = (v: any) => {
  return v.uniqueKey || v.sm || v.lg;
};

export const GalleryUploader = ({ onChange, value, resize, className = '', disabled = false, maxFiles = 6, placeholder }: any) => {

  const [forRefresh, setForRefresh] = useState(false);
  const { getImagePath } = useAuiContext();
  const uid = useMemo(() => randomString(8, 'A#'), []);

  useEffect(() => {
    const handleChanged = (e: any) => {
      if (e.detail?.src?.dataset?.content) {
        const { controllerId } = JSON.parse(e.detail?.src?.dataset?.content);
        if (controllerId === uid) {
          const domArr: HTMLElement[] = Array.from(e.detail.src.parentNode.childNodes) as HTMLElement[];
          const newOrdering: any[] = [];
          const valueDict: any = {};
          for (const v of value) {
            valueDict[getItemId(v)] = v;
          }
          for (const item of domArr) {
            const { id } = JSON.parse(item.dataset?.content as string);
            if (valueDict[id]) {
              newOrdering.push(valueDict[id]);
            }
          }
          onChange(newOrdering);
        }
      }
    };

    const handleRemoved = (e: any) => {
      if (e.detail?.src?.dataset?.content) {
        const { id: removedId, controllerId } = JSON.parse(e.detail?.src?.dataset?.content);
        if (controllerId === uid) {
          const domArr: HTMLElement[] = Array.from(e.detail.src.parentNode.childNodes) as HTMLElement[];
          const newOrdering: any[] = [];
          const valueDict: any = {};
          for (const v of value) {
            valueDict[getItemId(v)] = v;
          }
          for (const item of domArr) {
            const { id } = JSON.parse(item.dataset?.content as string);
            if (valueDict[id] && id !== removedId) {
              newOrdering.push(valueDict[id]);
            }
          }
          onChange(newOrdering);
        }
      }
    };

    document.addEventListener('mdnd_drop', handleChanged);
    document.addEventListener('mdnd_remove', handleRemoved);
    return () => {
      document.removeEventListener("mdnd_drop", handleChanged);
      document.removeEventListener("mdnd_remove", handleRemoved);
    };
  }, [onChange, value, uid]);


  useEffect(() => {
    // do nothing (for linting @typescript-eslint/no-unused-vars)
  }, [forRefresh]);

  const onDrop = async (acceptedFiles: any) => {
    console.log('acceptedFiles', acceptedFiles);
    if (acceptedFiles.length) {
      try {
        const promises: Promise<any>[] = [];
        const newImages: any[] = [];
        for (let i = 0; i < acceptedFiles.length; i++) {
          const acceptedFile = acceptedFiles[i];
          const galleryItem: any = {
            originalFile: acceptedFile,
            isNew: true,
            uniqueKey: toTimeUniqueAlphaNumeric(Date.now(), 0) + toAlphaNumeric(i),
          };
          newImages.push(galleryItem);
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
        }
        await Promise.all(promises).then(() => {
          setForRefresh((prev) => !prev);
        });
        console.log('newImages', newImages);
        if (!Array.isArray(value)) {
          onChange(newImages);
        } else {
          onChange([...value, ...newImages]);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    maxFiles,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg']
      // 'image/png': ['.png'],
      // 'image/jpg': ['.jpg', '.jpeg'],
    }
  });

  const processedValue = useMemo(() => {
    if (!value) return [];
    const list: any[] = [];
    for (const v of value) {
      const id = getItemId(v);
      let component = <div>loading...</div>;
      if (v.isNew) {
        if (v.files) {
          if (!arrayMatchAtLeastOne(['sm', 'lg'], Object.keys(v.files))) {
            throw new Error('[gallery uploader] no known image size [lg,sm]');
          }
          component = <img
            className="w-full h-full object-contain"
            src={v.files.sm?.file || v.files.lg?.file}
            alt=""
          />;
        }
      } else {
        component = <img
          src={getImagePath(v.sm || v.lg)}
          className="w-full h-full object-contain"
          alt=""
        />;
      }
      try {
        list.push({
          id,
          component,
          content: { id, controllerId: uid },
        });
      } catch (err) {
        console.log('err', err);
      }
    }
    return list;
  }, [value, getImagePath, uid]);

  return (
    <div className={toClassName('uploader', { disabled }, className)} {...getRootProps()}>
      <input {...getInputProps()}/>
      <MDNDContainer list={processedValue} placeHolder={<UploadPlaceholder placeholder={placeholder}/>}/>
    </div>
  );
};

const MDNDContainer = ({ list, placeHolder }: { list: any[], placeHolder: any }) => {
  return (
    <div className={toClassName(list.length ? 'grid grid-cols-3 gap-2' : 'grid')}>
      {list.length ? list.map((v) => (
        <MDNDMasonryItem
          key={v.id}
          id={v.id}
          className="dnd-img-container"
          content={JSON.stringify(v.content)}
        >
          {v.component}
        </MDNDMasonryItem>)
      ) : placeHolder}
    </div>
  );
};

const UploadPlaceholder = ({ placeholder }: any) => {
  const { t } = useAuiContext();
  return (
    <div className="uploader-placeholder">
      <div className="flex flex-col items-center">
        <Icon name="cloud-upload-outline" className="text-3xl"/>
        <div>{placeholder || t('data:upload_placeholder')}</div>
      </div>
    </div>
  );
};
