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
                showAlert("请先登录", "warning");
                setTimeout(() => {
                    window.location.href = "teacher-login.html";
                }, 1500);
                return;
            }

            const teacherInfo = JSON.parse(teacherStr);
            // 宽松的角色校验，避免字段名不一致问题
            const isTeacher = teacherInfo.role === "teacher" || teacherInfo.type === "teacher";
            if (!isTeacher) {
                showAlert("权限错误，请使用教师账号登录", "error");
                localStorage.removeItem("teacherInfo"); // 清理无效登录信息
                setTimeout(() => {
                    window.location.href = "teacher-login.html";
                }, 1500);
                return;
            }
            window.location.href = "teacher-index.html";
        } catch (err) {
            console.error('返回主页校验失败:', err);
            showAlert("登录信息异常，请重新登录", "error");
            localStorage.removeItem("teacherInfo");
            setTimeout(() => {
                window.location.href = "teacher-login.html";
            }, 1500);
        }
    }

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

    /**
     * 重置表单（核心优化：重置后自动刷新列表）
     */
    function handleReset() {
        searchForm.reset();
        // 重置后加载第一页数据
        currentPage = 1;
        fetchJournalList();
    }

    /**
     * 处理模态框点击（点击遮罩层关闭）
     */
    function handleModalClick(e) {
        if (e.target === detailModal) closeModal();
    }

    // ========== 5. 工具函数 ==========
    /**
     * 特殊字符转义函数（核心优化：适配URL和SQL通配符）
     * @param {string} keyword - 原始关键词
     * @returns {string} 转义后的关键词
     */
    function escapeKeyword(keyword) {
        if (!keyword) return '';
        // 1. 转义SQL通配符（交给后端处理更安全，前端仅做基础转义）
        let escaped = keyword
            .replace(/%/g, '\\%')
            .replace(/_/g, '\\_');
        // 2. URL编码（避免特殊字符影响参数传递）
        return encodeURIComponent(escaped);
    }

    /**
     * 获取期刊列表（核心修正：加载状态、错误提示、参数校验）
     * 对应后端接口: GET /journals
     * 请求参数对应journal_info表字段
     */
    async function fetchJournalList() {
        // 加载状态锁
        if (isLoading) return;
        isLoading = true;

        // 显示加载UI
        journalTableBody.innerHTML = '<tr><td colspan="8" class="text-center py-3"><i class="fas fa-spinner fa-spin me-2"></i> 正在加载期刊数据...</td></tr>';
        // 禁用分页按钮
        setPaginationButtonsDisabled(true);

        try {
            // 收集原始参数（增加DOM元素校验）
            const searchKeywordInput = document.getElementById('searchKeyword');
            const rawParams = {
                keyword: searchKeywordInput ? searchKeywordInput.value.trim() : '',
                category: document.getElementById('category')?.value || '',
                issn: document.getElementById('issn')?.value.trim() || '',
                status: document.getElementById('status')?.value || '',
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

            // 调用后端接口
            const response = await api.get('/journal/journals', params);

            // 校验返回数据格式
            if (!response || !Array.isArray(response.list)) {
                throw new Error('返回数据格式错误');
            }

            // 更新数据
            const { list, total } = response;
            totalCount = total || 0;
            totalPages = Math.ceil(totalCount / pageSize);

            // 渲染表格和分页
            renderJournalTable(list);
            updatePagination();
        } catch (error) {
            console.error('获取期刊列表失败:', error);
            // 显示错误UI
            journalTableBody.innerHTML = `<tr><td colspan="8" class="text-center py-3 text-danger">
                <i class="fas fa-exclamation-circle me-2"></i> 加载失败：${error.message || '网络异常，请重试'}
            </td></tr>`;
            showAlert(`获取期刊列表失败：${error.message || '网络异常'}`, 'error');
        } finally {
            // 释放加载锁
            isLoading = false;
            // 启用分页按钮
            setPaginationButtonsDisabled(false);
        }
    }

    /**
     * 渲染期刊表格（核心优化：空值处理、data-id传递ID）
     */
    function renderJournalTable(journals) {
        journalTableBody.innerHTML = '';

        if (!Array.isArray(journals) || journals.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `<td colspan="8" class="empty-result text-center py-3 text-muted">暂无符合条件的期刊数据</td>`;
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

    /**
     * 更新分页控件（核心优化：按钮状态同步）
     */
    function updatePagination() {
        totalCountEl.textContent = totalCount;
        currentPageEl.textContent = currentPage;
        totalPagesEl.textContent = totalPages;

        // 更新按钮状态
        if (firstPageBtn) firstPageBtn.disabled = currentPage === 1;
        if (prevPageBtn) prevPageBtn.disabled = currentPage === 1;
        if (nextPageBtn) nextPageBtn.disabled = currentPage === totalPages;
        if (lastPageBtn) lastPageBtn.disabled = currentPage === totalPages;
    }

    /**
     * 跳转到指定页（核心修正：范围校验、加载状态）
     */
    function goToPage(page) {
        // 范围校验
        if (page < 1 || page > totalPages || page === currentPage || isLoading) return;
        currentPage = page;
        fetchJournalList();
    }

    /**
     * 查看期刊详情（核心修正：错误提示、加载状态）
     * 对应后端接口: GET /journal/{id}
     */
    async function viewJournalDetail(id) {
        if (!id || isLoading) return;
        isLoading = true;

        try {
            const journal = await api.get(`/journal/id/${id}`);
            if (!journal) {
                throw new Error('未查询到该期刊信息');
            }
            renderJournalDetail(journal);
            openModal();
        } catch (error) {
            console.error('获取期刊详情失败:', error);
            showAlert(`查看期刊详情失败：${error.message}`, 'error');
        } finally {
            isLoading = false;
        }
    }

    /**
     * 渲染期刊详情（核心优化：空值兜底、HTML转义）
     */
    function renderJournalDetail(journal) {
        if (!journalDetailContent) return;
        // HTML转义防XSS
        function escapeHtml(str) {
            if (!str) return '暂无';
            return str
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        const publishDate = formatDate(journal.publishDate);
        const statusClass = journal.status === 'available' ? 'status-available' : 'status-unavailable';
        const statusText = journal.status === 'available' ? '可借阅' : '不可借阅';

        journalDetailContent.innerHTML = `
            <div class="detail-row">
                <div class="detail-label">期刊名称:</div>
                <div class="detail-value">${escapeHtml(journal.name)}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">ISSN:</div>
                <div class="detail-value">${escapeHtml(journal.issn)}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">类别:</div>
                <div class="detail-value">${escapeHtml(journal.category)}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">出版社:</div>
                <div class="detail-value">${escapeHtml(journal.publisher)}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">出版日期:</div>
                <div class="detail-value">${publishDate}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">可借数量:</div>
                <div class="detail-value">${journal.availableQuantity ?? 0}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">状态:</div>
                <div class="detail-value">
                    <span class="status-tag ${statusClass}">${statusText}</span>
                </div>
            </div>
            <div class="detail-row detail-description">
                <div class="detail-label">期刊简介:</div>
                <div class="detail-value">${escapeHtml(journal.description) || '暂无简介'}</div>
            </div>
        `;
    }

    // ========== 6. 模态框操作（核心优化：样式兼容、防重复打开） ==========
    function openModal() {
        if (!detailModal) return;
        // 兼容不同模态框实现方式
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            const modal = new bootstrap.Modal(detailModal);
            modal.show();
        } else {
            detailModal.style.display = 'flex';
            detailModal.classList.add('show');
            document.body.style.overflow = 'hidden';
            // 添加半透明遮罩（如果样式缺失）
            if (!detailModal.querySelector('.modal-backdrop')) {
                const backdrop = document.createElement('div');
                backdrop.className = 'modal-backdrop fade show';
                document.body.appendChild(backdrop);
            }
        }
    }

    function closeModal() {
        if (!detailModal) return;
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            const modal = bootstrap.Modal.getInstance(detailModal);
            if (modal) modal.hide();
        } else {
            detailModal.style.display = 'none';
            detailModal.classList.remove('show');
            document.body.style.overflow = '';
            // 移除遮罩
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) document.body.removeChild(backdrop);
        }
        // 清空详情内容
        if (journalDetailContent) journalDetailContent.innerHTML = '';
    }

    // ========== 7. 工具函数（核心优化：日期格式化、提示框） ==========
    /**
     * 日期格式化（核心修正：IOS兼容、解析失败处理）
     */
    function formatDate(dateString) {
        if (!dateString) return '-';
        // 兼容IOS的yyyy-MM-dd格式
        const date = new Date(dateString.replace(/-/g, '/'));
        if (isNaN(date.getTime())) return '日期异常';
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }

    /**
     * 全局提示框（核心新增：用户可见的反馈）
     */
    function showAlert(message, type = 'info') {
        // 创建提示元素
        const alertEl = document.createElement('div');
        const typeClass = {
            success: 'alert-success',
            error: 'alert-danger',
            warning: 'alert-warning',
            info: 'alert-info'
        }[type] || 'alert-info';

        alertEl.className = `alert ${typeClass} fixed-top mx-auto mt-3 w-50 text-center`;
        alertEl.style.zIndex = '9999';
        alertEl.innerHTML = message;

        // 添加到页面
        document.body.appendChild(alertEl);

        // 3秒后自动关闭
        setTimeout(() => {
            alertEl.classList.add('fade-out');
            setTimeout(() => {
                document.body.removeChild(alertEl);
            }, 500);
        }, 3000);
    }

    /**
     * 设置分页按钮禁用状态（核心新增）
     */
    function setPaginationButtonsDisabled(disabled) {
        if (firstPageBtn) firstPageBtn.disabled = disabled || firstPageBtn.disabled;
        if (prevPageBtn) prevPageBtn.disabled = disabled || prevPageBtn.disabled;
        if (nextPageBtn) nextPageBtn.disabled = disabled || nextPageBtn.disabled;
        if (lastPageBtn) lastPageBtn.disabled = disabled || lastPageBtn.disabled;
    }
});