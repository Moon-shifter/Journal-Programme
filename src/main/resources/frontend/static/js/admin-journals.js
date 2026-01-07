// ==================== API路径配置（根据接口文档） ====================
const JOURNAL_API_PATHS = {
    LIST: '/journal/journals',
    DETAIL: (id) => `/journal/${id}`,
    ADD: '/journal/admin/add',
    UPDATE: '/journal/admin/update',
    DELETE: (id) => `/journal/admin/delete/${id}`
};

// ==================== 字段名映射配置（代码下划线 → 文档驼峰） ====================
const FIELD_NAME_MAPPING = {
    'id': 'id',
    'NAME': 'name',
    'ISSN': 'issn',
    'category': 'category',
    'publisher': 'publisher',
    'publish_date': 'publishDate',
    'issue_number': 'issueNumber',
    'STATUS': 'status',
    'total_quantity': 'totalQuantity',
    'available_quantity': 'availableQuantity',
    'description': 'description'
};

// ==================== 全局变量 ====================
let currentPage = 1;
let totalPages = 0;
let pageSize = 10;
let lastSearchValue = '';

// ==================== 页面初始化 ====================
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
});

// 初始化页面
async function initializePage() {
    try {
        await performSearch('', 1);
    } catch (error) {
        console.error('初始化失败:', error);
        alert('页面初始化失败，请刷新重试');
    }
    bindEventListeners();
}

// 绑定所有事件监听器
function bindEventListeners() {
    // 侧边栏折叠
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const toggleBtn = document.getElementById('toggleSidebar');
    
    toggleBtn.addEventListener('click', function() {
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
    });

    // 搜索功能
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    
    searchBtn.addEventListener('click', function() {
        const ssbnValue = searchInput.value.trim();
        lastSearchValue = ssbnValue;
        performSearch(ssbnValue, 1);
    });
    
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchBtn.click();
        }
    });

    // 表格操作按钮（事件委托）
    const tbody = document.getElementById('journalTableBody');
    tbody.addEventListener('click', function(e) {
        const button = e.target.closest('button');
        if (!button) return;
        
        const id = button.getAttribute('data-id');
        if (!id) return;
        
        if (button.classList.contains('edit-btn')) {
            handleEdit(id);
        }
        if (button.classList.contains('delete-btn')) {
            handleDelete(id);
        }
    });

    // 保存按钮点击事件
    const saveBtn = document.getElementById('saveBtn');
    saveBtn.addEventListener('click', handleFormSubmit);

    // 模态框关闭时清理状态
    const modal = document.getElementById('addJournalModal');
    modal.addEventListener('hidden.bs.modal', function() {
        const form = document.getElementById('journalForm');
        form.reset();
        delete form.dataset.editId;
        document.getElementById('addJournalModalLabel').textContent = '添加期刊';
        document.getElementById('id').readOnly = false;
        document.getElementById('id').style.backgroundColor = '';
    });
}

// ==================== 查询功能 ====================
async function performSearch(ssbn, page) {
    const tbody = document.getElementById('journalTableBody');
    const paginationContainer = document.getElementById('paginationContainer');
    
    tbody.innerHTML = '<tr><td colspan="10" class="text-center py-4"><i class="fas fa-spinner fa-spin"></i> 正在加载数据...</td></tr>';
    paginationContainer.innerHTML = '';

    try {
        const params = {
            page: page,
            pageSize: pageSize
        };
        
        if (ssbn) {
            params.ssbn = ssbn;
        }
        
        // 使用配置路径
        const response = await api.get(JOURNAL_API_PATHS.LIST, params);
        
        if (response && response.list) {
            currentPage = page;
            renderTable(response.list);
            
            const total = response.total || 0;
            totalPages = Math.ceil(total / pageSize);
            renderPagination(totalPages, page);
        } else {
            throw new Error('后端返回数据格式错误');
        }
        
    } catch (error) {
        console.error('查询失败:', error);
        tbody.innerHTML = '<tr><td colspan="10" class="text-center py-4 text-danger">数据加载失败，请重试</td></tr>';
        paginationContainer.innerHTML = '';
    }
}

