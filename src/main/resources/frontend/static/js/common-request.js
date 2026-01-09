// 1. 创建Axios实例（配置后端基础路径、超时等）
const requestInstance = axios.create({
  baseURL: "http://localhost:8080/api", // 后端接口基础路径（根据实际后端地址修改，如"http://localhost:8080/api"）
  timeout: 5000, // 请求超时时间（5秒）
  headers: { "Content-Type": "application/json;charset=utf-8" } // 默认请求头
});


// 2. 请求拦截器（可选：添加Token、请求参数预处理）
requestInstance.interceptors.request.use(
  (config) => {
    // 示例：从本地存储中获取Token并添加到请求头（若后端需要认证）
    // const token = localStorage.getItem("token");
    // if (token) {
    //
    //   config.headers["Authorization"] = token; // 格式根据后端要求调整（如"Bearer " + token）
    // }
    return config;
  },
  (error) => {
    // 请求发送失败的前置处理
    alert("请求准备失败，请检查网络");
    return Promise.reject(error);
  }
);


// 3. 通用响应处理函数（核心：处理code/data/message）
function handleApiResponse(res) {
  // 校验后端响应格式是否合法
  if (res.code === undefined) {
    throw new Error("后端响应格式错误（缺少code字段）");
  }

  // 假设后端约定 code=200 为成功（可根据实际调整）
  if (res.code === 200) {
    return res.data; // 成功时返回data
  } else {
    // 失败时抛出错误信息（优先用后端的message）
    const errorMsg = res.message || `请求失败（错误码：${res.code}）`;
    alert(errorMsg); // 可替换为项目的提示组件（如ElementUI的$message）
    throw new Error(errorMsg); // 抛出错误，让业务代码catch处理
  }
}


// 4. 响应拦截器（处理HTTP状态码、传递给通用响应函数）
requestInstance.interceptors.response.use(
  (response) => {
    // 取出后端返回的完整数据（包含code/data/message）
    return handleApiResponse(response.data);
  },
  (error) => {
    // 处理HTTP错误（如404/500等）
    let errorMsg = "网络请求异常，请稍后再试";
    if (error.response) {
      // 有响应但状态码非2xx
      const { status } = error.response;
      switch (status) {
        // case 401:
        //   errorMsg = "未登录，请先登录";
        //   window.location.href = "/login.html"; // 跳转到登录页
        //   break;
        // case 403:
        //   errorMsg = "您没有权限访问该资源";
        //   break;
        case 404:
          errorMsg = "请求的接口不存在";
          break;
        case 500:
          errorMsg = "服务器内部错误，请联系管理员";
          break;
        default:
          errorMsg = error.response.data?.message || errorMsg;
      }
    } else if (error.request) {
      // 发送了请求但无响应（如超时）
      errorMsg = "请求超时，请检查网络连接";
    }
    alert(errorMsg);
    return Promise.reject(error);
  }
);


// 5. 通用请求函数（支持所有请求方式）
async function request(method, url, params = {}, data = {}) {
  try {
    const result = await requestInstance({
      method: method.toUpperCase(), // 统一转为大写
      url,
      params, // GET请求的参数（拼在URL上）
      data, // POST/PUT等请求的请求体
    });
    return result;
  } catch (err) {
    console.error("请求失败:", err);
    throw err; // 继续抛出错误，让业务代码处理
  }
}


// 6. 封装常用请求方法（简化调用）
const api = {
  get: (url, params) => request("GET", url, params),
  post: (url, data) => request("POST", url, {}, data),
  put: (url, data) => request("PUT", url, {}, data),
  del: (url, params) => request("DELETE", url, params),
};