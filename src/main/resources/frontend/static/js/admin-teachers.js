// 教师管理JS - 真实后端对接版本

// API基础路径配置
const TEACHER_API = {
    LIST: '/teacher/admin/list',      // 获取教师列表
    GET: '/teacher/admin',            // 获取单个教师
    ADD: '/teacher/admin/add',        // 新增教师
    UPDATE: '/teacher/admin/update',  // 更新教师
    DELETE: '/teacher/admin',         // 删除教师
    SEARCH: '/teacher/admin/search'   // 按手机号查询
};

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    loadTeachers();
    
    // 模态框关闭时重置表单
    const teacherModal = document.getElementById('teacherModal');
    teacherModal.addEventListener('hidden.bs.modal', function () {
        resetForm();
    });
});

// 加载教师列表
async function loadTeachers() {
    try {
        const teacherTableBody = document.getElementById('teacherTableBody');
        teacherTableBody.innerHTML = '<tr><td colspan="9" class="text-center"><i class="fas fa-spinner fa-spin"></i> 加载中...</td></tr>';
        
        const data = await api.get(TEACHER_API.LIST);
        
        if (!data || !Array.isArray(data)) {
            throw new Error('返回数据格式错误');
        }
        
        renderTeacherTable(data);
    } catch (error) {
        console.error('加载教师列表失败:', error);
        const teacherTableBody = document.getElementById('teacherTableBody');
        teacherTableBody.innerHTML = `<tr><td colspan="9" class="text-center text-danger">
            <i class="fas fa-exclamation-circle"></i> 加载失败: ${error.message}
        </td></tr>`;
    }
}

