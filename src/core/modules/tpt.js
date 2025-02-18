import requests from "@/utils/requests";

const isTauri = window.__TAURI__ ? true : false;
const baseUrl = isTauri ? 'http://localhost:6060' : import.meta.env.VITE_API_BASE_URL;

// 将对象参数转化为query参数
function appendQueryParams(url, params) {
    // 遍历params对象的每个属性和值
    let queryParams = Object.entries(params)
      .filter(([_, value]) => value !== "" && value !== undefined)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
      )
      .join("&");
  
    // 检查URL中是否已经存在查询参数
    let separator = url.includes("?") ? "&" : "?";
  
    // 将查询参数追加到API的URL后面
    url = queryParams ? `${url}${separator}${queryParams}` : url;
  
    return url;
}

// 获取账户（服务号）信息
export function getAccountInfo() {
  return requests.post(`${baseUrl}/userms/serviceAccount/owner/queryServiceAccountSetInfo`, {});
}

// 查询内容列表（后管）
export function getContentItemList(params) {
  let tptParams = {
    pageNo: params.page,
    pageSize: params.pageSize,
    status: params.status || '',
    isDelete: params.isDelete || '',
    style: params.style || '',
    title: params.title || '',
    type: params.type || ''
  };
    const url = `${baseUrl}/informationms/manager/mgrArticleInfo/getList`;
    const newUrl = appendQueryParams(url, tptParams);
    return requests.get(newUrl);
}

// 查询内容详情（后管）
export function getContentItemDetails(id) {
    return requests.get(`${baseUrl}/informationms/manager/mgrArticleInfo/getDetails?articleId=${id}`);
}
// 更新内容项目（后管）
export function contentFactoryUpdate(params) {
  return requests.post(
    `${baseUrl}/content-factory/manager/mgrArticleInfo/contentFactoryUpdate`,
    params
  );
}
// 删除内容项目（后管）
export function deleteContentItem(params) {
  return requests.post(
    `${baseUrl}/informationms/manager/mgrArticleInfo/delete`,
    params
  );
}
// 审批内容项目（后管）
export function examineContentItem(params) {
  return requests.post(
    `${baseUrl}/informationms/manager/mgrArticleInfo/examine`,
    params
  );
}

// 分页查询素材库
export function getMaterialLibrary(params) {
  let tptParams = {
    page: params.page,
    pageSize: params.pageSize,
    type: params.type,
    name: params.name,
    searchKey: params.searchKey,
    tags: params.tags || [],
    searchServiceOnly: params.searchServiceOnly ? true : false
  };
    return requests.post(
      `${baseUrl}/content-factory/element/v1/list/${params?.page}/${params?.pageSize}`,
      tptParams
    );
}