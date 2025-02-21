import { createStore } from 'vuex'
import { useDark, useToggle } from '@vueuse/core';

const store = createStore({
  state: {
    appConfig: {
      version: '1.0.0',
      model: 'normal',
      name: '惊蛰',
      logo: '',
      menu: {
        stars: false,
        tags: true,
        material: true, // 素材库
        myTemplates: false,
        share: false,
      },
      editor: {
        showTopToolBar: true,
      }
    },
    workspace: null,
    loadingWorkspace: false,
    cellsTree: [],
    breadcrumbs: [],
    itemSaveStatus: 'saved',

    loading: false, // 全局的loading
  },
  mutations: {

  },
  actions: {
    
  }
})

export default store;
