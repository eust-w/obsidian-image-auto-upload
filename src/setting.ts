import { App, PluginSettingTab, Setting } from "obsidian";
import imageAutoUploadPlugin from "./main";
import { t } from "./lang/helpers";

export interface PluginSettings {
  PrimaryStorage: string;
  GopicPath: string;
  Github:boolean;
  Qiniu:boolean;
  Samba:boolean;
  NewWorkBlackDomains: string;
}

export const DEFAULT_SETTINGS: PluginSettings = {
  PrimaryStorage: "github",
  GopicPath:"gopic",
  Github:false,
  Qiniu:false,
  Samba:false,
  NewWorkBlackDomains:"",
};

export class SettingTab extends PluginSettingTab {
  plugin: imageAutoUploadPlugin;

  constructor(app: App, plugin: imageAutoUploadPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    let { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: t("Plugin Settings") });

    //选择哪一个作为主要上传内容
    new Setting(containerEl)
      .setName(t("Primary storage"))
      .setDesc(t("Primary storage Desc"))
      .addDropdown(cb =>
        cb
          .addOption("github", "Github")
          .addOption("qiniu", "Qiniu")
          .addOption("samba", t("Samba"))
          .setValue(this.plugin.settings.PrimaryStorage)
          .onChange(async value => {
            this.plugin.settings.PrimaryStorage = value;
            this.display();
            await this.plugin.saveSettings();
          })
      );

      new Setting(containerEl)
        .setName(t("Gopic path"))
        .setDesc(t("Gopic path desc"))
        .addText(text =>
          text
            .setPlaceholder(t("Please input gopic path"))
            .setValue(this.plugin.settings.GopicPath)
            .onChange(async key => {
              this.plugin.settings.GopicPath = key;
              await this.plugin.saveSettings();
            })
        );

    new Setting(containerEl)
      .setName(t("Active Github"))
      .setDesc(
        t(
          "Active Github desc"
        )
      )
      .addToggle(toggle =>
        toggle
          .setValue(this.plugin.settings.Github)
          .onChange(async value => {
            this.plugin.settings.Github = value;
            this.display();
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName(t("Active Qiniu"))
      .setDesc(
        t(
          "Active Qiniu desc"
        )
      )
      .addToggle(toggle =>
        toggle
          .setValue(this.plugin.settings.Qiniu)
          .onChange(async value => {
            this.plugin.settings.Qiniu = value;
            this.display();
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName(t("Active Samba"))
      .setDesc(
        t(
          "Active Samba desc"
        )
      )
      .addToggle(toggle =>
        toggle
          .setValue(this.plugin.settings.Samba)
          .onChange(async value => {
            this.plugin.settings.Samba = value;
            this.display();
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName(t("Network Domain Black List"))
      .setDesc(t("Network Domain Black List Des"))
      .addTextArea(textArea =>
        textArea
          .setValue(this.plugin.settings.NewWorkBlackDomains)
          .onChange(async value => {
            this.plugin.settings.NewWorkBlackDomains = value;
            await this.plugin.saveSettings();
          })
      );

  }
}
