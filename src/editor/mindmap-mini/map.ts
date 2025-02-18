import { cellDataFormat } from '@/core/utils/format';
import store from '@/store';
import Bus from "@/core/utils/bus";
import { v4 as uuidv4 } from 'uuid';

// 查询节点，可能是常规节点，也可能是自由节点
const findNode = (data, cid, who) => {
    let res = findNodeById(data, cid);
    let node = {};
    if (res) {
        if (who == 'node') {
            node = res.node;
        } else if (who == 'parent') {
            node = res.parent;
        }
    } else {
        let newdata: any = {};
        newdata.children = data.cells;
        let ress = findNodeById(newdata, cid);
        if (who == 'node') {
            node = ress.node;
        } else if (who == 'parent') {
            node = ress.parent;
        }
    }
    return node
}
// 根据id获取块分支体对象和位置(id以数组形式呈现)
export const findNodeById = (obj, id) => {
    if (obj?.cid === id) {
        return {
            parent: null,
            node: obj,
        };
    }
    const children = obj?.children || [];
    if (children.length) {
        for (let i = 0; i < children.length; i++) {
            const res = findNodeById(children[i], id);
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

/**
 * @description 使用鼠标拖拽div，实现横向、纵向滚动
 * @param el 被拖拽滚动的元素（产生滚动条的元素）
 */
export function addDragable(el) {
    let startX = 0; // el的scroll横向初始位置
    let gapX = 0; // 鼠标点击时的横向初始位置
    let startY = 0; // el的scroll纵向向初始位置
    let gapY = 0; // 鼠标点击时的纵向初始位置
    el.addEventListener("mousedown", start);
    el.addEventListener("mouseleave", stop); // 移除时解除事件

    function start(event) {
        // console.log('start', event)
        const clickedElement = event.target;
        const clickedElementClassList = clickedElement.classList;
        console.log('clickedElement', clickedElementClassList)
        if(!clickedElementClassList.contains('graph-wrapper') && !clickedElementClassList.contains('dragArea') && !clickedElementClassList.contains('block-content')) return
        // 判断是否点击鼠标左键
        if (event.button == 0) {
            gapX = event.clientX;
            gapY = event.clientY;
            startX = el.scrollLeft;
            startY = el.scrollTop;
            el.addEventListener("mousemove", move); // document
            el.addEventListener("mouseup", stop);
            // console.log('滚动条坐标',startX,startY);
            // console.log('鼠标坐标',gapX,gapY);
            // console.log(event)
        }
        // event.preventDefault(); // 阻止默认事件或冒泡 如拖拽时选中文本
        return false;
    }
    function move(event) {
        // 移动时的坐标 - 鼠标左键点击时的坐标 = 鼠标移动的相对距离
        var left = event.clientX - gapX;
        var top = event.clientY - gapY;
        // 滚动条初始坐标 - 移动的相对距离 = 应该滚动后的坐标
        el.scrollTo(startX - left, startY - top); // 横向 纵向
        // console.log('实时坐标',startX - left,startY - top);
        return false;
    }
    function stop() {
        // 鼠标松开，解除绑定
        el.removeEventListener("mousemove", move, false);
        el.removeEventListener("mouseup", stop, false);
        // console.log('结束移动')
    }
}

let isNode = false;

export class Map {
    static data; // 脑图数据
    static editor = null;
    static initMap = (id, data) => {
        const container = document.getElementById(id);
        if(container){
            this.setData(data);
            return true;
        } else {
            return null
        }
    }
    static setData(data) {
        this.data = data;
    }
    // 选择节点
    static selectNode = (id) => {
        if (!id) {
            console.log('id is null')
            return null
        }
        console.log('click node')
        let res = findNodeById(store.state.currentMapData, id);
        let block = res?.node;
        if (block) {
            store.state.currentBlockData = block;
            isNode = true;
            console.log('selected node', block?.cid);
            return block;
        }
    }
    // 节点是否被选中
    static isNodeSelected = (id) => {
        if (store.state.currentBlockData?.cid === id) {
            return true;
        } else {
            return false;
        }
    }
    static getSelectedNode = () => {
        return store.state.currentBlockData;
    }
    // 取消选择节点
    static unSelectNode = () => {
        if (isNode) {
            isNode = false;
            return
        }
        store.state.currentBlockData = cellDataFormat({});
        console.log('unselect')
    }
    // 添加同级兄弟节点
    static addSiblingNode = (id) => {
        console.log('add sibling node', id)
        if (!id) return
        let res = findNodeById(store.state.currentMapData, id);
        if (!res) {
            console.log('未找到节点')
            return
        }
        let parent = res?.parent;
        const index = parent.children.findIndex((item) => item.cid === id);
        let newNode = cellDataFormat({
            cid: uuidv4(),
            data: {
                text: '分支主题'
            }
        });
        parent.children.splice(index + 1, 0, newNode);
        this.selectNode(parent.children[index + 1].cid);
        Bus.emit('onMapAddNode', newNode);
        
        // parent.children.push(newNode);
        // this.selectNode(newNode?.cid);
        // Bus.emit('onMapAddNode', newNode);
    }
    // 添加子节点
    static addChildNode = (id) => {
        if (!id) return
        let res = findNodeById(store.state.currentMapData, id);
        console.log('add child node', id, res)
        if (!res) {
            console.log('未找到节点')
            return
        }
        let node = res.node;
        let newNode = cellDataFormat({
            cid: uuidv4(),
            data: {
                text: '分支主题'
            }
        });
        node.children.push(newNode);
        this.selectNode(newNode.cid);
        Bus.emit('onMapAddNode', newNode);
    }
    // 删除节点
    static deleteNode = (id) => {
        if (!id) return
        let res = findNodeById(store.state.currentMapData, id);
        let parent = res.parent;
        let index = parent.children.findIndex(item => item.cid === id);
        if (index < 0) {
            return
        }
        parent.children.splice(index, 1);
        // 删除后选中紧邻的最后一个节点
        if (index > 0) {
            let id = parent.children[index - 1]?.cid;
            this.selectNode(id);
            Bus.emit('onMapDeleteNode', id);
        } else {
            this.selectNode(parent.cid);
        }
    }
    // 选择上一个节点
    static selectAboveNode = () => {
        let node: any = store.state.currentBlockData;
        if (!node?.cid) return
        let res = findNodeById(store.state.currentMapData, node?.cid);
        let parent = res.parent;
        let index = parent.children.findIndex(item => item.cid === node?.cid);
        if (index > 0) {
            let aboveBid = parent.children[index - 1]?.cid;
            this.selectNode(aboveBid);
        } else {
            this.selectNode(parent.cid);
        }
    }
    // 选择下一个节点
    static selectNextNode = () => {
        let node: any = store.state.currentBlockData;
        if (!node?.cid) return
        let res = findNodeById(store.state.currentMapData, node?.cid);
        let parent = res.parent;
        let index = parent.children.findIndex(item => item.cid === node?.cid);
        if (index <= parent.children.length) {
            // 选择同级下一个节点
            let nextBid = parent.children[index + 1]?.cid;
            this.selectNode(nextBid);
        }
    }
    // 选择父节点
    static selectParentNode = () => {
        let node: any = store.state.currentBlockData;
        if (!node?.cid) return
        let res = findNodeById(store.state.currentMapData, node?.cid);
        let parent = res.parent;
        this.selectNode(parent.cid);
    }
    // 选择子节点
    static selectChildNode = () => {
        let node: any = store.state.currentBlockData;
        if (!node?.cid) return
        if(node.children?.length){
            let firstBid = node.children[0]?.cid;
            this.selectNode(firstBid);
        }
    }
    // 获取节点已有的标签
    static getNodeTags = () => {
        let node = store.state.currentBlockData;
        if (!node?.cid) return
        const tags = node?.tags ? (Array.isArray(node.tags) ? node.tags : []) : [];
        return tags;
    }
    // 添加标签
    static addTag = (tag) => {
        let node = store.state.currentBlockData;
        if (!node?.cid) return
        // node.tags = node.tags || [];
        // const t = formatTag(tag);
        // node.tags.push(t);
    }
    // 删除标签
    static removeTag = (tid) => {
        let node = store.state.currentBlockData;
        if (!node?.cid) return
        const tags = node?.tags ? (Array.isArray(node.tags) ? node.tags : []) : [];
        const index = tags.findIndex(item => item.tid === tid);
        if (index !== -1) {
            tags.splice(index, 1);
        }
    }
    // 通过标签重绘
    static reDrawByTag = (map) => {
        if (!map?.cid) return null;
        let newMap: any = JSON.parse(JSON.stringify(map));
    }
    // 通过节点重绘
    static reDrawByNode = (map) => {

    }
    // 切换标签和节点，以重绘脑图
    static toggleReDraw = (map) => {
        
    }
    // 回到视图中心（初始视图：用于思维导图）
    static goCenterView = () => {
        let container = document.getElementById("map");
        if (!container) return
        let containerHeight = container.clientHeight; // 页面容器高度
        let containerWidth = container.clientWidth; // 页面容器宽度
        container.scrollTo(10000 - containerWidth / 2, 10000 - containerHeight / 2);
        console.log('视图中心')
    }
    // 切换map的显示类型（脑图和大纲）
    static switcViewType = (type) => {
        const map = document.getElementById('map');
        const types = ['mindmap', 'outline'];
        if (map && types.includes(type)) {
            map.className = `map-container ${type}`;
        }
    }
    // 自动切换显示类型
    static observerAutoView: any = null;
    static autoSwitchViewType = (s) => {
        const map = document.getElementById('map');
        if (map) {
            if (s === 'on') {
                this.observerAutoView = new ResizeObserver(entries => {
                    // 处理回调
                    for (const entry of entries) {
                        // 获取元素宽度
                        const width = entry.contentRect.width;
                        // 切换 class
                        if (width < 256) {
                            this.switcViewType('outline');
                        } else if (width >= 256 && width < 356) {
                            this.switcViewType('mindmap');
                            this.goCenterView();
                        } else {
                            this.switcViewType('mindmap');
                        }
                    }
                });
                this.observerAutoView.observe(map);
            } else if (s === 'off') {
                if (this.observerAutoView) {
                    this.observerAutoView.unobserve(map);
                }
            }
        }
    }
    static keyEvent = (e) => {
        // console.log('keydown:', e);
        // tab, arrow keys
        if ([9, 13, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
            e.preventDefault();
        }
        // 脑图画布下，当没有在编辑时，取消空格键默认行为（导致页面滚动）
        if ([32].indexOf(e.keyCode) > -1 && store.state?.fileShowType == 'mindmap' && !store.state.currentBlockData?.cid) {
            e.preventDefault();
        }
        if (e.code === 'Tab') {
            this.addChildNode(store.state.currentBlockData?.cid);
        } else if (e.code === 'Enter') {
            this.addSiblingNode(store.state.currentBlockData?.cid);
        } else if (e.code === 'Backspace' || e.code === 'Delete') {
            this.deleteNode(store.state.currentBlockData?.cid);
        } else if (e.code === 'ArrowLeft') {
            this.selectParentNode();
        } else if (e.code === 'ArrowRight') {
            this.selectChildNode();
        } else if (e.code === 'ArrowUp') {
            this.selectAboveNode();
        } else if (e.code === 'ArrowDown') {
            this.selectNextNode();
        }
    }
}