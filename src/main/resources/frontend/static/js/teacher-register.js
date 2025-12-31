// 等待DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 获取表单元素和消息提示元素
    const registerForm = document.getElementById('teacherRegisterForm');
    const registerMessage = document.getElementById('registerMessage');

    // 为表单添加提交事件监听
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault(); // 阻止表单默认提交行为

        // 获取表单数据
        const formData = {
            id: document.querySelector('input[name="teacherId"]').value.trim(),
            name: document.querySelector('input[name="name"]').value.trim(),
            department: document.querySelector('select[name="department"]').value.trim(),
            email: document.querySelector('input[name="email"]').value.trim(),
            phone: document.querySelector('input[name="phone"]').value.trim()
        };

        // 前端表单验证
        if (!validateForm(formData)) {
            return;
        }

        // 发送注册请求
        registerTeacher(formData);
    });

    /**
     * 表单验证函数
     * @param {Object} data - 表单数据对象
     * @returns {boolean} - 验证是否通过
     */
    function validateForm(data) {
        // 姓名验证
        if (!data.name) {
            showMessage('请输入真实姓名', 'error');
            return false;
        }

        // 教师ID验证 (6-12位数字/字母组合)
        if (!data.id || !/^[A-Za-z0-9]{6,12}$/.test(data.id)) {
            showMessage('教师ID必须是6-12位数字/字母组合', 'error');
            return false;
        }

        // 邮箱验证
        if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            showMessage('请输入有效的电子邮箱', 'error');
            return false;
        }

        // 手机号验证
        if (!data.phone || !/^1[3-9]\d{9}$/.test(data.phone)) {
            showMessage('请输入有效的手机号码', 'error');
            return false;
        }

        // 部门验证
        if (!data.department) {
            showMessage('请选择所属部门', 'error');
            return false;
        }

        return true;
    }

    /**
     * 发送教师注册请求（核心修正）
     * @param {Object} teacherData - 教师注册信息
     */
    function registerTeacher(teacherData) {
        // 调试日志：打印请求数据和地址
        console.log("注册请求数据：", teacherData);
        console.log("最终请求地址：", requestInstance.defaults.baseURL + "/auth/teacher/register");

        // 使用配置好的requestInstance（带baseURL）发送请求
        requestInstance.post('/auth/teacher/register', teacherData)
            .then(response => {
                    showMessage('注册成功，即将跳转到登录页...', 'success');
                    setTimeout(() => {
                        window.location.href = '../../pages/teacher/teacher-login.html';
                    }, 3000);
            })
            .catch(error => {
                // 打印完整错误信息（调试关键）
                console.error("注册请求异常：", error);
                console.error("请求URL：", error.config?.url);
                console.error("响应状态码：", error.response?.status);
                console.error("响应内容：", error.response?.data);

                // 按错误类型提示
                let errorMsg = "注册失败，请稍后重试";
                if (error.response?.status === 404) {
                    errorMsg = "注册接口不存在（路径错误），请检查后端接口";
                } else if (error.response?.status === 500) {
                    errorMsg = "服务器内部错误，请联系管理员";
                } else if (error.response?.data?.message) {
                    errorMsg = error.response.data.message;
                }
                showMessage(errorMsg, 'error');
            });
    }

    /**
     * 显示消息提示（确保样式可见）
     * @param {string} text - 消息内容
     * @param {string} type - 消息类型 (success/error)
     */
    function showMessage(text, type) {
        registerMessage.textContent = text;
        registerMessage.style.display = 'block'; // 强制显示提示
        registerMessage.className = 'message'; // 重置样式
        registerMessage.classList.add(type); // 添加类型样式
        // 错误提示5秒后隐藏，成功提示不自动隐藏（等待跳转）
        if (type === 'error') {
            setTimeout(() => {
                registerMessage.style.display = 'none';
            }, 5000);
        }
    }
});