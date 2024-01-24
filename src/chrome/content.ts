import { CHROME_DATA } from '@/constants';
import { ChromeActionEnum, ChromeMessage } from '@/types';

const actions = {
    CTX_MENU_COLLECT_SELECTED: ({ data, callback }) => {
        console.log('🚀 ~ data:', data);
        chrome.storage.local.get(CHROME_DATA).then((result) => {
            const chromeData = result?.[CHROME_DATA] || '';
            const dataParse = chromeData ? JSON.parse(chromeData) : [];
            chrome.storage.local.set({
                [CHROME_DATA]: JSON.stringify([
                    {
                        name: data,
                    },
                    ...dataParse,
                ]),
            });
        });
    },
} satisfies Record<
    ChromeActionEnum,
    (value: { data: any; callback: (data: any) => void }) => void
>;

chrome.runtime.onMessage.addListener(
    (message: ChromeMessage, _, sendResponse) => {
        const callback = actions[message.type];
        callback({
            data: message.data,
            callback: sendResponse,
        });
    }
);
