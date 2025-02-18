import { ElMessage } from 'element-plus';

// 检查 email 格式
export const checkEmail = (rule, value) => {
    let emailReg = /^([a-zA-Z]|[0-9])(\w|-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/;
    if (emailReg.test(value) && value.length) {
        return true;
    } else {
        return false;
    }
}
// 检查手机号
export const checkPhone = (rule, value)=>{
    return /^1[3-9]\d{9}$/.test(value) && value.length === 11; 
}

// 将数组按照某字段进行重新分组
export function formattingData(arr, group_key) {
    let map = {}
    let res = []

    for (let i = 0; i < arr.length; i++) {
        let ai = arr[i]
        if (!map[ai[group_key]]) {
            map[ai[group_key]] = [ai]
        } else {
            map[ai[group_key]].push(ai)
        }
    }
    Object.keys(map).forEach(key => {
        res.push({
            [group_key]: key,
            children: map[key],
        })
    })
    return res
}
// 将富文本转化为纯文本
export function getPlainText(html) {
    const domParser = new DOMParser();
    const doc = domParser.parseFromString(html, 'text/html');
    const plainText = doc.body.textContent || '';
  
    // 去除多余空格和换行符
    return plainText.replace(/\s+/g, ' ').trim();
}

// 复制文本
export function copyText(text) {
    if (typeof text === "object") {
      try {
        text = JSON.stringify(text);
      } catch (error) { }
    }
    let Input = document.createElement("input");
    Input.value = text;
    document.body.appendChild(Input);
    Input.select();
    document.execCommand("Copy");
    Input.style.display = "none";
    Input.remove();
    ElMessage({
      message: "已复制",
      type: "success",
    });
}

/**
 * @Desc: 全屏事件检测
 */
const getOnfullscreEnevt = () => {
    if (document.documentElement.requestFullScreen) {
      return 'onfullscreenchange'
    } else if (document.documentElement.webkitRequestFullScreen) {
      return 'onwebkitfullscreenchange'
    } else if (document.documentElement.mozRequestFullScreen) {
      return 'onmozfullscreenchange'
    } else if (document.documentElement.msRequestFullscreen) {
      return 'onmsfullscreenchange'
    }
}

export const fullscrrenEvent = getOnfullscreEnevt()

/**
 * @Desc: 全屏
 */
export const fullScreen = element => {
  if (element.requestFullScreen) {
    element.requestFullScreen()
  } else if (element.webkitRequestFullScreen) {
    element.webkitRequestFullScreen()
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen()
  }
}

// 将富文本转为纯文本
export function richTextToPlainText(richText) {
  // 创建一个临时的 div 元素
  const tempDiv = document.createElement('div');
  
  // 将富文本设置为 div 的内容
  tempDiv.innerHTML = richText;

  // 处理特殊情况
  
  // 将 <br> 和 </p> 标签替换为换行符
  tempDiv.innerHTML = tempDiv.innerHTML.replace(/<br\s*\/?>/gi, '\n');
  tempDiv.innerHTML = tempDiv.innerHTML.replace(/<\/p>/gi, '\n');
  
  // 将 <li> 标签替换为 "• "（项目符号加空格）
  tempDiv.innerHTML = tempDiv.innerHTML.replace(/<li\s*\/?>/gi, '• ');

  // 获取纯文本内容
  let plainText = tempDiv.textContent || tempDiv.innerText || '';

  // 删除多余的空白字符
  plainText = plainText.replace(/\s+/g, ' ').trim();

  // 恢复换行符
  plainText = plainText.replace(/\s*\n\s*/g, '\n');

  return plainText;
}

// 将富文本中的文本部分替换为新文本
export function replaceRichTextContent(richText, newText) {
  // 使用正则表达式匹配所有的HTML标签
  const tagPattern = /<[^>]+>/g;
  
  // 将富文本分割成标签和文本部分
  const parts = richText.split(tagPattern);
  
  // 提取所有的标签
  const tags = richText.match(tagPattern) || [];
  
  // 用新文本替换所有的非标签部分
  const newParts = parts.map(part => part.trim() ? newText : part);
  
  // 重新组合文本和标签
  let result = '';
  for (let i = 0; i < Math.max(newParts.length, tags.length); i++) {
      if (i < newParts.length) result += newParts[i];
      if (i < tags.length) result += tags[i];
  }
  
  return result;
}

//防抖
// fn 要执行的函数
// delay 执行函数
export function debounce(func, delay) {
  let timer;
  return function (...args) {
    const context = this;
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(context, args);
    }, delay);
  };
}