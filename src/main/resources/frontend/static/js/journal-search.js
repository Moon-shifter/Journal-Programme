// 期刊查询页面交互逻辑
document.addEventListener('DOMContentLoaded', () => {
    // DOM元素获取
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

    // 分页参数
    let currentPage = 1;
    const pageSize = 10;
    let totalCount = 0;
    let totalPages = 1;

    // 初始化页面
    init();

    function init() {
        // 绑定事件监听
        searchForm.addEventListener('click', handleSearch);
        resetBtn.addEventListener('click', handleReset);
        backHomeBtn.addEventListener('click', handleBackHome);
        firstPageBtn.addEventListener('click', () => goToPage(1));
        prevPageBtn.addEventListener('click', () => goToPage(currentPage - 1));
        nextPageBtn.addEventListener('click', () => goToPage(currentPage + 1));
        lastPageBtn.addEventListener('click', () => goToPage(totalPages));
        closeModalBtn.addEventListener('click', closeModal);
        detailModal.addEventListener('click', handleModalClick);
    }

    // 返回主页
    function handleBackHome() {
        const teacherStr = localStorage.getItem("teacherInfo");
        if (!teacherStr) {
            alert("请先登录");
            window.location.href = "teacher-login.html";
            return;
        }

        const teacherInfo = JSON.parse(teacherStr);
        if (teacherInfo.role !== "teacher") {
            alert("权限错误，请使用教师账号登录");
            window.location.href = "teacher-login.html";
            return;
        }
        window.location.href = "teacher-index.html";
    }

    // 处理搜索请求
    async function handleSearch(e) {
        e.preventDefault();
        currentPage = 1; // 重置为第一页
        await fetchJournalList();
    }

    // 重置表单
    function handleReset() {
        searchForm.reset();
    }

    // 处理模态框点击
    function handleModalClick(e) {
        if (e.target === detailModal) closeModal();
    }

    // ========== 特殊字符转义函数（核心优化） ==========
    function escapeKeyword(keyword) {
        return keyword
            .replace(/%/g, '\\%') // 转义数据库通配符 %（避免被识别为模糊匹配符号）
            .replace(/_/g, '\\_') // 转义数据库通配符 _（避免被识别为单个字符匹配）
            .replace(/&/g, '&amp;') // 转义URL特殊字符 &
            .replace(/=/g, '&equals;'); // 转义URL特殊字符 =
    }

    /**
     * 获取期刊列表
     * 对应后端接口: GET /journals
     * 请求参数对应journal_info表字段
     */
    async function fetchJournalList() {
        try {
            // 收集原始参数（仅保留有效字段）
            const searchKeywordInput = document.getElementById('searchKeyword');
            const rawParams = {
                // keyword: 对应journal_info.name字段，后端应使用LIKE %name%模糊查询
                keyword: searchKeywordInput.value.trim(),
                // category: 对应journal_info.category字段，精确匹配
                category: document.getElementById('category').value,
                // issn: 对应journal_info.issn字段，精确匹配
                issn: document.getElementById('issn').value.trim(),
                // status: 对应journal_info.status字段，精确匹配
                status: document.getElementById('status').value,
                // 分页参数
                page: currentPage,
                pageSize: pageSize
            };

            // 过滤+标准化参数（空值不传递）
            const params = {};
            if (rawParams.keyword) {
                params.keyword = escapeKeyword(rawParams.keyword);
            }
            if (rawParams.category && rawParams.category !== 'all') {
                params.category = rawParams.category;
            }
            if (rawParams.issn) {
                params.issn = rawParams.issn;
            }
            if (rawParams.status && rawParams.status !== 'all') {
                params.status = rawParams.status;
            }
            params.page = rawParams.page;
            params.pageSize = rawParams.pageSize;

            // 调用后端接口（仅传递有效参数）
            const response = await api.get('/journals', params);

            // 更新数据
            const { list, total } = response;
            totalCount = total;
            totalPages = Math.ceil(totalCount / pageSize);

            // 渲染表格
            renderJournalTable(list);

            // 更新分页信息
            updatePagination();
        } catch (error) {
            console.error('获取期刊列表失败:', error);
        }
    }

    // 渲染期刊表格
    function renderJournalTable(journals) {
        journalTableBody.innerHTML = '';

        if (journals.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `<td colspan="8" class="empty-result">暂无符合条件的期刊数据</td>`;
            journalTableBody.appendChild(emptyRow);
            return;
        }

        journals.forEach(journal => {
            const row = document.createElement('tr');
            row.innerHTML = `
        <td>${journal.name}</td>
        <td>${journal.issn}</td>
        <td>${journal.category}</td>
        <td>${journal.publisher}</td>
        <td>${formatDate(journal.publishDate)}</td>
        <td>${journal.availableQuantity}</td>
        <td>
          <span class="status-tag ${journal.status === 'available' ? 'status-available' : 'status-unavailable'}">
            ${journal.status === 'available' ? '可借阅' : '不可借阅'}
          </span>
        </td>
        <td>
          <button class="btn-view" onclick="viewJournalDetail(${journal.id})">
            <i class="fas fa-eye"></i> 详情
          </button>
        </td>
      `;
            journalTableBody.appendChild(row);
        });
    }

    // 更新分页控件
    function updatePagination() {
        totalCountEl.textContent = totalCount;
        currentPageEl.textContent = currentPage;
        totalPagesEl.textContent = totalPages;

        // 更新按钮状态
        firstPageBtn.disabled = currentPage === 1;
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages;
        lastPageBtn.disabled = currentPage === totalPages;
    }

    // 跳转到指定页
    function goToPage(page) {
        if (page < 1 || page > totalPages) return;
        currentPage = page;
        fetchJournalList();
    }

    /**
     * 查看期刊详情
     * 对应后端接口: GET /journal/{id}
     * 路径参数id对应journal_info.id字段
     */
    window.viewJournalDetail = async (id) => {
        try {
            const journal = await api.get(`/journal/${id}`);
            renderJournalDetail(journal);
            openModal();
        } catch (error) {
            console.error('获取期刊详情失败:', error);
        }
    };

    // 渲染期刊详情
    function renderJournalDetail(journal) {
        journalDetailContent.innerHTML = `
      <div class="detail-row">
        <div class="detail-label">期刊名称:</div>
        <div class="detail-value">${journal.name}</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">ISSN:</div>
        <div class="detail-value">${journal.issn}</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">类别:</div>
        <div class="detail-value">${journal.category}</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">出版社:</div>
        <div class="detail-value">${journal.publisher}</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">出版日期:</div>
        <div class="detail-value">${formatDate(journal.publishDate)}</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">可借数量:</div>
        <div class="detail-value">${journal.availableQuantity}</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">状态:</div>
        <div class="detail-value">
          <span class="status-tag ${journal.status === 'available' ? 'status-available' : 'status-unavailable'}">
            ${journal.status === 'available' ? '可借阅' : '不可借阅'}
          </span>
        </div>
      </div>
      <div class="detail-row detail-description">
        <div class="detail-label">期刊简介:</div>
        <div class="detail-value">${journal.description || '暂无简介'}</div>
      </div>
    `;
    }

    // 打开模态框
    function openModal() {
        detailModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    // 关闭模态框
    function closeModal() {
        detailModal.style.display = 'none';
        document.body.style.overflow = '';
    }

    // 日期格式化工具
    function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }
});