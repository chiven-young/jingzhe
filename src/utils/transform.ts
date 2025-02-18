// 文档和思维导图互相转化
// 使用一种通用节点数据结构，作为主数据储存，然后向多种编辑器的数据格式进行互相转化。
// 主数据为全量数据，各编辑器所需要的数据储存在data下的特定字段，在编辑时，将各编辑器数据合并到主数据，切换编辑器时，从主数据解析到对应编辑器所需数据。

// 使用合并的方法，不要丢掉原有的属性。为此，文档和脑图各自独立储存，在切换编辑器的时候，进行合并。

import { v4 as uuidv4 } from 'uuid';
import { richTextToPlainText, replaceRichTextContent } from './tools';

// 通用节点
interface TreeNode {
    [key: string]: any;
    children?: TreeNode[];
}
interface MindMapNode {
    cid: string;
    data: {
        text: string;
        type: string;
        level?: number;
        [key: string]: any;
    };
    children: MindMapNode[];
    [key: string]: any;
}

// simpleMap节点
interface MapNode {
    data: {
        text: string;
        uid: string;
        richText?: boolean;
        expand?: boolean;
        icon?: any[];
        image?: string;
        imageTitle?: string;
        imageSize?: {
            width: number;
            height: number;
            custom: boolean;
        };
        hyperlink?: string;
        hyperlinkTitle?: string;
        note?: string;
        attachmentUrl?: string;
        attachmentName?: string;
        tag?: Array<string | { text: string; style: any }>;
        generalization?: Array<{
            text: string;
            richText?: boolean;
            [key: string]: any;
        }> | null;
        associativeLineTargets?: string[];
        associativeLineText?: string;
        [key: string]: any;
    };
    children: MapNode[];
}

interface Map {
    root: MapNode;
    [key: string]: any;
}

// 合并文档到脑图
export function mergeDoc2Map(cell: any) {
    let data = Object.assign({}, cell);
    data = tiptap2main(data, cell?.data?.blocks);
    const mapData = main2simpleMap(data);
    data.data = (data?.data && typeof data.data === 'object') ? data.data : {};
    data.data.map = (data.data?.map && typeof data.data.map === 'object') ? data.data.map : {};
    data.data.map.root = mapData;
    // console.log('======文档合并到主数据', data, mapData);
    return data;
}

// 合并脑图到文档
export function mergeMap2Doc(cell: any) {
    let data = Object.assign({}, cell);
    const map: Map = formatMapData(data?.data?.map);
    
    data = simpleMap2main(cell, map);
    const blocks = main2tiptap(data);
    data.data.blocks = blocks;
    // data.data.blocks = blocks;
    // console.log('======思维导图合并到主数据', data, blocks);
    return data;
}

const formatMapData = (map: any) => {
    let data = Object.assign({}, map);
    data.root = (typeof map?.root === 'object' && map?.root !== null) ? map.root : {};
    data.root.data = (typeof map?.root?.data === 'object' && map?.root?.data !== null) ? map.root.data : {};
    data.root.data.text = map?.root?.data?.text || '';
    data.root.children = (Array.isArray(map?.root?.children)) ? map.root.children : [];
    return data;
}
const formatSimpleMapNode = (node: any) => {
    // let data = Object.assign({}, node);
    let data: any = {
        data: {},
        children: []
    };
    // data.data = (typeof node?.data === 'object' && node?.data !== null) ? node.data : {};
    data.data.uid = node?.data?.uid;
    data.data.text = node?.data?.text || '';
    data.data.richText = node?.data?.richText === false ? false : true;
    data.data.expand = node?.data?.expand === false ? false : true;
    data.data.icon = node?.data?.icon || [];
    data.data.image = node?.data?.image || '';
    data.data.imageTitle = node?.data?.imageTitle || '';
    data.data.imageSize = node?.data?.imageSize;
    data.data.hyperlink = node?.data?.hyperlink || '';
    data.data.hyperlinkTitle = node?.data?.hyperlinkTitle || '';
    data.data.note = node?.data?.note || '';
    data.data.attachmentUrl = node?.data?.attachmentUrl || '';
    data.data.attachmentName = node?.data?.attachmentName || '';
    data.data.tag = node?.data?.tag || [];
    data.data.generalization = node?.data?.generalization || [];
    data.data.associativeLineTargets = node?.data?.associativeLineTargets || [];
    data.data.associativeLineText = node?.data?.associativeLineText || '';
    data.children = (Array.isArray(node?.children)) ? node.children : [];
    return data;
}

