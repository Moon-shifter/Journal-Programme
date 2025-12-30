// ================== 全局公共Cookie工具函数 ==================

/**
 * 设置Cookie
 * @param {String} name - Cookie名称
 * @param {String} value - Cookie值
 * @param {Number} days - 过期天数（默认7天）
 * @param {String} path - 路径（默认"/"）
 */
function setCookie(name, value, days = 7, path = "/") {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + d.toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)};${expires};path=${path}`;
}

/**
 * 获取Cookie
 * @param {String} key - Cookie名称
 * @returns {String|null} Cookie值（解码后）或null
 */
function getCookie(key) {
    const cookieList = document.cookie.split("; ");
    for (let i = 0; i < cookieList.length; i++) {
        const [cookieKey, ...cookieValueParts] = cookieList[i].split("=");
        // 处理值中包含"="的情况
        const cookieValue = cookieValueParts.join("=");
        if (key === cookieKey.trim()) {
            return decodeURIComponent(cookieValue);
        }
    }
    return null;
}

/**
 * 删除Cookie
 * @param {String} key - Cookie名称
 * @param {String} path - 路径（默认"/"）
 */
function deleteCookie(key, path = "/") {
    document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
}

/**
 * 批量设置Cookie（适配多值存储场景）
 * @param {Object} cookies - {name: value, ...}格式的Cookie键值对
 * @param {Number} days - 过期天数
 */
function setCookies(cookies, days = 7) {
    Object.entries(cookies).forEach(([name, value]) => {
        setCookie(name, value, days);
    });
}

// 导出函数（支持模块化引入）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { setCookie, getCookie, deleteCookie, setCookies };
}

