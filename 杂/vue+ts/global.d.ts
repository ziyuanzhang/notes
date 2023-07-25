interface IString {
  [key: string]: string | number | null | Dayjs;
}
interface ISArray {
  [index: number | string]: Object<IString> | null;
}
declare interface Window {
  DVM: any;
}
