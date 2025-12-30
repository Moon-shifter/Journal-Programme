
/**
 * API请求通用配置
 * 可根据项目实际情况修改（如基础URL、超时时间、Token键名）
 */
const API_CONFIG = {
  baseURL: "/api", // 接口基础路径（拼接后完整路径：baseURL + url）
  timeout: 10000, // 请求超时时间（毫秒）
  tokenKey: "admin_token", // 存储Token的Cookie/本地存储键名
  contentType: {
    json: "application/json;charset=UTF-8",
    form: "application/x-www-form-urlencoded;charset=UTF-8",
    formData: "multipart/form-data"
  }
};

/**
 * 获取请求头（自动携带Token，适配权限接口）
 * @param {Object} customHeaders - 自定义请求头（覆盖默认）
 * @param {Boolean} isFormData - 是否为FormData格式（自动跳过Content-Type）
 * @returns {Object} 最终请求头
 */
const getRequestHeaders = (customHeaders = {}, isFormData = false) => {
  // 从Cookie获取Token（复用common.js的getCookie方法）
  const token = getCookie ? getCookie(API_CONFIG.tokenKey) : "";
  // 构建默认请求头
  const defaultHeaders = {
    "Accept": "application/json",
    // FormData格式由浏览器自动设置Content-Type，无需手动配置
    ...(isFormData ? {} : { "Content-Type": API_CONFIG.contentType.json })
  };
  // 有Token则添加授权头（适配后端鉴权）
  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }
  // 合并自定义请求头（自定义优先级更高）
  return { ...defaultHeaders, ...customHeaders };
};

/**
 * 拼接URL参数（GET请求专用）
 * @param {String} url - 基础URL
 * @param {Object} params - GET参数对象
 * @returns {String} 拼接后的URL
 */
const concatUrlParams = (url, params = {}) => {
  if (!Object.keys(params).length) return url;
  const searchParams = new URLSearchParams(params);
  return `${url}${url.includes("?") ? "&" : "?"}${searchParams.toString()}`;
};

/**
 * 通用请求核心函数
 * @param {String} method - 请求方法（GET/POST/PUT/DELETE）
 * @param {String} url - 接口路径（相对于baseURL）
 * @param {Object} options - 请求配置
 * @param {Object} options.params - URL参数（GET）/请求体参数（POST/PUT/DELETE）
 * @param {Object} options.headers - 自定义请求头
 * @param {Boolean} options.isFormData - 是否以FormData格式提交（默认false）
 * @param {Boolean} options.isFormUrlEncoded - 是否以x-www-form-urlencoded格式提交（默认false）
 * @returns {Promise<Object>} 标准化响应数据
 */
const request = async (method, url, options = {}) => {
  const {
    params = {},
    headers = {},
    isFormData = false,
    isFormUrlEncoded = false
  } = options;

  // 1. 拼接完整URL（处理GET参数）
  const fullUrl = method.toUpperCase() === "GET" 
    ? concatUrlParams(`${API_CONFIG.baseURL}${url}`, params) 
    : `${API_CONFIG.baseURL}${url}`;

  // 2. 处理请求体（POST/PUT/DELETE）
  let body = null;
  if (method.toUpperCase() !== "GET") {
    if (isFormData) {
      // FormData格式（如登录接口的表单数据）
      body = params instanceof FormData ? params : new FormData();
      if (!(params instanceof FormData)) {
        Object.entries(params).forEach(([key, value]) => {
          body.append(key, value);
        });
      }
    } else if (isFormUrlEncoded) {
      // x-www-form-urlencoded格式
      body = new URLSearchParams(params).toString();
    } else {
      // JSON格式（默认）
      body = JSON.stringify(params);
    }
  }

  // 3. 构建fetch配置
  const fetchOptions = {
    method: method.toUpperCase(),
    headers: getRequestHeaders(headers, isFormData),
    credentials: "include", // 携带Cookie（适配鉴权、会话保持）
    signal: AbortSignal.timeout(API_CONFIG.timeout), // 超时控制
    ...(method.toUpperCase() !== "GET" ? { body } : {})
  };

  try {
    // 4. 发送请求
    const response = await fetch(fullUrl, fetchOptions);

    // 5. 处理HTTP状态码异常
    if (!response.ok) {
      throw new Error(`HTTP请求失败：状态码 ${response.status}(${response.statusText})`);
    }

    // 6. 解析响应数据（优先JSON，兼容文本）
    let data;
    try {
      data = await response.json();
    } catch (e) {
      data = await response.text();
    }

    // 7. 标准化响应（适配业务状态码，与登录接口的code字段对齐）
    return {
      success: data.code === 200, // 业务成功标识（后端约定200为成功）
      data: data, // 原始响应数据
      message: data.message || (data.code === 200 ? "请求成功" : "请求失败"),
      statusCode: response.status // HTTP状态码
    };
  } catch (error) {
    // 8. 统一异常处理（网络错误、超时、解析错误等）
    console.error(`[API请求异常] ${method} ${fullUrl}：`, error);
    return {
      success: false,
      data: null,
      message: error.name === "TimeoutError" ? "请求超时，请稍后重试" : "请求失败：" + error.message,
      statusCode: 0 // 非HTTP异常标识
    };
  }
};


/**
 * 暴露通用请求方法（简化调用）
 */
const api = {
  // GET请求：参数自动拼接到URL
  get: (url, params = {}, headers = {}) => request("GET", url, { params, headers }),
  
  // POST请求：默认JSON格式，支持FormData/x-www-form-urlencoded
  post: (url, params = {}, headers = {}, isFormData = false, isFormUrlEncoded = false) => 
    request("POST", url, { params, headers, isFormData, isFormUrlEncoded }),
  
  // PUT请求：同POST
  put: (url, params = {}, headers = {}, isFormData = false, isFormUrlEncoded = false) => 
    request("PUT", url, { params, headers, isFormData, isFormUrlEncoded }),
  
  // DELETE请求：默认JSON格式，支持URL参数/请求体
  delete: (url, params = {}, headers = {}, isFormData = false) => 
    request("DELETE", url, { params, headers, isFormData })
};

// 挂载到window，全局可用（兼容现有代码）
window.api = api;