  // 登录表单处理
    const loginForm = document.getElementById('loginForm');
    const message = document.getElementById('message');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const loading = submitBtn.querySelector('.loading');
    const forgotIdLink = document.getElementById('forgotId');

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // 显示加载状态
        btnText.textContent = '登录中';
        loading.style.display = 'inline-block';
        submitBtn.disabled = true;
        
        try {
            // 获取表单数据
            const teacherId = document.getElementById('teacherId').value;
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            
            // 前端基础验证
            if (!teacherId || !name || !email) {
                showMessage('请填写完整信息', 'error');
                resetButton();
                return;
            }
            
            // 邮箱格式验证
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showMessage('请输入有效的邮箱地址', 'error');
                resetButton();
                return;
            }

            // 调用真实登录API（使用common-api.js提供的api方法）
            const response = await api.post(
                '/auth/teacher/login',  // 登录接口路径，会与baseURL拼接
                { teacherId, name, email },  // 请求参数
                {},  // 自定义请求头（可选）
                false,  // 不使用FormData格式
                false   // 不使用x-www-form-urlencoded格式
            );

            if (response.success) {
                // 登录成功处理
                showMessage(`登录成功，欢迎您，${name}老师！`, 'success');
                
                // 存储后端返回的Token（如果有）
                if (response.data.token) {
                    setCookie(API_CONFIG.tokenKey, response.data.token, 7);
                }
                
                // 跳转到系统主页
                setTimeout(() => {
                    window.location.href = 'teacher-index.html';
                }, 2000);
            } else {
                // 登录失败显示错误信息
                showMessage(response.message || '登录失败，请检查信息后重试', 'error');
                resetButton();
            }
        } catch (error) {
            // 捕获异常
            showMessage('网络异常，请稍后重试', 'error');
            console.error('登录请求异常:', error);
            resetButton();
        }
    });

    // 链接点击事件
    forgotIdLink.addEventListener('click', function(e) {
        e.preventDefault();
        showMessage('请联系管理员查询您的教师ID', 'warning');
    });

    // 显示消息提示
    function showMessage(text, type) {
        message.textContent = text;
        message.className = 'message ' + type;
        message.style.display = 'block';
        
        // 添加显示动画
        message.style.animation = 'fadeIn 0.3s ease';
        
        // 3秒后自动隐藏非成功消息
        if (type !== 'success') {
            setTimeout(() => {
                message.style.display = 'none';
            }, 3000);
        }
    }

    // 重置按钮状态
    function resetButton() {
        btnText.textContent = '登录系统';
        loading.style.display = 'none';
        submitBtn.disabled = false;
    }