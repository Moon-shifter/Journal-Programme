// 管理员登录接口调用（对应后端"管理员登录接口"）
async function adminLogin(username, password) {
  return api.post("/auth/admin/login", { username, password });
}


// 登录按钮点击事件（结合之前的逻辑）
loginBtn.addEventListener("click", async () => {
  // 1. 清空错误提示
  errorMsg.textContent = "";

  // 2. 数据校验（之前的逻辑）
  const userName = userNameInput.value.trim();
  const passWord = passWordInput.value.trim();
  if (!userName) {
    errorMsg.textContent = "请输入用户名";
    return;
  }
  if (passWord.length < 6 || passWord.length > 20) {
    errorMsg.textContent = "密码长度需在6-20个字符之间";
    return;
  }

  // 3. 加载状态
  loginBtn.disabled = true;
  loginBtn.classList.add("loading");
  loginBtn.textContent = "登录中...";

  try {
    // 4. 调用登录接口
    const userData = await adminLogin(userName, passWord);
    
    // 5. 登录成功：存储用户信息+Token（根据后端返回的data结构调整）
    localStorage.setItem("userInfo", JSON.stringify(userData));
    localStorage.setItem("token", userData.token); // 假设后端返回token
    
    // 6. 跳转到管理员首页
    window.location.href = "admin-index.html";
  } catch (err) {
    // 7. 登录失败：恢复按钮状态
    errorMsg.textContent = err.message;
    loginBtn.disabled = false;
    loginBtn.classList.remove("loading");
    loginBtn.textContent = "登录";
  }
});