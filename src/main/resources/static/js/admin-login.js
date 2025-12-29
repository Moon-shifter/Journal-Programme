// ================== 管理员登录页专属JS==================

// 页面加载完成后执行初始化操作
window.addEventListener("load", () => {
    // 1. 填充缓存的用户名和密码
    initFormData();
    // 2. 绑定按钮事件
    bindButtonEvents();
    // 3. 绑定键盘事件（支持回车登录）
    bindKeydownEvents();
});

/**
 * 初始化表单数据：从Cookie中读取并填充用户名
 */
function initFormData() {
    const savedUserName = getCookie("userName");
    if (savedUserName) {
        const userNameInput = document.getElementById("userName");
        if (userNameInput) userNameInput.value = savedUserName;
        // 记住用户名选项同步
        document.getElementById("rememberMe").checked = true;
    }
}

/**
 * 表单验证
 * @returns {Boolean} 是否通过验证
 */
function validateForm() {
    const userName = document.getElementById("userName").value.trim();
    const password = document.getElementById("password").value.trim();
    
    if (!userName) {
        showMessage("请输入用户名");
        return false;
    }
    
    if (!password) {
        showMessage("请输入密码");
        return false;
    }
    
    // 密码长度验证（可根据实际需求调整）
    if (password.length < 6) {
        showMessage("密码长度不能少于6位");
        return false;
    }
    
    return true;
}

/**
 * 处理登录逻辑
 */
async function handleLogin() {
    // 验证表单
    if (!validateForm()) return;
    
    const loginBtn = document.getElementById("loginBtn");
    // 防止重复提交
    loginBtn.disabled = true;
    loginBtn.textContent = "登录中...";
    
    try {
        const formData = new FormData(document.getElementById("userForm"));
        // 调用登录接口（使用全局api对象）
        const response = await api.post(
            "/admin/login",  // 登录接口路径
            formData,
            {},
            true  // 标记为FormData格式
        );
        
        if (response.success) {
            handleLoginResponse(response.data, formData);
        } else {
            showMessage(response.message || "登录失败，请重试");
        }
    } catch (error) {
        console.error("登录请求异常:", error);
        showMessage("网络异常，请稍后重试");
    } finally {
        // 恢复按钮状态
        loginBtn.disabled = false;
        loginBtn.textContent = "登录";
    }
}

/**
 * 处理登录响应（根据选项保存用户名）
 */
function handleLoginResponse(data, formData) {
    if (data.valid) {
        if (data.token) {
            setCookie(API_CONFIG.tokenKey, data.token, 1, "/", true);
        }
        showMessage("登录成功，正在跳转...", "success");
        setTimeout(() => {
            window.location.href = "../admin/index.html";
        }, 1500);
    } else {
        showMessage(data.message || "用户名或密码错误，请重试！");
    }
}

/**
 * 显示消息提示
 * @param {String} text - 提示文本
 * @param {String} type - 类型（error/success）
 */
function showMessage(text, type = "error") {
    const msgEl = document.getElementById("errorMsg");
    if (!msgEl) return;
    
    msgEl.textContent = text;
    msgEl.className = type === "error" ? "error-message" : "success-message";
    msgEl.style.display = "block"; // 确保显示
    
    // 3秒后自动隐藏成功提示
    if (type === "success") {
        setTimeout(() => {
            msgEl.style.display = "none";
        }, 3000);
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

    // 重置按钮逻辑
    const resetBtn = document.getElementById("resetBtn");
    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            const form = document.getElementById("userForm");
            if (form) {
                form.reset();
                // 重置提示信息
                const msgEl = document.getElementById("errorMsg");
                if (msgEl) {
                    msgEl.textContent = "";
                    msgEl.style.display = "none";
                }
            }
        });
    }
}

/**
 * 绑定键盘事件（支持回车键登录）
 */
function bindKeydownEvents() {
    const form = document.getElementById("userForm");
    if (form) {
        form.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault(); // 阻止表单默认提交
                handleLogin();
            }
        });
    }
}
