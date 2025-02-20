import { v4 as uuidv4 } from 'uuid';

// 细胞数据格式化，修复错误和补齐缺失字段
export const cellDataFormat = (cell) => {
    let data = Object.assign({}, cell);
    // 基础属性
    data.cid = cell?.cid || '';
    data.name = cell?.name || ''; // 细胞名，主体名
    data.groupName = cell?.groupName || 'CONTENT'; // 细胞组名, CONTENT、TEMPLATE、QNOTE、MATERIAL
    data.type = cell?.type || 'document'; // 细胞类型（模块）
    data.description = cell?.description || ''; // 简略描述
    data.icon = cell?.icon ? decodeURI(String(cell.icon)) : ''; // 图标
    let covers = []; // 封面图组（如果使用单图封面，则取第一个），部分形态下会作为封面、背景图、题图
    const coverList = cell?.cover ? (Array.isArray(cell.cover) ? cell.cover : []) : [];
    for (const each of coverList) {
        let item = each && typeof each === 'object' ? each : {};
        item.image = item?.image || '';
        item.thumbnail = item?.thumbnail || '';
        covers.push(item);
    }
    data.cover = covers;
    data.status = typeof cell?.status === 'number' ? cell.status : 2; // 细胞状态
    data.heat = typeof cell?.heat === 'number' ? cell.heat : 0; // 热度
    data.isStar = cell?.isStar || false; // 是否被当前用户收藏
    data.isLike = cell?.isLike || false; // 是否被当前用户点赞
    data.isRoot = cell?.isRoot === 0 ? 0 : 1; // 是否为顶级细胞
    data.encrypted = cell?.encrypted || 0; // 是否加密
    data.createTime = cell?.createTime || Date.parse(new Date()); // 创建时间
    data.updateTime = cell?.updateTime || Date.parse(new Date()); // 更新时间
    data.publishTime = cell?.publishTime || null; // 发布时间

    data.data = (typeof cell?.data === "object" && cell?.data !== null) ? cell.data : {}; // 细胞功能数据
    data.data.format = cell?.data?.format || 'markdown'; // 具体取用哪种格式，和细胞主体的type配合使用，算是type的下级分类，用于明确取用哪个字段的数据
    data.data.text = cell?.data?.text || '';
    data.data.images = Array.isArray(cell?.data?.images) ? cell.data.images : [];
    data.data.video = cell?.data?.video || '';
    data.data.audio = cell?.data?.audio || '';
    data.data.file = cell?.data?.file || '';
    data.data.link = cell?.data?.link || '';
    data.data.json = cell?.data?.json || {};
    data.data.html = cell?.data?.html || '';
    const blocks = Array.isArray(cell?.data?.blocks) ? cell.data.blocks : [];
    const seenIds = new Set(); // 用于存储已经出现的 id
    // 遍历每个块
    data.data.blocks = blocks.map(block => {
        // 如果该块的 id 已经出现过，则生成一个新的 id
        if (seenIds.has(block.attrs.id)) {
            block.attrs.id = uuidv4();
        }
        // 将 id 加入到 seenIds 中，以便后续检测
        seenIds.add(block.attrs.id);
        // 对块内容中的所有子块（如果有）也进行检查
        if (block.content && Array.isArray(block.content)) {
            block.content.forEach(subBlock => {
                // 递归检查子块的 id
                if (subBlock.attrs && seenIds.has(subBlock.attrs.id)) {
                    subBlock.attrs.id = uuidv4();
                }
                seenIds.add(subBlock.attrs.id);
            });
        }
        return block;
    });
    const children = Array.isArray(cell?.children) ? cell.children : []; // 子级内容，在离散模式下这里默认为空，在构建项目时往里面填充子级细胞；在单细胞模式下，子级内容直接写在这里
    const childrenIds = new Set();
    data.children = children.map(child => {
        if (childrenIds.has(child.cid)) {
            child.cid = uuidv4();
        }
        childrenIds.add(child.cid);
        return child;
    });

    data.data.map = (typeof cell?.data?.map === "object" && cell?.data?.map !== null) ? cell.data.map : {};
    
    // 配置项
    data.config = (typeof cell?.config === "object" && cell?.config !== null) ? cell.config : {};
    data.childrenSort = Array.isArray(cell?.childrenSort) ? cell.childrenSort : []; // 子级细胞排序

    data.statistics = (typeof cell?.statistics === "object" && cell?.statistics !== null) ? cell.statistics : {};
    data.statistics.viewCount = cell?.statistics?.viewCount || 0; // 阅读数
    data.statistics.clickCount = cell?.statistics?.clickCount || 0; // 点击数
    data.statistics.likeCount = cell?.statistics?.likeCount || 0; // 点赞数
    data.statistics.starCount = cell?.statistics?.starCount || 0; // 收藏数
    data.statistics.shareCount = cell?.statistics?.shareCount || 0; // 分享数

    // 细胞全部样式配置项
    data.style = (typeof cell?.style === "object" && cell?.style !== null) ? cell.style : {}; // 细胞样式对象
    data.style.theme = cell?.style?.theme || 'default'; // 主题
    data.style.background = cell?.style?.background && typeof cell.style?.background === 'object' ? cell.style?.background : {}; // 背景
    data.style.background.show = cell?.style?.background?.show ? cell.style.background.show : 'none'; // 是否显示背景，以及背景的类型
    data.style.background.image = cell?.style?.background?.image || ''; // 背景图片
    data.style.background.color = cell?.style?.background?.color || ''; // 背景颜色
    data.style.background.blur = cell?.style?.background?.blur || ''; // 背景模糊
    data.style.background.opacity = cell?.style?.background?.opacity || ''; // 背景透明度
    data.style.background.repeat = cell?.style?.background?.repeat || ''; // 背景重复方式
    data.style.font = cell?.style?.font && typeof cell.style?.font === 'object' ? cell.style?.font : {}; // 字体
    data.style.font.fontFamily = cell?.style?.font?.fontFamily || ''; // 字体系列
    data.style.font.fontSize = cell?.style?.font?.fontSize || ''; // 字体大小
    data.style.font.fontWeight = cell?.style?.font?.fontWeight || ''; // 字体粗细
    data.style.font.color = cell?.style?.font?.color || ''; // 字体颜色
    data.style.title = cell?.style?.title && typeof cell.style?.title === 'object' ? cell.style?.title : {}; // 标题
    data.style.title.show = cell?.style?.title?.show === false ? false : true; // 是否显示标题
    data.style.cover = cell?.style?.cover && typeof cell?.style?.cover === 'object' ? cell?.style?.cover : {}; // 封面
    data.style.cover.show = cell?.style?.cover?.show === false ? false : true; // 是否显示封面（控制详情页里的封面是否显示，外部的封面会一直显示）
    data.style.cover.type = cell?.style?.cover?.type || 'single'; // 封面类型
    data.style.cover.theme = cell?.style?.cover?.theme || ''; // 封面主题
    data.style.desc = cell?.style?.desc && typeof cell.style.desc === 'object' ? cell.style.desc : {}; // 描述
    data.style.desc.show = cell?.style?.desc?.show === false ? false : true; // 是否显示描述
    data.style.icon = cell?.style?.icon && typeof cell.style.icon === 'object' ? cell.style.icon : {}; // 图标
    data.style.icon.show = cell?.style?.icon?.show === false ? false : true; // 是否显示图标
    data.style.author = cell?.style?.author && typeof cell.style.author === 'object' ? cell.style.author : {}; // 作者
    data.style.author.show = cell?.style?.author?.show === false ? false : true; // 是否显示作者

    return data
}


