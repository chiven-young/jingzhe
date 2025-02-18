
// 将tiptap的块列表转化为标准块
export const tiptap2blocks = (list) => {
    let blocks: any = [];
    for (let i = 0; i < list.length; i++) {
        let block: any = {};
        if (list[i].type === 'paragraph') {
            block.type = 'text';
        }
        blocks.push(block);
    }
    return blocks;
}

// 将tiptap的块列表转化为标准块
export const blocks2tiptap = (list) => {
    let blocks: any = [];
    for (let i = 0; i < list.length; i++) {
        let block: any = {};
        if (list[i].type === 'text') {
            block.type = 'paragraph';
        }
        blocks.push(block);
    }
    return blocks;
}