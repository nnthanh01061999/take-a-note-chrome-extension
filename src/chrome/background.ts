import { ChromeActionEnum } from '@/types';

chrome.contextMenus.create({
    id: ChromeActionEnum.CTX_MENU_COLLECT_SELECTED,
    title: 'Take a note',
    contexts: ['selection'],
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (!tab?.id) return;
    chrome.tabs.sendMessage(tab.id, {
        type: info.menuItemId,
        data: info.selectionText,
    });
});
