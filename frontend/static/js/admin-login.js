// 依赖说明：需在 HTML 中先引入 axios 和 common-request.js（顺序：axios → common-request.js → admin-login.js）
!(function(window, api) {
  // 防止重复初始化
  if (window.AdminLogin) return;

  const AdminLogin = {
    /**
     * 初始化登录表单（核心入口函数）
     * @param {Object} options - 配置项
     * @param {string} options.formId - 登录表单ID（必填）
     * @param {string} options.usernameKey - 用户名输入框name属性（默认："username"）
     * @param {string} options.passwordKey - 密码输入框name属性（默认："password"）
     * @param {string} options.loginApiUrl - 登录接口URL（默认："/admin/login"，需与后端接口路径一致）
     * @param {string} options.successRedirectUrl - 登录成功后跳转地址（默认："/admin/index.html"）
     */
    init: function(options = {}) {
      // 初始化配置（合并默认值）
      this.config = Object.assign(
        {
          formId: "adminLoginForm",
          usernameKey: "username",
          passwordKey: "password",
          loginApiUrl: "auth/admin/login",
          successRedirectUrl: "../../pages/admin/admin-index.html",
        },
        options
      );

      // 获取表单元素
      this.loginForm = document.getElementById(this.config.formId);
      if (!this.loginForm) {
        throw new Error(`未找到ID为${this.config.formId}的登录表单`);
      }

      // 绑定表单提交事件
      this.loginForm.addEventListener("submit", (e) => this.handleSubmit(e));
    },

    /**
     * 处理表单提交（内部方法，无需外部调用）
     * @param {Event} e - 提交事件对象
     */
    handleSubmit: function(e) {
      // 阻止表单默认提交行为（避免页面刷新）
      e.preventDefault();

      // 收集表单数据
      const formData = this.collectFormData();

      // 验证表单数据（非空校验）
      if (!this.validateFormData(formData)) return;

      // 发送登录请求
      this.sendLoginRequest(formData);
    },

    /**
     * 收集表单数据（内部方法，无需外部调用）
     * @returns {Object} 表单数据（{ username, password }）
     */
    collectFormData: function() {
      const usernameInput = this.loginForm.querySelector(`[name="${this.config.usernameKey}"]`);
      const passwordInput = this.loginForm.querySelector(`[name="${this.config.passwordKey}"]`);

      return {
        username: usernameInput?.value?.trim() || "",
        password: passwordInput?.value?.trim() || "",
      };
    },

    /**
     * 验证表单数据（内部方法，可外部扩展）
     * @param {Object} formData - 表单数据
     * @returns {boolean} 验证结果（true=通过，false=不通过）
     */
    validateFormData: function(formData) {
      const { username, password } = formData;

      if (!username) {
        alert("请输入用户名");
        return false;
      }

      if (!password) {
        alert("请输入密码");
        return false;
      }

      // 可扩展：密码长度校验、格式校验等
      if (password.length < 6) {
        alert("密码长度不能少于6位");
        return false;
      }

      return true;
    },

    /**
     * 发送登录请求（核心请求方法，可单独调用）
     * @param {Object} loginParams - 登录参数
     * @param {string} loginParams.username - 用户名
     * @param {string} loginParams.password - 密码
     * @returns {Promise<Object>} 登录响应数据（包含adminId、username、role等）
     */
    sendLoginRequest: async function(loginParams) {
      try {
        // 调用 common-request.js 封装的 POST 方法发送请求（无 Token 携带）
        const response = await api.post(this.config.loginApiUrl, loginParams);

        // 登录成功：处理响应数据并跳转
        this.handleLoginSuccess(response);

        return response;
      } catch (error) {
        // 登录失败：错误提示已在 common-request.js 中统一处理
        console.error("管理员登录失败：", error);
        throw error; // 允许外部自定义处理错误
      }
    },

    /**
     * 处理登录成功逻辑（无 Token 存储）
     * @param {Object} userInfo - 后端返回的用户信息（不含 Token）
     */
    handleLoginSuccess: function(userInfo) {
      // 可选：存储用户基本信息到本地（仅用于页面展示，无认证作用）
      localStorage.setItem("adminUserInfo", JSON.stringify(userInfo));

      // 跳转到后台首页
      window.location.href = this.config.successRedirectUrl;
    },
  };

  // 暴露到全局，供HTML调用
  window.AdminLogin = AdminLogin;
})(window, api);