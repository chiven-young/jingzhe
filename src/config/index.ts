
// 应用配置
export const appConfig = {
    menus: {
        stars: true,
        tags: true,
        material: true, // 素材库
        myTemplates: true,
    },
    editor: {
        showTopToolBar: true,
    },
    config: {
        
    }
}

// 检查两个对象是否有相同的属性
function haveSameProperties(obj1, obj2) {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    // 如果两个对象的属性数量不同，返回false
    if (keys1.length !== keys2.length) {
      return false;
    }
    // 检查每个属性名是否相同
    for (let i = 0; i < keys1.length; i++) {
      if (!keys2.includes(keys1[i])) {
        return false;
      }
    }
    // 所有属性名都相同，返回true
    return true;
}