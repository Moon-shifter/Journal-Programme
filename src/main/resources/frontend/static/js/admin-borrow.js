// ============================================
// 借阅管理JS - 真实后端对接版本（已校准）
// 文件路径: static/js/admin-borrow.js
// 校准说明：匹配后端BorrowController接口规范 + common-request.js错误处理逻辑
// ============================================

// 1. API配置映射（校准：路径严格匹配后端BorrowController）
const BORROW_API = {
    // 借阅记录查询接口（后端：GET /api/borrow/admin/list）
    LIST_BORROWS: '/borrow/admin/list',
    // 教师借阅记录查询（后端：GET /api/borrow/teacher/list）
    TEACHER_BORROWS: '/borrow/teacher/list',
    // 期刊借阅记录查询（后端：GET /api/borrow/admin/journal/{journalId}）
    JOURNAL_BORROWS: '/borrow/admin/journal',
    // 核心业务接口（后端：POST /api/borrow/teacher/create）
    CREATE_BORROW: '/borrow/teacher/create',
    // 归还期刊（后端：PUT /api/borrow/teacher/return）
    RETURN_BORROW: '/borrow/teacher/return',
    // 查教师借阅状态（后端：GET /api/borrow/teacher/admin/{teacherId}）
    GET_TEACHER: '/borrow/teacher/admin',
    // 查期刊借阅状态（后端：GET /api/borrow/journal/{journalId}）
    GET_JOURNAL: '/borrow/journal',
};

// 2. 页面初始化入口
document.addEventListener('DOMContentLoaded', function() {
    loadBorrowRecords();
    initEventListeners();
});

// 3. 事件监听器初始化
function initEventListeners() {
    // 3.1 借阅模态框内的查询按钮
    document.getElementById('searchTeacher').addEventListener('click', () => searchTeacher());
    document.getElementById('searchJournal').addEventListener('click', () => searchJournal());

    // 3.2 归还模态框内的查询按钮
    document.getElementById('searchBorrowRecords').addEventListener('click', () => searchByTeacher());
    document.getElementById('searchJournalRecords').addEventListener('click', () => searchByJournal());

    // 3.3 借阅表单提交事件
    document.getElementById('borrowForm').addEventListener('submit', handleBorrowSubmit);

    // 3.4 输入框回车快捷查询
    document.getElementById('borrowerId').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchTeacher();
    });
    document.getElementById('journalId').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchJournal();
    });

    // 3.5 模态框生命周期事件
    initModalEvents();
}

// 4. 模态框事件处理
function initModalEvents() {
    // 4.1 借阅模态框显示前触发
    document.getElementById('borrowModal').addEventListener('show.bs.modal', function () {
        resetBorrowForm();
        setDefaultDates();
        setTimeout(() => document.getElementById('borrowerId').focus(), 200);
    });

    // 4.2 归还模态框显示前触发
    document.getElementById('returnModal').addEventListener('show.bs.modal', function () {
        resetReturnForm();
        setTimeout(() => document.getElementById('returnBorrowerId').focus(), 200);
    });
}

// 5. 工具函数：设置默认日期（校准：仅用于前端展示，后端用borrowDays计算日期）
function setDefaultDates() {
    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 30);

    // 转换为YYYY-MM-DD格式（匹配后端日期格式）
    document.getElementById('startDate').value = today.toISOString().split('T')[0];
    document.getElementById('endDate').value = dueDate.toISOString().split('T')[0];
}

// 6. 工具函数：重置表单
function resetBorrowForm() {
    const form = document.getElementById('borrowForm');
    form.reset();
    form.classList.remove('was-validated');
}

function resetReturnForm() {
    document.getElementById('returnBorrowerId').value = '';
    document.getElementById('returnJournalId').value = '';
    document.getElementById('currentBorrowsList').innerHTML =
        '<div class="text-center text-muted py-4"><i class="fas fa-info-circle"></i> 请输入教师ID或期刊ID进行查询</div>';
}

