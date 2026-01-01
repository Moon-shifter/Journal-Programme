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
    const borrowFormSection = document.getElementById('borrowFormSection');

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
        backHomeBtn.addEventListener('click', () => {
            // 从本地存储获取教师登录信息
            const teacherStr = localStorage.getItem("teacherInfo");
            if (!teacherStr) {
                // 未登录状态：跳转到登录页
                alert("请先登录");
                window.location.href = "teacher/teacher-login.html";
                return;
            }

            const teacherInfo = JSON.parse(teacherStr);
            // 验证角色是否为教师（增强安全性）
            if (teacherInfo.role !== "teacher") {
                alert("权限错误，请使用教师账号登录");
                window.location.href = "teacher/teacher-login.html";
                return;
            }
            // 已登录的教师：跳转到主页（保持登录状态）
            window.location.href = "teacher/teacher-index.html";
        });
        firstPageBtn.addEventListener('click', () => goToPage(1));
        prevPageBtn.addEventListener('click', () => goToPage(currentPage - 1));
        nextPageBtn.addEventListener('click', () => goToPage(currentPage + 1));
        lastPageBtn.addEventListener('click', () => goToPage(totalPages));
        closeModalBtn.addEventListener('click', closeModal);
        detailModal.addEventListener('click', (e) => {
            if (e.target === detailModal) closeModal();
        });
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

    // 获取期刊列表
    async function fetchJournalList() {
        try {
            // 收集查询参数
            const params = {
                keyword: document.getElementById('searchKeyword').value.trim(),
                category: document.getElementById('category').value,
                isbn: document.getElementById('isbn').value.trim(),
                status: document.getElementById('status').value,
                page: currentPage,
                pageSize: pageSize
            };

            // 调用后端接口
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
        <td>${journal.isbn}</td>
        <td>${journal.category}</td>
        <td>${journal.publisher}</td>
        <td>${formatDate(journal.publishDate)}</td>
        <td>${journal.stockQuantity}</td>
        <td>
          <span class="status-tag ${journal.status === 'available' ? 'status-available' : 'status-unavailable'}">
            ${journal.status === 'available' ? '可预约' : '不可预约'}
          </span>
        </td>
        <td>
          <button class="btn-view" onclick="viewJournalDetail(${journal.id})">
            <i class="fas fa-eye"></i> 详情
          </button>
          ${journal.status === 'available' ? `
            <button class="btn-borrow" onclick="showBorrowForm(${journal.id})">
              <i class="fas fa-hand-holding"></i> 预约
            </button>
          ` : ''}
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

    // 查看期刊详情
    window.viewJournalDetail = async (id) => {
        try {
            const journal = await api.get(`/journals/${id}`);
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
        <div class="detail-label">ISBN:</div>
        <div class="detail-value">${journal.isbn}</div>
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
        <div class="detail-label">主编:</div>
        <div class="detail-value">${journal.editor}</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">库存数量:</div>
        <div class="detail-value">${journal.stockQuantity}</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">状态:</div>
        <div class="detail-value">
          <span class="status-tag ${journal.status === 'available' ? 'status-available' : 'status-unavailable'}">
            ${journal.status === 'available' ? '可预约' : '不可预约'}
          </span>
        </div>
      </div>
      <div class="detail-row detail-description">
        <div class="detail-label">期刊简介:</div>
        <div class="detail-value">${journal.description || '暂无简介'}</div>
      </div>
    `;

        // 渲染借阅表单（如果可预约）
        borrowFormSection.innerHTML = journal.status === 'available' ? `
      <div class="form-title">借阅预约</div>
      <form id="borrowForm">
        <input type="hidden" id="journalId" value="${journal.id}">
        <div class="form-group">
          <label for="borrowDays">借阅天数:</label>
          <select id="borrowDays" required>
            <option value="7">7天</option>
            <option value="14" selected>14天</option>
            <option value="21">21天</option>
          </select>
        </div>
        <div class="form-group">
          <label for="contactInfo">联系信息:</label>
          <input type="text" id="contactInfo" placeholder="请输入手机号或邮箱" required>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn-primary">确认预约</button>
        </div>
      </form>
    ` : '';

        // 绑定借阅表单提交事件
        const borrowForm = document.getElementById('borrowForm');
        if (borrowForm) {
            borrowForm.addEventListener('click', handleBorrowSubmit);
        }
    }

    // 处理借阅预约提交
    async function handleBorrowSubmit(e) {
        e.preventDefault();

        const journalId = document.getElementById('journalId').value;
        const borrowDays = document.getElementById('borrowDays').value;
        const contactInfo = document.getElementById('contactInfo').value.trim();

        try {
            const data = {
                journalId,
                borrowDays,
                contactInfo,
                borrowDate: new Date().toISOString().split('T')[0]
            };

            await api.post('/journals/borrow', data);
            alert('借阅预约成功！');
            closeModal();
            fetchJournalList(); // 刷新列表
        } catch (error) {
            console.error('借阅预约失败:', error);
        }
    }

    // 显示借阅表单（直接显示详情模态框）
    window.showBorrowForm = (id) => {
        window.viewJournalDetail(id);
    };



    // 打开模态框
    function openModal() {
        detailModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    // 关闭模态框
    function closeModal() {
        detailModal.style.display = 'none';
        document.body.style.overflow = '';
        // 移除表单事件监听，防止重复绑定
        const borrowForm = document.getElementById('borrowForm');
        if (borrowForm) {
            borrowForm.removeEventListener('submit', handleBorrowSubmit);
        }
    }

    // 日期格式化工具
    function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }
});