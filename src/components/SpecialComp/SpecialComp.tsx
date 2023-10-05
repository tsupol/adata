import React from "react";
import "./SpecialComp.css";

export interface ButtonProps {
    label: string;
}

const SpecialComp = (props: ButtonProps) => {
    return <div className="specom">{props.label}</div>;
};

export default SpecialComp;