// 渲染教师表格
function renderTeacherTable(teachers) {
    const teacherTableBody = document.getElementById('teacherTableBody');
    
    if (!teachers || teachers.length === 0) {
        teacherTableBody.innerHTML = '<tr><td colspan="9" class="text-center text-muted">暂无教师数据</td></tr>';
        return;
    }
    
    teacherTableBody.innerHTML = teachers.map(teacher => `
        <tr>
            <td>${teacher.teacherId || teacher.id || '-'}</td>
            <td>${teacher.name || '-'}</td>
            <td>${teacher.department || '-'}</td>
            <td>${teacher.email || '-'}</td>
            <td>${teacher.phone || '-'}</td>
            <td>${teacher.maxBorrow ?? 5}</td>
            <td>${teacher.currentBorrow ?? 0}</td>
            <td>
                <span class="badge ${teacher.status === 'active' ? 'bg-success' : 'bg-secondary'}">
                    ${teacher.status === 'active' ? '活跃' : '非活跃'}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-primary me-1" onclick="editTeacher('${teacher.teacherId || teacher.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteTeacher('${teacher.teacherId || teacher.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// 新增/编辑教师
async function saveTeacher() {
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
        currentBorrow: parseInt(document.getElementById('currentBorrow').value) || 0
    };
    
    // 移除空值字段
    Object.keys(teacherData).forEach(key => {
        if (teacherData[key] === '' || teacherData[key] === null || teacherData[key] === undefined) {
            delete teacherData[key];
        }
    });
    
    try {
        const submitBtn = event.target;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 保存中...';
        
        if (isEdit) {
            // 编辑模式 - 使用PUT请求
            await api.put(TEACHER_API.UPDATE, teacherData);
            alert('教师信息更新成功！');
        } else {
            // 新增模式 - 使用POST请求
            // 移除ID字段（新增时ID由后端生成或使用业务ID）
            delete teacherData.id;
            await api.post(TEACHER_API.ADD, teacherData);
            alert('教师新增成功！');
        }
        
        // 关闭模态框
        const modal = bootstrap.Modal.getInstance(document.getElementById('teacherModal'));
        modal.hide();
        
        // 刷新列表
        loadTeachers();
    } catch (error) {
        console.error('保存教师失败:', error);
        alert(`保存失败: ${error.message}`);
    } finally {
        const submitBtn = event.target;
        submitBtn.disabled = false;
        submitBtn.innerHTML = '保存';
    }
}

// 编辑教师 - 加载数据到模态框
async function editTeacher(teacherId) {
    if (!teacherId) {
        alert('无效的教师ID');
        return;
    }
    
    try {
        // 显示模态框并加载数据
        const modal = new bootstrap.Modal(document.getElementById('teacherModal'));
        modal.show();
        
        // 获取教师详细信息
        const teacher = await api.get(`${TEACHER_API.GET}/${teacherId}`);
        
        // 填充表单
        document.getElementById('modalTitle').textContent = '编辑教师';
        document.getElementById('teacherId').value = teacher.teacherId || teacher.id;
        document.getElementById('name').value = teacher.name || '';
        document.getElementById('department').value = teacher.department || '';
        document.getElementById('email').value = teacher.email || '';
        document.getElementById('phone').value = teacher.phone || '';
        document.getElementById('maxBorrow').value = teacher.maxBorrow ?? 5;
        document.getElementById('currentBorrow').value = teacher.currentBorrow ?? 0;
        document.getElementById('status').value = teacher.status || 'active';
        
        // 设置ID字段为只读
        document.getElementById('teacherId').setAttribute('readonly', true);
        
    } catch (error) {
        console.error('加载教师详情失败:', error);
        alert(`加载教师信息失败: ${error.message}`);
    }
}

// 删除教师
async function deleteTeacher(teacherId) {
    if (!teacherId) {
        alert('无效的教师ID');
        return;
    }
    
    if (!confirm('确定要删除该教师吗？此操作不可恢复！')) {
        return;
    }
    
    try {
        await api.del(`${TEACHER_API.DELETE}/${teacherId}`);
        alert('教师删除成功！');
        loadTeachers();
    } catch (error) {
        console.error('删除教师失败:', error);
        alert(`删除失败: ${error.message}`);
    }
}

// 按手机号查询
async function searchByPhone() {
    const phone = document.getElementById('phoneSearch').value.trim();
    if (!phone) {
        alert('请输入手机号');
        return;
    }
    
    try {
        const teacherTableBody = document.getElementById('teacherTableBody');
        teacherTableBody.innerHTML = '<tr><td colspan="9" class="text-center"><i class="fas fa-spinner fa-spin"></i> 查询中...</td></tr>';
        
        const data = await api.get(TEACHER_API.SEARCH, { phone: phone });
        renderTeacherTable(Array.isArray(data) ? data : [data]);
    } catch (error) {
        console.error('查询失败:', error);
        alert(`查询失败: ${error.message}`);
        loadTeachers(); // 失败后重新加载全部数据
    }
}

// 重置搜索
function resetSearch() {
    document.getElementById('phoneSearch').value = '';
    loadTeachers();
}

// 导出Excel（前端导出）
function exportTeachers() {
    try {
        const table = document.querySelector('.data-table');
        const rows = Array.from(table.querySelectorAll('tbody tr'));
        
        if (rows.length === 0 || rows[0].cells.length === 1) {
            alert('暂无数据可导出');
            return;
        }
        
        let csvContent = '\uFEFF'; // UTF-8 BOM
        csvContent += '教师ID,姓名,系部,邮箱,手机号,最大借阅量,当前借阅量,状态\n';
        
        rows.forEach(row => {
            const cells = Array.from(row.cells);
            const rowData = cells.slice(0, 8).map(cell => {
                let text = cell.textContent.trim();
                // 处理状态列
                if (cell.querySelector('.badge')) {
                    text = cell.querySelector('.badge').textContent.trim();
                }
                // CSV转义
                if (text.includes(',') || text.includes('"')) {
                    return `"${text.replace(/"/g, '""')}"`;
                }
                return text;
            });
            csvContent += rowData.join(',') + '\n';
        });
        
        // 创建下载链接
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `教师信息_${new Date().toLocaleDateString()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        alert('导出成功！');
    } catch (error) {
        console.error('导出失败:', error);
        alert('导出失败，请重试');
    }
}

// 重置表单
function resetForm() {
    document.getElementById('teacherForm').reset();
    document.getElementById('modalTitle').textContent = '新增教师';
    document.getElementById('teacherId').removeAttribute('readonly');
    document.getElementById('currentBorrow').value = 0;
    document.getElementById('teacherForm').classList.remove('was-validated');
}