// ==================== 表格渲染 ====================
function renderTable(data) {
    const tbody = document.getElementById('journalTableBody');
    
    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" class="text-center py-4">暂无数据</td></tr>';
        return;
    }
    
    // 兼容后端驼峰命名和代码下划线命名
    tbody.innerHTML = data.map(item => `
        <tr>
            <td><strong>${item.name || item.NAME}</strong></td>
            <td>${item.issn || item.ISSN}</td>
            <td>${item.category}</td>
            <td>${item.publisher}</td>
            <td>${item.publishDate || item.publish_date}</td>
            <td>${item.issueNumber || item.issue_number}</td>
            <td>${item.totalQuantity || item.total_quantity}</td>
            <td>${item.availableQuantity || item.available_quantity}</td>
            <td>${item.status === 'available' ? '可用' : '停用'}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-primary btn-icon-sm edit-btn" 
                            data-id="${item.id}" title="编辑">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger btn-icon-sm delete-btn" 
                            data-id="${item.id}" title="删除">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// ==================== 表单提交（核心修改） ====================
async function handleFormSubmit() {
    const form = document.getElementById('journalForm');
    const editId = form.dataset.editId;
    
    // 收集表单数据（内部字段名）
    const internalData = {
        id: document.getElementById('id').value.trim(),
        NAME: document.getElementById('NAME').value.trim(),
        ISSN: document.getElementById('ISSN').value.trim(),
        category: document.getElementById('category').value.trim(),
        publisher: document.getElementById('publisher').value.trim(),
        publish_date: document.getElementById('publish_date').value.trim(),
        issue_number: document.getElementById('issue_number').value.trim(),
        STATUS: document.getElementById('STATUS').value.trim(),
        total_quantity: document.getElementById('total_quantity').value.trim(),
        available_quantity: document.getElementById('available_quantity').value.trim(),
        description: document.getElementById('description').value.trim()
    };
    
    // 字段名转换：下划线 → 驼峰
    const data = {};
    for (let key in internalData) {
        const mappedKey = FIELD_NAME_MAPPING[key];
        if (mappedKey) {
            data[mappedKey] = internalData[key];
        }
    }
    
    // 类型转换
    data.id = parseInt(data.id);
    data.totalQuantity = parseInt(data.totalQuantity);
    data.availableQuantity = parseInt(data.availableQuantity);
    
    // 字段中文名映射（用于提示）
    const fieldNames = {
        'id': '期刊ID',
        'name': '期刊名称',
        'issn': 'SSBN号',
        'category': '学科分类',
        'publisher': '出版社',
        'publishDate': '出版日期',
        'status': '状态',
        'totalQuantity': '馆藏数量',
        'availableQuantity': '可借数量'
    };
    
    // 必填验证（使用转换后的字段名）
    const requiredFields = ['id', 'name', 'issn', 'category', 'publisher', 
                           'publishDate', 'status', 'totalQuantity', 'availableQuantity'];
    
    for (let field of requiredFields) {
        if (!data[field] && data[field] !== 0) {
            alert(`请填写${fieldNames[field]}`);
            // 将驼峰转回下划线找元素
            const elementId = field.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
            document.getElementById(elementId).focus();
            return;
        }
    }
    
    // ID格式验证
    if (!Number.isInteger(data.id) || data.id <= 0) {
        alert('期刊ID必须为大于0的数字！');
        document.getElementById('id').focus();
        return;
    }
    
    // 数量逻辑验证
    if (data.availableQuantity > data.totalQuantity) {
        alert('可借数量不能大于馆藏数量！');
        document.getElementById('available_quantity').focus();
        return;
    }
    
    // 提交数据
    try {
        let response;
        
        if (editId) {
            // 编辑模式：文档要求id在请求体
            data.id = parseInt(editId);
            response = await api.put(JOURNAL_API_PATHS.UPDATE, data);
            alert('修改成功！');
        } else {
            // 添加模式
            response = await api.post(JOURNAL_API_PATHS.ADD, data);
            alert('添加成功！');
        }
        
        // 关闭模态框
        const modal = bootstrap.Modal.getInstance(document.getElementById('addJournalModal'));
        modal.hide();
        
        // 刷新列表
        await performSearch(lastSearchValue, 1);
        
    } catch (error) {
        console.error('保存失败:', error);
        alert('保存失败：' + (error.message || '未知错误'));
    }
}

// ==================== 编辑功能 ====================
async function handleEdit(id) {
    const modal = new bootstrap.Modal(document.getElementById('addJournalModal'));
    const form = document.getElementById('journalForm');
    
    try {
        // 使用配置路径
        const response = await api.get(JOURNAL_API_PATHS.DETAIL(id));
        const journal = response;
        
        // 填充表单（兼容驼峰和下划线）
        document.getElementById('id').value = journal.id || '';
        document.getElementById('NAME').value = journal.name || journal.NAME || '';
        document.getElementById('ISSN').value = journal.issn || journal.ISSN || '';
        document.getElementById('category').value = journal.category || '';
        document.getElementById('publisher').value = journal.publisher || '';
        document.getElementById('publish_date').value = journal.publishDate || journal.publish_date || '';
        document.getElementById('issue_number').value = journal.issueNumber || journal.issue_number || '';
        document.getElementById('STATUS').value = journal.status || journal.STATUS || '';
        document.getElementById('total_quantity').value = journal.totalQuantity || journal.total_quantity || '';
        document.getElementById('available_quantity').value = journal.availableQuantity || journal.available_quantity || '';
        document.getElementById('description').value = journal.description || '';
        
        // 设置编辑ID标识
        form.dataset.editId = id;
        document.getElementById('addJournalModalLabel').textContent = '编辑期刊';
        
        // ** 编辑时ID设为只读 **
        document.getElementById('id').readOnly = true;
        document.getElementById('id').style.backgroundColor = '#e9ecef';
        
        modal.show();
        
    } catch (error) {
        console.error('获取期刊详情失败:', error);
        alert('获取数据失败，请重试');
    }
}

// ==================== 删除功能 ====================
async function handleDelete(id) {
    if (!confirm('确定要删除该期刊吗？此操作不可恢复。')) {
        return;
    }
    
    try {
        // 使用配置路径
        await api.del(JOURNAL_API_PATHS.DELETE(id));
        
        alert('删除成功！');
        
        // 刷新列表
        await performSearch(lastSearchValue, currentPage);
        
    } catch (error) {
        console.error('删除失败:', error);
        alert('删除失败：' + (error.message || '未知错误'));
    }
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
                performSearch(lastSearchValue, page);
            }
        });
    });
}