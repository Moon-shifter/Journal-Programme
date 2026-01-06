// ==================== API路径配置 ====================
const OVERDUE_API_PATHS = {
    // 获取超期列表（管理员专用接口）
    LIST: '/borrow/admin/overdue/list',
    // 发送催还通知（管理员专用接口）
    SEND_NOTICE: '/borrow/admin/overdue/notice',
    // 批量发送催还通知（新增接口）
    BATCH_SEND_NOTICE: '/borrow/admin/overdue/batch-notice'
};

// ==================== 全局变量 ====================
let currentPage = 1;
let totalPages = 0;
let pageSize = 10;
let selectedRecords = new Set(); // 存储选中的记录ID（borrow_id）

// ==================== 页面初始化 ====================
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
});

async function initializePage() {
    try {
        // 加载第1页超期数据
        await loadOverdueList(1);
    } catch (error) {
        console.error('初始化失败:', error);
        alert('页面初始化失败，请刷新重试');
    }
    bindEventListeners();
}

// ==================== 事件绑定 ====================
function bindEventListeners() {
    // 侧边栏折叠
    const toggleBtn = document.getElementById('toggleSidebar');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    
    toggleBtn.addEventListener('click', function() {
        sidebar.classList.toggle('sidebar-collapsed');
        mainContent.classList.toggle('main-content-expanded');
    });

    // 全选/取消全选
    const selectAllCheckbox = document.getElementById('selectAll');
    selectAllCheckbox.addEventListener('change', function() {
        const checkboxes = document.querySelectorAll('.record-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = this.checked;
            const recordId = checkbox.getAttribute('data-id');
            if (this.checked) {
                selectedRecords.add(recordId);
            } else {
                selectedRecords.delete(recordId);
            }
        });
    });

    // 批量打印
    const batchPrintBtn = document.getElementById('batchPrintBtn');
    batchPrintBtn.addEventListener('click', function() {
        if (selectedRecords.size === 0) {
            alert('请先选择要打印的记录！');
            return;
        }
        const selectedData = getSelectedRecordsData();
        printNotice(selectedData);
    });

    // 批量发送通知（新增功能）
    const batchSendBtn = document.getElementById('batchSendBtn');
    batchSendBtn.addEventListener('click', batchSendNotice);

    // 导出Excel
    const exportExcelBtn = document.getElementById('exportExcelBtn');
    exportExcelBtn.addEventListener('click', function() {
        exportToExcel();
    });

    // 表格操作（事件委托）
    const tbody = document.getElementById('overdueTableBody');
    tbody.addEventListener('click', function(e) {
        const checkbox = e.target.closest('input[type="checkbox"]');
        if (checkbox && checkbox.classList.contains('record-checkbox')) {
            const recordId = checkbox.getAttribute('data-id');
            if (checkbox.checked) {
                selectedRecords.add(recordId);
            } else {
                selectedRecords.delete(recordId);
            }
            updateSelectAllCheckbox();
            return;
        }

        const button = e.target.closest('button');
        if (!button) return;
        
        const recordId = button.getAttribute('data-id');
        if (!recordId) return;

        // 查看详情
        if (button.classList.contains('view-detail-btn')) {
            viewDetail(recordId);
        }
        
        // 生成催还单
        if (button.classList.contains('generate-notice-btn')) {
            const rowData = getRecordDataById(recordId);
            printNotice([rowData]);
        }
        
        // 发送通知
        if (button.classList.contains('send-notice-btn')) {
            sendNotice(recordId);
        }
    });
}

// ==================== 加载超期列表 ====================
async function loadOverdueList(page) {
    const tbody = document.getElementById('overdueTableBody');
    const paginationContainer = document.getElementById('paginationContainer');
    const warningBox = document.getElementById('overdueWarning');
    
    // 显示加载状态
    tbody.innerHTML = '<tr><td colspan="11" class="text-center py-4"><i class="fas fa-spinner fa-spin"></i> 正在加载数据...</td></tr>';
    paginationContainer.innerHTML = '';

    try {
        const params = {
            page: page,
            pageSize: pageSize
        };
        
        // 调用后端API（后端应返回关联查询后的完整数据）
        const response = await api.get(OVERDUE_API_PATHS.LIST, params);
        
        if (response && response.list) {
            currentPage = page;
            renderOverdueTable(response.list);
            
            // 更新超期统计
            document.getElementById('totalOverdueCount').textContent = response.total || 0;
            
            // 如果超期数量为0，隐藏警告框
            if (response.total === 0) {
                warningBox.style.display = 'none';
            } else {
                warningBox.style.display = 'block';
            }
            
            // 计算总页数并渲染分页
            const total = response.total || 0;
            totalPages = Math.ceil(total / pageSize);
            renderPagination(totalPages, page);
        } else {
            throw new Error('后端返回数据格式错误（缺少list字段）');
        }
        
    } catch (error) {
        console.error('加载失败:', error);
        tbody.innerHTML = '<tr><td colspan="11" class="text-center py-4 text-danger">数据加载失败，请重试</td></tr>';
        paginationContainer.innerHTML = '';
        warningBox.style.display = 'none';
    }
}

