// teacher-index.js
// 教师主页数据交互逻辑（适配localStorage存储用户信息）

// 全局分页变量（核心新增：借阅列表分页）
let currentPage = 1;
let pageSize = 10;
let totalPages = 0;
let totalBorrows = 0;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initSidebarToggle();
    // 核心修正：按优先级加载，先校验登录状态
    const userId = getCurrentUserId();
    if (!userId) {
        handleNotLogin();
        return;
    }
    // 并行加载提升性能
    Promise.all([
        loadUserInfo(),
        loadStatisticData(),
        loadBorrowList()
    ]).catch(err => {
        console.error('页面初始化数据加载失败:', err);
        showGlobalError('数据加载异常，请刷新页面重试');
    });
    // 绑定刷新按钮事件（核心新增）
    bindRefreshEvents();
});

// 初始化侧边栏切换功能（优化：增加防抖）
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

// 工具函数：从localStorage获取当前登录教师ID（核心修正：更严谨的校验）
function getCurrentUserId() {
    try {
        // 从localStorage读取存储的用户信息
        const teacherInfoStr = localStorage.getItem("teacherInfo");
        if (!teacherInfoStr) return null;

        // 解析JSON（处理可能的格式错误）
        const teacherInfo = JSON.parse(teacherInfoStr);
        // 严格校验必要字段
        if (!teacherInfo || !teacherInfo.id || typeof teacherInfo.id !== 'string' && typeof teacherInfo.id !== 'number') {
            localStorage.removeItem("teacherInfo"); // 清理无效数据
            return null;
        }
        return teacherInfo.id.toString(); // 统一转为字符串，避免类型问题
    } catch (err) {
        console.error('解析用户信息失败:', err);
        localStorage.removeItem("teacherInfo"); // 清理损坏数据
        return null;
    }
}

// 处理未登录状态（核心新增）
function handleNotLogin() {
    const userInfoElem = document.querySelector('.user-info span');
    if (userInfoElem) {
        userInfoElem.textContent = '未登录';
    }
    // 显示登录提示
    showGlobalError('请先登录后再操作', true);
    // 3秒后跳转登录页（可选：注释掉则仅提示不跳转）
    // setTimeout(() => {
    //     window.location.href = '../teacher/teacher-login.html';
    // }, 3000);
}

// 加载用户信息（顶部导航）（核心修正：增加加载状态、错误处理）
async function loadUserInfo() {
    const userId = getCurrentUserId();
    if (!userId) return;
    
    // 从Cookie获取用户姓名
    const userInfo = getCurrentUserInfo();
    const userInfoElem = document.querySelector('.user-info span');
    const userAvatarElem = document.querySelector('.user-avatar');

    // 显示加载状态
    if (userInfoElem) userInfoElem.textContent = '加载中...';
    if (userAvatarElem) userAvatarElem.textContent = '?';

    try {
        // 更新UI（使用Cookie中的用户信息）
        if (userInfoElem) {
            userInfoElem.textContent = `教师：${userInfo.name || '未知'}`;
        }
        if (userAvatarElem) {
            userAvatarElem.textContent = userInfo.name.charAt(0) || '师';
        }
        
        // 可选：如果需要从服务器获取最新用户信息，可以保留下面的代码
        // 调用用户信息接口（使用Cookie中的userId）
        // const data = await api.get('/teacher/info', { id: userId });
        // 严格校验返回数据
        // if (!data || !data.name) {
        //     throw new Error('用户信息获取失败');
        // }
        // 更新UI
        // if (userInfoElem) {
        //     userInfoElem.textContent = `教师：${data.name}`;
        // }
        // if (userAvatarElem) {
        //     userAvatarElem.textContent = data.name.charAt(0) || '师';
        // }
    } catch (err) {
        console.error('加载用户信息失败:', err);
        if (userInfoElem) userInfoElem.textContent = `教师：${userInfo.name || '未知'}`;
        if (userAvatarElem) userAvatarElem.textContent = userInfo.name.charAt(0) || '师';
    }
}

