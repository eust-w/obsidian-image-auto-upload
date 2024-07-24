import {  FormData } from "node-fetch-native";

import { PluginSettings } from "./setting";
import { exec } from "child_process";
import imageAutoUploadPlugin from "./main";

import { promises as fs, readFile } from "fs";
import * as os from 'os';
import * as path from 'path';

import { bufferToArrayBuffer } from "./utils";

export class PicGoUploader {
  settings: PluginSettings;
  plugin: imageAutoUploadPlugin;

  constructor(settings: PluginSettings, plugin: imageAutoUploadPlugin) {
    this.settings = settings;
    this.plugin = plugin;
  }


  async uploadFiles(fileList: Array<string>): Promise<any> {
    let response: any;

    const files = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const buffer: Buffer = await new Promise((resolve, reject) => {
        readFile(file, (err, data) => {
          if (err) {
            reject(err);
          }
          resolve(data);
        });
      });
      const arrayBuffer = bufferToArrayBuffer(buffer);
      files.push(new File([arrayBuffer], file));
    }
    response = await this.uploadFileByData(files);

    return response;
  }

  async uploadFileByData(fileList: FileList | File[]): Promise<any> {
    const form = new FormData();
    let filelistRaw: Array<string> = [];

    const readFiles = async () => {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        form.append("list", file);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filePath = path.join(os.tmpdir(), `${uniqueSuffix}-${file.name}`);

        const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as ArrayBuffer);
          reader.onerror = reject;
          reader.readAsArrayBuffer(file);
        });

        await fs.writeFile(filePath, Buffer.from(arrayBuffer));
        filelistRaw.push(filePath);
      }
    };

    await readFiles();


    return new Promise((resolve, reject) => {
      const files = filelistRaw.join(' ');
      let storages: string;
      if (new Set([this.settings.Github, this.settings.Samba, this.settings.Qiniu]).size === 1) {
        storages = "-a"
      }else {
        storages = "-s "
        let storageList: string[] = [];
        if (this.settings.Qiniu){
          storageList.push("qiniu")
        }
        if (this.settings.Samba){
          storageList.push("samba")
        }
        if (this.settings.Github){
          storageList.push("github")
        }
        storages += storageList.join(",");
      }

      const command = this.settings.GopicPath+` upload ${storages} -p ${files} -f `+this.settings.PrimaryStorage;
      exec(command, async (error, stdout, stderr) => {
        for (const filePath of filelistRaw) {
          await fs.unlink(filePath);
        }

        if (error) {
          reject(`Error: ${error.message}`);
          return;
        }
        if (stderr) {
          reject(`Stderr: ${stderr}`);
          return;
        }

        const result = stdout.trim().split('\n');
        resolve(result);
      });
    });
  }



  async uploadFileByClipboard(fileList?: FileList): Promise<any> {
    let res: any;
    res = await this.uploadFileByData(fileList);
    return res
  }
}
