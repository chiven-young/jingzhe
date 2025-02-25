import { v4 as uuidv4 } from 'uuid';
import Workspace from './workspace';
import { cellDataFormat } from '../utils/format';
import { parseTimeToTimestamp } from '../utils/time';
import { cellFieldsForCover, cellFieldsForTag, cellUserRelationTypes } from '../config/db';

export default class Cells {

    /**
     * 获取用户的所有根细胞列表
     * @param {Number} uid - 用户id，如果传此值表示只看这个用户的细胞列表（需权限或只看公开），uid和token至少有一个
     * @param {Number} cid - 细胞id，如果传此值表示只精确查询此细胞
     * @param {Array} cids - 细胞id数组，如果传此值表示只精确查询这些细胞
     * @param {String} groupName - 大类别，type的上级，空则查全部
     * @param {String} type - 类别，空则查全部
     * @param {Number} minStatus - 最小状态值，0-4，空则不设限
     * @param {Number} maxStatus - 最大状态值，0-4，空则不设限
     * @param {Array} parentIds - 父级关联细胞的cid数组，允许筛选多个cid，表示要查询这些sourceId关联的所有targetId的子级细胞
     * @param {Array} childIds - 子级关联细胞的cid数组，允许筛选多个cid，表示要查询这些targetId关联的所有sourceId的父级细胞
     * @param {String} relationshipType - 细胞与用户的关系类别，如果传值，则根据用户uid或者管理员指定的uid去查
     * @param {String} startTime - 开始时间，格式为13位时间戳或 'YYYY-MM-DD HH:mm:ss'
     * @param {String} endTime - 结束时间，格式为13位时间戳或 'YYYY-MM-DD HH:mm:ss'
     * @param {String} timeType - 检查的时间类型，createTime、updateTime、publishTime，默认是createTime
     * @param {Number} page - 分页
     * @param {Number} pageSize - 每页条数，如果传-1，则请求全部数据
     * @param {Number} showDetail - 是否显示每个细胞的详细数据，否则只是简要数据
     * @param {Number} showCorrelationParents - 是否显示上级关联细胞
     * @param {Number} showCorrelationChildren - 是否显示下级关联细胞
     * @param {Array} orders // 排序，一个对象数组，每个对象属性：column：参与排序字段，order：正序还是倒序，ASC正序，DESC倒序
     * @returns {Object} 细胞列表和总数
     */
    static async getCells(params) {
        if (['createTime', 'updateTime', 'publishTime'].indexOf(params.timeType) === -1) {
            params.timeType = 'createTime';
        }
        const startTime = parseTimeToTimestamp(params?.startTime);
        const endTime = parseTimeToTimestamp(params?.endTime);
        params.orders = Array.isArray(params?.orders) ? params.orders : [];
        let orders = [];
        for (const each of params.orders) {
            if (each?.column) {
                const obj = {
                    column: each.column,
                    order: each?.order === 'ASC' ? each.order : 'DESC'
                }
                orders.push(obj)
            }
        }
        const page = params.page || 1;
        const pageSize = params.pageSize || 20;
        const minStatus = typeof params.minStatus === 'number' ? params.minStatus : 0;
        const maxStatus = typeof params.maxStatus === 'number' ? params.maxStatus : 4;
        try {
            let selector = {
                status: { $gte: minStatus, $lte: maxStatus },
                createTime: { $gte: 0 },
            };
            if (startTime && endTime) {
                selector[params.timeType] = { $gte: startTime, $lte: endTime };
            } else if (startTime) {
                selector[params.timeType] = { $gte: startTime };
            } else if (endTime) {
                selector[params.timeType] = { $lte: endTime };
            }
            if (params.groupName) {
                selector.groupName = { $eq: params.groupName };
            }
            if (params.type) {
                selector.type = { $eq: params.type };
            }
            if (params.isRoot === 0 || params.isRoot === 1) {
                selector.isRoot = { $eq: params.isRoot };
            }
            if (Array.isArray(params.cids) && params.cids.length > 0) {
                selector.cid = { $in: params.cids };
            }

            let correlationCids = []; // 关联细胞cid数组

            // 1. 如果存在关联类型，则说明是查询指定的用户的某种关联类型的细胞
            let correlationCids1 = [];
            if (params.relationshipType && cellUserRelationTypes.includes(params.relationshipType)) {
                const relationRes = await Workspace.cellUserRelationsDB.find({
                    selector: {
                        type: params.relationshipType
                    }
                })
                const relation = relationRes.docs;
                correlationCids1 = relation.map(item => item.cid);
            }
            // 2. 如果存在parentIds或childIds，则是从关联细胞来筛选细胞
            let correlationCids2 = [];
            let isCorrelation = false; // 是否从关联细胞查询
            let correlationCidsByParentIds = []; // 由父cid查的cid数组
            let correlationCidsByChildIds = []; // 由子cid查的cid数组
            if (Array.isArray(params?.parentIds) && params.parentIds.length > 0) {
                const relationsRes = await Workspace.cellsRelationsDB.find({
                    selector: {
                        sourceId: { $in: params.parentIds },
                    }
                })
                const relation = relationsRes.docs;
                correlationCidsByParentIds = relation.map(item => item.targetId);
            }
            if (Array.isArray(params?.childIds) && params.childIds.length > 0) {
                const relationsRes = await Workspace.cellsRelationsDB.find({
                    selector: {
                        targetId: { $in: params.childIds },
                    }
                })
                const relation = relationsRes.docs;
                correlationCidsByChildIds = relation.map(item => item.sourceId);
            }
            if (Array.isArray(params?.parentIds) && params.parentIds.length > 0 && Array.isArray(params?.childIds) && params.childIds.length > 0) {
                // 如果同时传了父子ids，则使用它们的交集
                correlationCids2 = correlationCidsByParentIds.filter(cid => correlationCidsByChildIds.includes(cid));
                isCorrelation = true;
            } else if (Array.isArray(params?.parentIds) && params.parentIds.length > 0 && !params.childIds) {
                // 如果只传了父ids，则只查子级
                correlationCids2 = correlationCidsByParentIds;
                isCorrelation = true;
            } else if (Array.isArray(params?.childIds) && params.childIds.length > 0 && !params.parentIds) {
                // 如果只传了子ids，则只查父级
                correlationCids2 = correlationCidsByChildIds;
                isCorrelation = true;
            }
            // 将上面的查到的关联cid数组求交集
            if (params.relationshipType && !isCorrelation) {
                // 如果只从细胞-用户关联来查询
                correlationCids = correlationCids1;
            } else if (!params.relationshipType && isCorrelation) {
                // 如果只从细胞间父子关联来查询
                correlationCids = correlationCids2;
            } else if (params.relationshipType && isCorrelation) {
                // 如果两者都有，则求交集
                correlationCids = correlationCids1.filter(cid => correlationCids2.includes(cid));
            }
            if (correlationCids.length > 0) {
                selector.cid = { $in: correlationCids };
            } else if (isCorrelation || params.relationshipType) {
                return {
                    code: '1000',
                    success: true,
                    data: {
                        total: 0,
                        list: []
                    },
                    message: '获取细胞列表成功'
                };
            }
            const totalResult = await Workspace.cellsDB.find({
                selector: selector,
                fields: ['_id']
            });
            const total = totalResult.docs.length;

            let sort = [];
            if (orders.length > 0) {
                orders.forEach(order => {
                    const { column, order: sortOrder } = order;
                    if (column && (sortOrder === 'DESC' || sortOrder === 'ASC')) {
                        sort.push({ [column]: sortOrder.toLowerCase() });
                        if (!selector[column]) {
                            selector[column] = { $gte: 0 };
                        }
                    }
                });
            }
            const skip = (page - 1) * pageSize;
            let result = null;
            if (pageSize !== -1) {
                result = await Workspace.cellsDB.find({
                    selector: selector,
                    sort: sort.length > 0 ? sort : undefined,
                    fields: params.showDetail ? undefined : cellFieldsForCover,
                    skip: skip,
                    limit: pageSize,
                });
            } else {
                result = await Workspace.cellsDB.find({
                    selector: selector,
                    sort: sort.length > 0 ? sort : undefined,
                    fields: params.showDetail ? undefined : cellFieldsForCover,
                });
            }
            let list = result.docs;
            const cids = list.map(cell => cell.cid); // 所有细胞的cid
            // 查询父级关联细胞
            let parentRelations = []; // 父级关系表
            let correlationParentCells = []; // 所有父级细胞
            if (params.showCorrelationParents) {
                const relationsRes = await Workspace.cellsRelationsDB.find({
                    selector: {
                        targetId: { $in: cids },
                    }
                })
                parentRelations = relationsRes.docs;
                const sourceCellCids = parentRelations.map(relation => relation.sourceId);
                const sourceCellsRes = await Workspace.cellsDB.find({
                    selector: {
                        _id: { $in: sourceCellCids },
                    },
                    fields: cellFieldsForTag
                })
                correlationParentCells = sourceCellsRes.docs;
            }
            // 查询子级关联细胞
            let childrenRelations = []; // 子级关系表
            let correlationChildrenCells = []; // 所有子级细胞
            if (params.showCorrelationChildren) {
                const relationsRes = await Workspace.cellsRelationsDB.find({
                    selector: {
                        sourceId: { $in: cids },
                    }
                })
                childrenRelations = relationsRes.docs;
                const targetCellCids = childrenRelations.map(relation => relation.targetId);
                const targetCellsRes = await Workspace.cellsDB.find({
                    selector: {
                        _id: { $in: targetCellCids },
                    },
                    fields: cellFieldsForTag
                })
                correlationChildrenCells = targetCellsRes.docs;
            }
            // 查询与用户的关系
            const relationsCURes = await Workspace.cellUserRelationsDB.find({
                selector: {
                    cid: { $in: cids },
                }
            })
            const relationsCUArr = relationsCURes.docs;
            // 组装最终数据
            for (const cell of list) {
                cell.isStar = relationsCUArr.some(relation => relation.cid === cell.cid && relation.type === 'star');
                cell.isLike = relationsCUArr.some(relation => relation.cid === cell.cid && relation.type === 'like');
                if (params.showCorrelationParents) {
                    cell.correlationsParents = correlationParentCells.filter(targetCell => {
                        return parentRelations.some(relation => {
                            return relation.sourceId === targetCell.cid && relation.targetId === cell.cid
                        })
                    })
                }
                if (params.showCorrelationChildren) {
                    cell.correlationsChildren = correlationChildrenCells.filter(targetCell => {
                        return childrenRelations.some(relation => {
                            return relation.sourceId === cell.cid && relation.targetId === targetCell.cid
                        })
                    })
                }
            }
            return {
                code: '1000',
                success: true,
                data: {
                    total: total,
                    list: list
                },
                message: '获取细胞列表成功'
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

    /**
     * 通过cid获取用户的细胞详细数据
     * @param {String} cid - 细胞id
     * @param {String} password - 密码
     * @param {Number} showUser - 是否显示用户信息
     * @param {Number} showCorrelationParents - 是否显示上级关联细胞
     * @param {Number} showCorrelationChildren - 是否显示下级关联细胞
     * @param {Boolean} deepQuery - 是否深度查找主属性下对应的数据，如果启用，则不会再查用户、关联细胞等附属属性
     * @param {any} deepPath - 要查询的深度数据路径，是个对象
     * @param {Object} deepQueryOptions - 深度查询的一些选项，可以用来给数组分页查询
     * @returns {Object} 细胞详情
     */
    static async getCell(params) {
        const { cid, source } = params;
        try {
            let res = await Workspace.cellsDB.get(cid);
            if (params?.showCorrelationChildren) {
                const relationsRes = await Workspace.cellsRelationsDB.find({
                    selector: {
                        sourceId: cid,
                    }
                })
                const relation = relationsRes.docs;
                const targetCellCids = relation.map(item => item.targetId);
                const targetCellsRes = await Workspace.cellsDB.find({
                    selector: {
                        _id: { $in: targetCellCids },
                    },
                    fields: cellFieldsForTag
                })
                res.correlationsChildren = targetCellsRes.docs;
            }
            if (params?.showCorrelationParents) {
                const relationsRes = await Workspace.cellsRelationsDB.find({
                    selector: {
                        targetId: cid,
                    }
                })
                const relation = relationsRes.docs;
                const sourceCellCids = relation.map(item => item.sourceId);
                const sourceCellsRes = await Workspace.cellsDB.find({
                    selector: {
                        _id: { $in: sourceCellCids },
                    },
                    fields: cellFieldsForTag
                })
                res.correlationsParents = sourceCellsRes.docs;
            }
            return {
                code: '1000',
                success: true,
                data: res,
                message: '获取细胞成功'
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

    /**
     * 创建新的细胞
     * @param {Object} ...data - 细胞数据，传什么插入什么
     * @returns {Object} 插入细胞的cid, rev
     */
    static async addCell(params) {
        if (typeof params !== 'object' || !params) {
            return {
                code: '1004',
                success: false,
                data: null,
                message: 'cell必须是对象'
            };
        }
        let cell = cellDataFormat(params);
        cell.cid = uuidv4();
        const now = Date.now();
        cell.createTime = now;
        cell.updateTime = now;
        try {
            const res = await Workspace.cellsDB.put({
                _id: cell.cid,
                ...cell
            });
            return {
                code: '1000',
                success: true,
                data: cell.cid,
                message: '添加细胞成功'
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

    // 更新细胞
    static async updateCell(params) {
        try {
            const cell = await Workspace.cellsDB.get(params.cid);
            if (cell) {
                let updateData = cell;
                const now = Date.now();
                updateData.updateTime = now;
                if (params.name) {
                    updateData.name = params.name;
                }
                if (params.description) {
                    updateData.description = params.description;
                }
                if (params.icon) {
                    updateData.icon = params.icon;
                }
                if (params.groupName) {
                    updateData.groupName = params.groupName;
                }
                if (params.type) {
                    updateData.type = params.type;
                }
                if (typeof params.status === 'number' && params.status >= 0 && params.status <= 4) {
                    updateData.status = params.status;
                }
                if (params.data && typeof params.data === 'object') {
                    updateData.data = params.data;
                }
                if (params.config && typeof params.config === 'object') {
                    updateData.config = params.config;
                }
                if (params.style && typeof params.style === 'object') {
                    updateData.style = params.style;
                }
                if (params.encrypted === 0 || params.encrypted === 1) {
                    updateData.encrypted = params.encrypted;
                }
                if (params.password) {
                    updateData.password = params.password;
                }
                if (params.isRoot === 0 || params.isRoot === 1) {
                    updateData.isRoot = params.isRoot;
                }
                if (params.cover && Array.isArray(params.cover)) {
                    updateData.cover = params.cover;
                }
                if (params.children && Array.isArray(params.children)) {
                    updateData.children = params.children;
                }
                if (params.statistics && typeof params.statistics === 'object') {
                    updateData.statistics = params.statistics;
                }
                if (params.createTime && typeof params.createTime === 'number') {
                    updateData.createTime = params.createTime;
                }
                if (params.status >= 3 && !params.publishTime) {
                    updateData.publishTime = now;
                }
                if (params.publishTime && typeof params.publishTime === 'number') {
                    updateData.publishTime = params.publishTime;
                }
                await Workspace.cellsDB.put(updateData);
                const res = await Workspace.cellsDB.get(params.cid);
                if (res) {
                    return {
                        code: '1000',
                        success: true,
                        data: res,
                        message: '更新细胞成功'
                    };
                } else {
                    return {
                        code: '1005',
                        success: false,
                        data: null,
                        message: '更新细胞失败'
                    };
                }
            } else {
                return {
                    code: '1005',
                    success: false,
                    data: false,
                    message: '细胞不存在'
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

    static async deleteCell(params) {
        if (!params.cid) {
            return {
                code: '1005',
                success: false,
                data: false,
                message: '缺少删除的细胞cid'
            };
        }
        try {
            const cell = await Workspace.cellsDB.get(params.cid);
            if (cell) {
                await Workspace.cellsDB.remove(cell);
                this.deleteAllCellsRelations(params.cid);
                return {
                    code: '1000',
                    success: true,
                    data: true,
                    message: '删除细胞成功'
                };
            } else {
                return {
                    code: '1005',
                    success: false,
                    data: false,
                    message: '细胞不存在'
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

    // 绑定两个细胞
    static async connectCells(params) {
        const { sourceId, targetId } = params;
        if (!sourceId || !targetId) {
            return {
                code: '1005',
                success: false,
                data: false,
                message: '请选择要绑定的细胞'
            };
        } else if (sourceId === targetId) {
            return {
                code: '1005',
                success: false,
                data: false,
                message: '不能绑定同一个细胞'
            };
        }
        try {
            const sourceCell = await Workspace.cellsDB.get(sourceId);
            const targetCell = await Workspace.cellsDB.get(targetId);
            if (sourceCell && targetCell) {
                const reid = uuidv4();
                const relation = {
                    _id: reid,
                    reid: reid,
                    sourceId: sourceId,
                    targetId: targetId
                }
                await Workspace.cellsRelationsDB.put(relation);
                // 如果目标细胞为根细胞，则去除根标记
                if (targetCell.isRoot) {
                    targetCell.isRoot = 0;
                    Workspace.cellsDB.put(targetCell);
                }
                return {
                    code: '1000',
                    success: true,
                    data: reid,
                    message: '绑定细胞成功'
                };
            } else {
                return {
                    code: '1005',
                    success: false,
                    data: false,
                    message: '细胞不存在'
                };
            }
        } catch (err) {
            const errorMessage = err.message ? err.message : String(err);
            return {
                code: '1005',
                success: false,
                data: false,
                message: errorMessage
            }
        }
    }

    // 解绑两个细胞
    static async disconnectCells(params) {
        const { sourceId, targetId } = params;
        if (!sourceId || !targetId) {
            return {
                code: '1005',
                success: false,
                data: false,
                message: '请选择要解绑的细胞'
            };
        } else if (sourceId === targetId) {
            return {
                code: '1005',
                success: false,
                data: false,
                message: '不能解绑同一个细胞'
            };
        }
        try {
            const relationRes = await Workspace.cellsRelationsDB.find({
                selector: {
                    sourceId: sourceId,
                    targetId: targetId
                }
            });
            const relation = relationRes.docs.length ? relationRes.docs[0]: null;
            if (relation) {
                await Workspace.cellsRelationsDB.remove(relation);
                return {
                    code: '1000',
                    success: true,
                    data: true,
                    message: '解绑细胞成功'
                };
            } else {
                return {
                    code: '1005',
                    success: false,
                    data: false,
                    message: '关系不存在'
                };
            }
        } catch (err) {
            const errorMessage = err.message ? err.message : String(err);
            return {
                code: '1005',
                success: false,
                data: false,
                message: errorMessage
            }
        }
    }

    // 移动细胞（从一个细胞下面移动到另一个细胞下面）
    static async moveCell(cid, sourceId, targetId) {
        if (!cid) {
            return {
                code: '1005',
                success: false,
                data: false,
                message: 'cid不存在'
            };
        }
        if (sourceId) {
            await this.disconnectCells({
                sourceId: sourceId,
                targetId: cid,
            })
        } else {
            await this.updateCell({
                cid: cid,
                isRoot: 0
            })
            const list = Workspace.currentWorkspace.data.rootCells;
            const index = list.indexOf(cid);
            if (index > -1) {
                list.splice(index, 1);
                await this.saveRootCells(list);
            }
        }
        if (targetId) {
            await this.connectCells({
                sourceId: targetId,
                targetId: cid,
            })
        } else {
            await this.updateCell({
                cid: cid,
                isRoot: 1
            })
            const list = Workspace.currentWorkspace.data.rootCells;
            list.push(cid);
            await this.saveRootCells(list);
        }
        return {
            code: '1000',
            success: true,
            data: true,
            message: '细胞移动成功'
        };
    }
    
    // 关联一个细胞与用户
    static async connectCellAndUser (params) {
        const { cid, type } = params;
        if (!cid || !type) {
            return {
                code: '1005',
                success: false,
                data: false,
                message: '参数不完整'
            };
        }
        try {
            const cell = await Workspace.cellsDB.get(cid);
            if (cell) {
                const relationRes = await Workspace.cellUserRelationsDB.find({
                    selector: {
                        cid: cid,
                        type: type
                    }
                })
                if (relationRes.docs.length === 0) {
                    const reid = uuidv4();
                    const relation = {
                        _id: reid,
                        reid: reid,
                        cid: cid,
                        type: type
                    }
                    await Workspace.cellUserRelationsDB.put(relation);
                    return {
                        code: '1000',
                        success: true,
                        data: reid,
                        message: '绑定关系成功'
                    };
                } else {
                    return {
                        code: '1005',
                        success: false,
                        data: false,
                        message: '关系已存在'
                    };
                }
            } else {
                return {
                    code: '1005',
                    success: false,
                    data: false,
                    message: '细胞不存在'
                };
            }
        } catch (err) {
            const errorMessage = err.message ? err.message : String(err);
            return {
                code: '1005',
                success: false,
                data: false,
                message: errorMessage
            }
        }
    }

    // 解除一个细胞与用户的关系
    static async disconnectCellAndUser (params) {
        const { cid, type } = params;
        if (!cid || !type) {
            return {
                code: '1005',
                success: false,
                data: false,
                message: '参数不完整'
            };
        }
        try {
            const relationRes = await Workspace.cellUserRelationsDB.find({
                selector: {
                    cid: cid,
                    type: type
                }
            });
            const relation = relationRes.docs.length ? relationRes.docs[0]: null;
            if (relation) {
                await Workspace.cellUserRelationsDB.remove(relation);
                return {
                    code: '1000',
                    success: true,
                    data: true,
                    message: '解绑关系成功'
                };
            } else {
                return {
                    code: '1005',
                    success: false,
                    data: false,
                    message: '关系不存在'
                };
            }
        } catch (err) {
            const errorMessage = err.message ? err.message : String(err);
            return {
                code: '1005',
                success: false,
                data: false,
                message: errorMessage
            }
        }
    }

    // 删除一个cid所有相关的关系数据
    static async deleteAllCellsRelations(cid) {
        const relation1 = await Workspace.cellsRelationsDB.find({
            selector: {
                sourceId: cid,
            }
        });
        const relation2 = await Workspace.cellsRelationsDB.find({
            selector: {
                targetId: cid,
            }
        });
        const relation3 = await Workspace.cellUserRelationsDB.find({
            selector: {
                cid: cid,
            }
        })
        const list = [...relation1.docs, ...relation2.docs, ...relation3.docs];
        const docsToDelete = list.map(row => {
            return {
              _id: row._id,
              _rev: row._rev, // 每个文档必须包含 _rev
              _deleted: true      // 标记为删除
            };
        });
        Workspace.cellsRelationsDB.bulkDocs(docsToDelete);
    }

    // 保存细胞树
    static async saveRootCells(list) {
        if (!Array.isArray(list)) {
            return {
                code: '1004',
                success: false,
                data: null,
                message: '必须是数组'
            };
        } else {
            Workspace.currentWorkspace.data.rootCells = list;
            await Workspace.updateWorkspace(Workspace.currentWorkspace);
            return {
                code: '1000',
                success: true,
                data: true,
                message: '保存成功'
            }
        }
    }
    
}
