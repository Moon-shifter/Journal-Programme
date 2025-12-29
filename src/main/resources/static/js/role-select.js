// ================== 角色选择页专属JS ==================
// 页面加载完成后绑定事件
window.addEventListener("load", () => {
    bindRoleCardEvents();
});

/**
 * 绑定角色卡片点击事件（卡片和按钮均可触发跳转）
 */
function bindRoleCardEvents() {
    // 管理员角色跳转
    const adminRole = document.getElementById("admin-role");
    const adminBtn = adminRole.querySelector(".btn-primary");
    
    // 卡片点击跳转
    adminRole.addEventListener("click", () => {
        jumpToAdminLogin();
    });
    // 按钮点击跳转（阻止事件冒泡，避免重复触发）
    adminBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        jumpToAdminLogin();
    });

    // 教师角色跳转
    const teacherRole = document.getElementById("teacher-role");
    const teacherBtn = teacherRole.querySelector(".btn-primary");
    
    // 卡片点击跳转
    teacherRole.addEventListener("click", () => {
        jumpToTeacherLogin();
    });
    // 按钮点击跳转（阻止事件冒泡，避免重复触发）
    teacherBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        jumpToTeacherLogin();
    });
}

/**
 * 跳转到管理员登录页
 */
function jumpToAdminLogin() {
   window.location.href = "admin/admin-login.html";
}

/**
 * 跳转到教师登录/注册页
 */
function jumpToTeacherLogin() {
     window.location.href = "teacher/teacher-login.html";
   
}