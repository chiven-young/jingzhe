import { formatWorkspace, cellIndexs, cellRelationsIndexs, cellUserRelationsIndexs, getRandomColor } from '../config/db';
import store from '@/store';
import { getLocalStorageArray, reorderLocalStorageArray, removeFromLocalStorageArray } from '../utils/data';
import Files from './files';
import { v4 as uuidv4 } from 'uuid';
import bus from '@/core/utils/bus';
import PouchDB from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';
PouchDB.plugin(PouchDBFind);

export default class Workspace {
    static workspaceManagerDB = null;
    static cellsDB = null;
    static cellsRelationsDB = null;
    static cellUserRelationsDB = null;
    static currentWorkspace = null;
    static backendRequestQueue = [];
    static processingQueue = false;

    static async init(workspaceData) {
        store.state.loadingWorkspace = true;
        if (!this.workspaceManagerDB) {
            this.workspaceManagerDB = new PouchDB('workspaceManager');
        }
        const workspaceList = await this.getWorkspaceList();
        if (workspaceList.data.list.length === 0) {
            let workspace = null;
            if (workspaceData) {
                workspace = formatWorkspace(workspaceData);
            } else {
                workspace = formatWorkspace({});
            }
            const res1 = await this.createWorkspace(workspace);
            if (res1.success && res1.data?.id) {
                const res2 = await this.switchWorkspace(res1.data.id);
                store.state.loadingWorkspace = false;
                return res2.data;
            } else {
                store.state.loadingWorkspace = false;
                return null;
            }
        } else {
            const id = sessionStorage.getItem('activeWorkspaceId');
            if (id) {
                const res = await this.switchWorkspace(id);
                store.state.loadingWorkspace = false;
                return res.data;
            }
            const list = getLocalStorageArray('recentWorkspaces');
            if (list && list.length > 0) {
                const res = await this.switchWorkspace(list[0]);
                store.state.loadingWorkspace = false;
                return res.data;
            }
            const workspaceId = workspaceList.data.list[0]?.id;
            const workspace = await this.switchWorkspace(workspaceId);
            store.state.loadingWorkspace = false;
            return workspace.data;
        }
    }
    // 获取工作区列表
    static async getWorkspaceList() {
        try {
            const res = await this.workspaceManagerDB.allDocs({ include_docs: true });
            return {
                code: '1000',
                success: true,
                data: {
                    list: res.rows.map(row => row.doc),
                    total: res.total_rows,
                },
                message: '获取工作区列表成功'
            }
        } catch (err) {
            const errorMessage = err.message ? err.message : String(err);
            return {
                code: '1005',
                success: false,
                data: null,
                message: errorMessage
            };
        }
    }
    // 创建工作区
    static async createWorkspace(data) {
        let workspace = formatWorkspace(data);
        try {
            const res = await this.workspaceManagerDB.put({
                _id: workspace.id,
                ...workspace
            });
            return {
                code: '1000',
                success: true,
                data: res,
                message: '创建工作区成功'
            };
        } catch (err) {
            const errorMessage = err.message ? err.message : String(err);
            return {
                code: '1005',
                success: false,
                data: null,
                message: errorMessage
            };
        }
    }

