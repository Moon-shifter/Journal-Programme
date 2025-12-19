// ================== 全局公共JS工具函数 ==================
function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + d.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function getCookie(key) {
    const cookieList = document.cookie.split("; ");
    let keyValue;
    for (let i = 0; i < cookieList.length; i++) {
        const arr = cookieList[i].split("=");
        if (key === arr[0].trim()) {
            keyValue = arr[1];
            break;
        }
    }
    return typeof keyValue === "undefined" ? null : keyValue;
}

function deleteCookie(key) {
    document.cookie = key + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}


axios.defaults.baseURL = 'http://localhost:8080'; // 替换为你的后端地址
axios.defaults.withCredentials = true;
axios.defaults.headers.post['Content-Type'] = 'application/json;charset=utf-8';
axios.interceptors.request.use(config => {
    if (config.method === 'post' && config.data && !(config.data instanceof FormData)) {
        config.data = JSON.stringify(config.data); // 自动序列化JSON
    }
    return config;
}, error => Promise.reject(error));

// 3. 页面跳转工具函数
function jumpTo(pageUrl) {
    window.location.href = pageUrl;
}

// 4. 表单重置工具函数
function resetForm(formId) {
    const form = document.getElementById(formId);
    if (form) form.reset();
}