// 对树状结构的每个节点格式化
function formatTree<T extends TreeNode>(
    tree: T,
    formatNode: (node: T) => T
): T {
    // 创建节点的浅拷贝
    const formattedNode = { ...formatNode(tree) };

    // 如果节点有子节点，递归处理它们
    if (Array.isArray(formattedNode.children)) {
        formattedNode.children = formattedNode.children.map((child: any) => 
            formatTree(child, formatNode)
        );
    }

    return formattedNode as T;
}
// 将树状结构转化为平行数组
function flattenTree<T extends TreeNode>(tree: T): Omit<T, 'children'>[] {
    let result: Omit<T, 'children'>[] = [];

    // 添加当前节点（不包括children属性）
    const { children, ...nodeWithoutChildren } = tree;
    result.push(nodeWithoutChildren);

    // 如果有子节点，递归处理它们
    if (Array.isArray(children)) {
        for (const child of children) {
            result = result.concat(flattenTree(child) as Omit<T, 'children'>[]);
        }
    }

    return result;
}


// ===== 专属编辑器tiptap、mindmap的转化逻辑 =============================================


// 主数据转化为simple思维导图数据
const main2simpleMap = (cell: any) => {
    const data = Object.assign({}, cell);
    const formatNode = (node) => {
        let newNode = formatSimpleMapNode(node);
        newNode.data.text = node?.data?.text || '';
        newNode.data.level = node?.data?.level;
        newNode.data.richText = true;
        newNode.data.uid = node?.cid;
        return newNode;
    }
    let mapData = formatTree({
        uid: data?.cid,
        data,
        children: data?.children || []
    }, formatNode);
    mapData.data.text = cell?.data?.richTextTitle ? replaceRichTextContent(cell?.data?.richTextTitle, cell?.name) : `<p><span>${cell?.name}</span></p>`;
    return mapData;
}
// simple思维导图数据合并到主数据
const simpleMap2main = (cell: any, map: Map) => {
    let data = Object.assign({}, cell);
    data.name = richTextToPlainText(map?.root?.data?.text) || cell?.name;
    const formatNode = (node, parentLevel = 0, isRoot = false) => {
        let newNode = {
            ...node,
            cid: node?.data?.uid,
            data: node?.data || {}
        }
        newNode.data.text = node?.data?.text || '';
        
        // 如果原本就有 level 值，保留这个值
        if (newNode.data.level === undefined) {
            // 根节点的直接子节点，如果有子节点，则 level 为 1，否则不设置
            if (isRoot) {
                if (node.children && node.children.length > 0) {
                    newNode.data.level = 1;
                }
            } else {
                // 非根节点，且不是末端节点，level 为父节点 level + 1
                if (node.children && node.children.length > 0) {
                    newNode.data.level = parentLevel + 1;
                }
            }
        }
        
        return newNode;
    }

    const setLevels = (node, parentLevel = 0, isRoot = true) => {
        let formattedNode = formatNode(node, parentLevel, isRoot);
        
        if (node.children && node.children.length > 0) {
            formattedNode.children = node.children.map(child => 
                setLevels(child, formattedNode.data.level || parentLevel, false)
            );
        }
        
        return formattedNode;
    }

    const formattedTree = setLevels(map?.root);
    data.children = mergeArrays(data.children, formattedTree?.children || []);
    data.data = (data?.data && typeof data?.data === 'object') ? data?.data : {};
    data.data.richTextTitle = map?.root?.data?.text;
    return data;
}
// 主数据转化为tiptap文档数据
const main2tiptap = (cell: any) => {
    let data = Object.assign({}, cell);
    let blocks: any = [];
    const flattenList = flattenTree(data);
    // 去除根节点
    const newlist = flattenList.filter((item: any) => item.cid !== cell.cid);
    for (const each of newlist) {
        if (each.cid) {
            const oldblock = newlist.find((item: any) => item?.attrs?.id === each.cid);
            let newblock = createTiptapBlockFromHtml(each?.data?.text || '', { id: each.cid, level: each?.data?.level });
            const block = deepMerge(oldblock, newblock);
            blocks.push(block);
        }
    }
    return blocks;
}
// tiptap文档数据合并到主数据
const tiptap2main = (cell: any, doc: TiptapBlock[]): MindMapNode[] => {
    let data = Object.assign({}, cell);
    const blocks = Array.isArray(doc) ? doc : [];

    const root: MindMapNode = {
        cid: cell.cid,
        data: {
            text: cell?.name || '',
            type: '',
            level: 0
        },
        children: []
    };
    const stack: MindMapNode[] = [root];

    blocks.forEach(block => {
        const content = block.content[0];
        const text = convertTiptapBlockToHtml(block);
        
        let newNode: MindMapNode = {
            cid: block.attrs.id,
            data: {
                type: content.type,
                level: content?.attrs?.level,
                text: text,
            },
            children: []
        };

        if (content.type === 'heading') {
            // 修改这部分逻辑
            while (stack.length > 1 && stack[stack.length - 1].data.level! >= content?.attrs?.level!) {
                stack.pop();
            }
            stack[stack.length - 1].children.push(newNode);
            stack.push(newNode);
        } else if (content.type === 'paragraph') {
            // 段落应该添加到当前最深层的节点下
            stack[stack.length - 1].children.push(newNode);
        } else {
            // 其他类型的内容，添加到根节点下
            root.children.push(newNode);
        }
    });

    data.children = mergeArrays(data.children, root.children);
    return data;
}

