// 教师管理JS - 真实后端对接版本（修正版）

// API基础路径配置
const TEACHER_API = {
    LIST: '/teacher/admin/list',      // 获取教师列表（分页）
    GET: '/teacher/admin',            // 获取单个教师
    ADD: '/teacher/admin/add',        // 新增教师
    UPDATE: '/teacher/admin/update',  // 更新教师
    DELETE: '/teacher/admin/delete',  // 删除教师
    SEARCH: '/teacher/admin/search'   // 按手机号查询（支持分页）
};

// 全局分页变量（核心新增：补充分页逻辑）
let currentPage = 1;
let pageSize = 10;
let totalPages = 0;
let totalCount = 0;

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    loadTeachers();

    // 模态框关闭时重置表单
    const teacherModal = document.getElementById('teacherModal');
    teacherModal.addEventListener('hidden.bs.modal', function () {
        resetForm();
    });

    // 绑定分页点击事件（核心新增）
    bindPaginationEvents();
});

// 加载教师列表（核心修正：补充分页参数、优化加载逻辑）
async function loadTeachers(searchParams = {}) {
    try {
        const teacherTableBody = document.getElementById('teacherTableBody');
        teacherTableBody.innerHTML = '<tr><td colspan="9" class="text-center"><i class="fas fa-spinner fa-spin"></i> 加载中...</td></tr>';

        // 拼接分页参数和查询参数
        const params = {
            page: currentPage,
            pageSize: pageSize,
            ...searchParams
        };

        // 调用分页列表接口，后端返回PageResult {data: [], total: number}
        const pageResult = await api.get(TEACHER_API.LIST, params);

        if (!pageResult || !Array.isArray(pageResult.data)) {
            throw new Error('返回数据格式错误，缺少分页数据');
        }

        // 更新分页统计
        totalCount = pageResult.total || 0;
        totalPages = Math.ceil(totalCount / pageSize);

        // 渲染表格和分页
        renderTeacherTable(pageResult.data);
        renderPagination();

        // 更新总数显示（需在页面添加id为totalTeacherCount的元素，如<span id="totalTeacherCount"></span>）
        const totalElement = document.getElementById('totalTeacherCount');
        if (totalElement) {
            totalElement.textContent = totalCount;
        }
    } catch (error) {
        console.error('加载教师列表失败:', error);
        const teacherTableBody = document.getElementById('teacherTableBody');
        teacherTableBody.innerHTML = `<tr><td colspan="9" class="text-center text-danger">
            <i class="fas fa-exclamation-circle"></i> 加载失败: ${error.message || '网络异常，请重试'}
        </td></tr>`;
        // 清空分页
        renderPagination(true);
    }
}

