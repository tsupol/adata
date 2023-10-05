import React, { useEffect, useState } from 'react';
import { Subject, takeUntil } from 'rxjs';
import { useDropzone } from 'react-dropzone';

export const RrxDropzone = (props: any) => {
  const { form, name, id, moreClassNames, onChange, onBlur, placeholder, type, disabled } = props;
  const [value, setValue] = useState(form?.controls[name]?.value || '');
  const [uploaded] = useState<any>(null);

  useEffect(() => {
    const destroy$ = new Subject<boolean>();
    form.controls[name].valueChanges.pipe(
      takeUntil(destroy$)
    ).subscribe((v: any) => {
      setValue(v);
    });
    return () => {
      destroy$.next(true);
      destroy$.unsubscribe();
    };
  }, [form.controls, name]);


  const onDrop = async (acceptedFiles: any) => {
    console.log('acceptedFiles', acceptedFiles);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/tpng': ['.png'],
      'image/jpg': ['.jpg', '.jpeg'],
    }
  });

  return (
    <div {...getRootProps()}>
      <input
        name={name}
        type={type}
        id={id}
        className={moreClassNames?.join(' ')}
        onChange={onChange}
        onBlur={onBlur}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        {...getInputProps()}
      />
      {uploaded ?
        // <p className="">uploaded: {uploaded.lg}</p>
        <ImageView path="dummy" src={uploaded.lg}/> :
        <p className="py-4 border-4 border-dashed border-primary flex-center w-full h-full">{
          placeholder || 'Upload'
        }</p>
      }
    </div>
  );
};

export const ImageView = ({ src }: any) => {
  return (
    <div className="art-img">
      <img src={`https://megalo-drive.s3.ap-southeast-1.amazonaws.com/artapp/uploads/` + src} alt="dd here"/>
    </div>
  );
};
