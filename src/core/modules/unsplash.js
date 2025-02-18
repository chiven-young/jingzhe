import axios from "axios";

const requests = axios.create({
    // baseURL:'/api',
    timeout: 60000,
})
// 请求头配置
requests.interceptors.request.use(
    function (config) {
        config.headers.Authorization = 'Client-ID yJijAuSfkE48TJM0jncC7moEzNHBN6d6BkfGanCAdu0';

        return config;
    },
    function (error) {
        return Promise.reject(error);
    }
);
// 响应拦截器
requests.interceptors.response.use(
    res => {
        return res.data
    }, error => {
        return Promise.resolve(error?.response?.data)
    })
// unsplash随机缩略图
export function getUnsplashThumbnail() {
    return requests.get(`https://source.unsplash.com/random/300x200`);
}
export function getUnsplashList() {
    return requests.get(`https://api.unsplash.com/photos?page=1`);
}
