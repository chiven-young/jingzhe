
import JSZip from 'jszip';
import saveAs from 'file-saver';
import { save } from '@tauri-apps/plugin-dialog';
import { writeFile } from '@tauri-apps/plugin-fs';

export default class Files {

    // 导出完整文件结构到本地
    static async exportFiles(exportData) {
        const zip = new JSZip();

        // 创建根目录
        const rootDir = zip.folder(exportData.rootDirName);

        // 创建子文件夹及文件
        this.createFoldersAndFiles(rootDir, exportData.folders || []);
        exportData.files?.forEach(file => {
            rootDir.file(file.name, file.content);
        });

        // 生成 ZIP 文件
        zip.generateAsync({ type: 'blob' }).then(async (content) => {
            if (window.__TAURI__) {
                const filePath = await save({ defaultPath: `${exportData.rootDirName}.zip` });
                const zipArrayBuffer = await content.arrayBuffer();
                await writeFile(filePath, new Uint8Array(zipArrayBuffer));
            } else {
                saveAs(content, `${exportData.rootDirName}.zip`);
            }
        });
    }

    static createFoldersAndFiles(parentDir, folders) {
        folders.forEach(folder => {
            const folderDir = parentDir.folder(folder.name);

            // 创建文件
            folder.files?.forEach(file => {
                folderDir.file(file.name, file.content);
            });

            // 递归创建子文件夹
            if (folder.folders && folder.folders.length > 0) {
                this.createFoldersAndFiles(folderDir, folder.folders);
            }
        });
    }

    static async parseZip(file) {
        const zip = await JSZip.loadAsync(file);
        const parsedData = {
            rootDirName: '',
            folders: [],
            files: []
        };

        // 获取根目录名称
        for (const path of Object.keys(zip.files)) {
            if (path.endsWith('/') && !parsedData.rootDirName) {
                parsedData.rootDirName = path.slice(0, -1); // 移除末尾的 '/'
                break;
            }
        }

        // 创建一个 Promise 数组，用于等待所有文件内容的异步加载
        const filePromises = [];

        // 解析文件和文件夹
        for (const path of Object.keys(zip.files)) {
            if (!path.endsWith('/')) { // 确保这不是一个文件夹路径
                const parts = path.split('/');
                const fileName = parts.pop();
                const folderPath = parts.join('/');

                let currentFolder = parsedData.folders.find(f => f.name === folderPath);
                if (!currentFolder) {
                    currentFolder = {
                        name: folderPath,
                        files: [],
                        folders: []
                    };
                    parsedData.folders.push(currentFolder);
                }

                // 添加文件，加载文件内容的 Promise
                const filePromise = zip.files[path].async('string').then(content => {
                    currentFolder.files.push({ name: fileName, content });
                });
                filePromises.push(filePromise);
            } else { // 处理文件夹
                const folderPath = path.slice(0, -1); // 移除末尾的 '/'

                let currentFolder = parsedData.folders.find(f => f.name === folderPath);
                if (!currentFolder) {
                    currentFolder = {
                        name: folderPath,
                        files: [],
                        folders: []
                    };
                    parsedData.folders.push(currentFolder);
                }
            }
        }

        // 等待所有文件内容异步加载完成
        await Promise.all(filePromises);

        // 递归处理子文件夹
        parsedData.folders.forEach(folder => {
            this.recursivelyAddSubfolders(parsedData.folders, folder);
        });

        return {
            rootDirName: parsedData.rootDirName,
            ...parsedData.folders[0]
        };
    }


    static recursivelyAddSubfolders(folders, folder) {
        for (let i = 0; i < folders.length; i++) {
            const subFolder = folders[i];
            if (subFolder.name.startsWith(folder.name + '/')) {
                folder.folders.push(subFolder);
                folders.splice(i, 1);
                i--;
            }
        }

        // 递归处理子文件夹
        folder.folders.forEach(subFolder => {
            this.recursivelyAddSubfolders(folder.folders, subFolder);
        });
    }
}