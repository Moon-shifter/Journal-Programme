// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);

/**
 * 页面初始化入口
 */
async function init() {
    // 初始化侧边栏折叠功能
    initSidebarToggle();
    // 加载用户信息
    await loadUserInfo();
    // 加载借阅统计数据
    await loadBorrowStats();
    // 加载当前借阅列表
    await loadCurrentBorrowList();
    // 加载推荐期刊列表
    await loadRecommendedJournals();
    // 绑定所有操作按钮事件
    bindAllActionEvents();
}

/**
 * 初始化侧边栏折叠/展开功能
 */
function initSidebarToggle() {
    const toggleSidebar = document.getElementById('toggleSidebar');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');

    toggleSidebar.addEventListener('click', function() {
        sidebar.classList.toggle('sidebar-collapsed');
        mainContent.classList.toggle('main-content-expanded');
        
        const icon = this.querySelector('i');
        if (sidebar.classList.contains('sidebar-collapsed')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-expand');
        } else {
            icon.classList.remove('fa-expand');
            icon.classList.add('fa-bars');
        }
    });
}

/**
 * 加载用户信息（从Cookie/接口获取）
 */
async function loadUserInfo() {
    try {
        // 优先从接口获取用户信息，无则从Cookie fallback
        const userRes = await api.get('/teacher/info');
        const userName = userRes.data.name || getCookie('teacherName') || '未知教师';
        const avatarText = userRes.data.avatarText || userName.charAt(0);

        // 更新页面显示
        document.querySelector('.user-info span').textContent = `教师：${userName}`;
        document.querySelector('.user-avatar').textContent = avatarText;
    } catch (err) {
        console.error('加载用户信息失败:', err);
        // 降级处理：保留默认显示
        const userName = getCookie('teacherName') || '李教授';
        document.querySelector('.user-info span').textContent = `教师：${userName}`;
        document.querySelector('.user-avatar').textContent = userName.charAt(0);
    }
}

/**
 * 加载借阅统计数据
 */
async function loadBorrowStats() {
    try {
        const statsRes = await api.get('/teacher/borrow/stats');
        const stats = statsRes.data;
        
        // 更新统计卡片数值
        const statValues = document.querySelectorAll('.stat-card .card-value');
        statValues[0].textContent = stats.currentBorrow || 0; // 当前借阅
        statValues[1].textContent = stats.overdue || 0;       // 已超期
        statValues[2].textContent = stats.soonExpire || 0;    // 即将到期
        statValues[3].textContent = stats.renewable || 0;     // 可再借阅
    } catch (err) {
        console.error('加载借阅统计失败:', err);
        // 降级：保留默认数值
    }
}

/**
 * 加载当前借阅列表
 */
