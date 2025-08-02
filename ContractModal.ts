// ContractModal.ts

import { App, Modal, Setting } from 'obsidian';

export class ContractModal extends Modal {
    onSubmitMission: (data: any) => void;

    constructor(app: App, mission: (data: any) => void) {
        super(app);
        this.onSubmitMission = mission;

    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.createEl("h2", { text: "Create New Self-Contract" });
        let titleValue = '';
        let dateValue = '';
        new Setting(contentEl)
        .setName("Contract Title")
        .addText(text => text
        .setPlaceholder("e.g., Learn Obsidian API")
        .onChange((value) => {
            titleValue = value;
        }));
        new Setting(contentEl)
        .setName("Due Date")
        .addText(text => text
            .setPlaceholder("e.g., 2024-12-31")
            .onChange((value) => {
                dateValue = value;
            }));
        new Setting(contentEl)
        .addButton(button => button
        .setButtonText("Create Contract")
        .setCta()
        .onClick(() => {

            this.close();
            const formData = { title: titleValue, dueDate: dateValue };
            this.onSubmitMission(formData);
        }));  
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