interface BlockOptions {
    id?: string;
    [key: string]: any;
    // textAlign?: 'left' | 'center' | 'right' | 'justify';
}

// 将富文本转化为tiptap块
export function createTiptapBlockFromHtml(html: string, options: BlockOptions = {}): any {
    const {
        id = uuidv4(),
        level = 0,
    } = options;

    // 创建一个临时的容器元素来解析 HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html.trim();

    // 获取第一个子元素，这将决定块的类型（段落或标题）
    const firstChild = tempDiv.firstElementChild || tempDiv;
    const blockType = firstChild.tagName.toLowerCase();

    // 解析内容
    function parseNode(node: Node, marks: any[] = []): any[] {
        let content: any[] = [];

        node.childNodes.forEach((childNode) => {
            if (childNode.nodeType === Node.TEXT_NODE) {
                const text = childNode.textContent || '';
                if (text.trim()) {
                    content.push({ type: 'text', text, marks });
                }
            } else if (childNode.nodeType === Node.ELEMENT_NODE) {
                const element = childNode as HTMLElement;
                const text = element.textContent || '';
                if (element.tagName.toLowerCase() === 'img') {
                    // 处理图片节点
                    const imgSrc = element.getAttribute('src') || '';
                    content.push({
                        type: 'image',
                        attrs: {
                            src: imgSrc,
                            alt: element.getAttribute('alt') || '',
                            title: element.getAttribute('title') || ''
                        }
                    });
                } else if (text.trim()) {
                    let elementMarks = [...marks];
                    
                    // 检查 <span> 标签，并处理其样式
                    if (element.tagName === 'SPAN') {
                        if (element.style.color || element.style.backgroundColor) {
                            elementMarks.push({ type: 'textStyle', attrs: {
                                color: element.style.color,
                                fontSize: element.style.fontSize,
                                fontFamily: element.style.fontFamily,
                                backgroundColor: element.style.backgroundColor,
                            } });
                        }
                    } else {
                        // 检查其他标签
                        if (element.tagName === 'STRONG' || element.tagName === 'B') elementMarks.push({ type: 'bold' });
                        if (element.tagName === 'EM' || element.tagName === 'I') elementMarks.push({ type: 'italic' });
                        if (element.tagName === 'U') elementMarks.push({ type: 'underline' });
                        if (element.tagName === 'S') elementMarks.push({ type: 'strike' });
                        if (element.tagName === 'CODE') elementMarks.push({ type: 'code' });
                    }

                    content.push(...parseNode(element, elementMarks));
                }
            }
        });

        return content;
    }

    // 根据块类型确定内容类型
    let contentType = 'paragraph';
    if (blockType === 'p' || blockType === 'div') {
        contentType = 'paragraph';
    } else if (blockType.startsWith('h')) {
        contentType = 'heading';
    } else {
        contentType = 'paragraph';
    }
    const contentAttrs: any = { };
    if (blockType.startsWith('h') && ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(blockType)) {
        contentAttrs.level = parseInt(blockType.charAt(1));
    }
    if (level) {
        contentType = 'heading';
        contentAttrs.level = level;
    }

    return {
        type: 'Block',
        attrs: { id },
        content: [
            {
                type: contentType,
                attrs: contentAttrs,
                content: parseNode(firstChild)
            }
        ]
    };
}

