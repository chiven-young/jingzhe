
// 菜单栏的tab项
export const menuBarTabs = [
    {
        label: '项目',
        value: 'item',
        icon: 'DescriptionOutlined',
        highlightIcon: 'DescriptionRound'
    },
    {
        label: '素材库',
        value: 'library',
        icon: 'DnsOutlined',
        highlightIcon: 'DnsRound'
    },
    {
        label: '搜索',
        value: 'search',
        icon: 'SearchRound',
        highlightIcon: 'SearchRound'
    },
    {
        label: '通知',
        value: 'message',
        icon: 'MailOutlineRound',
        highlightIcon: 'MailRound'
    },
]

// 菜单-项目目录
export const itemMenu = [
    {
        label: '我的文档',
        value: '/library/index',
        icon: 'LayersOutlined',
        highlightIcon: 'LayersFilled'
    },
    {
        label: '收藏',
        value: '/library/star',
        icon: 'StarOutlineRound',
        highlightIcon: 'StarOutlined'
    },
    {
        label: '素材库',
        value: '/library/material',
        icon: 'InboxOutlined',
        highlightIcon: 'InboxFilled'
    },
    {
        label: '标签',
        value: '/library/tags',
        icon: 'DiscountOutlined',
        highlightIcon: 'DiscountRound'
    },
    {
        label: '我的模板',
        value: '/library/template',
        icon: 'SubtitlesOutlined',
        highlightIcon: 'SubtitlesFilled'
    },
    {
        label: '社区',
        value: '/library/community',
        icon: 'LanguageRound',
        highlightIcon: 'LanguageTwotone'
    },
    {
        label: '废纸篓',
        value: '/library/deleted',
        icon: 'DeleteOutlineRound',
        highlightIcon: 'DeleteRound'
    },
]
// 后台管理菜单
export const adminMenu = [
    {
        label: '平台管理',
        value: '/library/manage',
        icon: 'InsertChartOutlined',
        highlightIcon: 'InsertChartRound'
    },
    {
        label: '标签管理',
        value: '/admin/tags',
        icon: 'DiscountOutlined',
        highlightIcon: 'DiscountRound'
    },
]

export const fileTypeOptions = [
    {
        label: '文档',
        value: 'document',
        icon: '',
        color: '',
        enable: true
    },
    {
        label: '图片',
        value: 'image',
        icon: '',
        color: '',
        enable: false
    },
    {
        label: '图册',
        value: 'images',
        icon: '',
        color: '',
        enable: false
    },
    {
        label: '视频',
        value: 'video',
        icon: '',
        color: '',
        enable: false
    },
    {
        label: '音频',
        value: 'audio',
        icon: '',
        color: '',
        enable: false
    },
    {
        label: '链接',
        value: 'link',
        icon: '',
        color: '',
        enable: false
    },
    {
        label: '思维导图',
        value: 'mindmap',
        icon: '',
        color: '',
        enable: true
    },
    {
        label: '看板',
        value: 'kanban',
        icon: '',
        color: '',
        enable: false
    },
    {
        label: '流程图',
        value: 'flowchat',
        icon: '',
        color: '',
        enable: false
    },
    {
        label: '绘图',
        value: 'draw',
        icon: '',
        color: '',
        enable: false
    },
    {
        label: 'Markdown',
        value: 'markdown',
        icon: '',
        color: '',
        enable: false
    },
    {
        label: '文件夹',
        value: 'folder',
        icon: 'FolderOpenRound',
        color: '',
        enable: false
    }
]