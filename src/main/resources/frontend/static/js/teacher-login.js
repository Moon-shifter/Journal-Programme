// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const loginForm = document.getElementById('loginForm');
    const teacherIdInput = document.getElementById('teacherId');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const loadingIndicator = submitBtn.querySelector('.loading');
    const messageElement = document.getElementById('message');

    // 显示消息
    function showMessage(text, isError = true) {
        messageElement.textContent = text;
        messageElement.style.display = 'block';
        messageElement.className = 'message';
        messageElement.classList.add(isError ? 'error' : 'success');

        // 3秒后自动隐藏消息
        setTimeout(() => {
            messageElement.style.display = 'none';
        }, 3000);
    }

    // 显示加载状态
    function showLoading() {
        btnText.style.display = 'none';
        loadingIndicator.style.display = 'inline-block';
        submitBtn.disabled = true;
    }

    // 隐藏加载状态
    function hideLoading() {
        btnText.style.display = 'inline-block';
        loadingIndicator.style.display = 'none';
        submitBtn.disabled = false;
    }

    // 表单验证
    function validateForm() {
        const teacherId = teacherIdInput.value.trim();
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();

        // 简单验证教师ID（假设为数字）
        if (!teacherId) {
            showMessage('请输入教师ID');
            return false;
        }
        if (!/^\d+$/.test(teacherId)) {
            showMessage('教师ID必须为数字');
            return false;
        }

        // 验证姓名
        if (!name) {
            showMessage('请输入姓名');
            return false;
        }

        // 验证邮箱格式
        if (!email) {
            showMessage('请输入邮箱');
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showMessage('请输入有效的邮箱地址');
            return false;
        }

        return true;
    }

    // 登录处理函数
    async function handleLogin(e) {
        e.preventDefault();

        // 表单验证
        if (!validateForm()) {
            return;
        }

        // 获取表单数据
        const loginData = {
            id: teacherIdInput.value.trim(),
            name: nameInput.value.trim(),
            email: emailInput.value.trim()
        };

        try {
            // 显示加载状态
            showLoading();

            // 调用登录API
            const response = await api.post('auth/teacher/login', loginData);

            // 登录成功，保存用户信息到Cookie
            setCookies({
                id: loginData.teacherId,
                name: loginData.name,
                email: loginData.email,
                // 如果后端返回token，也需要保存
                ...(response.token && { token: response.token })
            }, 7); // 保存7天

            // 显示成功消息并跳转
            showMessage('登录成功，正在跳转...', false);
            setTimeout(() => {
                // 跳转到教师主页，根据实际情况修改路径
                window.location.href = '../../pages/teacher/teacher-index.html';
            }, 1000);

        } catch (error) {
            // 显示错误消息
            showMessage(error.message || '登录失败，请重试');
            console.error('登录错误:', error);
        } finally {
            // 隐藏加载状态
            hideLoading();
        }
    }

    // 绑定表单提交事件
    loginForm.addEventListener('submit', handleLogin);

    // 为输入框添加焦点事件，清除消息
    [teacherIdInput, nameInput, emailInput].forEach(input => {
        input.addEventListener('focus', () => {
            messageElement.style.display = 'none';
        });
    });
});