// ContractModal.ts

import { App, Modal, Setting } from 'obsidian';

export class ContractModal extends Modal {

    constructor(app: App) {
        super(app);
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.setText('اینجا فرم ما قرار می‌گیرد!');
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