export const formatDocCell = (cell) => {
    let data = Object.assign({}, cell);
    data.data = (typeof cell?.data === "object" && cell?.data !== null) ? cell.data : {};
    data.data.blocks = Array.isArray(cell?.data?.blocks) ? cell.data.blocks : [];
    return data;
}
export const formatMapCell = (cell) => {
    let data = Object.assign({}, cell);
    data.data = (typeof cell?.data === "object" && cell?.data !== null) ? cell.data : {};
    data.data.map = (typeof cell?.data?.map === "object" && cell?.data?.map !== null) ? cell.data.map : {};
    data.data.map.root = (typeof cell?.data?.map?.root === "object" && cell?.data?.map?.root !== null) ? cell.data.map.root : {};
    data.data.map.root.data = (typeof cell?.data?.map?.root?.data === "object" && cell?.data?.map?.root?.data !== null) ? cell.data.map.root.data : {};
    data.data.map.root.data.uid = cell?.cid || cell?.data?.map?.root?.data?.uid || uuidv4();
    data.data.map.root.data.text = cell?.data?.map?.root?.data?.text || cell?.name || '未命名主题';
    data.data.map.root.data.children = Array.isArray(cell?.data?.map?.root?.data?.children) ? cell.data.map.root.data.children : [];
    return data
}