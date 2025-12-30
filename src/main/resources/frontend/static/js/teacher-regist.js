 const registerForm = document.getElementById('teacherRegisterForm');
    const registerMessage = document.getElementById('registerMessage');

    // 显示消息提示
    const showMessage = (text, isSuccess = true) => {
        registerMessage.textContent = text;
        registerMessage.className = `message ${isSuccess ? 'success' : 'error'}`;
        registerMessage.style.display = 'block';
    };

    // 表单提交处理
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // 收集表单数据
        const formData = new FormData(registerForm);
        const formValues = Object.fromEntries(formData.entries());

        try {
            // 显示加载状态
            showMessage('正在提交注册信息...', true);
            
            // 调用注册接口 (使用common-api.js提供的api方法)
            const response = await api.post(
                '/auth/teacher/register', 
                formValues,
                {},  // 自定义请求头
                false,  // 非FormData格式
                false   // 非x-www-form-urlencoded格式
            );

            if (response.success) {
                // 注册成功处理
                showMessage('✅ 注册成功！即将跳转到登录页面...', true);
                
                // 3秒后跳转登录页
                setTimeout(() => {
                    window.location.href = '../../pages/teacher/teacher-login.html';
                }, 3000);
            } else {
                // 注册失败（业务逻辑错误）
                showMessage(`❌ 注册失败：${response.message}`, false);
            }
        } catch (error) {
            // 网络错误处理
            showMessage('❌ 网络异常，请稍后重试', false);
            console.error('注册请求失败:', error);
        }
    });