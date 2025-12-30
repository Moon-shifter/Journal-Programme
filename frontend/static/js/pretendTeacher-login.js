// 等待DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 获取核心DOM元素
    const loginForm = document.getElementById('loginForm');
    const teacherIdInput = document.getElementById('teacherId');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const loadingIcon = submitBtn.querySelector('.loading');
    const messageBox = document.getElementById('message');

    // 邮箱格式校验正则
    const emailReg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // 显示消息提示框
    function showMessage(text, isSuccess = false) {
        messageBox.textContent = text;
        messageBox.style.display = 'block';
        // 区分成功/错误样式（需配合CSS，若无则可注释）
        messageBox.className = isSuccess ? 'message success' : 'message error';
    }

    // 隐藏消息提示框
    function hideMessage() {
        messageBox.style.display = 'none';
        messageBox.textContent = '';
    }

    // 处理登录表单提交
    loginForm.addEventListener('submit', function(e) {
        // 阻止表单默认提交行为
        e.preventDefault();
        // 清空之前的提示
        hideMessage();

        // 1. 获取并校验输入值
        const teacherId = teacherIdInput.value.trim();
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();

        // 教师ID校验
        if (!teacherId) {
            showMessage('请输入教师ID');
            return;
        }
        // 姓名校验
        if (!name) {
            showMessage('请输入姓名');
            return;
        }
        // 邮箱格式校验
        if (!emailReg.test(email)) {
            showMessage('请输入合法的邮箱地址');
            return;
        }

        // 2. 切换为加载状态
        submitBtn.disabled = true;
        btnText.textContent = '登录中';
        loadingIcon.style.display = 'inline-block';

        // 3. 构造模拟请求体
        const requestBody = {
            teacherId: teacherId,
            name: name,
            email: email,
            loginTime: new Date().toLocaleString() // 模拟登录时间
        };
        console.log('模拟登录请求体:', requestBody);

        // 4. 模拟异步请求（1.2秒延迟，模拟接口响应）
        setTimeout(() => {
            // 模拟登录成功条件：可自定义（示例：教师ID以T开头、姓名非空、邮箱含学校域名）
            const isLoginSuccess = teacherId.startsWith('T') && name && email.includes('@college.edu.cn');
            
            if (isLoginSuccess) {
                // 登录成功 - 跳转到教师首页
                showMessage('登录成功，即将跳转...', true);
                // 延迟跳转（让用户看到成功提示）
                setTimeout(() => {
                    window.location.href = '../teacher/teacher-index.html'; // 路径根据实际文件层级调整
                }, 800);
            } else {
                // 登录失败 - 恢复按钮状态并提示
                showMessage('登录失败：教师ID/姓名/邮箱不匹配');
                submitBtn.disabled = false;
                btnText.textContent = '登录系统';
                loadingIcon.style.display = 'none';
            }
        }, 1200);
    });

    // 监听重置按钮（表单reset事件）
    loginForm.addEventListener('reset', function() {
        // 重置后清空提示框
        hideMessage();
        // 恢复登录按钮初始状态（防止重置时按钮仍处于加载态）
        submitBtn.disabled = false;
        btnText.textContent = '登录系统';
        loadingIcon.style.display = 'none';
        // 重置输入框焦点（可选）
        setTimeout(() => {
            teacherIdInput.focus();
        }, 100);
    });
});