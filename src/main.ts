import {
  addIcon,
  Editor,
  FileSystemAdapter,
  Menu,
  MenuItem,
  Notice,
  Plugin,
  TFile,
} from "obsidian";

import { basename, join } from "path";

import { isAssetTypeAnImage } from "./utils";
import { PicGoUploader } from "./uploader";
import Cache from "./utils";
import { t } from "./lang/helpers";

import { DEFAULT_SETTINGS, PluginSettings, SettingTab } from "./setting";

interface Image {
  path: string;
  name: string;
  source: string;
}

export default class imageAutoUploadPlugin extends Plugin {
  settings: PluginSettings;
  helper: Cache;
  goPicUploader: PicGoUploader;

  async loadSettings() {
    this.settings = Object.assign(DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  onunload() {}

  async onload() {
    await this.loadSettings();

    this.helper = new Cache(this.app);
    this.goPicUploader = new PicGoUploader(this.settings, this);

    addIcon(
      "cute-cat",
      `<svg x="0px" y="0px" viewBox="0 0 64 64" class="icon" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 0C18.745 0 8 10.745 8 24c0 8.836 7.164 16 16 16h4v8c0 2.209 1.791 4 4 4s4-1.791 4-4v-8h4c8.836 0 16-7.164 16-16C56 10.745 45.255 0 32 0zM21.657 30.343a1 1 0 1 1 1.415-1.415 7.967 7.967 0 0 0 11.314 0 1 1 0 0 1 1.415 1.415 9.97 9.97 0 0 1-14.142 0zM40 24c-1.105 0-2-.895-2-2s.895-2 2-2 2 .895 2 2-.895 2-2 2zm-16 0c-1.105 0-2-.895-2-2s.895-2 2-2 2 .895 2 2-.895 2-2 2z" fill="#8a8a8a"/>
  </svg>`
    );

    this.addSettingTab(new SettingTab(this.app, this));

    this.setupPasteHandler();
    this.registerFileMenu();
  }

  registerFileMenu() {
    this.registerEvent(
      this.app.workspace.on(
        "file-menu",
        (menu: Menu, file: TFile, source: string) => {
          if (source === "canvas-menu") return false;
          if (!isAssetTypeAnImage(file.path)) return false;
          if (!(file instanceof TFile)) return false;
          menu.addItem((item: MenuItem) => {
            item
              .setTitle("Upload")
              .setIcon("upload")
              .onClick(() => {
                this.fileMenuUpload(file);
              });
          });
        }
      )
    );
  }

  fileMenuUpload(file: TFile) {
    let content = this.helper.getValue();

    if (this.app.vault.adapter instanceof FileSystemAdapter) {
      const basePath = this.app.vault.adapter.getBasePath();
      let imageList: Image[] = [];
      const fileArray = this.helper.getAllFiles();

      for (const match of fileArray) {
        const imageName = match.name;
        const encodedUri = match.path;

        const fileName = basename(decodeURI(encodedUri));

        if (file && file.name === fileName) {
          const abstractImageFile = join(basePath, file.path);

          if (isAssetTypeAnImage(abstractImageFile)) {
            imageList.push({
              path: abstractImageFile,
              name: imageName,
              source: match.source,
            });
          }
        }
      }

      if (imageList.length === 0) {
        new Notice(t("Can not find any image file"));
        return;
      }

      this.goPicUploader.uploadFiles(imageList.map(item => item.path)).then(res => {
        imageList.map(item => {
          const uploadImage = res.shift();
          let name = this.handleName(item.name);

          content = content.replaceAll(
            item.source,
            `![${name}](${uploadImage})`
          );
        });
        this.helper.setValue(content);
      });
    } else {
      new Notice("The adapter is not a FileSystemAdapter");
    }
  }

  setupPasteHandler() {
    this.registerEvent(
      this.app.workspace.on(
        "editor-paste",
        (evt: ClipboardEvent, editor: Editor) => {
          const clipboardValue = evt.clipboardData.getData("text/plain");
          const imageList = this.helper
            .getImageLink(clipboardValue)
            .filter(image => image.path.startsWith("http"))
            .filter(
              image =>
                !this.helper.hasBlackDomain(
                  image.path,
                  this.settings.NewWorkBlackDomains
                )
            );
          if (imageList.length !== 0) {
            this.goPicUploader
              .uploadFiles(imageList.map(item => item.path))
              .then(res => {
                let value = this.helper.getValue();
                imageList.map(item => {
                  const url = res[0];
                  let name = this.handleName(item.name);

                  value = value.replaceAll(
                    item.source,
                    `![${name}](${url})`
                  );
                });
                this.helper.setValue(value);
              });
          }

          if (this.canUpload(evt.clipboardData)) {
            this.uploadFileAndEmbedImgurImage(
              editor,
              async () => {
                let res: any;
                res = await this.goPicUploader.uploadFileByClipboard(
                  evt.clipboardData.files
                );
                return res[0];
              },
              evt.clipboardData
            ).catch();
            evt.preventDefault();
          }
        }
      )
    );
    this.registerEvent(
      this.app.workspace.on(
        "editor-drop",
        async (evt: DragEvent, editor: Editor) => {
          let files = evt.dataTransfer.files;

          if (files.length !== 0 && files[0].type.startsWith("image")) {
            const data = await this.goPicUploader.uploadFileByData(files);
            data.map((value: string) => {
              let pasteId = (Math.random() + 1).toString(36).substr(2, 5);
              this.insertTemporaryText(editor, pasteId);
              this.embedMarkDownImage(editor, pasteId, value, files[0].name);
            });
          }
        }
      )
    );
  }

  canUpload(clipboardData: DataTransfer) {
    const files = clipboardData.files;
    clipboardData.getData("text");
    return files.length !== 0 && files[0].type.startsWith("image");
  }

  async uploadFileAndEmbedImgurImage(
    editor: Editor,
    callback: Function,
    clipboardData: DataTransfer
  ) {
    let pasteId = (Math.random() + 1).toString(36).substr(2, 5);
    this.insertTemporaryText(editor, pasteId);
    const name = clipboardData.files[0].name;

    try {
      const url = await callback(editor, pasteId);
      this.embedMarkDownImage(editor, pasteId, url, name);
    } catch (e) {
      this.handleFailedUpload(editor, pasteId, e);
    }
  }

  insertTemporaryText(editor: Editor, pasteId: string) {
    let progressText = imageAutoUploadPlugin.progressTextFor(pasteId);
    editor.replaceSelection(progressText + "\n");
  }

  private static progressTextFor(id: string) {
    return `![Uploading file...${id}]()`;
  }

  embedMarkDownImage(
    editor: Editor,
    pasteId: string,
    imageUrl: any,
    name: string = ""
  ) {
    let progressText = imageAutoUploadPlugin.progressTextFor(pasteId);
    name = this.handleName(name);

    let markDownImage = `![${name}](${imageUrl})`;

    imageAutoUploadPlugin.replaceFirstOccurrence(
      editor,
      progressText,
      markDownImage
    );
  }

  handleFailedUpload(editor: Editor, pasteId: string, reason: any) {
    new Notice(reason);
    console.error("Failed request: ", reason);
    let progressText = imageAutoUploadPlugin.progressTextFor(pasteId);
    imageAutoUploadPlugin.replaceFirstOccurrence(
      editor,
      progressText,
      "⚠️upload failed, check dev console"
    );
  }

  handleName(name: string) {
    return `${name}`;
  }

  static replaceFirstOccurrence(
    editor: Editor,
    target: string,
    replacement: string
  ) {
    let lines = editor.getValue().split("\n");
    for (let i = 0; i < lines.length; i++) {
      let ch = lines[i].indexOf(target);
      if (ch != -1) {
        let from = { line: i, ch: ch };
        let to = { line: i, ch: ch + target.length };
        editor.replaceRange(replacement, from, to);
        break;
      }
    }
  }
}