// ==================== 渲染表格 ====================
function renderOverdueTable(data) {
    const tbody = document.getElementById('overdueTableBody');
    
    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="11" class="text-center py-4">暂无超期记录</td></tr>';
        return;
    }
    
    tbody.innerHTML = data.map(item => {
        // 字段兼容性处理：同时支持下划线命名和驼峰命名
        const borrowId = item.borrow_id || item.borrowId;
        const teacherId = item.teacher_id || item.teacherId;
        const teacherName = item.teacher_name || item.teacherName;
        const journalName = item.journal_name || item.journalName;
        
        // 日期字段：优先使用end_date（借阅表），兼容due_date（旧版本）
        const startDate = item.start_date || item.startDate || item.borrow_date || item.borrowDate;
        const endDate = item.end_date || item.endDate || item.due_date || item.dueDate;
        
        // 关联查询字段：后端应返回教师的系部和电话
        const department = item.department || '';
        const phone = item.phone || '';
        
        // 超期天数计算：基于end_date
        const dueDate = new Date(endDate);
        const today = new Date();
        const overdueDays = Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24));
        
        // 状态标签：超期状态下固定显示"超期"
        let statusClass = 'badge-overdue-critical';
        let statusText = '严重超期';
        if (overdueDays <= 7) {
            statusClass = 'badge-overdue-warning';
            statusText = '一般超期';
        }
        
        return `
            <tr>
                <td>
                    <input type="checkbox" class="form-check-input record-checkbox" 
                           data-id="${borrowId}">
                </td>
                <td>${teacherId}</td>
                <td>${teacherName}</td>
                <td>${department}</td>
                <td>${phone || '—'}</td>
                <td>${journalName}</td>
                <td>${startDate}</td>
                <td>${endDate}</td>
                <td><span class="badge ${statusClass}">${overdueDays}天</span></td>
                <td><span class="badge-status badge-overdue">${statusText}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-info btn-icon-sm view-detail-btn" 
                                data-id="${borrowId}" title="查看详情">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-primary btn-icon-sm generate-notice-btn" 
                                data-id="${borrowId}" title="生成催还单">
                            <i class="fas fa-file-alt"></i>
                        </button>
                        <button class="btn btn-sm btn-warning btn-icon-sm send-notice-btn" 
                                data-id="${borrowId}" title="发送通知">
                            <i class="fas fa-envelope"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// ==================== 获取选中的记录 ====================
function getSelectedRecordsData() {
    const tbody = document.getElementById('overdueTableBody');
    const rows = tbody.querySelectorAll('tr');
    const selectedData = [];
    
    rows.forEach(row => {
        const checkbox = row.querySelector('.record-checkbox');
        if (checkbox && checkbox.checked) {
            const cells = row.querySelectorAll('td');
            selectedData.push({
                teacherId: cells[1].textContent,
                teacherName: cells[2].textContent,
                department: cells[3].textContent,
                phone: cells[4].textContent,
                journalName: cells[5].textContent,
                borrowDate: cells[6].textContent,
                dueDate: cells[7].textContent,
                overdueDays: cells[8].textContent
            });
        }
    });
    
    return selectedData;
}

// ==================== 根据ID获取记录数据 ====================
function getRecordDataById(borrowId) {
    const tbody = document.getElementById('overdueTableBody');
    const row = tbody.querySelector(`[data-id="${borrowId}"]`).closest('tr');
    const cells = row.querySelectorAll('td');
    
    return {
        teacherId: cells[1].textContent,
        teacherName: cells[2].textContent,
        department: cells[3].textContent,
        phone: cells[4].textContent,
        journalName: cells[5].textContent,
        borrowDate: cells[6].textContent,
        dueDate: cells[7].textContent,
        overdueDays: cells[8].textContent
    };
}

// ==================== 打印催还单 ====================
function printNotice(records) {
    if (!records || records.length === 0) {
        alert('没有可打印的数据！');
        return;
    }
    
    const printWindow = window.open('', '_blank');
    const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>催还通知单</title>
            <style>
                body { font-family: 'SimSun', serif; margin: 20px; }
                h2 { text-align: center; }
                .info { margin: 20px 0; }
                .info p { margin: 5px 0; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #000; padding: 8px; text-align: left; }
                th { background-color: #f0f0f0; }
                .footer { margin-top: 40px; text-align: right; }
                .multiple-records { margin-bottom: 30px; page-break-after: always; }
            </style>
        </head>
        <body>
            ${records.map((record, index) => `
                <div class="${records.length > 1 ? 'multiple-records' : ''}">
                    <h2>期刊催还通知单</h2>
                    <div class="info">
                        <p><strong>编号：</strong>${Date.now()}-${index + 1}</p>
                        <p><strong>日期：</strong>${new Date().toLocaleDateString('zh-CN')}</p>
                    </div>
                    <div class="info">
                        <p><strong>尊敬的 ${record.teacherName}（${record.department}）：</strong></p>
                        <p>您于 ${record.borrowDate} 借阅的期刊已超期，请尽快归还。</p>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>期刊名称</th>
                                <th>借阅日期</th>
                                <th>应还日期</th>
                                <th>超期天数</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>${record.journalName}</td>
                                <td>${record.borrowDate}</td>
                                <td>${record.dueDate}</td>
                                <td>${record.overdueDays}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div class="info">
                        <p><strong>联系方式：</strong>${record.phone}</p>
                        <p><strong>备注：</strong>请尽快到图书馆归还期刊，以免影响您的借阅信用。</p>
                    </div>
                    <div class="footer">
                        <p>图书馆管理员</p>
                        <p>${new Date().toLocaleDateString('zh-CN')}</p>
                    </div>
                </div>
            `).join('')}
        </body>
        </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // 延迟打印，等待内容加载完成
    setTimeout(() => {
        printWindow.print();
    }, 500);
}

// ==================== 批量发送催还通知（新增核心功能） ====================
async function batchSendNotice() {
    if (selectedRecords.size === 0) {
        alert('请先选择要发送的记录！');
        return;
    }

    if (!confirm(`确定要向${selectedRecords.size}位教师批量发送催还通知吗？`)) {
        return;
    }

    // 禁用按钮防止重复点击
    const btn = document.getElementById('batchSendBtn');
    const originalHtml = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>发送中...';

    try {
        // 将Set集合转换为数组
        const borrowIds = Array.from(selectedRecords);
        
        // 调用后端批量发送接口
        const response = await api.post(OVERDUE_API_PATHS.BATCH_SEND_NOTICE, {
            borrowIds: borrowIds
        });

        // 处理响应结果
        if (response.code === 200) {
            const { success, failed, failList } = response.data || {};
            let msg = `批量发送完成！\n成功：${success || 0}条`;
            
            if (failed && failed > 0) {
                msg += `\n失败：${failed}条`;
                console.error('失败详情：', failList);
                
                // 显示前3条失败原因
                if (failList && failList.length > 0) {
                    const showFails = failList.slice(0, 3).map(f => 
                        `${f.borrowId}: ${f.reason}`
                    ).join('\n');
                    msg += `\n\n${showFails}`;
                    if (failList.length > 3) {
                        msg += `\n...等${failList.length}条失败`;
                    }
                }
            }
            
            alert(msg);
            
            // 清空选择并刷新列表
            selectedRecords.clear();
            updateSelectAllCheckbox();
            loadOverdueList(currentPage);
        } else {
            throw new Error(response.message || '批量发送失败');
        }
        
    } catch (error) {
        console.error('批量发送失败:', error);
        alert('批量发送失败：' + (error.message || '未知错误'));
    } finally {
        // 恢复按钮状态
        btn.disabled = false;
        btn.innerHTML = originalHtml;
    }
}

// ==================== 发送催还通知（单条） ====================
async function sendNotice(borrowId) {
    if (!confirm('确定要发送催还通知吗？')) {
        return;
    }
    
    try {
        // 调用后端发送通知接口（邮件/短信）
        await api.post(OVERDUE_API_PATHS.SEND_NOTICE, { borrowId });
        alert('催还通知发送成功！');
        // 可选：刷新当前页数据
        // loadOverdueList(currentPage);
    } catch (error) {
        console.error('发送失败:', error);
        alert('发送失败：' + (error.message || '未知错误'));
    }
}

// ==================== 导出Excel ====================
function exportToExcel() {
    const tbody = document.getElementById('overdueTableBody');
    const rows = tbody.querySelectorAll('tr');
    
    if (rows.length === 0 || rows[0].querySelector('td').colSpan > 1) {
        alert('暂无数据可导出！');
        return;
    }
    
    // 收集所有数据（包括未选中的）
    const allData = [];
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        allData.push({
            '教师ID': cells[1].textContent,
            '姓名': cells[2].textContent,
            '系部': cells[3].textContent,
            '联系方式': cells[4].textContent,
            '期刊名称': cells[5].textContent,
            '借阅日期': cells[6].textContent,
            '应还日期': cells[7].textContent,
            '超期天数': cells[8].textContent,
            '状态': cells[9].textContent
        });
    });
    
    // 创建工作簿
    const ws = XLSX.utils.json_to_sheet(allData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '超期记录');
    
    // 设置列宽
    const colWidths = [
        { wch: 10 }, // 教师ID
        { wch: 10 }, // 姓名
        { wch: 15 }, // 系部
        { wch: 15 }, // 联系方式
        { wch: 25 }, // 期刊名称
        { wch: 12 }, // 借阅日期
        { wch: 12 }, // 应还日期
        { wch: 10 }, // 超期天数
        { wch: 10 }  // 状态
    ];
    ws['!cols'] = colWidths;
    
    // 导出文件
    const fileName = `超期催还记录_${new Date().toLocaleDateString('zh-CN')}.xlsx`;
    XLSX.writeFile(wb, fileName);
    
    alert('Excel导出成功！');
}

// ==================== 查看详情 ====================
async function viewDetail(borrowId) {
    // 实现查看详情逻辑，可以打开模态框显示更多信息
    alert('查看详情功能待实现\n借阅记录ID: ' + borrowId);
}

// ==================== 分页渲染 ====================
function renderPagination(totalPages, currentPage) {
    const container = document.getElementById('paginationContainer');
    
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let html = '<nav aria-label="Page navigation"><ul class="pagination justify-content-center">';
    
    // 上一页
    const prevClass = currentPage === 1 ? 'disabled' : '';
    html += `<li class="page-item ${prevClass}">
                <a class="page-link" href="#" data-page="${currentPage - 1}">上一页</a>
             </li>`;
    
    // 页码计算
    const maxButtons = 7;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);
    
    if (endPage - startPage + 1 < maxButtons) {
        startPage = Math.max(1, endPage - maxButtons + 1);
    }
    
    // 第一页
    if (startPage > 1) {
        html += `<li class="page-item ${currentPage === 1 ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="1">1</a>
                 </li>`;
        if (startPage > 2) {
            html += '<li class="page-item disabled"><span class="page-link">...</span></li>';
        }
    }
    
    // 中间页码
    for (let i = startPage; i <= endPage; i++) {
        const active = i === currentPage ? 'active' : '';
        html += `<li class="page-item ${active}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>`;
    }
    
    // 最后一页
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            html += '<li class="page-item disabled"><span class="page-link">...</span></li>';
        }
        html += `<li class="page-item ${currentPage === totalPages ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${totalPages}">${totalPages}</a>
                 </li>`;
    }
    
    // 下一页
    const nextClass = currentPage === totalPages ? 'disabled' : '';
    html += `<li class="page-item ${nextClass}">
                <a class="page-link" href="#" data-page="${currentPage + 1}">下一页</a>
             </li>`;
    
    html += '</ul></nav>';
    container.innerHTML = html;
    
    // 绑定页码点击事件
    container.querySelectorAll('.page-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            if (this.parentElement.classList.contains('disabled')) return;
            
            const page = parseInt(this.getAttribute('data-page'));
            if (page && page !== currentPage) {
                loadOverdueList(page);
            }
        });
    });
}

// ==================== 更新全选框状态 ====================
function updateSelectAllCheckbox() {
    const checkboxes = document.querySelectorAll('.record-checkbox');
    const selectAllCheckbox = document.getElementById('selectAll');
    const total = checkboxes.length;
    const checked = document.querySelectorAll('.record-checkbox:checked').length;
    
    selectAllCheckbox.checked = total > 0 && total === checked;
}