// 渲染教师表格（核心修正：字段空值处理、状态显示优化）
function renderTeacherTable(teachers) {
    const teacherTableBody = document.getElementById('teacherTableBody');

    if (!teachers || teachers.length === 0) {
        teacherTableBody.innerHTML = '<tr><td colspan="9" class="text-center text-muted">暂无教师数据</td></tr>';
        return;
    }

    teacherTableBody.innerHTML = teachers.map(teacher => {
        // 统一ID字段：优先使用teacherId，兼容id字段
        const tid = teacher.teacherId || teacher.id || '-';
        // 空值处理：默认值更严谨
        const maxBorrow = teacher.maxBorrow !== undefined ? teacher.maxBorrow : 5;
        const currentBorrow = teacher.currentBorrow !== undefined ? teacher.currentBorrow : 0;
        // 状态样式和文本统一
        const statusMap = {
            'active': { class: 'bg-success', text: '活跃' },
            'inactive': { class: 'bg-secondary', text: '非活跃' },
            'forbidden': { class: 'bg-danger', text: '禁用' }
        };
        const statusInfo = statusMap[teacher.status] || statusMap.active;

        return `
            <tr>
                <td>${tid}</td>
                <td>${teacher.name || '-'}</td>
                <td>${teacher.department || '-'}</td>
                <td>${teacher.email || '-'}</td>
                <td>${teacher.phone || '-'}</td>
                <td>${maxBorrow}</td>
                <td>${currentBorrow}</td>
                <td>
                    <span class="badge ${statusInfo.class}">${statusInfo.text}</span>
                </td>
                <td>
                    <button class="btn btn-sm btn-primary me-1" onclick="editTeacher('${tid}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteTeacher('${tid}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// 新增/编辑教师（核心修正：表单验证、重复点击、字段校验）
async function saveTeacher(event) {
    // 兼容event对象，避免调用时未传递event导致报错
    event = event || window.event;
    const submitBtn = event.target || event.srcElement;

    const form = document.getElementById('teacherForm');
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    const teacherId = document.getElementById('teacherId').value;
    const isEdit = !!teacherId;

    const teacherData = {
        id: teacherId,
        name: document.getElementById('name').value.trim(),
        department: document.getElementById('department').value,
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        maxBorrow: parseInt(document.getElementById('maxBorrow').value) || 5,
        status: document.getElementById('status').value,
        // 核心修正：currentBorrow是后端计算字段，不允许前端修改，移除该字段
        // currentBorrow: parseInt(document.getElementById('currentBorrow').value) || 0
    };

    // 移除空值字段（避免传递空字符串给后端）
    Object.keys(teacherData).forEach(key => {
        if (teacherData[key] === '' || teacherData[key] === null || teacherData[key] === undefined) {
            delete teacherData[key];
        }
    });

    try {
        // 禁用按钮防止重复提交
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 保存中...';

        if (isEdit) {
            // 编辑模式 - 使用PUT请求
            await api.put(TEACHER_API.UPDATE, teacherData);
            alert('教师信息更新成功！');
        } else {
            // 新增模式 - 使用POST请求
            // 移除ID字段（新增时ID由后端生成）
            delete teacherData.id;
            await api.post(TEACHER_API.ADD, teacherData);
            alert('教师新增成功！');
        }

        // 关闭模态框
        const modal = bootstrap.Modal.getInstance(document.getElementById('teacherModal'));
        modal.hide();

        // 刷新列表（回到第一页）
        currentPage = 1;
        loadTeachers();
    } catch (error) {
        console.error('保存教师失败:', error);
        alert(`保存失败: ${error.message || '业务异常，请联系管理员'}`);
    } finally {
        // 恢复按钮状态
        submitBtn.disabled = false;
        submitBtn.innerHTML = '保存';
    }
}

// 编辑教师 - 加载数据到模态框（核心修正：先加载数据再显示模态框，避免闪烁）
async function editTeacher(teacherId) {
    if (!teacherId || teacherId === '-') {
        alert('无效的教师ID');
        return;
    }

    try {
        // 先显示加载提示（可选）
        const modal = new bootstrap.Modal(document.getElementById('teacherModal'));
        resetForm(); // 先重置表单

        // 核心修正：先获取数据，再显示模态框
        const teacher = await api.get(`${TEACHER_API.GET}/${teacherId}`);
        if (!teacher) {
            throw new Error('未查询到该教师信息');
        }

        // 填充表单
        document.getElementById('modalTitle').textContent = '编辑教师';
        document.getElementById('teacherId').value = teacher.teacherId || teacher.id || '';
        document.getElementById('name').value = teacher.name || '';
        document.getElementById('department').value = teacher.department || '';
        document.getElementById('email').value = teacher.email || '';
        document.getElementById('phone').value = teacher.phone || '';
        document.getElementById('maxBorrow').value = teacher.maxBorrow ?? 5;
        // 核心修正：currentBorrow设为只读，仅展示不允许修改
        document.getElementById('currentBorrow').value = teacher.currentBorrow ?? 0;
        document.getElementById('currentBorrow').setAttribute('readonly', true);
        document.getElementById('status').value = teacher.status || 'active';

        // 设置ID字段为只读
        document.getElementById('teacherId').setAttribute('readonly', true);

        // 再显示模态框
        modal.show();
    } catch (error) {
        console.error('加载教师详情失败:', error);
        alert(`加载教师信息失败: ${error.message}`);
    }
}

// 删除教师（核心修正：增加二次确认、错误提示优化）
async function deleteTeacher(teacherId) {
    if (!teacherId || teacherId === '-') {
        alert('无效的教师ID');
        return;
    }

    if (!confirm('确定要删除该教师吗？删除后将无法恢复，且关联的借阅记录可能受影响！')) {
        return;
    }

    try {
        await api.del(`${TEACHER_API.DELETE}/${teacherId}`);
        alert('教师删除成功！');
        // 刷新列表（如果当前页只有一条数据，回到上一页）
        if (totalCount % pageSize === 1 && currentPage > 1) {
            currentPage--;
        }
        loadTeachers();
    } catch (error) {
        console.error('删除教师失败:', error);
        alert(`删除失败: ${error.message || '该教师存在关联借阅记录，无法删除'}`);
    }
}

// 按手机号查询（核心修正：参数传递、分页支持）
async function searchByPhone() {
    const phone = document.getElementById('phoneSearch').value.trim();
    if (!phone) {
        alert('请输入手机号');
        return;
    }

    try {
        const teacherTableBody = document.getElementById('teacherTableBody');
        teacherTableBody.innerHTML = '<tr><td colspan="9" class="text-center"><i class="fas fa-spinner fa-spin"></i> 查询中...</td></tr>';

        // 核心修正：GET请求参数正确传递方式，重置分页到第一页
        currentPage = 1;
        const pageResult = await api.get(TEACHER_API.SEARCH, {
            phone: phone,
            page: currentPage,
            pageSize: pageSize
        });

        // 渲染结果（兼容单条和多条返回）
        const data = Array.isArray(pageResult.data) ? pageResult.data : (pageResult ? [pageResult] : []);
        renderTeacherTable(data);
        // 更新分页
        totalCount = pageResult.total || data.length;
        totalPages = Math.ceil(totalCount / pageSize);
        renderPagination();

        // 更新总数显示
        const totalElement = document.getElementById('totalTeacherCount');
        if (totalElement) {
            totalElement.textContent = totalCount;
        }
    } catch (error) {
        console.error('查询失败:', error);
        alert(`查询失败: ${error.message}`);
        loadTeachers(); // 失败后重新加载全部数据
    }
}

// 重置搜索
function resetSearch() {
    document.getElementById('phoneSearch').value = '';
    currentPage = 1; // 重置分页
    loadTeachers();
}

// 导出Excel（CSV）（核心修正：文件名兼容、数据处理优化）
function exportTeachers() {
    try {
        const table = document.querySelector('.data-table');
        const rows = Array.from(table.querySelectorAll('tbody tr'));

        if (rows.length === 0 || (rows[0].cells.length === 1 && rows[0].cells[0].colSpan > 1)) {
            alert('暂无数据可导出');
            return;
        }

        let csvContent = '\uFEFF'; // UTF-8 BOM（解决中文乱码）
        csvContent += '教师ID,姓名,系部,邮箱,手机号,最大借阅量,当前借阅量,状态\n';

        rows.forEach(row => {
            const cells = Array.from(row.cells);
            const rowData = cells.slice(0, 8).map(cell => {
                let text = cell.textContent.trim();
                // 提取状态标签文本
                if (cell.querySelector('.badge')) {
                    text = cell.querySelector('.badge').textContent.trim();
                }
                // CSV格式转义：处理逗号、引号、换行
                if (text.includes(',') || text.includes('"') || text.includes('\n')) {
                    text = `"${text.replace(/"/g, '""')}"`; // 双引号转义
                }
                return text;
            });
            csvContent += rowData.join(',') + '\n';
        });

        // 创建下载链接
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        // 核心修正：文件名替换特殊字符（/），避免下载失败
        const fileName = `教师信息_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`;
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // 释放URL对象
        URL.revokeObjectURL(url);

        alert('导出成功！');
    } catch (error) {
        console.error('导出失败:', error);
        alert(`导出失败: ${error.message || '请检查浏览器权限'}`);
    }
}