    // 更新工作区
    static async updateWorkspace(data, isCurrent = true) {
        if (!data.id) {
            return {
                code: '1005',
                success: false,
                data: null,
                message: '工作区ID不能为空'
            };
        }
        let workspace = JSON.parse(JSON.stringify(data));
        try {
            const item = await this.workspaceManagerDB.get(workspace.id);
            if (item) {
                workspace.version ++;
                await this.workspaceManagerDB.put({
                    ...item,
                    ...workspace
                });
                const res = await this.getWorkspace(workspace.id);
                if (res.success) {
                    if (isCurrent) {
                        this.currentWorkspace = res.data;
                        store.state.workspace = res.data;   
                    }
                    return {
                        code: '1000',
                        success: true,
                        data: true,
                        message: '更新工作区成功'
                    };
                } else {
                    return {
                        code: '1005',
                        success: false,
                        data: null,
                        message: '更新工作区失败'
                    };
                }
            } else {
                return {
                    code: '1005',
                    success: false,
                    data: null,
                    message: '工作区不存在'
                };
            }
        } catch (err) {
            const errorMessage = err.message ? err.message : String(err);
            return {
                code: '1005',
                success: false,
                data: null,
                message: errorMessage
            };
        }
    }
    // 删除工作区
    static async deleteWorkspace(id) {
        try {
            const item = await this.workspaceManagerDB.get(id);
            if (item) {
                await this.workspaceManagerDB.remove(item);
                const cellsName = `cells_${id}`;
                const cellRelationsName = `cellRelations_${id}`;
                const cellUserRelationsName = `cellUserRelations_${id}`;
                const db1 = new PouchDB(cellsName);
                const db2 = new PouchDB(cellRelationsName);
                const db3 = new PouchDB(cellUserRelationsName);
                db1.destroy();
                db2.destroy();
                db3.destroy();
                removeFromLocalStorageArray('recentWorkspaces', id);
                if (id !== this.currentWorkspace.id) {
                    return {
                        code: '1000',
                        success: true,
                        data: true,
                        message: '删除工作区成功'
                    };
                }
                const res1 = await this.getWorkspaceList();
                const list = res1.data.list;
                if (list.length > 0) {
                    const firstWorkspace = list[0];
                    const res = await this.switchWorkspace(firstWorkspace.id);
                } else {
                    const res = await this.createWorkspace({ name: '我的工作区' });
                    const res2 = await this.switchWorkspace(res.data.id);
                }
                return {
                    code: '1000',
                    success: true,
                    data: true,
                    message: '删除工作区成功'
                };
            } else {
                return {
                    code: '1005',
                    success: false,
                    data: false,
                    message: '工作区不存在'
                };
            }
        } catch (err) {
            const errorMessage = err.message ? err.message : String(err);
            return {
                code: '1005',
                success: false,
                data: false,
                message: errorMessage
            };
        }
    }
    // 创建、获取数据库，并创建索引
    static getDB = async (name, indexsName, indexs) => {
        try {
            const db = new PouchDB(name);

            // 等待获取索引
            const result = await db.getIndexes();
            const indexes = result.indexes;

            // 查找是否已有指定的索引
            const existingIndex = indexes.find(index => index.name === indexsName);

            if (!existingIndex) {
                // 如果索引不存在，创建索引并等待完成
                await db.createIndex({
                    index: indexs
                });
                // console.log('索引创建成功', indexsName);
            }

            // 在索引检查/创建完成后返回数据库实例
            return db;

        } catch (err) {
            console.error('处理索引时出错', err);

            // 如果出错，仍然返回数据库实例
            return new PouchDB(name);
        }
    }
    // 切换工作区
    static async switchWorkspace(id) {
        store.state.loadingWorkspace = true;
        try {
            let workspace = await this.workspaceManagerDB.get(id);
            if (workspace) {
                workspace = formatWorkspace(workspace);
                const cellsName = `cells_${id}`;
                const cellRelationsName = `cellRelations_${id}`;
                const cellUserRelationsName = `cellUserRelations_${id}`;
                this.cellsDB = await this.getDB(cellsName, 'cellIndexs', cellIndexs);
                this.cellsRelationsDB = await this.getDB(cellRelationsName, 'cellRelationsIndexs', cellRelationsIndexs);
                this.cellUserRelationsDB = await this.getDB(cellUserRelationsName, 'cellUserRelationsIndexs', cellUserRelationsIndexs);
                this.currentWorkspace = workspace;
                store.state.workspace = workspace;
                sessionStorage.setItem('activeWorkspaceId', id);
                reorderLocalStorageArray('recentWorkspaces', id);
                store.state.loadingWorkspace = false;
                bus.emit('workspace-switched', workspace);
                return {
                    code: '1000',
                    success: true,
                    data: workspace,
                    message: '切换工作区成功'
                };
            } else {
                store.state.loadingWorkspace = false;
                return {
                    code: '1005',
                    success: false,
                    data: null,
                    message: '工作区不存在'
                };
            }
        } catch (err) {
            store.state.loadingWorkspace = false;
            const errorMessage = err.message ? err.message : String(err);
            console.log(errorMessage);
            return {
                code: '1005',
                success: false,
                data: null,
                message: errorMessage
            };
        }
    }

    // 工作区
    static async getWorkspace(id) {
        try {
            const res = await this.workspaceManagerDB.get(id);
            return {
                code: '1000',
                success: true,
                data: res,
                message: '获取工作区成功'
            }
        } catch (err) {
            const errorMessage = err.message ? err.message : String(err);
            return {
                code: '1005',
                success: false,
                data: null,
                message: errorMessage
            };
        }
    }

    // 导出单个数据库到文件
    static async exportDatabaseToFile(db, filePath) {
        const writeStream = fs.createWriteStream(filePath);
        await db.dump(writeStream);
        console.log(`${db.name} 数据库导出成功至 ${filePath}`);
    }

