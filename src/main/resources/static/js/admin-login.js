// ================== 管理员登录页专属JS（完整封装） ==================


// 页面加载完成后执行初始化操作
window.addEventListener("load", () => {
    // 1. 填充缓存的用户名和密码（复用全局getCookie函数）
    initFormData();
    // 2. 绑定按钮事件
    bindButtonEvents();
});

/**
 * 初始化表单数据：从Cookie中读取并填充用户名和密码
 */
function initFormData() {
    const savedUserName = getCookie("userName");
    const savedPassWord = getCookie("passWord");
    
    // 不为null/空才填充
    if (savedUserName) {
        const userNameInput = document.getElementById("userName");
        if (userNameInput) userNameInput.value = savedUserName;
    }
    if (savedPassWord) {
        const passWordInput = document.getElementById("passWord");
        if (passWordInput) passWordInput.value = savedPassWord;
    }
}

/**
 * 绑定按钮事件（重置按钮 + 登录按钮）
 */
function bindButtonEvents() {

    // 登录按钮逻辑
    const loginBtn = document.getElementById("loginBtn");
    if (loginBtn) {
        loginBtn.addEventListener("click", handleLogin);
    }
}

/**
 * 处理登录逻辑（核心函数）
 * @param {Event} e - 点击事件对象
 */
function handleLogin(e) {
    e.preventDefault(); // 阻止表单默认提交行为

    // 获取表单元素
    const userForm = document.getElementById("userForm");
    if (!userForm) {
        alert("表单元素不存在！");
        return;
    }

    // 构建表单数据
    const formData = new FormData(userForm);
    formData.append("source", "USER_LOGIN"); // 标识请求来源

    // 发送登录请求
    sendLoginRequest(formData);
}

/**
 * 发送登录请求（封装AJAX逻辑）
 * @param {FormData} formData - 表单数据对象
 */
function sendLoginRequest(formData) {
    fetch("LoginServlet", {//改!!!!!!!!!!!!!!
        method: "POST",
        body: formData // 浏览器自动处理Content-Type和边界，无需手动设置
    })
    .then((response) => {
        // 验证响应是否成功
        if (response.code!== 200) {
            throw new Error(`HTTP错误！状态码：${response.code}`);
        }
        return response.json(); // 解析JSON数据
    })
    .then((data) => {
        handleLoginResponse(data, formData); // 处理登录响应结果
    })
    .catch((error) => {
        // 捕获请求异常
        console.error("登录请求失败：", error);
        alert("登录请求出错，请稍后重试！");
    });
}

/**
 * 处理登录响应结果
 * @param {Object} data - 服务器返回的JSON数据
 * @param {FormData} formData - 表单数据对象
 */
function handleLoginResponse(data, formData) {
    if (data.valid) {
        // 登录成功：保存Cookie + 提交表单 + 跳转
        setCookie("userName", formData.get("userName"), 1);
        // 可选：如需保存密码，添加下面一行（不推荐，存在安全风险）
         setCookie("passWord", formData.get("passWord"), 1);
        
        alert("登录成功，正在跳转...");
        document.getElementById("userForm").submit(); // 提交表单
        setTimeout(() => {
            window.location.href = "../admin/index.html"; // 跳转到管理员首页（替换#为实际路径）
        }, 1500); // 缩短跳转时间，提升体验
    } else {
        alert("用户名或密码错误，请重试！");
    }
}