// 重置表单（核心修正：恢复currentBorrow可编辑状态、清空只读属性）
function resetForm() {
    const form = document.getElementById('teacherForm');
    form.reset();
    document.getElementById('modalTitle').textContent = '新增教师';
    const teacherIdInput = document.getElementById('teacherId');
    teacherIdInput.removeAttribute('readonly');
    teacherIdInput.value = '';
    // 核心修正：新增时currentBorrow恢复可编辑（但实际仅展示，提交时不传递）
    const currentBorrowInput = document.getElementById('currentBorrow');
    currentBorrowInput.value = 0;
    currentBorrowInput.removeAttribute('readonly');
    form.classList.remove('was-validated');
}

// ==================== 分页相关功能（核心新增） ====================
// 渲染分页控件
function renderPagination(empty = false) {
    const paginationContainer = document.getElementById('paginationContainer');
    if (!paginationContainer) return; // 页面未定义分页容器则跳过

    if (empty || totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }

    let html = '<nav aria-label="教师列表分页"><ul class="pagination justify-content-center">';

    // 上一页
    const prevClass = currentPage === 1 ? 'disabled' : '';
    html += `<li class="page-item ${prevClass}">
                <a class="page-link" href="#" onclick="changePage(${currentPage - 1})">上一页</a>
             </li>`;

    // 页码（最多显示5个）
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
        const activeClass = i === currentPage ? 'active' : '';
        html += `<li class="page-item ${activeClass}">
                    <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
                 </li>`;
    }

    // 下一页
    const nextClass = currentPage === totalPages ? 'disabled' : '';
    html += `<li class="page-item ${nextClass}">
                <a class="page-link" href="#" onclick="changePage(${currentPage + 1})">下一页</a>
             </li>`;

    // 总数显示
    html += `<li class="page-item disabled">
                <span class="page-link">共 ${totalCount} 条 / ${totalPages} 页</span>
             </li>`;

    html += '</ul></nav>';
    paginationContainer.innerHTML = html;
}

// 切换页码
function changePage(page) {
    if (page < 1 || page > totalPages || page === currentPage) return;
    currentPage = page;
    loadTeachers();
}

// 绑定分页事件（预留扩展）
function bindPaginationEvents() {
    // 可扩展：绑定页码输入跳转、每页条数切换等事件
}