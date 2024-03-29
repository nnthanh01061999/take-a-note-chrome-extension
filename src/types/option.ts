export interface IOption<T> {
    value: T;
    label: string;
    [key: string | number]: any;
}
