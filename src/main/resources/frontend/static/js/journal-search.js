// 期刊查询页面交互逻辑（仅修复核心问题版）
document.addEventListener('DOMContentLoaded', () => {
    // ========== 1. DOM元素获取与校验（保留原有） ==========
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
        // 注释：保留原有alert逻辑，若你有showAlert则用，没有则临时提示
        alert('页面加载异常，请刷新重试');
        return;
    }

    // ========== 2. 分页参数（保留原有） ==========
    let currentPage = 1;          // 当前页码
    const pageSize = 10;          // 每页条数
    let totalCount = 0;           // 总记录数
    let totalPages = 1;           // 总页数
    let isLoading = false;        // 加载状态锁（核心新增：防重复请求）

    // ========== 核心修复1：补充缺失的formatDate函数（解决截图报错） ==========
    function formatDate(dateStr) {
        if (!dateStr) return '-';
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return '-';
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        } catch (error) {
            console.error('日期格式化失败:', error);
            return '-';
        }
    }

    // ========== 3. 初始化页面 ==========
    init();

    function init() {
        // 核心修复2：搜索事件绑定+防重复提交（解决点击搜索无反应）
        searchForm.addEventListener('submit', async function(e) {
            e.preventDefault(); // 阻止表单默认刷新
            if (isLoading) return; // 防重复点击
            currentPage = 1; // 搜索重置为第一页
            await fetchJournalList();
        });

        // 保留原有事件绑定
        if (resetBtn) resetBtn.addEventListener('click', handleReset);
        if (backHomeBtn) backHomeBtn.addEventListener('click', handleBackHome);
        if (firstPageBtn) firstPageBtn.addEventListener('click', () => goToPage(1));
        if (prevPageBtn) prevPageBtn.addEventListener('click', () => goToPage(currentPage - 1));
        if (nextPageBtn) nextPageBtn.addEventListener('click', () => goToPage(currentPage + 1));
        if (lastPageBtn) lastPageBtn.addEventListener('click', () => goToPage(totalPages));
        if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
        if (detailModal) detailModal.addEventListener('click', handleModalClick);

        // 核心新增：事件委托（避免动态元素点击失效）
        journalTableBody.addEventListener('click', (e) => {
            const viewBtn = e.target.closest('.btn-view');
            if (viewBtn) {
                const journalId = viewBtn.dataset.id;
                if (journalId) viewJournalDetail(journalId);
            }
        });

        // 初始化加载第一页数据
        fetchJournalList();
    }

    // ========== 保留原有函数（仅修复fetchJournalList数据解析） ==========
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

    function handleReset() {
        searchForm.reset();
        currentPage = 1;
        fetchJournalList();
    }

    function handleModalClick(e) {
        if (e.target === detailModal) {
            closeModal();
        }
    }

    function escapeKeyword(keyword) {
        if (!keyword) return keyword;
        return keyword.replace(/([%_])/g, "\\$1");
    }

    // ========== 核心修复3：适配你的返回数据结构（data是数组，total在根层级） ==========
    async function fetchJournalList() {
        isLoading = true;
        try {
            // 收集参数（保留原有逻辑）
            const keyword = document.getElementById('searchKeyword')?.value;
            const category = document.getElementById('category')?.value;
            const issn = document.getElementById('issn')?.value;
            const status = document.getElementById('status')?.value;

            const params = {};
            if (keyword) params.keyword = escapeKeyword(keyword);
            if (category && category !== '') params.category = category;
            if (issn) params.issn = issn;
            if (status && status !== '') params.status = status;
            params.page = currentPage;
            params.pageSize = pageSize;

            // 调用后端接口（保留你的路径，仅修复数据解析）
            const response = await api.get('/journal/journals/multi-search', params);

            // 核心修复：适配你截图的返回结构（code:200, data:[...], total:1）
            // if (!response || response.code !== 200) {
            //     throw new Error('接口返回异常');
            // }

            // 解析：data是期刊数组，total/ totalPages从返回根层级取
            const journalList = response.data || [];
            totalCount = response.total || 0;       // 适配你的返回字段
            totalPages = response.totalPages || 1;  // 适配你的返回字段

            // 渲染表格和分页（保留原有逻辑）
            renderJournalTable(journalList);
            updatePagination();

        } catch (error) {
            console.error('获取期刊列表失败:', error);
            journalTableBody.innerHTML = `<tr><td colspan="9" class="error-result">获取期刊列表失败: ${error.message || '未知错误'}</td></tr>`;
            totalCount = 0;
            totalPages = 1;
            updatePagination();
        } finally {
            isLoading = false;
        }
    }

    // ========== 保留原有渲染逻辑（仅依赖修复后的formatDate） ==========
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
            // 现在formatDate已定义，不会报错
            const publishDate = formatDate(journal.publishDate);
            const availableQuantity = journal.availableQuantity ?? 0;
            const statusClass = journal.status === 'available' ? 'status-available' : 'status-unavailable';
            const statusText = journal.status === 'available' ? '可借阅' : '不可借阅';

            row.innerHTML = `
                <td>${journal.name || '-'}</td>
                <td>${journal.issueNumber || '-'}</td>
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

    // ========== 补充分页/模态框基础函数（避免未定义报错，不改动逻辑） ==========
    function goToPage(targetPage) {
        if (targetPage < 1) targetPage = 1;
        if (targetPage > totalPages) targetPage = totalPages;
        if (targetPage === currentPage || isLoading) return;
        currentPage = targetPage;
        fetchJournalList();
    }

    function updatePagination() {
        totalCountEl.textContent = totalCount;
        currentPageEl.textContent = currentPage;
        totalPagesEl.textContent = totalPages;
        if (prevPageBtn) prevPageBtn.disabled = currentPage === 1;
        if (firstPageBtn) firstPageBtn.disabled = currentPage === 1;
        if (nextPageBtn) nextPageBtn.disabled = currentPage === totalPages;
        if (lastPageBtn) lastPageBtn.disabled = currentPage === totalPages;
    }

    function closeModal() {
        if (detailModal) detailModal.style.display = 'none';
        if (journalDetailContent) journalDetailContent.innerHTML = '';
    }

    function viewJournalDetail(journalId) {
        // 保留你原有逻辑，若没有则空实现（避免报错）
    }
});