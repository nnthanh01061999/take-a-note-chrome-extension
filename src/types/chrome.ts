export enum ChromeActionEnum {
    'CTX_MENU_COLLECT_SELECTED' = 'CTX_MENU_COLLECT_SELECTED',
}

export type ChromeMessage = {
    type: ChromeActionEnum;
    data: any;
};
