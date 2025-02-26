import { v4 as uuidv4 } from 'uuid';

export const defaultWorkspace = {
    config: {

    }
}

export const formatWorkspace = (workspace) => {
    let data = Object.assign({}, workspace || {});
    data.id = workspace?.id || uuidv4();
    data.version = workspace?.version || 1;
    data.name = workspace?.name || 'UntitledWorkspace';
    data.description = workspace?.description || '';
    data.color = workspace?.color || getRandomColor();
    data.avatar = workspace?.avatar || '';
    data.icon = workspace?.icon;
    data.createTime = workspace?.createTime || Date.now();

    data.user = (workspace?.user && typeof workspace.user === 'object') ? workspace.user : {};
    data.user.uid = workspace?.user?.uid || '';
    data.user.name = workspace?.user?.name || '';
    data.user.description = workspace?.user?.description || '';
    data.user.avatar = workspace?.user?.avatar || '';
    data.user.cover = workspace?.user?.cover || '';
    data.user.type = workspace?.user?.type || '';
    data.user.email = workspace?.user?.email || '';
    data.user.phone = workspace?.user?.phone || '';
    data.user.tags = workspace?.user?.tags || [];

    data.appearance = (workspace?.appearance && typeof workspace.appearance === 'object') ? workspace.appearance : {};
    data.appearance.theme = workspace?.appearance?.theme || 'system';
    data.appearance.primaryColor = workspace?.appearance?.primaryColor || '#007aff';

    data.layout = (workspace?.layout && typeof workspace.layout === 'object') ? workspace.layout : {};
    data.layout.sidebar = (data.layout.sidebar && typeof data.layout.sidebar === 'object') ? data.layout.sidebar : {};
    data.layout.sidebar.collapse = workspace?.layout?.sidebar?.collapse === true ? true : false;

    data.menus = (workspace?.menus && typeof workspace.menus === 'object') ? workspace.menus : {};
    data.menus.stars = workspace?.menus?.stars === true ? true : false;
    data.menus.tags = workspace?.menus?.tags === true ? true : false;
    data.menus.material = workspace?.menus?.material === true ? true : false;
    data.menus.myTemplates = workspace?.menus?.myTemplates === true ? true : false;
    data.menus.filesTree = workspace?.menus?.filesTree === true ? true : false;
    data.menus.developer = workspace?.menus?.developer === true ? true : false;

    data.editor = (workspace?.editor && typeof workspace.editor === 'object') ? workspace.editor : {};
    data.editor.showTopToolBar = workspace?.editor?.showTopToolBar === false ? false : true;
    data.editor.panel = (data.editor.panel && typeof data.editor.panel === 'object') ? data.editor.panel : {};
    data.editor.panel.collapse = workspace?.editor?.panel?.collapse === false ? false : true;

    data.config = (workspace?.config && typeof workspace.config === 'object') ? workspace.config : {};

    data.data = (workspace?.data && typeof workspace.data === 'object') ? workspace.data : {};
    data.data.rootCells = Array.isArray(workspace?.data?.rootCells) ? workspace.data.rootCells : [];

    return data;
}

export const cellIndexs = {
    fields: ['groupName', 'type', 'status', 'isRoot', 'createTime', 'updateTime', 'publishTime', 'name'],
    name: 'cellIndexs',
    type: 'json',
    partial_filter_selector: {
        status: { $gte: 0, $lte: 4 },
        isRoot: { $gte: 0, $lte: 1 },
    }
}
export const cellRelationsIndexs = {
    fields: ['sourceId', 'targetId'],
    name: 'cellRelationsIndexs',
}

export const cellUserRelationsIndexs = {
    fields: ['cid', 'type'],
    name: 'cellUserRelationsIndexs',
}

export const cellFieldsForCover = ['cid', 'name', 'description', 'groupName', 'type', 'icon', 'cover', 'status', 'encrypted', 'isRoot', 'style', 'config', 'statistics', 'createTime', 'updateTime', 'publishTime'];

export const cellFieldsForTag = ['cid', 'name', 'description', 'groupName', 'type', 'icon', 'cover', 'status'];

// 用户和细胞的关联类型
export const cellUserRelationTypes = [
    'star', // 星标收藏
    'like', // 喜欢点赞
    'template', // 模板
]

const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#A133FF'];
export function getRandomColor() {
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
}