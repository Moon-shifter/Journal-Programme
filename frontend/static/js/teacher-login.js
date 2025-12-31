// 教师登录核心逻辑 - teacher-login.js
document.addEventListener("DOMContentLoaded", () => {
    // 元素获取
    const loginForm = document.getElementById("loginForm");
    const submitBtn = document.getElementById("submitBtn");
    const btnText = document.getElementById("btnText");
    const loadingIcon = submitBtn.querySelector(".loading");
    const messageEl = document.getElementById("message");

    // 表单提交事件
    submitBtn.addEventListener("click", async () => {
        try {
            // 1. 获取并校验表单数据
            const teacherId = document.getElementById("teacherId").value.trim();
            const name = document.getElementById("name").value.trim();
            const email = document.getElementById("email").value.trim();

            // 非空校验
            if (!teacherId) {
                api.showMessage("请输入教师ID", "error");
                return;
            }
            if (!name) {
                api.showMessage("请输入姓名", "error");
                return;
            }
            if (!email) {
                api.showMessage("请输入邮箱", "error");
                return;
            }
            // 邮箱格式校验
            const emailReg = /^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
            if (!emailReg.test(email)) {
                api.showMessage("请输入有效的邮箱地址", "error");
                return;
            }

            // 2. 显示加载状态
            submitBtn.disabled = true;
            btnText.textContent = "登录中...";
            loadingIcon.style.display = "inline-block";
            messageEl.style.display = "none"; // 清空之前的提示

            // 3. 发起登录请求（接口地址根据实际后端调整）
            const loginData = {
                teacherId: teacherId,
                name: name,
                email: email
            };
            // 登录接口：POST /api/teacher/login（可根据实际接口调整）
            const userInfo = await api.post("/api/teacher/login", loginData);

            // 4. 登录成功处理
            api.showMessage("登录成功，即将跳转...", "success");
            console.log("登录成功，用户信息：", userInfo);
            
            // 存储用户信息到本地
            localStorage.setItem("teacherInfo", JSON.stringify(userInfo));
            
            // 延迟跳转（体验更友好）
            setTimeout(() => {
                window.location.href = "/teacher/index.html"; // 替换为实际教师首页地址
            }, 1500);

        } catch (error) {
            // 5. 登录失败处理
            console.error("登录失败：", error.message);
            api.showMessage(error.message, "error");

        } finally {
            // 6. 恢复按钮状态
            submitBtn.disabled = false;
            btnText.textContent = "登录系统";
            loadingIcon.style.display = "none";
        }
    });

    // 重置按钮清空提示
    const resetBtn = loginForm.querySelector(".btn-secondary");
    resetBtn.addEventListener("click", () => {
        messageEl.style.display = "none";
    });
});