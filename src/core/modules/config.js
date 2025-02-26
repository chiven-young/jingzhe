
import Workspace from './workspace';
import User from './user';

export default class Config {

    // =========== 布局 ============

    // 保存布局
    static async setLayout(layout) {
        if (layout !== Workspace.currentWorkspace?.layout) {
            Workspace.currentWorkspace.layout = layout;
            const res = await Workspace.updateWorkspace(Workspace.currentWorkspace);
        }
    }
    static async setSidebarCollapse(status) {
        const container = document.getElementById("main-container");
        if (status) {
            if (container) {
                container.classList.remove("expand");
                container.classList.add("collapse");
            }
        } else {
            if (container) {
                container.classList.remove("collapse");
                container.classList.add("expand");
            }
        }
        if (status !== Workspace.currentWorkspace?.layout?.sidebar?.collapse) {
            Workspace.currentWorkspace.layout.sidebar.collapse = status;
            const res = await Workspace.updateWorkspace(Workspace.currentWorkspace);
        }
    }
    static toggleSidebar() {
        const container = document.getElementById("main-container");
        if (container) {
            if (container.classList.contains("collapse")) {
                this.setSidebarCollapse(false);
            } else {
                this.setSidebarCollapse(true);
            }
        }
    }

    // =========== 外观 ============

    // 保存外观设置
    static setAppearance(appearance) {
        if (appearance !== Workspace.currentWorkspace.appearance) {
            Workspace.currentWorkspace.appearance = appearance;
            Workspace.updateWorkspace(Workspace.currentWorkspace);
        }
    }
    static setTheme(theme) {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
        } else {
            document.documentElement.classList.remove('dark');
            document.documentElement.classList.add('light');
        }
        if (theme !== Workspace.currentWorkspace.appearance.theme) {
            Workspace.currentWorkspace.appearance.theme = theme;
            Workspace.updateWorkspace(Workspace.currentWorkspace);
        }
    }
    static toggleTheme () {
        if (Workspace.currentWorkspace.appearance.theme === 'dark') {
            this.setTheme('light');
        } else {
            this.setTheme('dark');
        }
    }
    static async setPrimaryColor(color) {
        if (color !== Workspace.currentWorkspace.appearance.primaryColor) {
            Workspace.currentWorkspace.appearance.primaryColor = color;
            const res = await Workspace.updateWorkspace(Workspace.currentWorkspace);
            document.documentElement.style.setProperty('--el-color-primary', color);
        }
    }

    // =========== 配置 ============

    // 保存配置
    static setConfig(config) {
        if (config !== Workspace.currentWorkspace.config) {
            Workspace.currentWorkspace.config = config;
            Workspace.updateWorkspace(Workspace.currentWorkspace);
        }
    }

    // =========== 编辑器 ============

    // 保存编辑器配置
    static setEditor(editor) {
        if (editor !== Workspace.currentWorkspace.editor) {
            Workspace.currentWorkspace.editor = editor;
            Workspace.updateWorkspace(Workspace.currentWorkspace);
        }
    }
    static setShowTopToolBar(val) {
        if (Workspace.currentWorkspace.editor.showTopToolBar !== val) {
            Workspace.currentWorkspace.editor.showTopToolBar = Boolean(val);
            Workspace.updateWorkspace(Workspace.currentWorkspace);
        }
    }
    static toggleEditorPanel () {
        Workspace.currentWorkspace.editor.panel.collapse = !Workspace.currentWorkspace.editor.panel.collapse;
        Workspace.updateWorkspace(Workspace.currentWorkspace);
    }

    // =========== 菜单 ============
    static async setMenus(menus) {
        if (menus !== Workspace.currentWorkspace.menus) {
            Workspace.currentWorkspace.menus = menus;
            const res = await Workspace.updateWorkspace(Workspace.currentWorkspace);
        }
    }

    // 加载所有配置
    static async loadWorkspaceConfig() {
        // console.log('===== loadWorkspace Config =====');
        this.setSidebarCollapse(Workspace.currentWorkspace?.layout?.sidebar?.collapse);
        User.getUserData();
        if (Workspace.currentWorkspace?.appearance?.theme  === 'dark') {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
        } else {
            document.documentElement.classList.remove('dark');
            document.documentElement.classList.add('light');
        }
        if (Workspace.currentWorkspace?.appearance?.primaryColor) {
            document.documentElement.style.setProperty('--el-color-primary', Workspace.currentWorkspace.appearance.primaryColor);
        }
    }
}