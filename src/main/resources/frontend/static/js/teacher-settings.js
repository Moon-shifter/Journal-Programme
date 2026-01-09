// teacher-settings.js
// 教师个人设置页面逻辑

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initSidebarToggle();
    
    // 核心修正：按优先级加载，先校验登录状态
    const userId = getCurrentUserId();
    if (!userId) {
        handleNotLogin();
        return;
    }
    
    // 加载用户信息到表单
    loadUserInfo();
    
    // 绑定表单事件
    bindFormEvents();
});

// 初始化侧边栏切换功能（与主页相同）
function initSidebarToggle() {
    const toggleBtn = document.getElementById('toggleSidebar');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');

    if (!toggleBtn || !sidebar || !mainContent) return;

    let isToggling = false;
    toggleBtn.addEventListener('click', function() {
        if (isToggling) return;
        isToggling = true;
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('sidebar-collapsed');
        // 防抖：避免快速点击
        setTimeout(() => {
            isToggling = false;
        }, 300);
    });
}

// 工具函数：从Cookie获取当前登录教师ID
function getCurrentUserId() {
    try {
        // 从Cookie读取用户ID
        const id = getCookie('id');
        if (!id) return null;
        return id.toString(); // 统一转为字符串，避免类型问题
    } catch (err) {
        console.error('获取用户ID失败:', err);
        return null;
    }
}

// 工具函数：从Cookie获取当前登录教师信息
function getCurrentUserInfo() {
    try {
        // 从Cookie读取用户信息
        const id = getCookie('id');
        const name = getCookie('name');
        const email = getCookie('email');
        
        if (!id) return null;
        
        return {
            id,
            name: name || '',
            email: email || ''
        };
    } catch (err) {
        console.error('获取用户信息失败:', err);
        return null;
    }
}

// 处理未登录状态
function handleNotLogin() {
    const userInfoElem = document.querySelector('.user-info span');
    if (userInfoElem) {
        userInfoElem.textContent = '未登录';
    }
    // 显示登录提示
    showGlobalError('请先登录后再操作', true);
    // 3秒后跳转登录页
    setTimeout(() => {
        window.location.href = '../teacher/teacher-login.html';
    }, 3000);
}

// 加载用户信息到表单
async function loadUserInfo() {
    const userId = getCurrentUserId();
    if (!userId) return;

    const userInfo = getCurrentUserInfo();
    const userInfoElem = document.querySelector('.user-info span');
    const userAvatarElem = document.querySelector('.user-avatar');

    // 更新顶部导航用户信息
    if (userInfoElem) {
        userInfoElem.textContent = `教师：${userInfo.name || '未知'}`;
    }
    if (userAvatarElem) {
        userAvatarElem.textContent = userInfo.name.charAt(0) || '师';
    }

    try {
        // 调用用户信息接口获取详细信息
        const data = await api.get('/teacher/info', { id: userId });
        
        // 填充表单数据
        document.getElementById('teacherName').value = data.name || userInfo.name || '';
        document.getElementById('teacherEmail').value = data.email || userInfo.email || '';
        document.getElementById('teacherPhone').value = data.phone || '';
        document.getElementById('teacherDepartment').value = data.department || '';
        document.getElementById('teacherTitle').value = data.title || '';
    } catch (err) {
        console.error('加载用户信息失败:', err);
        // 使用Cookie中的基本信息
        document.getElementById('teacherName').value = userInfo.name || '';
        document.getElementById('teacherEmail').value = userInfo.email || '';
    }
}

// 绑定表单事件
function bindFormEvents() {
    // 个人信息表单提交
    const personalInfoForm = document.getElementById('personalInfoForm');
    if (personalInfoForm) {
        personalInfoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            savePersonalInfo();
        });
    }
    
    // 密码修改表单提交
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            changePassword();
        });
    }
}

