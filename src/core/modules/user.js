
import Workspace from './workspace';
import { getAccountInfo } from './tpt';

export default class User {

    static async login(username, password) {
        // const res = await Workspace.login(username, password);
        // return res;
    }
    static async logout() {
        
    }
    static async register(username, password) {
        
    }
    
    static async getUserData() {
        let user = Workspace.currentWorkspace?.user;
        let res = null;
        try {
            res = await getAccountInfo();
            if (res.success && res.data) {
                user.uid = res.data?.serviceAccountId;
                user.name = res.data?.name;
                user.avatar = res.data?.avatar;
                user.description = res.data?.description;
                user.cover = res.data?.cover;
                user.type = res.data?.type;
                user.tags = res.data?.tags;
                user.phone = res.data?.bindMobile;
                user.email = res.data?.bindEmail;
            }
        } catch (e) {}
        Workspace.currentWorkspace.user = user;
        await Workspace.updateWorkspace(Workspace.currentWorkspace);
        return Workspace.currentWorkspace.user;
    }

    // 保存完整用户信息
    static async setUserData(user) {
        if (user !== Workspace.currentWorkspace.user) {
            Workspace.currentWorkspace.user = user;
            const res = await Workspace.updateWorkspace(Workspace.currentWorkspace);
            if (res.success) {
                return {
                    code: '1000',
                    success: true,
                    data: true,
                    message: '保存用户信息成功'
                }
            } else {
                return {
                    code: '1001',
                    success: false,
                    data: false,
                    message: '保存用户信息失败'
                }
            }
        }
    }

    static async setUserName(val) {
        if (Workspace.currentWorkspace.user.name !== val) {
            Workspace.currentWorkspace.user.name = val;
        }
        const res = await Workspace.updateWorkspace(Workspace.currentWorkspace);
        if (res.success) {
            return {
                code: '1000',
                success: true,
                data: true,
                message: '保存用户信息成功'
            }
        } else {
            return {
                code: '1001',
                success: false,
                data: false,
                message: '保存用户信息失败'
            }
        }
    }
    static async setUserAvatar(val) {
        if (Workspace.currentWorkspace.user.avatar !== val) {
            Workspace.currentWorkspace.user.avatar = val;
        }
        const res = await Workspace.updateWorkspace(Workspace.currentWorkspace);
        if (res.success) {
            return {
                code: '1000',
                success: true,
                data: true,
                message: '保存用户信息成功'
            }
        } else {
            return {
                code: '1001',
                success: false,
                data: false,
                message: '保存用户信息失败'
            }
        }
    }
    static async setUserEmail(val) {
        if (Workspace.currentWorkspace.user.email !== val) {
            Workspace.currentWorkspace.user.email = val;
        }
        const res = await Workspace.updateWorkspace(Workspace.currentWorkspace);
        if (res.success) {
            return {
                code: '1000',
                success: true,
                data: true,
                message: '保存用户信息成功'
            }
        } else {
            return {
                code: '1001',
                success: false,
                data: false,
                message: '保存用户信息失败'
            }
        }
    }
}