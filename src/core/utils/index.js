
// 从localstorage中获取数组
export function getLocalStorageArray(key) {
    return JSON.parse(localStorage.getItem(key) || '[]');
}

// 添加到localstorage数组并重排
export function reorderLocalStorageArray(key, value) {
    let list = getLocalStorageArray(key);
    const index = list.indexOf(value);
    if (index > -1) {
        list.splice(index, 1);
    }
    list.unshift(value);
    localStorage.setItem(key, JSON.stringify(list));
}

// 从localstorage数组中移除
export function removeFromLocalStorageArray(key, value) {
    let list = getLocalStorageArray(key);
    const index = list.indexOf(value);
    if (index > -1) {
        list.splice(index, 1);
    }
    localStorage.setItem(key, JSON.stringify(list));
}

// 检查两个对象是否有相同的属性
export function haveSameProperties(obj1, obj2) {
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

// 将时间统一转化为时间戳形式返回
export function parseTimeToTimestamp(time) {
  if (!time) {
      return 0
  }
  // 判断是否为常规时间格式（如：2021-07-01 14:11:54）
  const isRegularFormat = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(time);

  if (isRegularFormat) {
      // 转化为时间戳
      const timestamp = new Date(time).getTime();
      return timestamp;
  } else {
      // 时间已经是时间戳，直接返回
      return time;
  }
}