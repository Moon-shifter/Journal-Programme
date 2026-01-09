// ==================== 真实后端对接版本（无Token验证） ====================

// 页面元素加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化侧边栏导航（补充实现）
    initSidebarNavigation();

    // 加载初始数据
    loadDashboardData();

    // 每30秒刷新一次数据
    setInterval(loadDashboardData, 30000);
});

// ==================== 补充：侧边栏导航初始化函数 ====================
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
        // 匹配链接的href（如admin-dashboard.html）与当前路径
        const linkHref = link.getAttribute('href');
        if (currentPath.endsWith(linkHref)) {
            link.classList.add('active');
            // 展开父级菜单（如果有）
            const parentMenu = link.closest('.nav-submenu');
            if (parentMenu) {
                parentMenu.classList.add('show');
                const parentLink = parentMenu.previousElementSibling;
                if (parentLink) parentLink.classList.add('active');
            }
        }

        // 3. 子菜单折叠/展开
        link.addEventListener('click', function(e) {
            const submenu = this.nextElementSibling;
            if (submenu && submenu.classList.contains('nav-submenu')) {
                e.preventDefault();
                submenu.classList.toggle('show');
            }
        });
    });
}

// ==================== 数据加载主函数 ====================
async function loadDashboardData() {
    try {
        // 同时加载所有数据（并行请求提高效率）
        await Promise.all([
            loadStatisticsData(),
            loadDepartmentData(),
            loadOverdueData(),
            loadAdminInfo()
        ]);
        console.log('仪表盘数据加载完成');
    } catch (error) {
        console.error('数据加载失败:', error);
        alert('数据加载失败，请检查网络连接或联系管理员！');
    }
}

// ==================== 1. 统计数据加载 ====================
async function loadStatisticsData() {
    try {
        // 调用后端统计数据接口（路径已匹配baseURL: /api + /admin/statistics/summary）
        const statistics = await api.get('/admin/statistics/summary');

        // 绑定到UI（复用原有函数，字段已匹配后端返回）
        bindStatisticsData(statistics);
    } catch (error) {
        console.error('统计数据加载失败:', error);
        alert('加载统计数据失败，请刷新页面重试！');
    }
}

function bindStatisticsData(statistics) {
    const statsContainer = document.getElementById('statsContainer');
    statsContainer.innerHTML = '';

    // 兜底：防止后端返回null/undefined导致报错
    const safeStats = statistics || { totalJournals: 0, totalTeachers: 0, overdueItems: 0 };

    const statsConfig = [
        {
            value: safeStats.totalJournals,
            label: "期刊总数",
            icon: "fa-book",
            color: "primary"
        },
        {
            value: safeStats.totalTeachers,
            label: "教师总数",
            icon: "fa-users",
            color: "success"
        },
        {
            value: safeStats.overdueItems,
            label: "超期未还",
            icon: "fa-exclamation-triangle",
            color: "danger"
        }
    ];

    statsConfig.forEach(stat => {
        const colDiv = document.createElement('div');
        colDiv.className = 'col-md-4 col-sm-6 mb-4';
        colDiv.innerHTML = `
            <div class="stat-card">
                <div class="card-icon ${stat.color}">
                    <i class="fas ${stat.icon} fa-lg"></i>
                </div>
                <div class="card-value">${stat.value}</div>
                <div class="card-label">${stat.label}</div>
            </div>
        `;
        statsContainer.appendChild(colDiv);
    });
}

// ==================== 2. 系部教师数据加载 ====================
async function loadDepartmentData() {
    try {
        // 调用后端系部教师统计接口
        const departmentTeachers = await api.get('/admin/statistics/department-teachers');

        // 绑定到图表
        bindDepartmentChart(departmentTeachers);
    } catch (error) {
        console.error('系部教师数据加载失败:', error);
        alert('加载系部统计数据失败，请刷新页面重试！');
    }
}

function bindDepartmentChart(departmentTeachers) {
    const chartContainer = document.getElementById('departmentChart');
    chartContainer.innerHTML = '';

    // 兜底处理空数据
    if (!departmentTeachers || !Array.isArray(departmentTeachers) || departmentTeachers.length === 0) {
        chartContainer.innerHTML = '<p class="text-center text-muted">暂无数据</p>';
        return;
    }

    // 获取最大值用于计算百分比高度
    const maxCount = Math.max(...departmentTeachers.map(item => item.count || 0));

    // 生成柱状图
    departmentTeachers.forEach(dept => {
        const heightPercentage = maxCount > 0 ? (dept.count / maxCount) * 100 : 0;
        const bar = document.createElement('div');
        bar.className = 'chart-bar';
        bar.style.height = `${heightPercentage}%`;
        bar.innerHTML = `
            <span class="chart-bar-value">${dept.count || 0}</span>
            <span class="chart-bar-label">${dept.name || '未知系部'}</span>
        `;
        chartContainer.appendChild(bar);
    });
}

// ==================== 3. 超期借阅数据加载（核心校准） ====================
async function loadOverdueData() {
    try {
        // 修复：直接传递pageNum/pageSize参数，不嵌套在params对象中
        const overdueRes = await api.get('/borrow/admin/overdue/list', {
            pageNum: 1,  // 默认第一页
            pageSize: 10 // 默认每页10条
        });

        const overdueRecords = overdueRes.data || [];
        bindOverdueRecords(overdueRecords);
    } catch (error) {
        console.error('超期借阅数据加载失败：', error);
        alert('加载超期借阅数据失败，请刷新页面重试！');
    }
}

function bindOverdueRecords(overdueRecords) {
    const tableBody = document.getElementById('overdueRecordsTable');
    tableBody.innerHTML = '';

    if (!overdueRecords || overdueRecords.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">暂无超期记录</td></tr>';
        return;
    }


    // 生成表格行（字段校准：匹配后端BorrowDTO）
    overdueRecords.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.borrowerId || '-'}</td>
            <td>${record.borrowerName || '-'}</td>
            <td>${record.borrowerDepartment || '-'}</td>
            <td>${record.journalName || '-'}</td>
            <td>${record.daysOverdue || 0}天</td>
            <td><span class="badge-status badge-overdue">超期</span></td>
        `;
        tableBody.appendChild(row);
    });
}

// ==================== 4. 管理员信息加载 ====================
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



// ==================== 退出登录处理 ====================
document.addEventListener('DOMContentLoaded', function() {
    const logoutLink = document.querySelector('.nav-link[href="admin-login.html"]');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            // 添加退出确认
            if (!confirm('确定要退出登录吗？')) {
                e.preventDefault();
                return;
            }
            // 退出时清除本地存储的管理员信息
            localStorage.removeItem("adminUserInfo");
        });
    }
});