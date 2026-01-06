// ============================================
// 借阅管理JS - 真实后端对接版本
// 文件路径: static/js/admin-borrow.js
// ============================================

// 1. API配置映射
// 作用：将业务操作映射到后端接口路径，集中管理便于维护
const BORROW_API = {
    // 借阅记录查询接口（需后端实现）
    LIST_BORROWS: '/borrow/admin/list',           // GET 查询所有借阅记录
    TEACHER_BORROWS: '/borrow/teacher/list',      // GET 按教师ID查询
    JOURNAL_BORROWS: '/borrow/admin/journal',     // GET 按期刊ID查询
    
    // 核心业务接口（接口文档已定义）
    CREATE_BORROW: '/borrow/teacher/create',      // POST 创建借阅
    RETURN_BORROW: '/borrow/return',              // PUT 归还期刊
    
    // 辅助查询接口（用于数据验证和展示）
    GET_TEACHER: '/borrow/teacher/admin',                // GET 查询教师详情
    GET_JOURNAL: '/borrow/journal',                      // GET 查询期刊详情
};

// 2. 页面初始化入口
// 触发时机：DOM结构加载完成后自动执行（相当于页面"main函数"）
document.addEventListener('DOMContentLoaded', function() {
    // 2.1 加载表格数据（当前借阅+历史借阅）
    loadBorrowRecords();
    
    // 2.2 绑定所有事件监听器
    initEventListeners();
});

// 3. 事件监听器初始化
// 作用：为页面所有交互元素绑定处理函数
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
        if (e.key === 'Enter') searchTeacher(); // 回车直接查询教师
    });
    document.getElementById('journalId').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchJournal(); // 回车直接查询期刊
    });
    
    // 3.5 模态框生命周期事件
    initModalEvents();
}

// 4. 模态框事件处理
// 作用：管理模态框的显示/隐藏生命周期，确保状态干净
function initModalEvents() {
    // 4.1 借阅模态框显示前触发
    document.getElementById('borrowModal').addEventListener('show.bs.modal', function () {
        resetBorrowForm();      // 清空旧数据
        setDefaultDates();      // 设置默认日期
        // 延迟聚焦，等待模态框动画完成
        setTimeout(() => document.getElementById('borrowerId').focus(), 200);
    });
    
    // 4.2 归还模态框显示前触发
    document.getElementById('returnModal').addEventListener('show.bs.modal', function () {
        resetReturnForm();      // 清空旧查询结果
        setTimeout(() => document.getElementById('returnBorrowerId').focus(), 200);
    });
}

// 5. 工具函数：设置默认日期
// 逻辑：借阅日期=今天，应还日期=30天后
function setDefaultDates() {
    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 30); // 默认30天借阅期
    
    // 转换为YYYY-MM-DD格式（input[type="date"]要求）
    document.getElementById('startDate').value = today.toISOString().split('T')[0];
    document.getElementById('endDate').value = dueDate.toISOString().split('T')[0];
}

// 6. 工具函数：重置表单
function resetBorrowForm() {
    const form = document.getElementById('borrowForm');
    form.reset();                           // 清空所有输入
    form.classList.remove('was-validated'); // 移除验证样式
}

function resetReturnForm() {
    document.getElementById('returnBorrowerId').value = '';
    document.getElementById('returnJournalId').value = '';
    document.getElementById('currentBorrowsList').innerHTML = 
        '<div class="text-center text-muted py-4"><i class="fas fa-info-circle"></i> 请输入教师ID或期刊ID进行查询</div>';
}

// 7. 加载借阅记录（主入口）
// 逻辑：并行加载当前借阅和历史借阅，提升速度
async function loadBorrowRecords() {
    try {
        // Promise.all并行执行两个查询，总耗时=较慢的那个
        await Promise.all([
            loadCurrentBorrows(),  // 加载状态为borrowed/overdue的记录
            loadHistoryBorrows()   // 加载状态为returned的记录
        ]);
    } catch (error) {
        console.error('加载借阅记录失败:', error);
        alert('加载数据失败: ' + error.message);
    }
}

