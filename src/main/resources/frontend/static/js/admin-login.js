// pretendAdmin-login.js 完整代码
document.addEventListener('DOMContentLoaded', function() {
  // 1. 获取页面元素（和admin-login.html的表单对应）
  const userNameInput = document.getElementById('userName'); // 用户名输入框
  const passWordInput = document.getElementById('passWord'); // 密码输入框
  const loginBtn = document.getElementById('loginBtn');       // 登录按钮
  const resetBtn = document.getElementById('resetBtn');       // 清空按钮
  const errorMsgDiv = document.getElementById('errorMsg');    // 错误提示容器


  // 2. 登录按钮点击事件（核心：调用common-request的api.post）
  loginBtn.addEventListener('click', async function() {
    // 先做前端非空验证
    const userName = userNameInput.value.trim();
    const passWord = passWordInput.value.trim();

    if (!userName) {
      errorMsgDiv.textContent = '请输入用户名';
      return;
    }
    if (!passWord) {
      errorMsgDiv.textContent = '请输入密码';
      return;
    }
    errorMsgDiv.textContent = ''; // 清空之前的错误提示


    try {
      // 调用common-request中的api.post发送登录请求
      // 注意：url要和后端登录接口路径匹配，同时检查common-request的baseURL是否正确
      const loginResult = await api.post(
          'auth/admin/login', // 后端登录接口的路径（需和后端Controller的@RequestMapping一致）
          { username: userName, password: passWord } // 前端传的JSON数据（和后端接收的参数名对应）
      );


        //localStorage.setItem('token', loginResult.token); // 假设后端返回token
        alert('登录成功！正在跳转至系统首页...');
        window.location.href = '../../pages/admin/admin-index.html'; // 跳转到系统首页（替换为你的首页路径）

    } catch (error) {
      // 4. 登录失败的处理（错误信息会被common-request的拦截器自动提示，这里可以补充页面提示）
      errorMsgDiv.textContent = '用户名或密码错误，请重试';
    }
  });


  // 5. 清空按钮的逻辑（可选）
  resetBtn.addEventListener('click', function() {
    userNameInput.value = '';
    passWordInput.value = '';
    errorMsgDiv.textContent = '';
  });
});