// 7. 加载借阅记录（主入口）
async function loadBorrowRecords() {
    try {
        await Promise.all([
            loadCurrentBorrows(),
            loadHistoryBorrows()
        ]);
    } catch (error) {
        console.error('加载借阅记录失败:', error);
        // 校准：适配后端业务code错误提示
        const errMsg = getBusinessErrorMsg(error);
        alert('加载数据失败: ' + errMsg);
    }
}

// 8. 加载当前借阅记录（校准：字段映射+错误处理）
async function loadCurrentBorrows() {
    const tbody = document.getElementById('currentBorrowsTable');
    tbody.innerHTML = '<tr><td colspan="7" class="text-center"><i class="fas fa-spinner fa-spin"></i> 加载中...</td></tr>';

    try {
        // 校准：传参名匹配后端（status支持逗号分隔多值）
        const data = await api.get(BORROW_API.LIST_BORROWS, {
            status: 'borrowed,overdue'
        });

        // 校准：适配后端两种返回结构（数组 / {records:[], total:0}）
        const borrows = Array.isArray(data) ? data : (data.records || []);

        renderCurrentBorrows(borrows);
        document.getElementById('activeBorrowsCount').textContent = borrows.length;

    } catch (error) {
        console.error('加载当前借阅失败:', error);
        const errMsg = getBusinessErrorMsg(error);
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">加载失败: ${errMsg}</td></tr>`;
    }
}

// 9. 加载历史借阅记录（校准：limit参数匹配后端+错误处理）
async function loadHistoryBorrows() {
    const tbody = document.getElementById('historyBorrowsTable');
    tbody.innerHTML = '<tr><td colspan="7" class="text-center"><i class="fas fa-spinner fa-spin"></i> 加载中...</td></tr>';

    try {
        // 校准：limit参数匹配后端/admin/list接口的分页限制
        const data = await api.get(BORROW_API.LIST_BORROWS, {
            status: 'returned',
            limit: 50
        });

        const borrows = Array.isArray(data) ? data : (data.records || []);
        renderHistoryBorrows(borrows);
        document.getElementById('returnedBorrowsCount').textContent = borrows.length;

    } catch (error) {
        console.error('加载历史借阅失败:', error);
        const errMsg = getBusinessErrorMsg(error);
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">加载失败: ${errMsg}</td></tr>`;
    }
}

