// ==================== 真实后端对接版本（无Token验证） ====================

// 页面元素加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化侧边栏导航
    initSidebarNavigation();
    
    // 加载初始数据
    loadDashboardData();
    
    // 每30秒刷新一次数据
    setInterval(loadDashboardData, 30000);
});

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
        // 调用后端统计数据接口
        const statistics = await api.get('/statistics/summary');
        
        // 绑定到UI（复用原有函数）
        bindStatisticsData(statistics);
    } catch (error) {
        console.error('统计数据加载失败:', error);
        alert('加载统计数据失败，请刷新页面重试！');
    }
}

function bindStatisticsData(statistics) {
    const statsContainer = document.getElementById('statsContainer');
    statsContainer.innerHTML = '';
    
    const statsConfig = [
        { 
            value: statistics.totalJournals, 
            label: "期刊总数", 
            icon: "fa-book", 
            color: "primary" 
        },
        { 
            value: statistics.totalTeachers, 
            label: "教师总数", 
            icon: "fa-users", 
            color: "success" 
        },
        { 
            value: statistics.overdueItems, 
            label: "超期未还", 
            icon: "fa-exclamation-triangle", 
            color: "danger" 
        }
    ];
    
    statsConfig.forEach(stat => {
        const colDiv = document.createElement('div');
        colDiv.className = 'col-md-4 col-sm-6 mb-4'; // 修改为col-md-4保持3列布局
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
        const departmentTeachers = await api.get('/statistics/department-teachers');
        
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
    
    if (!departmentTeachers || departmentTeachers.length === 0) {
        chartContainer.innerHTML = '<p class="text-center text-muted">暂无数据</p>';
        return;
    }
    
    // 获取最大值用于计算百分比高度
    const maxCount = Math.max(...departmentTeachers.map(item => item.count));
    
    // 生成柱状图
    departmentTeachers.forEach(dept => {
        const heightPercentage = maxCount > 0 ? (dept.count / maxCount) * 100 : 0;
        const bar = document.createElement('div');
        bar.className = 'chart-bar';
        bar.style.height = `${heightPercentage}%`;
        bar.innerHTML = `
            <span class="chart-bar-value">${dept.count}</span>
            <span class="chart-bar-label">${dept.name}</span>
        `;
        chartContainer.appendChild(bar);
    });
}

// ==================== 3. 超期借阅数据加载 ====================
async function loadOverdueData() {
    try {
        // 调用后端超期借阅接口
        const overdueRecords = await api.get('/borrow/overdue');
        
        // 绑定到表格
        bindOverdueRecords(overdueRecords);
    } catch (error) {
        console.error('超期借阅数据加载失败:', error);
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
    
    // 生成表格行
    overdueRecords.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.teacherId}</td>
            <td>${record.name}</td>
            <td>${record.department}</td>
            <td>${record.journal}</td>
            <td>${record.daysOverdue}天</td>
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

        // 2. 若本地无存储（如未登录或存储失效），再调用接口
        const currentUser = await api.get('/user/current');
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
    // 姓名显示
    document.querySelector('.user-info span').textContent = `管理员：${currentUser.name}`;
    
    // 头像首字母（优先用返回的initial，否则取name首字符）
    const initial = currentUser.initial || currentUser.name.charAt(0);
    document.querySelector('.user-avatar').textContent = initial;
}



// ==================== 退出登录处理 ====================
document.addEventListener('DOMContentLoaded', function() {
    const logoutLink = document.querySelector('.nav-link[href="admin-login.html"]');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            // 添加退出确认
            if (!confirm('确定要退出登录吗？')) {
                e.preventDefault();
            }
        });
    }
});