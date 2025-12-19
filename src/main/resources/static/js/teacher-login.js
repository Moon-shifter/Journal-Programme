// ================== 教师登录页专属Vue逻辑 ==================
new Vue({
    el: "#app",
    data: {
        activeForm: 'login',
        currentYear: new Date().getFullYear(),
        departmentList: [
            '教务处/教学办',
            '学生工作办公室',
            '团委',
            '党委办公室',
            '科研办',
            '研究生办公室',
            '院级学生会',
            '其他部门'
        ],
        loginForm: {
            id: '',
            name: '',
            phone: '',
            source: 'TEACHER_LOGIN',
        },
        registerForm: {
           
            name: '',
            department: '',
            email: '',
            phone: '',
            source: 'TEACHER_REGISTER',
        },
    },
    mounted() {
        // 复用全局公共JS的getCookie函数
        const teacherId = getCookie("teacher_id");
        const name = getCookie("NAME");
        if (teacherId) this.loginForm.id = teacherId;
        if (name) this.loginForm.name = name;
    },
    methods: {
        // 切换登录/注册表单
        switchForm(form) {
            this.activeForm = form;
        },

        // 登录逻辑
       async login() {
            // 验证表单完整性
            for (let key in this.loginForm) {
                if (this.loginForm[key] === '') {
                    alert("请完整填写登录信息");
                    return;
                }
            }

            try {
                // 使用axios发送JSON格式请求
                const response = await axios.post(
                    '/auth/teacher/login', // 后端接口
                    this.loginForm // 直接传对象，axios会自动序列化为JSON（依赖common.js的拦截器）
                );
                const data = response.data;
                if (response.code==200) {
                    // 保存Cookie
                    setCookie("teacher_id", this.loginForm.id, 1);
                    setCookie("NAME", this.loginForm.name, 1);
                    setCookie("phone", this.loginForm.phone, 1);

                    alert("登录成功!正在跳转...");
                    setTimeout(() => {
                        jumpTo("../teacher/index.html"); // 跳转教师首页
                    }, 1500);
                } else {
                    alert("用户名或信息错误，请重试！");
                }
            } catch (error) {
                console.error("登录请求出错：", error);
                alert("登录请求出错，请稍后重试。");
            }
        },


        // 注册逻辑
        async register() {
            // 验证表单完整性
            for (let key in this.registerForm) {
                if (this.registerForm[key] === '') {
                    alert("请完整填写注册信息");
                    return;
                }
            }

            await axios.post('/auth/teacher/register', new URLSearchParams(this.registerForm))//改
                .then(response => {
                    const data = response.data;
                    if (data.success) {
                        alert("注册成功！请返回登录页面进行登录。");
                        this.registerForm = {
                            id: '',
                            name: '',
                            department: '',
                            email: '',
                            phone: '',
                            source: 'TEACHER_REGISTER',
                        };
                        this.switchForm('login');
                    } else {
                        alert("注册失败：" + data.message);
                    }
                })
                .catch(error => {
                    console.error("注册请求出错：", error);
                    alert("注册请求出错，请稍后重试。");
                });
        },
    }
});