// 10. 渲染当前借阅表格（校准：字段映射后端返回的borrowDate/dueDate）
function renderCurrentBorrows(borrows) {
    const tbody = document.getElementById('currentBorrowsTable');

    if (!borrows || borrows.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">暂无进行中的借阅</td></tr>';
        return;
    }

    tbody.innerHTML = borrows.map(borrow => {
        const today = new Date();
        // 校准：字段映射后端的dueDate（应还日期），而非endDate
        const dueDate = new Date(borrow.dueDate || borrow.endDate);
        const isOverdue = today > dueDate;
        // 校准：即将到期逻辑与后端DateUtil一致（3天内）
        const isDueSoon = !isOverdue && (dueDate - today) / (1000 * 60 * 60 * 24) <= 3;

        return `
            <tr class="${isOverdue ? 'overdue' : ''} ${isDueSoon ? 'due-soon' : ''}">
                <td>${borrow.borrowId || borrow.id}</td>
                <td>${borrow.borrower.id || borrow.borrowerId}</td>
                <td>${borrow.journal.id}</td>
                <!-- 校准：映射后端borrowDate（借阅日期） -->
                <td>${formatDate(borrow.borrowDate || borrow.startDate)}</td>
                <td>${formatDate(borrow.dueDate || borrow.endDate)}</td>
                <td>
                    <span class="badge ${isOverdue ? 'bg-danger' : isDueSoon ? 'bg-warning' : 'bg-success'}">
                        ${isOverdue ? '超期' : isDueSoon ? '即将到期' : '借阅中'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="openReturnModalForRecord('${borrow.borrowId || borrow.id}', '${borrow.teacherId || borrow.borrowerId}')">
                        <i class="fas fa-undo"></i> 归还
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// 11. 渲染历史借阅表格（校准：字段映射）
function renderHistoryBorrows(borrows) {
    const tbody = document.getElementById('historyBorrowsTable');

    if (!borrows || borrows.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">暂无历史记录</td></tr>';
        return;
    }

    tbody.innerHTML = borrows.map(borrow => `
        <tr>
            <td>${borrow.borrowId || borrow.id}</td>
            <td>${borrow.teacherId || borrow.borrowerId}</td>
            <td>${borrow.journalId}</td>
            <td>${formatDate(borrow.borrowDate || borrow.startDate)}</td>
            <td>${formatDate(borrow.dueDate || borrow.endDate)}</td>
            <td>${formatDate(borrow.returnDate)}</td>
            <td><span class="badge bg-secondary">已归还</span></td>
        </tr>
    `).join('');
}

// 12. 查询教师信息（校准：接口路径+字段+错误处理）
async function searchTeacher() {
    const teacherId = document.getElementById('borrowerId').value.trim();
    if (!teacherId) {
        alert('请输入教师ID');
        return;
    }

    try {
        // 校准：调用BorrowController的教师借阅状态接口（非TeacherController）
        const teacher = await api.get(`${BORROW_API.GET_TEACHER}/${teacherId}`);

        // 校准：字段匹配后端TeacherDTO（currentBorrow/maxBorrow）
        if (teacher.status !== 'active') {
            alert(`警告：教师 ${teacher.name} 账号状态为${teacher.status === 'inactive' ? '非活跃' : '未知'}，可能无法借阅！`);
        }
        if (teacher.currentBorrow >= teacher.maxBorrow) {
            alert(`该教师已达到最大借阅量（${teacher.maxBorrow}本），无法继续借阅！`);
        }

    } catch (error) {
        console.error('查询教师失败:', error);
        const errMsg = getBusinessErrorMsg(error);
        alert('未找到该教师信息：' + errMsg);
        document.getElementById('borrowerId').value = '';
    }
}

// 13. 查询期刊信息（校准：接口路径+字段+错误处理）
async function searchJournal() {
    const journalId = document.getElementById('journalId').value.trim();
    if (!journalId) {
        alert('请输入期刊ID');
        return;
    }

    try {
        // 校准：调用BorrowController的期刊借阅状态接口
        const journal = await api.get(`${BORROW_API.GET_JOURNAL}/${journalId}`);

        // 校准：字段匹配后端JournalDTO（availableQuantity）
        if (journal.availableQuantity <= 0) {
            alert('警告：该期刊无可借数量！');
        }

    } catch (error) {
        console.error('查询期刊失败:', error);
        const errMsg = getBusinessErrorMsg(error);
        alert('未找到该期刊信息：' + errMsg);
        document.getElementById('journalId').value = '';
    }
}

// 14. 办理借阅提交（核心校准：传参+错误处理+字段）
async function handleBorrowSubmit(e) {
    e.preventDefault();

    // 14.1 获取表单数据
    const teacherId = document.getElementById('borrowerId').value.trim();
    const journalId = document.getElementById('journalId').value.trim();
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    // 14.2 验证必填项
    if (!teacherId || !journalId || !startDate || !endDate) {
        alert('请填写完整的借阅信息');
        return;
    }

    // 14.3 验证日期逻辑合理性
    if (new Date(endDate) <= new Date(startDate)) {
        alert('应还日期必须晚于借阅日期！');
        return;
    }

    // 14.4 用户确认
    if (!confirm('确认办理借阅吗？')) {
        return;
    }

    // 查找提交按钮
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    try {
        // 14.5 显示加载状态
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 办理中...';
        }

        // 14.6 计算借阅天数（匹配后端参数要求）
        const borrowDays = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));

        // 14.7 构建请求体（校准：字段名严格匹配后端）
        const borrowData = {
            teacherId: parseInt(teacherId),
            journalId: parseInt(journalId),
            borrowDays: borrowDays
        };

        // 14.8 调用创建借阅接口
        await api.post(BORROW_API.CREATE_BORROW, borrowData);

        alert('借阅办理成功！');

        // 14.9 关闭模态框
        bootstrap.Modal.getInstance(document.getElementById('borrowModal')).hide();

        // 14.10 刷新列表数据
        loadBorrowRecords();

    } catch (error) {
        console.error('借阅失败:', error);
        const errMsg = getBusinessErrorMsg(error);

        // 校准：精准错误提示（匹配后端业务提示）
        let tipMsg = '借阅失败: ' + errMsg;
        if (errMsg.includes('最大借阅数')) tipMsg = '该教师已达到最大借阅数量限制！';
        if (errMsg.includes('可借数量')) tipMsg = '该期刊无可借数量！';
        if (errMsg.includes('状态')) tipMsg = '教师账号状态异常，无法借阅！';
        alert(tipMsg);
    } finally {
        // 14.12 恢复按钮状态
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-check"></i> 确认借阅';
        }
    }
}

// 15. 根据教师ID查询可归还记录（校准：传参+字段）
async function searchByTeacher() {
    const teacherId = document.getElementById('returnBorrowerId').value.trim();
    if (!teacherId) {
        alert('请输入教师ID');
        return;
    }

    const container = document.getElementById('currentBorrowsList');
    container.innerHTML = '<div class="text-center"><i class="fas fa-spinner fa-spin"></i> 查询中...</div>';

    try {
        // 校准：传参名匹配后端（teacherId + status）
        const data = await api.get(BORROW_API.TEACHER_BORROWS, {
            teacherId: teacherId,
            status: 'borrowed,overdue'
        });

        const borrows = Array.isArray(data) ? data : [data];
        renderReturnList(borrows, 'teacher');

    } catch (error) {
        console.error('查询失败:', error);
        const errMsg = getBusinessErrorMsg(error);
        alert('查询失败: ' + errMsg);
        container.innerHTML = '<div class="text-center text-danger">查询失败</div>';
    }
}

// 16. 根据期刊ID查询可归还记录（校准：路径+传参）
async function searchByJournal() {
    const journalId = document.getElementById('returnJournalId').value.trim();
    if (!journalId) {
        alert('请输入期刊ID');
        return;
    }

    const container = document.getElementById('currentBorrowsList');
    container.innerHTML = '<div class="text-center"><i class="fas fa-spinner fa-spin"></i> 查询中...</div>';

    try {
        // 校准：路径拼接 + status参数匹配后端
        const data = await api.get(`${BORROW_API.JOURNAL_BORROWS}/${journalId}`, {
            status: 'borrowed,overdue'
        });

        const borrows = Array.isArray(data) ? data : [data];
        renderReturnList(borrows, 'journal');

    } catch (error) {
        console.error('查询失败:', error);
        const errMsg = getBusinessErrorMsg(error);
        alert('查询失败: ' + errMsg);
        container.innerHTML = '<div class="text-center text-danger">查询失败</div>';
    }
}

// 17. 渲染可归还列表（校准：字段映射）
function renderReturnList(borrows, type) {
    const container = document.getElementById('currentBorrowsList');

    if (!borrows || borrows.length === 0) {
        container.innerHTML = `<div class="text-center text-muted">暂无未归还的借阅记录</div>`;
        return;
    }

    container.innerHTML = `
        <div class="mb-2 text-muted">
            <i class="fas fa-exclamation-circle"></i> 点击"归还"按钮办理归还手续
        </div>
        ${borrows.map(borrow => `
            <div class="borrow-item border-start border-4 ${borrow.status === 'overdue' ? 'border-danger' : 'border-warning'}">
                <div class="row align-items-center">
                    <div class="col-md-2">
                        <strong>借阅ID:</strong> ${borrow.borrowId || borrow.id}
                    </div>
                    <div class="col-md-2">
                        <strong>教师ID:</strong> ${borrow.teacherId || borrow.borrowerId}
                    </div>
                    <div class="col-md-3">
                        <strong>期刊ID:</strong> ${borrow.journalId}
                        <br><small class="text-muted">${borrow.journalName || ''}</small>
                    </div>
                    <div class="col-md-3">
                        <strong>应还日期:</strong> ${formatDate(borrow.dueDate || borrow.endDate)}
                        <br><span class="badge ${borrow.status === 'overdue' ? 'bg-danger' : 'bg-warning'}">
                            ${borrow.status === 'overdue' ? '超期' : '借阅中'}
                        </span>
                    </div>
                    <div class="col-md-2 text-end">
                        <button class="btn btn-sm btn-success" onclick="handleReturn('${borrow.borrowId || borrow.id}')">
                            <i class="fas fa-undo"></i> 归还
                        </button>
                    </div>
                </div>
            </div>
        `).join('')}`;
}

// 18. 处理归还操作（校准：参数+路径+错误处理）
async function handleReturn(borrowId) {
    // 校准：严格非空校验
    if (!borrowId || isNaN(parseInt(borrowId))) {
        alert('参数错误：借阅ID必须为有效数字');
        return;
    }

    if (!confirm(`确认办理归还吗？借阅ID: ${borrowId}`)) {
        return;
    }

    try {
        // 校准：请求体字段严格匹配后端
        const returnData = {
            borrowId: parseInt(borrowId),
        };

        // 校准：调用正确的归还接口（PUT /borrow/teacher/return）
        await api.put(BORROW_API.RETURN_BORROW, returnData);

        alert('归还办理成功！');

        document.getElementById('currentBorrowsList').innerHTML =
            '<div class="text-center text-success py-4"><i class="fas fa-check-circle"></i> 归还成功！请继续查询其他记录或关闭窗口</div>';

        loadBorrowRecords();

    } catch (error) {
        console.error('归还失败:', error);
        const errMsg = getBusinessErrorMsg(error);
        alert('归还失败: ' + errMsg);
    }
}

// 19. 快捷操作：打开归还模态框（校准：模态框实例化逻辑）
function openReturnModalForRecord(borrowId, teacherId) {
    // 校准：优先获取已有模态框实例，避免重复创建
    const modalEl = document.getElementById('returnModal');
    const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
    modal.show();

    // 自动填充教师ID并查询
    setTimeout(() => {
        document.getElementById('returnBorrowerId').value = teacherId;
        searchByTeacher();
    }, 300);
}

// 20. 工具函数：格式化日期（校准：兼容后端yyyy-MM-dd格式）
function formatDate(dateString) {
    if (!dateString) return '-';
    // 校准：兼容ISO格式和后端yyyy-MM-dd格式
    const date = new Date(dateString + (dateString.includes('T') ? '' : 'T00:00:00'));
    if (isNaN(date.getTime())) return '-'; // 无效日期返回-
    // 格式化为2024-01-15（与后端一致），也可保留中文格式
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).replace(/\//g, '-'); // 替换斜杠为横线，匹配后端格式
}

// 21. 工具函数：解析后端业务code错误信息（核心校准）
function getBusinessErrorMsg(error) {
    // 适配common-request.js的错误处理逻辑：error.message已包含业务提示
    if (!error || !error.message) return '未知错误';
    // 过滤通用错误，提取业务提示
    const pureMsg = error.message.replace(/请求失败（错误码：\d+）/g, '').trim();
    return pureMsg || '未知错误';
}

// 22. 导出函数供HTML调用
window.resetReturnForm = resetReturnForm;
window.openReturnModalForRecord = openReturnModalForRecord;
window.handleReturn = handleReturn;