async function loadCurrentBorrowList() {
    try {
        const borrowRes = await api.get('/teacher/borrows/current');
        const borrowList = borrowRes.data || [];
        const tbody = document.getElementById('borrowListTbody');
        tbody.innerHTML = ''; // 清空原有静态数据

        // 动态生成借阅列表行
        borrowList.forEach(borrow => {
            const statusMap = {
                overdue: { text: '已超期', class: 'badge-overdue' },
                soonExpire: { text: '即将到期', class: 'badge-warning' },
                normal: { text: '正常', class: 'badge-success' }
            };
            const status = statusMap[borrow.status] || statusMap.normal;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${borrow.journalName || ''}</td>
                <td>${borrow.volumeIssue || ''}</td>
                <td>${formatDate(borrow.borrowDate) || ''}</td>
                <td>${formatDate(borrow.dueDate) || ''}</td>
                <td><span class="badge-status ${status.class}">${status.text}</span></td>
                <td>
                    <button class="btn btn-sm btn-success" data-action="renew" data-id="${borrow.id}">
                        <i class="fas fa-redo"></i> 续借
                    </button>
                    <button class="btn btn-sm btn-secondary" data-action="return" data-id="${borrow.id}">
                        <i class="fas fa-undo"></i> 归还
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error('加载借阅列表失败:', err);
        // 降级：保留原有静态数据
    }
}

/**
 * 加载推荐期刊列表
 */
async function loadRecommendedJournals() {
    try {
        const journalRes = await api.get('/teacher/journals/recommended');
        const journalList = journalRes.data || [];
        const row = document.getElementById('recommendJournalRow');
        row.innerHTML = ''; // 清空原有静态数据

        // 动态生成推荐期刊卡片
        journalList.forEach(journal => {
            const statusBadge = journal.status === 'available' 
                ? '<span class="badge badge-success">可借阅</span>' 
                : '<span class="badge badge-warning">可预约</span>';

            const col = document.createElement('div');
            col.className = 'col-md-3 col-sm-6 mb-4';
            col.innerHTML = `
                <div class="journal-card">
                    <h6>${journal.name || ''}</h6>
                    <p class="text-sm text-muted">${journal.volumeIssue || ''}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        ${statusBadge}
                        <button class="btn btn-sm btn-primary" 
                                ${journal.status === 'reserve' ? 'data-action="reserve-journal" data-id="' + journal.id + '"' : 'onclick="window.location.href=\'../journal-search.html\'"'}>
                            ${journal.status === 'reserve' ? '立即预约' : '查看详情'}
                        </button>
                    </div>
                </div>
            `;
            row.appendChild(col);
        });
    } catch (err) {
        console.error('加载推荐期刊失败:', err);
        // 降级：保留原有静态数据
    }
}

/**
 * 绑定所有操作按钮事件（事件委托优化性能）
 */
function bindAllActionEvents() {
    document.addEventListener('click', async (e) => {
        const target = e.target.closest('[data-action]');
        if (!target) return;

        const action = target.dataset.action;
        const dataId = target.dataset.id; // 借阅ID/期刊ID

        switch (action) {
            case 'apply-renew':
                alert('请在借阅列表中选择需要续借的期刊');
                break;

            case 'reserve-journal':
                if (dataId) {
                    await handleJournalReserve(dataId);
                } else {
                    window.location.href = '../journal-search.html';
                }
                break;

            case 'view-history':
                window.location.href = '../teacher/borrow-history.html'; // 可替换为实际历史页面路径
                break;

            case 'reminder-settings':
                await handleReminderSettings();
                break;

            case 'renew':
                await handleBorrowRenew(dataId);
                break;

            case 'return':
                await handleBorrowReturn(dataId);
                break;

            default:
                break;
        }
    });
}

/**
 * 处理期刊续借
 */
async function handleBorrowRenew(borrowId) {
    if (!borrowId) return;
    try {
        const res = await api.post('/teacher/borrows/renew', { borrowId });
        alert(res.message || '续借成功');
        // 重新加载借阅列表和统计数据
        await loadCurrentBorrowList();
        await loadBorrowStats();
    } catch (err) {
        console.error('续借失败:', err);
        alert('续借失败：' + (err.message || '服务器异常'));
    }
}

/**
 * 处理期刊归还
 */
async function handleBorrowReturn(borrowId) {
    if (!borrowId) return;
    const journalName = document.querySelector(`[data-action="return"][data-id="${borrowId}"]`).closest('tr').cells[0].textContent;
    
    if (confirm(`确认归还《${journalName}》吗？`)) {
        try {
            const res = await api.post('/teacher/borrows/return', { borrowId });
            alert(res.message || '归还成功');
            // 重新加载借阅列表和统计数据
            await loadCurrentBorrowList();
            await loadBorrowStats();
        } catch (err) {
            console.error('归还失败:', err);
            alert('归还失败：' + (err.message || '服务器异常'));
        }
    }
}

/**
 * 处理期刊预约
 */
async function handleJournalReserve(journalId) {
    if (!journalId) return;
    try {
        const res = await api.post('/teacher/journals/reserve', { journalId });
        alert(res.message || '预约成功');
        // 重新加载推荐期刊列表
        await loadRecommendedJournals();
    } catch (err) {
        console.error('预约失败:', err);
        alert('预约失败：' + (err.message || '服务器异常'));
    }
}

/**
 * 处理借阅提醒设置
 */
async function handleReminderSettings() {
    try {
        // 先获取当前设置
        const getRes = await api.get('/teacher/reminder/settings');
        const currentDays = getRes.data.advanceDays || 3;
        const newDays = prompt(`当前提前提醒天数：${currentDays}天\n请输入新的提醒天数（1-7）：`, currentDays);
        
        if (newDays && !isNaN(newDays) && newDays >=1 && newDays <=7) {
            const updateRes = await api.put('/teacher/reminder/settings', {
                advanceDays: parseInt(newDays),
                notifyBy: getRes.data.notifyBy || 'system'
            });
            alert(updateRes.message || '提醒设置更新成功');
        } else if (newDays !== null) {
            alert('请输入1-7之间的有效数字');
        }
    } catch (err) {
        console.error('提醒设置失败:', err);
        alert('提醒设置失败：' + (err.message || '服务器异常'));
    }
}

/**
 * 日期格式化工具
 */
function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}