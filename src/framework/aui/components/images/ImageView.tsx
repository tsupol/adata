import React from "react";
export const ImageView = ({ src }:any) => {
  return (
    <div className="art-img">
      <img src={`https://megalo-drive.s3.ap-southeast-1.amazonaws.com/artapp/uploads/` + src}/>
    </div>
  );
};
