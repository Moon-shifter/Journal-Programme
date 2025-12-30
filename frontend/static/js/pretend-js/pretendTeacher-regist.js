// 等待DOM完全加载
document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const registerForm = document.getElementById('teacherRegisterForm');
    const submitBtn = registerForm.querySelector('.btn-primary');
    const resetBtn = registerForm.querySelector('.btn-secondary');
    const registerMessage = document.getElementById('registerMessage');

    // 正则校验规则
    const regRules = {
        teacherId: /^[a-zA-Z0-9]{6,12}$/, // 教师ID：6-12位数字/字母
        phone: /^1[3-9]\d{9}$/, // 手机号：11位国内手机号
        email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/ // 邮箱格式
    };

    // 显示消息提示（支持错误/成功样式）
    function showMessage(text, isSuccess = false) {
        registerMessage.textContent = text;
        registerMessage.style.display = 'block';
        // 切换提示样式（需配合CSS，若已有样式可直接用）
        registerMessage.className = `message ${isSuccess ? 'success' : 'error'}`;
    }

    // 清空消息提示
    function clearMessage() {
        registerMessage.textContent = '';
        registerMessage.style.display = 'none';
        registerMessage.className = 'message';
    }

    // 表单提交事件（注册逻辑）
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault(); // 阻止表单默认提交
        clearMessage();

        // 1. 获取表单字段值
        const formData = {
            name: registerForm.name.value.trim(),
            teacherId: registerForm.teacherId.value.trim(),
            email: registerForm.email.value.trim(),
            phone: registerForm.phone.value.trim(),
            department: registerForm.department.value
        };

        // 2. 数据校验
        let isValidatePass = true;
        if (!formData.name) {
            showMessage('请输入真实姓名');
            isValidatePass = false;
        } else if (!regRules.teacherId.test(formData.teacherId)) {
            showMessage('教师ID需为6-12位数字/字母组合');
            isValidatePass = false;
        } else if (!regRules.email.test(formData.email)) {
            showMessage('请输入合法的电子邮箱');
            isValidatePass = false;
        } else if (!regRules.phone.test(formData.phone)) {
            showMessage('请输入正确的11位手机号码');
            isValidatePass = false;
        } else if (!formData.department) {
            showMessage('请选择所属部门');
            isValidatePass = false;
        }

        // 校验不通过则终止
        if (!isValidatePass) return;

        // 3. 模拟请求加载状态
        submitBtn.disabled = true;
        submitBtn.textContent = '提交中...';

        // 4. 模拟注册请求体
        console.log('模拟注册请求体:', formData);

        // 5. 模拟异步请求（1.5秒延迟）
        setTimeout(() => {
            // 模拟注册成功（实际项目替换为真实接口调用）
            showMessage('注册成功！即将跳转到登录页...', true);
            
            // 延迟跳转（让用户看到成功提示）
            setTimeout(() => {
                window.location.href = 'teacher-login.html'; // 跳转到教师登录页（同目录）
            }, 1200);
        }, 1500);
    });

    // 重置按钮事件
    resetBtn.addEventListener('click', function() {
        // 重置表单后清空提示
        setTimeout(clearMessage, 100); // 延迟清空（等待表单重置完成）
        // 恢复提交按钮状态
        submitBtn.disabled = false;
        submitBtn.textContent = '提交注册';
    });
});