// 加载统计数据（中间数据卡片）（核心修正：加载状态、默认值处理）
async function loadStatisticData() {
    const userId = getCurrentUserId();
    if (!userId) return;

    // 初始化统计卡片为加载状态
    const statSelectors = [
        '.stat-card:nth-child(1) .card-value',
        '.stat-card:nth-child(2) .card-value',
        '.stat-card:nth-child(3) .card-value',
        '.stat-card:nth-child(4) .card-value'
    ];
    statSelectors.forEach(selector => {
        const elem = document.querySelector(selector);
        if (elem) elem.textContent = '...';
    });

    try {
        // 调用统计数据接口
        const data = await api.get('/teacher/borrow/statistics', { teacherId: userId });
        // 数据默认值处理
        const stats = {
            currentBorrowCount: data.currentBorrowCount || 0,
            overdueCount: data.overdueCount || 0,
            upcomingExpireCount: data.upcomingExpireCount || 0,
            renewableCount: data.renewableCount || 0
        };
        // 更新卡片值
        const statCards = [
            { selector: '.stat-card:nth-child(1) .card-value', value: stats.currentBorrowCount },
            { selector: '.stat-card:nth-child(2) .card-value', value: stats.overdueCount },
            { selector: '.stat-card:nth-child(3) .card-value', value: stats.upcomingExpireCount },
            { selector: '.stat-card:nth-child(4) .card-value', value: stats.renewableCount }
        ];
        statCards.forEach(item => {
            const elem = document.querySelector(item.selector);
            if (elem) {
                elem.textContent = item.value;
                // 超期卡片增加红色警示（核心新增）
                if (item.selector.includes('nth-child(2)') && item.value > 0) {
                    elem.classList.add('text-danger');
                } else {
                    elem.classList.remove('text-danger');
                }
            }
        });
    } catch (err) {
        console.error('加载统计数据失败:', err);
        // 失败后显示0
        statSelectors.forEach(selector => {
            const elem = document.querySelector(selector);
            if (elem) elem.textContent = '0';
        });
    }
}

// 加载借阅列表（下方表格）（核心修正：分页、日期兼容、状态判断）
async function loadBorrowList() {
    const userId = getCurrentUserId();
    if (!userId) return;

    const tbody = document.getElementById('borrowListTbody');
    const paginationContainer = document.getElementById('borrowPagination');

    // 显示加载状态
    if (tbody) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center"><i class="fas fa-spinner fa-spin"></i> 加载借阅记录中...</td></tr>';
    }
    if (paginationContainer) paginationContainer.innerHTML = '';

    try {
        // 调用分页借阅列表接口
        const pageResult = await api.get('/borrow/teacher/list', {
            teacherId: userId,
            page: currentPage,
            pageSize: pageSize
        });

        if (!pageResult) throw new Error('未获取到借阅数据');

        // 处理分页数据
        const borrows = Array.isArray(pageResult.data) ? pageResult.data : [];
        totalBorrows = pageResult.total || borrows.length;
        totalPages = Math.ceil(totalBorrows / pageSize);

        if (tbody) {
            tbody.innerHTML = ''; // 清空现有内容

            // 过滤掉已归还的记录，只显示当前借阅
            const currentBorrows = borrows.filter(borrow => borrow.status !== 'returned');

            if (currentBorrows.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">暂无未归还的借阅记录</td></tr>';
                return;
            }

            // 渲染借阅记录
            currentBorrows.forEach(borrow => {
                const { statusClass, statusText } = getBorrowStatusInfo(borrow);

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${borrow.journalName || '-'}</td>
                    <td>${borrow.daysOverdue|| '-'}</td>
                    <td>${formatDate(borrow.startDate)}</td>
                    <td>${formatDate(borrow.endDate)}</td>
                    <td><span class="badge-status ${statusClass}">${statusText}</span></td>
                `;
                tbody.appendChild(row);
            });
        }

        // 渲染分页控件
        if (paginationContainer) {
            renderBorrowPagination();
        }
    } catch (err) {
        console.error('加载借阅列表失败:', err);
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">
                <i class="fas fa-exclamation-circle"></i> 借阅记录加载失败：${err.message || '网络异常'}
            </td></tr>`;
        }
    }
}

// 核心新增：获取借阅状态信息（抽离逻辑，便于维护）
function getBorrowStatusInfo(borrow) {
    let statusClass = 'badge-secondary';
    let statusText = '未知';

    // 优先使用接口返回的状态
    switch (borrow.status) {
        case 'overdue':
            statusClass = 'badge-overdue';
            statusText = '已超期';
            break;
        case 'borrowed':
            // 计算剩余天数（核心修正：日期解析兼容IOS）
            const today = new Date();
            today.setHours(0, 0, 0, 0); // 清空时分秒

            const dueDate = parseDateSafely(borrow.endDate);
            if (!dueDate) {
                statusClass = 'badge-secondary';
                statusText = '日期异常';
                break;
            }
            dueDate.setHours(0, 0, 0, 0);

            const timeDiff = dueDate - today;
            const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

            if (daysDiff <= 0) {
                // 已超期但状态未更新
                statusClass = 'badge-overdue';
                statusText = '已超期';
            } else if (daysDiff <= 7) {
                // 7天内到期
                statusClass = 'badge-warning';
                statusText = `即将到期(${daysDiff}天)`;
            } else {
                // 正常借阅
                statusClass = 'badge-success';
                statusText = `正常(${daysDiff}天)`;
            }
            break;
        default:
            statusText = borrow.status ? borrow.status : '未知';
    }

    return { statusClass, statusText };
}

// 核心修正：安全解析日期（兼容IOS）
function parseDateSafely(dateString) {
    if (!dateString) return null;
    // 处理IOS不兼容的yyyy-MM-dd格式
    const dateParts = dateString.split('-');
    if (dateParts.length === 3) {
        return new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
    }
    return new Date(dateString);
}

// 日期格式化工具函数（核心修正：空值处理、格式统一）
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = parseDateSafely(dateString);
    if (isNaN(date.getTime())) return '日期异常';
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
}