// 8. 加载当前借阅记录
async function loadCurrentBorrows() {
    const tbody = document.getElementById('currentBorrowsTable');
    tbody.innerHTML = '<tr><td colspan="7" class="text-center"><i class="fas fa-spinner fa-spin"></i> 加载中...</td></tr>';
    
    try {
        // 调用api.get()，params会自动转为?status=borrowed,overdue
        const data = await api.get(BORROW_API.LIST_BORROWS, { 
            status: 'borrowed,overdue' // 只查询未归还的记录
        });
        
        // 后端可能返回数组或{records: [], total: 0}结构
        const borrows = Array.isArray(data) ? data : (data.records || []);
        
        // 渲染表格并更新统计数字
        renderCurrentBorrows(borrows);
        document.getElementById('activeBorrowsCount').textContent = borrows.length;
        
    } catch (error) {
        console.error('加载当前借阅失败:', error);
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">加载失败: ${error.message}</td></tr>`;
    }
}

// 9. 加载历史借阅记录
async function loadHistoryBorrows() {
    const tbody = document.getElementById('historyBorrowsTable');
    tbody.innerHTML = '<tr><td colspan="7" class="text-center"><i class="fas fa-spinner fa-spin"></i> 加载中...</td></tr>';
    
    try {
        const data = await api.get(BORROW_API.LIST_BORROWS, { 
            status: 'returned',  // 只查询已归还的记录
            limit: 50            // 限制数量避免数据过多
        });
        
        const borrows = Array.isArray(data) ? data : (data.records || []);
        renderHistoryBorrows(borrows);
        document.getElementById('returnedBorrowsCount').textContent = borrows.length;
        
    } catch (error) {
        console.error('加载历史借阅失败:', error);
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">加载失败: ${error.message}</td></tr>`;
    }
}

// 10. 渲染当前借阅表格
function renderCurrentBorrows(borrows) {
    const tbody = document.getElementById('currentBorrowsTable');
    
    if (!borrows || borrows.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">暂无进行中的借阅</td></tr>';
        return;
    }
    
    // 使用map生成HTML字符串，比字符串拼接性能更好
    tbody.innerHTML = borrows.map(borrow => {
        const today = new Date();
        const dueDate = new Date(borrow.endDate || borrow.dueDate);
        const isOverdue = today > dueDate; // 判断是否超期
        const isDueSoon = !isOverdue && (dueDate - today) / (1000 * 60 * 60 * 24) <= 3; // 3天内到期
        
        return `
            <tr class="${isOverdue ? 'overdue' : ''} ${isDueSoon ? 'due-soon' : ''}">
                <td>${borrow.borrowId || borrow.id}</td>
                <td>${borrow.borrowerId || borrow.teacherId}</td>
                <td>${borrow.journalId}</td>
                <td>${formatDate(borrow.startDate || borrow.borrowDate)}</td>
                <td>${formatDate(borrow.endDate || borrow.dueDate)}</td>
                <td>
                    <span class="badge ${isOverdue ? 'bg-danger' : isDueSoon ? 'bg-warning' : 'bg-success'}">
                        ${isOverdue ? '超期' : isDueSoon ? '即将到期' : '借阅中'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="openReturnModalForRecord('${borrow.borrowId || borrow.id}', '${borrow.borrowerId || borrow.teacherId}')">
                        <i class="fas fa-undo"></i> 归还
                    </button>
                </td>
            </tr>
        `;
    }).join(''); // join('')将数组转为字符串
}

// 11. 渲染历史借阅表格
function renderHistoryBorrows(borrows) {
    const tbody = document.getElementById('historyBorrowsTable');
    
    if (!borrows || borrows.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">暂无历史记录</td></tr>';
        return;
    }
    
    tbody.innerHTML = borrows.map(borrow => `
        <tr>
            <td>${borrow.borrowId || borrow.id}</td>
            <td>${borrow.borrowerId || borrow.teacherId}</td>
            <td>${borrow.journalId}</td>
            <td>${formatDate(borrow.startDate || borrow.borrowDate)}</td>
            <td>${formatDate(borrow.endDate || borrow.dueDate)}</td>
            <td>${formatDate(borrow.returnDate)}</td>
            <td><span class="badge bg-secondary">已归还</span></td>
        </tr>
    `).join('');
}