interface TiptapMark {
    type: string;
    attrs?: {
        [key: string]: any;
    };
}

interface TiptapNode {
    type: string;
    attrs?: {
        [key: string]: any;
    };
    content?: TiptapNode[];
    marks?: TiptapMark[];
    text?: string;
}

interface TiptapBlock {
    type: 'Block';
    attrs: {
        id: string;
    };
    content: TiptapNode[];
}

// 将tiptap块转化为html
function convertTiptapBlockToHtml(block: TiptapBlock): string {
    function renderNode(node: TiptapNode): string {
        switch (node.type) {
            case 'paragraph':
                return `<p>${renderContent(node.content)}</p>`;
            case 'heading':
                const level = node.attrs?.level || 1;
                return `<h${level}>${renderContent(node.content)}</h${level}>`;
            case 'image':
                return `<img src="${node.attrs?.src}" alt="${node.attrs?.alt}" title="${node.attrs?.title}">`
            case 'text':
                return renderText(node);
            default:
                return '';
        }
    }

    function renderContent(content?: TiptapNode[]): string {
        return content ? content.map(renderNode).join('') : '';
    }

    function renderText(node: TiptapNode): string {
        let text = node.text || '';
        if (node.marks) {
            node.marks.forEach(mark => {
                switch (mark.type) {
                    case 'bold':
                        text = `<strong>${text}</strong>`;
                        break;
                    case 'italic':
                        text = `<em>${text}</em>`;
                        break;
                    case 'underline':
                        text = `<u>${text}</u>`;
                        break;
                    case 'strike':
                        text = `<s>${text}</s>`;
                        break;
                    case 'code':
                        text = `<code>${text}</code>`;
                        break;
                    case 'textStyle':
                        let styles: any = [];
                        if (mark.attrs?.color) {
                            styles.push(`color: ${mark.attrs.color}`);
                        }
                        if (mark.attrs?.backgroundColor) {
                            styles.push(`background-color: ${mark.attrs.backgroundColor}`);
                        }
                        if (mark.attrs?.fontSize) {
                            styles.push(`font-size: ${mark.attrs.fontSize}`);
                        }
                        if (mark.attrs?.fontFamily) {
                            styles.push(`font-family: ${mark.attrs.fontFamily}`);
                        }
                        // 添加其他可能的样式属性...

                        if (styles.length > 0) {
                            text = `<span style="${styles.join(';')}">${text}</span>`;
                        }
                        break;
                }
            });
        }
        return text;
    }

    return block.content.map(renderNode).join('');
}

// 将一整篇html分割为数组
export function splitHtml2Arr(html: string): string[] {
    const blocks: string[] = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // 获取所有常见的块级元素，包括标题、段落、列表、待办事项、代码块等
    const elements = doc.querySelectorAll(
        'h1, h2, h3, h4, h5, h6, p, ul, ol, li, img, video, pre, code, blockquote, table, tbody, tr, td'
    );

    elements.forEach((el) => {
        // 处理待办事项（假设你用的是 <input type="checkbox"> 标签来表示）
        if (el.tagName === 'LI' && el.querySelector('input[type="checkbox"]')) {
        blocks.push(el.outerHTML); // 将待办事项添加到 blocks 中
        } else {
        blocks.push(el.outerHTML); // 其他标签直接添加
        }
    });

    return blocks;
}

