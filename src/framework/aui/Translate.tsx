import {useAuiContext} from "./AuiContext";

export const Translate = ({ s }: { s: string }) => {
  const { t } = useAuiContext();
  const replacer = (params: any) => {
    const match = params.match(/[\w\d_-]+:[\w\d_-]+/);
    if (match.length) {
      return t(match[0]);
    }
    return params;
  };
  return s.replace(/t\(([\w\d_-]+:[\w\d_-]+)\)/g, replacer);
};
