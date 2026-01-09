// ==================== 报表导出功能实现 ====================

// API路径配置
const REPORT_API_PATHS = {
    EXPORT_OVERDUE: '/api/report/export/overdue',
    EXPORT_BORROW: '/api/report/export/borrow'
};

// 页面元素加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化侧边栏导航
    initSidebarNavigation();
    
    // 加载管理员信息
    loadAdminInfo();
    
    // 绑定导出按钮事件
    bindExportButtons();
});

// ==================== 初始化侧边栏导航 ====================
function initSidebarNavigation() {
    // 1. 侧边栏折叠/展开功能
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');

    if (sidebarToggle && sidebar && mainContent) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('sidebar-collapsed');
        });
    }

    // 2. 侧边栏菜单激活态（匹配当前页面URL）
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.sidebar .nav-link');

    navLinks.forEach(link => {
        // 匹配链接的href（如admin-reports.html）与当前路径
        const linkHref = link.getAttribute('href');
        if (currentPath.endsWith(linkHref)) {
            link.classList.add('active');
        }
    });
}

// ==================== 加载管理员信息 ====================
async function loadAdminInfo() {
    try {
        // 1. 优先从本地存储读取登录后的管理员信息
        const storedUser = localStorage.getItem("adminUserInfo");
        if (storedUser) {
            const currentUser = JSON.parse(storedUser);
            bindUserInfo(currentUser);
            return; // 读取到则直接返回，无需调用接口
        }

        // 2. 若本地无存储，调用后端管理员当前信息接口
        const currentUser = await api.get('/admin/user/current');
        bindUserInfo(currentUser);
    } catch (error) {
        console.error('管理员信息加载失败:', error);
        // 失败时显示默认信息
        bindUserInfo({
            name: "管理员",
            initial: "管"
        });
    }
}

function bindUserInfo(currentUser) {
    // 兜底：防止字段为空
    const userName = currentUser.name || '管理员';
    // 姓名显示
    document.querySelector('.user-info span').textContent = `管理员：${userName}`;

    // 头像首字母（优先用返回的initial，否则取name首字符）
    const initial = currentUser.initial || userName.charAt(0);
    const avatarEl = document.querySelector('.user-avatar');
    if (avatarEl) avatarEl.textContent = initial;
}

// ==================== 绑定导出按钮事件 ====================
function bindExportButtons() {
    // 逾期催还单导出
    const exportOverdueBtn = document.getElementById('exportOverdueBtn');
    if (exportOverdueBtn) {
        exportOverdueBtn.addEventListener('click', exportOverdueReport);
    }
    
    // 借阅信息表导出
    const exportBorrowBtn = document.getElementById('exportBorrowBtn');
    if (exportBorrowBtn) {
        exportBorrowBtn.addEventListener('click', exportBorrowReport);
    }
}

// ==================== 导出逾期催还单 ====================
async function exportOverdueReport() {
    try {
        // 调用后端导出接口
        const response = await axios({
            url: REPORT_API_PATHS.EXPORT_OVERDUE,
            method: 'GET',
            responseType: 'blob' // 重要：指定响应类型为blob
        });
        
        // 创建下载链接并触发下载
        downloadExcelFile(response.data, '逾期催还单.xlsx');
    } catch (error) {
        console.error('导出逾期催还单失败:', error);
        alert('导出失败，请重试！');
    }
}

// ==================== 导出借阅信息表 ====================
async function exportBorrowReport() {
    try {
        // 调用后端导出接口
        const response = await axios({
            url: REPORT_API_PATHS.EXPORT_BORROW,
            method: 'GET',
            responseType: 'blob' // 重要：指定响应类型为blob
        });
        
        // 创建下载链接并触发下载
        downloadExcelFile(response.data, '借阅信息表.xlsx');
    } catch (error) {
        console.error('导出借阅信息表失败:', error);
        alert('导出失败，请重试！');
    }
}

// ==================== 下载Excel文件 ====================
function downloadExcelFile(blobData, fileName) {
    // 创建Blob对象
    const blob = new Blob([blobData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // 创建下载链接
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    
    // 触发下载
    document.body.appendChild(a);
    a.click();
    
    // 清理
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}