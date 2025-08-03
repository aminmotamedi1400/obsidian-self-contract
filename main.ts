import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile } from 'obsidian';
import {ContractModal} from './ContractModal' ;

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

export default class ContractPlugin extends Plugin {
	settings: MyPluginSettings;
	async createContractFile(title: string , dueDate: string){
		// console.log(`we in creatContractFile
		// 	Title : ${title} 
		// 	Due Date: ${dueDate}`);
		// فایل: main.ts (داخل متد createContractFile)
		const contractsFolder = 'Contracts';

		// 1. چک کردن و ساختن پوشه
		try {
			// این دستور سعی می‌کنه پوشه رو بسازه.
			await this.app.vault.createFolder(contractsFolder);
			new Notice("'Contracts' folder created!");
		} catch (e) {
			// اگر پوشه از قبل وجود داشته باشه، خطا می‌ده که ما نادیده‌اش می‌گیریم.
			// console.log("Contracts folder already exists.");
		}

    // 2. آماده کردن محتوای فایل (Template)
    const fileContent = `---
creationDate: ${new Date().toISOString().slice(0, 10)}
dueDate: ${dueDate || 'Not set'}
status: active
tags: [contract, self]
---

# Contract: ${title}

## 🎯 My Commitment
*I, [Your Name], commit to achieving the following goal:*

- 

## 🏆 The Reward for Success
*Upon successful completion, I will reward myself with:*

- 

## ⚠️ The Consequence of Failure
*If I fail to meet this commitment, I will accept the following consequence:*

- 
`;

		// 3. ایجاد فایل نهایی
		const fileName = `${title.replace(/[^a-zA-Z0-9 -]/g, '')}.md`;
		const filePath = `${contractsFolder}/${fileName}`;

		try {
			const newFile = await this.app.vault.create(filePath, fileContent);
			new Notice(`Contract "${title}" created successfully!`);        
			// 4. (اختیاری ولی خیلی خوب) باز کردن فایل جدید برای کاربر
			this.app.workspace.openLinkText(newFile.path, '', false);

		} catch (e) {        new Notice('Error: File with this name might already exist.');
			console.error("Error creating contract file:", e);
		}
	}
	async processContractCompletion(file: TFile) {
		// 1. اعتبارسنجی مسیر فایل
		if (!file.path.startsWith('Contracts/')) {
			new Notice("This command only works on files in the 'Contracts' folder.");
			return; // از تابع خارج شو
		}

		// 2. خواندن فراداده فایل
		const metadata = this.app.metadataCache.getFileCache(file);
		const frontmatter = metadata?.frontmatter;

		// 3. اعتبارسنجی وضعیت (status)
		if (!frontmatter || frontmatter.status !== 'active') {
			new Notice("This contract is not currently active.");
			return;
		}

		// اگر به اینجا رسیدیم، یعنی فایل معتبر است!
		new Notice("Validation successful! Proceeding to update the file.");

		// در گام بعدی، اینجا کد ویرایش فایل را اضافه می‌کنیم
	}
	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('This is a notice!');
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
		this.addCommand({
			id: 'create-new-self-contract',
			name: 'Create New Self-Contract',
			callback: () => {
				// console.log('Contract command triggered!');
				// new Notice('This is our first command!');
				// const handleFormSubmit = (data:any) => {
				// console.log("سفارش از مودال رسید!");
				// console.log("اطلاعات دریافتی:", data);
				// new Notice("اطلاعات با موفقیت از مودال گرفته شد!",data);
				// };
				new ContractModal(this.app,(result)=>{this.createContractFile(result.title, result.dueDate);}).open();
			}
		});
		this.addCommand({
			id: 'mark-contract-completed',
			name: 'Mark Contract as Completed',
			callback: () => {
				// اینجا منطق اصلی ما قرار خواهد گرفت
				// console.log("Mark as Completed command triggered!");
				// new Notice("Checking active file...");
				    const activeFile = this.app.workspace.getActiveFile();

			if (activeFile) {
				console.log("Active file found:", activeFile.path);
				new Notice(`File to process: ${activeFile.name}`);
				// در مراحل بعد، این فایل را پردازش خواهیم کرد
				this.processContractCompletion(activeFile);
			} else {
				console.log("No active file.");
				new Notice("Error: No active file selected.");
			}
			}
		});
		
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: ContractPlugin;

	constructor(app: App, plugin: ContractPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
