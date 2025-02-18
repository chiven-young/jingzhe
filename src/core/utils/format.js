import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import { splitHtml2Arr, createTiptapBlockFromHtml } from '@/utils/transform';

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
    data.config.shareStatus = cell?.config?.shareStatus === 0 ? 0 : 1; // 是否允许分享
    data.config.likeStatus = cell?.config?.likeStatus === 0 ? 0 : 1; // 是否允许点赞
    data.config.commentStatus = cell?.config?.commentStatus === 0 ? 0 : 1; // 是否允许评论
    data.config.price = cell?.config?.price || 0; // 价格

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

// 将太平通资讯项目数据转化为通用细胞数据
export const tptItem2cell = (tpt) => {
    let data = cellDataFormat(tpt);
    data.cid = tpt?.articleId;
    data.name = tpt?.title;
    data.description = tpt?.subTitle;
    data.source = tpt?.source;
    data.status = Number(tpt?.status);
    const covers = Array.isArray(tpt?.articleImage) ? tpt.articleImage : [];
    data.cover = covers.map((cover) => {
        let coverData = Object.assign({}, cover);
        coverData.image = coverData.fileUrl || '';
        coverData.thumbnail = coverData.fileUrl || '';
        return coverData
    })
    if (tpt?.style === '2') {
        data.style.cover.type = 'single';
    } else if (tpt?.style === '3') {
        data.style.cover.type = 'multi';
    } else if (tpt?.style === '6') {
        data.type = 'video';
    }
    data.data = {};
    data.data.text = tpt?.content || '';
    data.data.blocks = [];
    const textList = splitHtml2Arr(tpt?.content || '');
    textList.forEach((text) => {
        const block = createTiptapBlockFromHtml(text);
        data.data.blocks.push(block);
    })
    data.children = [];
    data.createTimeStr = tpt?.createTime;
    data.createTime = moment(tpt?.createTime).valueOf();
    data.publishTimeStr = tpt?.pubPlatformTimeStr || formatTimeArray(tpt?.pubPlatformTime);
    data.publishTime = moment(tpt?.pubPlatformTimeStr || formatTimeArray(tpt?.pubPlatformTime)).valueOf();
    return data
}

// 将通用细胞数据转化为太平通资讯项目数据
export const cell2tptItem = (cell) => {
    let data = {};
    data.articleId = cell?.cid;
    data.title = cell?.name;
    data.subTitle = cell?.description;
    data.source = cell?.source;
    data.status = cell?.status.toString();
    data.articleImage = [];
    const covers = cell?.cover && Array.isArray(cell.cover) ? cell.cover : [];
    for (const each of covers) {
        let item = {};
        if (each?.image) {
            item.fileType = each?.fileType || "1";
            item.filePurposes = each?.filePurposes || "2";
            item.fileUrl = each.image || each?.fileUrl || each?.url;
            data.articleImage.push(item);
        }
    }
    return data;
}
let tpt = {
    "articleId": "aed018564f074b1bb30ebbcf37369d1b",
    "title": "情绪价值法——《振奋人心！我国一箭五星成功发射的辉煌时刻》",
    "creatorId": "682",
    "status": "3",
    "isEnable": "1",
    "style": "2",
    "readCount": null,
    "clickCount": 1,
    "refuseCause": "其他原因，iiiiiiiiiiiii急急急急急急急急急急急急",
    "pubPlatformTime": [
        2024,
        9,
        25,
        17,
        6,
        22
    ],
    "createTime": "2024-09-25 16:36:14",
    "articleImage": [
        {
            "id": "1838860111770468353",
            "articleId": "aed018564f074b1bb30ebbcf37369d1b",
            "fileType": "1",
            "filePurposes": "2",
            "fileUrl": "https://tptcdnsit.itaiping.com/static/TPTSQ_FILES/20240925/info_20240925163614548_0a343907-3c2a-439b-a805-a4049ae18e83_.jpg",
            "creatorId": null,
            "type": null,
            "createBy": null,
            "createTime": "2024-09-25 16:36:30",
            "updateBy": "GUID9189765552640331777",
            "updateTime": "2024-09-25 16:36:30",
            "isDelete": "0"
        }
    ],
    "pubPlatformTimeStr": "2024-09-25 17:06:22",
    "isDelete": "0",
    "articleSource": "AI",
    "riversStatus": null,
    "isEdit": null,
    "dunStatus": "0",
    "detailUrl": "https://tptcdnsit.itaiping.com/static/newscontent/#/info?articleId=aed018564f074b1bb30ebbcf37369d1b&source=TPT&x_utmId=1234&x_businesskey=articleId&serviceNo=682",
    "serviceNoName": "太平通官方账号",
    "serviceNoImage": "https://tptcdnsit.itaiping.com/static/TPTSQ_FILES/20240701/info_thumbnail_20240701010004091_d2c0e121-9702-4c7f-b19c-71dc5bb91b44_.jpg",
    "source": "TPT"
}

export const tptBlock2cell = (block) => {
    let data = Object.assign({}, block);
    data.cid = block.id;
    data.name = block?.name || block?.fileName;
    data.type = block.type;
    data.cover = [];
    data.data = {};
    if (block.type === 'image') {
        data.data.image = block.fileUri;
        data.data.url = block.fileUri;
        data.cover.push({
            image: block.fileUri,
            thumbnail: block.fileUri
        })
    } else if (block.type === 'text') {
        data.data.text = block.content;
    }
    return data;
}
const block = {
    "id": "56193c5e-2d97-454f-893b-03c01ea748d6",
    "url": null,
    "name": null,
    "content": null,
    "type": "image",
    "subType": null,
    "originalFilename": null,
    "uploadContentType": null,
    "fileName": null,
    "fileSize": null,
    "fileStorePath": null,
    "fileUri": "https://tptcdnsit.itaiping.com/static/TPTSQ_FILES/20230711/info_20230711201521.jpg",
    "fileBusiType": null,
    "createTime": "2023-11-02 21:37:03",
    "updateTime": "2023-11-02 21:37:03",
    "isDelete": false,
    "tags": [],
    "serviceId": null,
    "compressed": null
}

function formatTimeArray(timeArray) {
    // 检查是否为数组且长度为 5或6
    if (!Array.isArray(timeArray) || timeArray.length < 5 || timeArray.length > 6) {
        return '';
    }
    if (timeArray.length === 5) {
        timeArray.push(0); // 如果长度为5，则添加一个0作为秒数
    }
    // 检查每个元素是否为数字
    if (!timeArray.every(item => typeof item === 'number' && !isNaN(item))) {
        return '';
    }
    // 解构数组
    const [year, month, day, hour, minute, second] = timeArray;
    // 检查日期和时间的有效性
    if (year < 0 || month < 1 || month > 12 || day < 1 || day > 31 ||
        hour < 0 || hour > 23 || minute < 0 || minute > 59 || second < 0 || second > 59) {
        return '';
    }
    // 格式化为两位数的函数
    const pad = (num) => num.toString().padStart(2, '0');
    // 返回格式化的字符串
    return `${year}-${pad(month)}-${pad(day)} ${pad(hour)}:${pad(minute)}:${pad(second)}`;
}