// 获取DOM元素
const loginBtn = document.getElementById('loginBtn');
const resetBtn = document.getElementById('resetBtn');
const userNameInput = document.getElementById('userName');
const passWordInput = document.getElementById('passWord');
const errorMsg = document.getElementById('errorMsg');
const userForm = document.getElementById('userForm');


// 登录按钮点击事件
loginBtn.addEventListener('click', function() {
    // 清空之前的错误提示
    errorMsg.textContent = '';
    
    // 获取并处理输入值
    const userName = userNameInput.value.trim();
    const passWord = passWordInput.value.trim();

    // 1. 数据校验
    if (!userName) {
        errorMsg.textContent = '请输入用户名';
        return;
    }
    if (passWord.length < 6 || passWord.length > 20) {
        errorMsg.textContent = '密码长度需在6-20个字符之间';
        return;
    }


    // 2. 模拟加载状态
    loginBtn.disabled = true;
    loginBtn.classList.add('loading');
    loginBtn.textContent = '登录中...';


    // 3. 模拟请求体
    const requestBody = {
        userName: userName,
        passWord: passWord
    };
    console.log('模拟请求体:', requestBody);


    // 4. 模拟异步请求（1秒延迟）
    setTimeout(() => {
        // 模拟请求结果：假设用户名"admin"、密码"123456"为合法账号
        if (userName === 'admin' && passWord === '123456') {
            // 登录成功，跳转到admin-index页面
            window.location.href = '../admin/admin-index.html'; // 路径根据实际文件层级调整
        } else {
            // 登录失败，提示错误
            errorMsg.textContent = '用户名或密码错误';
            // 恢复按钮状态
            loginBtn.disabled = false;
            loginBtn.classList.remove('loading');
            loginBtn.textContent = '登录';
        }
    }, 1000);
});


// 重置按钮点击事件
resetBtn.addEventListener('click', function() {
    // 清空表单输入内容
    userForm.reset();
    // 清空错误提示
    errorMsg.textContent = '';
});