// 12. 查询教师信息（验证是否存在和可借状态）
async function searchTeacher() {
    const teacherId = document.getElementById('borrowerId').value.trim();
    if (!teacherId) {
        alert('请输入教师ID');
        return;
    }
    
    try {
        // 调用真实接口：GET /teacher/admin/{id}
        const teacher = await api.get(`${BORROW_API.GET_TEACHER}/${teacherId}`);
        
        // 验证教师状态（active才能借阅）
        if (teacher.status !== 'active') {
            alert(`警告：教师 ${teacher.name} 账号状态为${teacher.status === 'inactive' ? '非活跃' : '未知'}，可能无法借阅！`);
        }
        
        // 检查是否达到最大借阅量
        if (teacher.currentBorrow >= teacher.maxBorrow) {
            alert(`该教师已达到最大借阅量（${teacher.maxBorrow}本），无法继续借阅！`);
        }
        
    } catch (error) {
        console.error('查询教师失败:', error);
        alert('未找到该教师信息，请检查ID是否正确');
        document.getElementById('borrowerId').value = ''; // 清空错误输入
    }
}

// 13. 查询期刊信息（验证是否存在和可借）
async function searchJournal() {
    const journalId = document.getElementById('journalId').value.trim();
    if (!journalId) {
        alert('请输入期刊ID');
        return;
    }
    
    try {
        // 调用真实接口：GET /journal/{id}
        const journal = await api.get(`${BORROW_API.GET_JOURNAL}/${journalId}`);
        
        // 检查可借数量
        if (journal.availableQuantity <= 0) {
            alert('警告：该期刊无可借数量！');
        }
        
    } catch (error) {
        console.error('查询期刊失败:', error);
        alert('未找到该期刊信息，请检查ID是否正确');
        document.getElementById('journalId').value = '';
    }
}

// 14. 办理借阅提交（核心业务流程）
async function handleBorrowSubmit(e) {
    e.preventDefault(); // 阻止表单默认提交行为
    
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
    
    try {
        // 14.5 显示加载状态
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 办理中...';
        
        // 14.6 计算借阅天数（后端需要这个参数）
        const borrowDays = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
        
        // 14.7 构建请求体（匹配接口文档要求的字段）
        const borrowData = {
            teacherId: parseInt(teacherId),  // 转换为数字类型
            journalId: parseInt(journalId),
            borrowDays: borrowDays           // 后端根据此计算end_date
        };
        
        // 14.8 调用真实创建借阅接口：POST /borrow/teacher/create
        await api.post(BORROW_API.CREATE_BORROW, borrowData);
        
        alert('借阅办理成功！');
        
        // 14.9 关闭模态框（Bootstrap标准方法）
        bootstrap.Modal.getInstance(document.getElementById('borrowModal')).hide();
        
        // 14.10 刷新列表数据
        loadBorrowRecords();
        
    } catch (error) {
        console.error('借阅失败:', error);
        
        // 14.11 根据错误信息给出具体提示
        let errorMsg = error.message || '借阅失败';
        if (errorMsg.includes('最大借阅数')) {
            alert('该教师已达到最大借阅数量限制！');
        } else if (errorMsg.includes('可借数量')) {
            alert('该期刊无可借数量！');
        } else if (errorMsg.includes('状态')) {
            alert('教师账号状态异常，无法借阅！');
        } else {
            alert('借阅失败: ' + errorMsg);
        }
    } finally {
        // 14.12 恢复按钮状态
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-check"></i> 确认借阅';
    }
}

// 15. 根据教师ID查询可归还记录
async function searchByTeacher() {
    const teacherId = document.getElementById('returnBorrowerId').value.trim();
    if (!teacherId) {
        alert('请输入教师ID');
        return;
    }
    
    const container = document.getElementById('currentBorrowsList');
    container.innerHTML = '<div class="text-center"><i class="fas fa-spinner fa-spin"></i> 查询中...</div>';
    
    try {
        // 调用真实接口：GET /borrow/teacher/list?teacherId=xxx&status=borrowed,overdue
        const data = await api.get(BORROW_API.TEACHER_BORROWS, { 
            teacherId: teacherId,
            status: 'borrowed,overdue' // 只查询未归还的
        });
        
        // 适配后端返回的多种格式
        const borrows = Array.isArray(data) ? data : [data];
        renderReturnList(borrows, 'teacher');
        
    } catch (error) {
        console.error('查询失败:', error);
        alert('查询失败: ' + error.message);
        container.innerHTML = '<div class="text-center text-danger">查询失败</div>';
    }
}

