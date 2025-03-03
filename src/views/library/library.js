import jingApi from '@/core';
import store from '@/store';

function getTreeListFromCache () {
    let list = JSON.parse(sessionStorage.getItem('fileTreeData') || '[]');
    if (Array.isArray(list) && list.length) {
        return list;
    }
    return [];
}

export default class Library {

    // 获取目录树
    static async getTree () {
        const list = getTreeListFromCache();
        const tree = list.find(item => item.id === jingApi.workspace?.currentWorkspace?.id);
        if (tree && tree?.tree?.length) {
            store.state.cellsTree = tree.tree;
            return tree.tree;
        }
        let arr = await this.getList('0');
        arr = sortByChildrenSort(arr, jingApi.workspace?.currentWorkspace?.data?.rootCells);
        this.saveTreeToCache(arr);
        store.state.cellsTree = arr;
        return arr;
    }
    static saveTreeToCache (tree) {
        let list = getTreeListFromCache();
        const index = list.findIndex(item => item.id === jingApi.workspace?.currentWorkspace?.id);
        if (index !== -1) {
            list[index].tree = tree;
        } else {
            list.push({
                id: jingApi.workspace?.currentWorkspace?.id,
                tree: tree,
            });
        }
        sessionStorage.setItem('fileTreeData', JSON.stringify(list));
    }
    // 获取细胞列表
    static async getList (parentId) {
        let res = null;
        let params = {
            groupName: 'CONTENT',
            maxStatus: 4,
            minStatus: 1,
            isRoot: 1,
            showCorrelationChildren: 1,
            page: 1,
            pageSize: -1,
        }
        if (parentId && parentId !== '0') {
            params.parentIds = [parentId];
            params.isRoot = null;
        }
        try {
            res = await jingApi.cells.getCells(params)
        } catch (error) { };
        let list = res?.data?.list || [];
        const resNode = findNodeById({
            cid: '0',
            correlationsChildren: store.state.cellsTree,
        }, parentId);
        const parent = resNode?.node;
        if (parent) {
            list = sortByChildrenSort(list, parent?.config?.childrenSort);
        }
        list = list.map((item) => {
            if (item.type === 'folder') {
                item.correlationsChildren = sortByChildrenSort(item?.correlationsChildren, item?.config?.childrenSort);
                if (!item.correlationsChildren?.length) {
                    item.correlationsChildren = [
                        {
                            name: "None",
                            correlationsChildren: [],
                        }
                    ];
                } else {
                    item.correlationsChildren = item.correlationsChildren.map((child) => {
                        if (child.type === 'folder') {
                            if (!child.correlationsChildren?.length) {
                                child.correlationsChildren = [
                                    {
                                        name: "None",
                                        correlationsChildren: [],
                                    }
                                ];
                            }
                        }
                        return child;
                    })
                }
            }
            return item;
        })
        if (!list.length) {
            list = [
                {
                    name: "None",
                    correlationsChildren: [],
                }
            ];
        }
        return list;
    }
    // 根据cid获取当前细胞的面包屑
    static findBreadcrumb(data, targetCid) {
      function helper(arr, path) {
        for (const item of arr) {
          const newPath = [...path, { cid: item.cid, name: item.name }];
          if (item.cid === targetCid) {
            return newPath;
          }
          if (item.correlationsChildren && item.correlationsChildren.length > 0) {
            const result = helper(item.correlationsChildren, newPath);
            if (result) {
              return result;
            }
          }
        }
        return null;
      }
      return helper(data, []);
    }
    // 更新父文件夹的childrenSort
    static async updateFolderChildrenSort (parentId, newChildren) {
        if (parentId === '0') {
            const list = store.state.cellsTree.map((item) => {
                return item?.cid;
            })
            await jingApi.cells.saveRootCells(list);
            return
        }
        const res = findNodeById({
            cid: '0',
            correlationsChildren: store.state.cellsTree,
        }, parentId);
        let list = (newChildren || []).filter((item) => item?.cid);
        if (res?.node) {
            res.node.correlationsChildren = list.length ? list : [
                {
                    name: "None",
                    correlationsChildren: [],
                }
            ];
        }
        const childrenSort = list.map((item) => {
            return item.cid;
        });
        await jingApi.cells.updateCell({
            cid: parent.cid,
            config: {
                ...parent.config,
                childrenSort: childrenSort,
            }
        })
    }
}

// 根据id查询节点及其父级
const findNodeById = (obj, id) => {
    if (obj?.cid === id) {
        return {
            parent: null,
            node: obj,
        };
    }
    const correlationsChildren = obj?.correlationsChildren || [];
    if (correlationsChildren.length) {
        for (let i = 0; i < correlationsChildren.length; i++) {
            const res = findNodeById(correlationsChildren[i], id);
            if (res) {
                return {
                    parent: res?.parent || obj,
                    node: res?.node,
                };
            }
        }
    }
    return null;
};

// 根据 childrenSort 对文档列表进行排序（只应用于文件夹类型的下一级文件）
const sortByChildrenSort = (list, childrenSort) => {
    // 如果 childrenSort 为空，直接返回原始文档列表
    if (!childrenSort || childrenSort.length === 0) {
      return list;
    }
  
    // 将文档按 ID 映射为一个对象，方便查找
    const listMap = new Map();
    list.forEach(doc => {
      listMap.set(doc.cid, doc);
    });
  
    // 根据 childrenSort 中的顺序对文档进行排序
    const sortedList = [];
  
    // 首先将 childrenSort 中的有效 ID 按顺序添加到排序结果中
    childrenSort.forEach((cid) => {
      if (listMap.has(cid)) {
          sortedList.push(listMap.get(cid)); // 根据 childrenSort 顺序添加文档
          listMap.delete(cid); // 从文档映射中移除已处理的文档
      }
    });
  
    // 对于剩余的文档（在 childrenSort 中没有出现的），保持原有的顺序
    // 将剩余的文档按它们在 list 中的顺序添加
    const remainingList = Array.from(listMap.values());
    sortedList.push(...remainingList);
  
    return sortedList;
  }