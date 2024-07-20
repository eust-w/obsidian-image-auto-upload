import { extname } from "path";
import { MarkdownView, App } from "obsidian";
import { parse } from "path";

interface Image {
  path: string;
  name: string;
  source: string;
}

const REGEX_FILE = /!\[(.*?)]\((\S+\.\w+)\)|!\[(.*?)]\((https?:\/\/.*?)\)/g;
const REGEX_WIKI_FILE = /!\[\[(.*?)(\s*?\|.*?)?]]/g;
export default class Cache {
  app: App;

  constructor(app: App) {
    this.app = app;
  }

  getEditor() {
    const mdView = this.app.workspace.getActiveViewOfType(MarkdownView);
    console.log("mdView:",mdView)
    console.log("MarkdownView:",MarkdownView)
    if (mdView) {
      return mdView.editor;
    } else {
      return null;
    }
  }
  getValue() {
    const editor = this.getEditor();
    console.log("editor:",editor)
    return editor.getValue();
  }

  setValue(value: string) {
    const editor = this.getEditor();
    const { left, top } = editor.getScrollInfo();
    const position = editor.getCursor();

    editor.setValue(value);
    editor.scrollTo(left, top);
    editor.setCursor(position);
  }

  getAllFiles(): Image[] {
    const editor = this.getEditor();
    let value = editor.getValue();
    return this.getImageLink(value);
  }
  getImageLink(value: string): Image[] {
    const matches = value.matchAll(REGEX_FILE);
    const WikiMatches = value.matchAll(REGEX_WIKI_FILE);

    let fileArray: Image[] = [];

    for (const match of matches) {
      const source = match[0];

      let name = match[1];
      let path = match[2];
      if (name === undefined) {
        name = match[3];
      }
      if (path === undefined) {
        path = match[4];
      }

      fileArray.push({
        path: path,
        name: name,
        source: source,
      });
    }

    for (const match of WikiMatches) {
      let name = parse(match[1]).name;
      const path = match[1];
      const source = match[0];
      if (match[2]) {
        name = `${name}${match[2]}`;
      }
      fileArray.push({
        path: path,
        name: name,
        source: source,
      });
    }

    return fileArray;
  }

  hasBlackDomain(src: string, blackDomains: string) {
    if (blackDomains.trim() === "") {
      return false;
    }
    const blackDomainList = blackDomains.split(",").filter(item => item !== "");
    let url = new URL(src);
    const domain = url.hostname;

    return blackDomainList.some(blackDomain => domain.includes(blackDomain));
  }
}


const IMAGE_EXT_LIST = [
  ".png",
  ".jpg",
  ".jpeg",
  ".bmp",
  ".gif",
  ".svg",
  ".tiff",
  ".webp",
  ".avif",
];

export function isAnImage(ext: string) {
  return IMAGE_EXT_LIST.includes(ext.toLowerCase());
}
export function isAssetTypeAnImage(path: string): Boolean {
  return isAnImage(extname(path));
}
export function bufferToArrayBuffer(buffer: Buffer) {
  const arrayBuffer = new ArrayBuffer(buffer.length);
  const view = new Uint8Array(arrayBuffer);
  for (let i = 0; i < buffer.length; i++) {
    view[i] = buffer[i];
  }
  return arrayBuffer;
}