// 保存个人信息
async function savePersonalInfo() {
    const userId = getCurrentUserId();
    if (!userId) return;

    // 获取表单数据
    const formData = {
        id: userId,
        name: document.getElementById('teacherName').value.trim(),
        email: document.getElementById('teacherEmail').value.trim(),
        phone: document.getElementById('teacherPhone').value.trim(),
        department: document.getElementById('teacherDepartment').value.trim(),
        title: document.getElementById('teacherTitle').value.trim()
    };

    // 表单验证
    if (!formData.name) {
        showGlobalError('请输入姓名');
        return;
    }

    if (!formData.email) {
        showGlobalError('请输入邮箱');
        return;
    }

    // 显示加载状态
    const submitBtn = personalInfoForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 保存中...';
    submitBtn.disabled = true;

    try {
        // 调用保存接口
        const result = await api.post('/teacher/update', formData);
        
        if (result.name) {
            showGlobalSuccess('个人信息保存成功');
            // 更新Cookie中的用户信息
            setCookie('name', formData.name, 7);
            setCookie('email', formData.email, 7);
            // 更新顶部导航用户信息
            const userInfoElem = document.querySelector('.user-info span');
            if (userInfoElem) {
                userInfoElem.textContent = `教师：${formData.name}`;
            }
            const userAvatarElem = document.querySelector('.user-avatar');
            if (userAvatarElem) {
                userAvatarElem.textContent = formData.name.charAt(0);
            }
        } else {
            showGlobalError(result.message || '保存失败，请重试');
        }
    } catch (err) {
        console.error('保存个人信息失败:', err);
        showGlobalError('保存失败：' + err.message);
    } finally {
        // 恢复按钮状态
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// 修改密码
async function changePassword() {
    const userId = getCurrentUserId();
    if (!userId) return;

    // 获取表单数据
    const currentPassword = document.getElementById('currentPassword').value.trim();
    const newPassword = document.getElementById('newPassword').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();

    // 表单验证
    if (!currentPassword) {
        showGlobalError('请输入当前密码');
        return;
    }

    if (!newPassword) {
        showGlobalError('请输入新密码');
        return;
    }

    if (newPassword.length < 6) {
        showGlobalError('新密码长度不能少于6位');
        return;
    }

    if (newPassword !== confirmPassword) {
        showGlobalError('两次输入的新密码不一致');
        return;
    }

    // 显示加载状态
    const submitBtn = passwordForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 修改中...';
    submitBtn.disabled = true;

    try {
        // 调用密码修改接口
        const result = await api.post('/teacher/change-password', {
            id: userId,
            currentPassword: currentPassword,
            newPassword: newPassword
        });
        
        if (result.success) {
            showGlobalSuccess('密码修改成功，请重新登录');
            // 清空密码表单
            document.getElementById('passwordForm').reset();
            // 3秒后跳转登录页
            setTimeout(() => {
                window.location.href = '../teacher/teacher-login.html';
            }, 3000);
        } else {
            showGlobalError(result.message || '密码修改失败，请重试');
        }
    } catch (err) {
        console.error('修改密码失败:', err);
        showGlobalError('修改失败：' + err.message);
    } finally {
        // 恢复按钮状态
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// 全局提示工具（与主页相同）
function showGlobalError(message, isLoginTip = false) {
    const errorElem = document.createElement('div');
    errorElem.className = 'global-alert alert alert-danger fixed-top m-3';
    errorElem.style.zIndex = '9999';
    errorElem.innerHTML = `<i class="fas fa-exclamation-circle me-2"></i>${message}`;
    if (isLoginTip) {
        errorElem.innerHTML += '<br><small>3秒后将跳转到登录页</small>';
    }
    document.body.appendChild(errorElem);
    // 3秒后自动关闭
    setTimeout(() => {
        errorElem.classList.add('fade-out');
        setTimeout(() => {
            document.body.removeChild(errorElem);
        }, 500);
    }, isLoginTip ? 3000 : 5000);
}

function showGlobalSuccess(message) {
    const successElem = document.createElement('div');
    successElem.className = 'global-alert alert alert-success fixed-top m-3';
    successElem.style.zIndex = '9999';
    successElem.innerHTML = `<i class="fas fa-check-circle me-2"></i>${message}`;
    document.body.appendChild(successElem);
    // 2秒后自动关闭
    setTimeout(() => {
        successElem.classList.add('fade-out');
        setTimeout(() => {
            document.body.removeChild(successElem);
        }, 500);
    }, 2000);
}