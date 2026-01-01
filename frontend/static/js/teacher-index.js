// teacher-index.js
// 教师主页数据交互逻辑（适配localStorage存储用户信息）

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initSidebarToggle();
    loadUserInfo();
    loadStatisticData();
    loadBorrowList();
  
});

// 初始化侧边栏切换功能（保持不变）
function initSidebarToggle() {
    const toggleBtn = document.getElementById('toggleSidebar');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    
    toggleBtn.addEventListener('click', function() {
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('sidebar-collapsed');
    });
}

// 工具函数：从localStorage获取当前登录教师ID
function getCurrentUserId() {
    try {
        // 从localStorage读取存储的用户信息
        const teacherInfoStr = localStorage.getItem("teacherInfo");
        if (!teacherInfoStr) return null;
        
        // 解析JSON（处理可能的格式错误）
        const teacherInfo = JSON.parse(teacherInfoStr);
        // 假设用户信息中包含id字段作为用户唯一标识
        return teacherInfo.id || null;
    } catch (err) {
        console.error('解析用户信息失败:', err);
        return null;
    }
}

// 加载用户信息（顶部导航）
function loadUserInfo() {
    // 从localStorage获取用户ID
    const userId = getCurrentUserId();
    if (!userId) {
        // 未登录，跳转到登录页
      // window.location.href = '../teacher/teacher-login.html';
        return;
    }
    
    // 调用用户信息接口（使用localStorage中的userId）
    api.get('/teacher/info', { id: userId })
        .then(data => {
            const userInfoElem = document.querySelector('.user-info span');
            const userAvatarElem = document.querySelector('.user-avatar');
            
            if (userInfoElem && userAvatarElem) {
                userInfoElem.textContent = `教师：${data.name}`;
                userAvatarElem.textContent = data.name.charAt(0);
            }
        })
        .catch(err => {
            console.error('加载用户信息失败:', err);
        });
}

// 加载统计数据（中间数据卡片）
function loadStatisticData() {
    const userId = getCurrentUserId();
    if (!userId) return;
    
    // 调用统计数据接口
    api.get('/teacher/borrow/statistics', { teacherId: userId })
        .then(data => {
            const statCards = [
                { selector: '.stat-card:nth-child(1) .card-value', value: data.currentBorrowCount },
                { selector: '.stat-card:nth-child(2) .card-value', value: data.overdueCount },
                { selector: '.stat-card:nth-child(3) .card-value', value: data.upcomingExpireCount },
                { selector: '.stat-card:nth-child(4) .card-value', value: data.renewableCount }
            ];
            
            statCards.forEach(item => {
                const elem = document.querySelector(item.selector);
                if (elem) {
                    elem.textContent = item.value;
                }
            });
        })
        .catch(err => {
            console.error('加载统计数据失败:', err);
        });
}

// 加载借阅列表（下方表格）
function loadBorrowList() {
    const userId = getCurrentUserId();
    if (!userId) return;
    
    // 调用借阅列表接口
    api.get('/teacher/borrow/list', { teacherId: userId })
        .then(data => {
            const tbody = document.getElementById('borrowListTbody');
            if (!tbody) return;
            
            tbody.innerHTML = ''; // 清空现有内容
            
            data.forEach(borrow => {
                let statusClass = '';
                let statusText = '';
                
                switch (borrow.status) {
                    case 'OVERDUE':
                        statusClass = 'badge-overdue';
                        statusText = '已超期';
                        break;
                    case 'UPCOMING_EXPIRE':
                        statusClass = 'badge-warning';
                        statusText = '即将到期';
                        break;
                    case 'NORMAL':
                        statusClass = 'badge-success';
                        statusText = '正常';
                        break;
                    default:
                        statusClass = 'badge-secondary';
                        statusText = '未知';
                }
                
                row.innerHTML = `
                    <td>${borrow.journalName}</td>
                    <td>${borrow.volumeIssue}</td>
                    <td>${formatDate(borrow.borrowDate)}</td>
                    <td>${formatDate(borrow.dueDate)}</td>
                    <td><span class="badge-status ${statusClass}">${statusText}</span></td>
                    <td>
                        <button class="btn btn-sm btn-success" data-action="renew" data-id="${borrow.id}">
                            <i class="fas fa-redo"></i> 续借
                        </button>
                        <button class="btn btn-sm btn-secondary" data-action="return" data-id="${borrow.id}">
                            <i class="fas fa-undo"></i> 归还
                        </button>
                    </td>
                `;
                
                tbody.appendChild(row);
            });
            
            bindOperationButtons();
        })
        .catch(err => {
            console.error('加载借阅列表失败:', err);
        });
}
// 日期格式化工具函数
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
}