// 合并对象
function deepMerge<T>(oldBlock: T, newBlock: Partial<T>): T {
    // 如果 newBlock 是 null 或不是对象，直接返回 newBlock
    if (newBlock === null || typeof newBlock !== 'object') {
        return newBlock as T;
    }

    // 如果 oldBlock 不是对象，使用 newBlock 作为基础
    if (oldBlock === null || typeof oldBlock !== 'object') {
        return deepMerge({} as T, newBlock);
    }

    // 创建 oldBlock 的副本
    let result: any = { ...oldBlock };

    // 遍历 newBlock 的所有属性
    for (const key in newBlock) {
        if (Object.prototype.hasOwnProperty.call(newBlock, key)) {
            if (Array.isArray(newBlock[key])) {
                // 如果属性是数组，递归合并每个元素
                result[key] = (newBlock[key] as any[]).map((item, index) => {
                    if (Array.isArray(oldBlock[key]) && index < oldBlock[key].length) {
                        return deepMerge(oldBlock[key][index], item);
                    }
                    return deepMerge({}, item);
                });
            } else if (typeof newBlock[key] === 'object' && newBlock[key] !== null) {
                // 如果属性是对象，递归合并
                result[key] = deepMerge(oldBlock[key], newBlock[key]);
            } else {
                // 对于基本类型，直接覆盖
                result[key] = newBlock[key];
            }
        }
    }

    return result as T;
}

// 合并数组
function mergeArrays(arr1: any, arr2: any): TreeNode[] {
    const mergedMap = new Map<string, TreeNode>();

    // 首先，将 arr1 中的所有节点放入 map
    (arr1 || []).forEach(node => mergedMap.set(node.cid, { ...node }));

    // 合并函数
    function merge(oldNode: TreeNode | undefined, newNode: TreeNode): TreeNode {
        if (!oldNode) {
            // 如果旧数组中没有这个节点，直接使用新节点
            return { ...newNode, children: mergeArrays([], newNode.children) };
        }

        // 合并 data 属性
        const mergedData = { ...oldNode.data, ...newNode.data };

        // 递归合并 children
        const mergedChildren = mergeArrays(oldNode.children, newNode.children);

        return {
            cid: newNode.cid,
            data: mergedData,
            children: mergedChildren
        };
    }

    // 遍历 arr2，合并或添加节点
    arr2.forEach(newNode => {
        const oldNode = mergedMap.get(newNode.cid);
        mergedMap.set(newNode.cid, merge(oldNode, newNode));
    });

    // 转换回数组，保持 arr2 的顺序
    return arr2.map(node => mergedMap.get(node.cid)!);
}

// 一个文档的块示例
const simpleDocBlock = {
    "type": "Block",
    "attrs": {
        "id": "15eabee3-392d-4003-99a9-d0ce2d1d6891"
    },
    "content": [
        {
            "type": "paragraph",
            "attrs": {
                "textAlign": "left"
            },
            "content": [
                {
                    "text": "www",
                    "type": "text"
                }
            ]
        }
    ]
}

// 一个脑图节点示例
const simpleMapNode = {
    data: {
        text: '', // 节点的文本，可以是富文本，也就是html格式的，此时richText要设为true
        richText: false, // 节点的文本是否是富文本模式
        expand: true, // 节点是否展开
        uid: '',// 节点唯一的id，可不传，内部会生成
        icon: [], // 图标，格式可参考教程里的【插入和扩展节点图标】章节
        image: '', // 图片的url
        imageTitle: '', // 图片的标题，可为空
        imageSize: { // 图片的尺寸
            width: 100, // 图片的宽度，必传
            height: 100, // 图片的高度，必传
            custom: false // 如果设为true，图片的显示大小不受主题控制，以imageSize.width和imageSize.height为准
        },
        hyperlink: '', // 超链接地址
        hyperlinkTitle: '', // 超链接的标题
        note: '', // 备注的内容
        attachmentUrl: '',// v0.9.10+，附件url
        attachmentName: '',// v0.9.10+，附件名称
        tag: [], // 标签列表，v0.10.3以前的版本只支持字符串数组，即['标签']，v0.10.3+版本支持对象数组，即[{text: '标签', style: {}}]
        generalization: [{// （0.9.0以下版本不支持数组，只能设置单个概要数据）节点的概要，如果没有概要generalization设为null即可
            text: '', // 概要的文本
            richText: false, // 节点的文本是否是富文本模式
            // ...其他普通节点的字段都支持，但是不支持children
        }],
        associativeLineTargets: [''],// 如果存在关联线，那么为目标节点的uid列表
        associativeLineText: '',// 关联线文本
        // ...其他样式字段，可以参考主题
    },
    children: [// 子节点，结构和根节点一致
        {
            data: {},
            children: []
        }
    ]
}