// 16. 根据期刊ID查询可归还记录
async function searchByJournal() {
    const journalId = document.getElementById('returnJournalId').value.trim();
    if (!journalId) {
        alert('请输入期刊ID');
        return;
    }
    
    const container = document.getElementById('currentBorrowsList');
    container.innerHTML = '<div class="text-center"><i class="fas fa-spinner fa-spin"></i> 查询中...</div>';
    
    try {
        // 调用真实接口：GET /borrow/admin/journal/{journalId}?status=borrowed,overdue
        const data = await api.get(`${BORROW_API.JOURNAL_BORROWS}/${journalId}`, {
            status: 'borrowed,overdue'
        });
        
        const borrows = Array.isArray(data) ? data : [data];
        renderReturnList(borrows, 'journal');
        
    } catch (error) {
        console.error('查询失败:', error);
        alert('查询失败: ' + error.message);
        container.innerHTML = '<div class="text-center text-danger">查询失败</div>';
    }
}

// 17. 渲染可归还列表（归还模态框内显示）
function renderReturnList(borrows, type) {
    const container = document.getElementById('currentBorrowsList');
    
    if (!borrows || borrows.length === 0) {
        container.innerHTML = `<div class="text-center text-muted">暂无未归还的借阅记录</div>`;
        return;
    }
    
    // 构建列表HTML，每条记录一个卡片
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
                        <strong>教师ID:</strong> ${borrow.borrowerId || borrow.teacherId}
                    </div>
                    <div class="col-md-3">
                        <strong>期刊ID:</strong> ${borrow.journalId}
                        <br><small class="text-muted">${borrow.journalName || ''}</small>
                    </div>
                    <div class="col-md-3">
                        <strong>应还日期:</strong> ${formatDate(borrow.endDate || borrow.dueDate)}
                        <br><span class="badge ${borrow.status === 'overdue' ? 'bg-danger' : 'bg-warning'}">
                            ${borrow.status === 'overdue' ? '超期' : '借阅中'}
                        </span>
                    </div>
                    <div class="col-md-2 text-end">
                        <button class="btn btn-sm btn-success" onclick="handleReturn('${borrow.borrowId || borrow.id}', '${borrow.borrowerId || borrow.teacherId}')">
                            <i class="fas fa-undo"></i> 归还
                        </button>
                    </div>
                </div>
            </div>
        `).join('')}`;
}

// 18. 处理归还操作（核心业务流程）
async function handleReturn(borrowId, teacherId) {
    if (!borrowId || !teacherId) {
        alert('参数错误：缺少借阅ID或教师ID');
        return;
    }
    
    // 二次确认
    if (!confirm(`确认办理归还吗？借阅ID: ${borrowId}`)) {
        return;
    }
    
    try {
        // 构建请求体（匹配接口文档）
        const returnData = {
            borrowId: parseInt(borrowId),
            teacherId: parseInt(teacherId)
        };
        
        // 调用真实归还接口：PUT /borrow/return
        await api.put(BORROW_API.RETURN_BORROW, returnData);
        
        alert('归还办理成功！');
        
        // 清空查询结果，显示成功提示
        document.getElementById('currentBorrowsList').innerHTML = 
            '<div class="text-center text-success py-4"><i class="fas fa-check-circle"></i> 归还成功！请继续查询其他记录或关闭窗口</div>';
        
        // 刷新主列表数据
        loadBorrowRecords();
        
    } catch (error) {
        console.error('归还失败:', error);
        alert('归还失败: ' + (error.message || '未知错误'));
    }
}

// 19. 快捷操作：从表格行直接打开归还模态框
function openReturnModalForRecord(borrowId, teacherId) {
    // 创建模态框实例
    const modal = new bootstrap.Modal(document.getElementById('returnModal'));
    modal.show();
    
    // 自动填充教师ID并查询
    setTimeout(() => {
        document.getElementById('returnBorrowerId').value = teacherId;
        searchByTeacher(); // 自动执行查询
    }, 300); // 延迟300ms确保模态框已显示
}

// 20. 工具函数：格式化日期显示
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    // 格式化为中文日期：2024年01月15日
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

// 21. 导出函数供HTML调用（重置查询表单）
window.resetReturnForm = resetReturnForm;