// 核心新增：渲染借阅列表分页
function renderBorrowPagination() {
    const paginationContainer = document.getElementById('borrowPagination');
    if (!paginationContainer || totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }

    let html = '<nav aria-label="借阅列表分页"><ul class="pagination justify-content-center">';

    // 上一页
    const prevClass = currentPage === 1 ? 'disabled' : '';
    html += `<li class="page-item ${prevClass}">
                <a class="page-link" href="#" onclick="changeBorrowPage(${currentPage - 1})">上一页</a>
             </li>`;

    // 页码（最多显示5个）
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
        const activeClass = i === currentPage ? 'active' : '';
        html += `<li class="page-item ${activeClass}">
                    <a class="page-link" href="#" onclick="changeBorrowPage(${i})">${i}</a>
                 </li>`;
    }

    // 下一页
    const nextClass = currentPage === totalPages ? 'disabled' : '';
    html += `<li class="page-item ${nextClass}">
                <a class="page-link" href="#" onclick="changeBorrowPage(${currentPage + 1})">下一页</a>
             </li>`;

    // 总数显示
    html += `<li class="page-item disabled">
                <span class="page-link">共 ${totalBorrows} 条</span>
             </li>`;

    html += '</ul></nav>';
    paginationContainer.innerHTML = html;
}

// 核心新增：切换借阅列表页码
function changeBorrowPage(page) {
    if (page < 1 || page > totalPages || page === currentPage) return;
    currentPage = page;
    loadBorrowList();
}

// 核心新增：绑定刷新事件
function bindRefreshEvents() {
    // 刷新用户信息
    const refreshUserBtn = document.getElementById('refreshUserBtn');
    if (refreshUserBtn) {
        refreshUserBtn.addEventListener('click', loadUserInfo);
    }
    // 刷新统计数据
    const refreshStatBtn = document.getElementById('refreshStatBtn');
    if (refreshStatBtn) {
        refreshStatBtn.addEventListener('click', loadStatisticData);
    }
    // 刷新借阅列表
    const refreshBorrowBtn = document.getElementById('refreshBorrowBtn');
    if (refreshBorrowBtn) {
        refreshBorrowBtn.addEventListener('click', () => {
            currentPage = 1; // 刷新回到第一页
            loadBorrowList();
        });
    }
    // 全局刷新
    const refreshAllBtn = document.getElementById('refreshAllBtn');
    if (refreshAllBtn) {
        refreshAllBtn.addEventListener('click', () => {
            currentPage = 1;
            Promise.all([
                loadUserInfo(),
                loadStatisticData(),
                loadBorrowList()
            ]).then(() => {
                showGlobalSuccess('数据刷新成功');
            }).catch(err => {
                showGlobalError('刷新失败：' + err.message);
            });
        });
    }
}

// 核心新增：全局提示工具
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