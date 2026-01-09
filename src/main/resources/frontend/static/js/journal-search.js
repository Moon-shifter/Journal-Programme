// 期刊查询页面交互逻辑（修正版）
document.addEventListener('DOMContentLoaded', () => {
    // ========== 1. DOM元素获取与校验（核心修正：增加空值校验） ==========
    const searchForm = document.getElementById('searchForm');
    const resetBtn = document.getElementById('resetBtn');
    const backHomeBtn = document.getElementById('backHomeBtn');
    const journalTableBody = document.getElementById('journalTableBody');
    const totalCountEl = document.getElementById('totalCount');
    const currentPageEl = document.getElementById('currentPage');
    const totalPagesEl = document.getElementById('totalPages');
    const firstPageBtn = document.getElementById('firstPage');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const lastPageBtn = document.getElementById('lastPage');
    const detailModal = document.getElementById('detailModal');
    const closeModalBtn = document.getElementById('closeModal');
    const journalDetailContent = document.getElementById('journalDetailContent');

    // 校验核心DOM元素，缺失则提示并终止初始化
    const requiredElements = [searchForm, journalTableBody, totalCountEl, currentPageEl, totalPagesEl];
    const missingElements = requiredElements.filter(el => !el);
    if (missingElements.length > 0) {
        console.error('缺失核心DOM元素，页面初始化失败');
        showAlert('页面加载异常，请刷新重试', 'error');
        return;
    }

    // ========== 2. 分页参数（保持不变，增加注释） ==========
    let currentPage = 1;          // 当前页码
    const pageSize = 10;          // 每页条数
    let totalCount = 0;           // 总记录数
    let totalPages = 1;           // 总页数
    let isLoading = false;        // 加载状态锁（核心新增：防重复请求）

    // ========== 3. 初始化页面 ==========
    init();

    function init() {
        // 绑定事件监听（核心修正：searchForm改为submit事件）
        searchForm.addEventListener('submit', handleSearch);
        
        /**
         * 处理搜索请求（核心修正：submit事件、加载状态）
         */
        async function handleSearch(e) {
            e.preventDefault();
            // 防重复提交
            if (isLoading) return;
            currentPage = 1; // 重置为第一页
            await fetchJournalList();
        }
        if (resetBtn) resetBtn.addEventListener('click', handleReset);
        if (backHomeBtn) backHomeBtn.addEventListener('click', handleBackHome);
        if (firstPageBtn) firstPageBtn.addEventListener('click', () => goToPage(1));
        if (prevPageBtn) prevPageBtn.addEventListener('click', () => goToPage(currentPage - 1));
        if (nextPageBtn) nextPageBtn.addEventListener('click', () => goToPage(currentPage + 1));
        if (lastPageBtn) lastPageBtn.addEventListener('click', () => goToPage(totalPages));
        if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
        if (detailModal) detailModal.addEventListener('click', handleModalClick);

        // 核心新增：事件委托替代全局函数，避免污染window
        journalTableBody.addEventListener('click', (e) => {
            const viewBtn = e.target.closest('.btn-view');
            if (viewBtn) {
                const journalId = viewBtn.dataset.id; // 改用data-id传递ID
                if (journalId) viewJournalDetail(journalId);
            }
        });

        // 初始化加载第一页数据
        fetchJournalList();
    }

    // ========== 4. 核心业务逻辑 ==========
    /**
     * 返回主页（核心修正：增加localStorage解析容错、权限校验优化）
     */
    function handleBackHome() {
        try {
            const teacherStr = localStorage.getItem("teacherInfo");
            if (!teacherStr) {
                window.location.href = "/login.html";
                return;
            }
            window.location.href = "/pages/teacher/teacher-index.html";
        } catch (error) {
            console.error("返回主页失败:", error);
            window.location.href = "/pages/teacher/teacher-index.html";
        }
    }

    /**
     * 重置查询条件（核心修正：清空表单、重置分页、刷新列表）
     */
    function handleReset() {
        // 重置表单
        searchForm.reset();
        // 重置分页
        currentPage = 1;
        // 刷新列表
        fetchJournalList();
    }

    /**
     * 点击遮罩层关闭模态框（核心修正：事件委托优化）
     */
    function handleModalClick(e) {
        if (e.target === detailModal) {
            closeModal();
        }
    }

    /**
     * 转义特殊字符（核心修正：适配URL和SQL通配符）
     */
    function escapeKeyword(keyword) {
        if (!keyword) return keyword;
        // 转义SQL通配符
        return keyword.replace(/([%_])/g, "\\$1");
    }

    /**
     * 获取期刊列表（核心修正：参数处理、API调用、数据处理）
     */
    async function fetchJournalList() {
        isLoading = true;
        // 显示加载状态
        try {
            // 收集参数
            const keyword = document.getElementById('searchKeyword')?.value;
            const category = document.getElementById('category')?.value;
            const issn = document.getElementById('issn')?.value;
            const status = document.getElementById('status')?.value;

            // 过滤+标准化参数（空值不传递）
            const params = {};
            if (keyword) {
                params.keyword = escapeKeyword(keyword);
            }
            if (category && category !== '') {
                params.category = category;
            }
            if (issn) {
                params.issn = issn;
            }
            if (status && status !== '') {
                params.status = status;
            }
            params.page = currentPage;
            params.pageSize = pageSize;

            // 调用后端接口
            const response = await api.get('/journal/journals/multi-search', params);
            
            // 校验返回数据格式
            if (!response || !response.data || !Array.isArray(response.data.data)) {
                throw new Error('返回数据格式错误');
            }
            
            // 更新数据
            const { data, total } = response.data;
            totalCount = total || 0;
            totalPages = Math.ceil(totalCount / pageSize);
            
            // 渲染表格和分页
            renderJournalTable(data);
            updatePagination();
            
        } catch (error) {
            console.error('获取期刊列表失败:', error);
            // 显示错误UI
            journalTableBody.innerHTML = `<tr><td colspan="9" class="error-result">获取期刊列表失败: ${error.message || '未知错误'}</td></tr>`;
            // 重置分页控件
            totalCount = 0;
            totalPages = 1;
            updatePagination();
        } finally {
            isLoading = false;
        }
    }

    /**
     * 渲染期刊表格（核心优化：空值处理、data-id传递ID）
     */
    function renderJournalTable(journals) {
        journalTableBody.innerHTML = '';

        if (!Array.isArray(journals) || journals.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `<td colspan="9" class="empty-result text-center py-3 text-muted">暂无符合条件的期刊数据</td>`;
            journalTableBody.appendChild(emptyRow);
            return;
        }

        journals.forEach(journal => {
            const row = document.createElement('tr');
            // 空值兜底处理
            const publishDate = formatDate(journal.publishDate);
            const availableQuantity = journal.availableQuantity ?? 0;
            const statusClass = journal.status === 'available' ? 'status-available' : 'status-unavailable';
            const statusText = journal.status === 'available' ? '可借阅' : '不可借阅';

            row.innerHTML = `
                <td>${journal.name || '-'}</td>
                <td>${journal.issueNumber || '-'}</td> <!-- 新增卷/期列 -->
                <td>${journal.issn || '-'}</td>
                <td>${journal.category || '-'}</td>
                <td>${journal.publisher || '-'}</td>
                <td>${publishDate}</td>
                <td>${availableQuantity}</td>
                <td>
                  <span class="status-tag ${statusClass}">${statusText}</span>
                </td>
                <td>
                  <button class="btn-view" data-id="${journal.id}">
                    <i class="fas fa-eye"></i> 详情
                  </button>
                </td>
            `;
            journalTableBody.appendChild(row);
        });
    }

    // ========== 其他函数保持不变 ==========
});