    // 导出一个工作区
    static async exportWorkspace(id) {
        try {
            const workspace = await this.workspaceManagerDB.get(id);
            const cellsName = `cells_${id}`;
            const cellRelationsName = `cellRelations_${id}`;
            const cellUserRelationsName = `cellUserRelations_${id}`;
            const db1 = new PouchDB(cellsName);
            const db2 = new PouchDB(cellRelationsName);
            const db3 = new PouchDB(cellUserRelationsName);
            async function getListFromDb(db) {
                let list = [];
                return new Promise((resolve, reject) => {
                    db.allDocs({ include_docs: true, attachments: true })
                        .then((response) => {
                            response.rows.forEach((row) => {
                                list.push({
                                    id: row.doc._id,
                                    data: row.doc,
                                    attachments: row.doc._attachments
                                });
                            });
                            resolve(list);
                        })
                        .catch((error) => {
                            console.error('Export failed:', error);
                            reject(error);
                        })
                })
            }
            const cells = await getListFromDb(db1);
            const cellRelations = await getListFromDb(db2);
            const cellUserRelations = await getListFromDb(db3);
            const cellsFiles = cells.map((cell) => {
                return {
                    name: cell.id + '.json',
                    content: JSON.stringify(cell.data, null, 2),
                    attachments: cell.attachments
                }
            });
            const cellRelationsFiles = cellRelations.map((cellRelation) => {
                return {
                    name: cellRelation.id + '.json',
                    content: JSON.stringify(cellRelation.data, null, 2),
                    attachments: cellRelation.attachments
                }
            });
            const cellUserRelationsFiles = cellUserRelations.map((cellUserRelation) => {
                return {
                    name: cellUserRelation.id + '.json',
                    content: JSON.stringify(cellUserRelation.data, null, 2),
                    attachments: cellUserRelation.attachments
                }
            })
            let exportData = {
                rootDirName: workspace?.name || `workspace_${id}`,
                folders: [
                    {
                        name: 'workspace',
                        files: [
                            {
                                name: 'workspace.json',
                                content: JSON.stringify(workspace, null, 2),
                            }
                        ],
                        folders: [
                            {
                                name: 'themes',
                                files: [
                                    { name: 'theme1.css', content: '/* Theme 1 */' }
                                ]
                            },
                            {
                                name: 'plugins',
                                folders: [
                                    {
                                        name: 'plugin1',
                                        files: [
                                            { name: 'plugin1.js', content: 'console.log("Plugin 1");' }
                                        ]
                                    }
                                ]
                            },
                            {
                                name: 'cellRelationsFiles',
                                files: cellRelationsFiles
                            },
                            {
                                name: 'cellUserRelationsFiles',
                                files: cellUserRelationsFiles
                            }
                        ]
                    },
                    {
                        name: 'cells',
                        files: cellsFiles
                    }
                ],
                files: [
                    { name: 'readme.txt', content: 'This is a root file.' }
                ]
            };
            Files.exportFiles(exportData);
        } catch (err) {
            console.log(err);
        }
    }

    // 导入一个工作区
    static async importWorkspace() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.zip'; // 只能选择 ZIP 文件
        input.addEventListener('change', async (event) => {
            const file = event.target.files[0];

            if (!file) {
                console.error('No file selected.');
                return;
            }

            if (file.type === 'application/zip') {
                try {
                    const parsedData = await Files.parseZip(file);
                    // console.log(parsedData);
                    const workspaceData = parsedData.folders.find(folder => folder.name === `${parsedData.rootDirName}/workspace`);
                    const workspaceFiles = workspaceData.files;
                    let workspace = JSON.parse(workspaceFiles.find(file => file.name === 'workspace.json')?.content || '{}');
                    workspace = formatWorkspace(workspace);
                    const workspaceId = uuidv4();
                    workspace._id = workspaceId;
                    workspace.id = workspaceId;
                    delete workspace._rev;
                    workspace.color = getRandomColor();
                    // console.log('import workspace', workspace);
                    await Workspace.workspaceManagerDB.put(workspace);
                    // console.log('import workspace success');

                    const workspaceFolders = workspaceData?.folders || [];
                    const cellRelationsFiles = workspaceFolders.find(folder => folder.name === `${parsedData.rootDirName}/workspace/cellRelationsFiles`)?.files || [];
                    const cellUserRelationsFiles = workspaceFolders.find(folder => folder.name === `${parsedData.rootDirName}/workspace/cellUserRelationsFiles`)?.files || [];
                    const cellsFiles = parsedData.folders.find(folder => folder.name === `${parsedData.rootDirName}/cells`)?.files || [];

                    const cellsName = `cells_${workspaceId}`;
                    const cellRelationsName = `cellRelations_${workspaceId}`;
                    const cellUserRelationsName = `cellUserRelations_${workspaceId}`;
                    const db1 = await Workspace.getDB(cellsName, 'cellIndexs', cellIndexs);
                    const db2 = await Workspace.getDB(cellRelationsName, 'cellRelationsIndexs', cellRelationsIndexs);
                    const db3 = await Workspace.getDB(cellUserRelationsName, 'cellUserRelationsIndexs', cellUserRelationsIndexs);

                    const docs1 = cellsFiles.map(file => ({
                        _id: file.name,
                        ...JSON.parse(file.content)
                    }));
                    await db1.bulkDocs(docs1, { new_edits: false });

                    const docs2 = cellRelationsFiles.map(file => ({
                        _id: file.name,
                        ...JSON.parse(file.content)
                    }));
                    await db2.bulkDocs(docs2, { new_edits: false });

                    const docs3 = cellUserRelationsFiles.map(file => ({
                        _id: file.name,
                        ...JSON.parse(file.content)
                    }));
                    await db3.bulkDocs(docs3, { new_edits: false });
                    // console.log('put data success');
                    Workspace.switchWorkspace(workspaceId);
                } catch (error) {
                    console.error('Error processing zip file:', error);
                }
            } else {
                console.error('Unsupported file type.');
            }
        });
        document.body.appendChild(input);
        input.click();
        document.body.removeChild(input);
    }
}