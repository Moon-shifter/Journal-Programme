// 全局变量 - 分页和数据配置
const journalConfig = {
  currentPage: 1,    // 当前页码
  pageSize: 10,      // 每页显示条数
  totalCount: 0,     // 总数据条数
  totalPages: 0,     // 总页数
  journalList: [],   // 所有期刊数据（模拟数据库表数据）
  filterList: []     // 筛选后的期刊数据
};

// 模拟数据库 journal_info 表的原始数据（严格匹配字段名和类型）
const mockJournalData = [
  {
    id: 1,
    NAME: "自然科学进展",
    ISBN: "9787030741234",
    category: "自然科学",
    publisher: "科学出版社",
    publish_date: "2023-01-15",
    issue_number: "2023-01", // 期号
    description: "涵盖自然科学各领域的最新研究成果和进展，包含物理、化学、生物等分支学科的前沿论文与综述。", // 简介（text类型）
    total_quantity: 10, // 总库存
    available_quantity: 8, // 可借数量
    STATUS: "available" // 状态枚举
  },
  {
    id: 2,
    NAME: "社会科学研究",
    ISBN: "9787561489765",
    category: "社会科学",
    publisher: "四川大学出版社",
    publish_date: "2023-02-20",
    issue_number: "2023-02",
    description: "聚焦社会科学前沿问题，探讨社会发展规律，涵盖社会学、人类学、政治学等领域的实证研究。",
    total_quantity: 8,
    available_quantity: 5,
    STATUS: "available"
  },
  {
    id: 3,
    NAME: "工程技术学报",
    ISBN: "9787111723456",
    category: "工程技术",
    publisher: "机械工业出版社",
    publish_date: "2023-03-10",
    issue_number: "2023-03",
    description: "工程技术领域的技术创新与应用研究，重点覆盖机械制造、自动化、电子工程等方向。",
    total_quantity: 5,
    available_quantity: 0, // 无可用数量
    STATUS: "unavailable"
  },
  {
    id: 4,
    NAME: "医学健康指南",
    ISBN: "9787513287654",
    category: "医学健康",
    publisher: "中国中医药出版社",
    publish_date: "2023-04-05",
    issue_number: "2023-04",
    description: "普及医学健康知识，指导日常健康管理，包含中医养生、西医诊疗、慢病管理等内容。",
    total_quantity: 15,
    available_quantity: 12,
    STATUS: "available"
  },
  {
    id: 5,
    NAME: "人文艺术评论",
    ISBN: "9787503978901",
    category: "人文艺术",
    publisher: "文化艺术出版社",
    publish_date: "2023-05-18",
    issue_number: "2023-01",
    description: "探讨人文艺术理论与创作实践，涵盖文学、绘画、音乐、戏剧等艺术形式的评论与分析。",
    total_quantity: 6,
    available_quantity: 3,
    STATUS: "available"
  },
  {
    id: 6,
    NAME: "经济管理研究",
    ISBN: "9787300301234",
    category: "经济管理",
    publisher: "中国人民大学出版社",
    publish_date: "2023-06-22",
    issue_number: "2023-02",
    description: "分析经济管理热点问题，提供决策参考，涵盖宏观经济、企业管理、市场营销等方向。",
    total_quantity: 8,
    available_quantity: 0,
    STATUS: "unavailable"
  }
];

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
  // 初始化模拟数据库数据
  journalConfig.journalList = [...mockJournalData];
  journalConfig.filterList = [...mockJournalData];
  journalConfig.totalCount = journalConfig.filterList.length;
  journalConfig.totalPages = Math.ceil(journalConfig.totalCount / journalConfig.pageSize);

  // 绑定事件
  bindEvents();

  // 初始化页面
  initPage();
});

/**
 * 绑定所有页面事件
 */
function bindEvents() {
  // 查询按钮
  document.getElementById('searchBtn').addEventListener('click', handleSearch);
  // 重置按钮
  document.getElementById('resetBtn').addEventListener('click', handleReset);
  // 关闭模态框按钮
  document.getElementById('closeModal').addEventListener('click', closeModal);
  // 返回主页按钮
  document.getElementById('backHomeBtn').addEventListener('click', () => {
    alert('返回主页（实际项目中可跳转至首页URL）');
    // window.location.href = 'index.html'; // 实际项目替换为首页地址
  });

  // 分页按钮
  document.getElementById('firstPage').addEventListener('click', () => changePage(1));
  document.getElementById('prevPage').addEventListener('click', () => changePage(journalConfig.currentPage - 1));
  document.getElementById('nextPage').addEventListener('click', () => changePage(journalConfig.currentPage + 1));
  document.getElementById('lastPage').addEventListener('click', () => changePage(journalConfig.totalPages));

  // 点击模态框遮罩层关闭模态框
  document.getElementById('detailModal').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
  });
}

/**
 * 初始化页面
 */
function initPage() {
  // 更新分页信息
  updatePagination();
  // 渲染表格数据
  renderJournalTable();
  // 初始化模态框为隐藏
  document.getElementById('detailModal').style.display = 'none';
}

/**
 * 处理查询逻辑（适配数据库字段）
 */
function handleSearch() {
  // 获取查询条件
  const keyword = document.getElementById('searchKeyword').value.trim().toLowerCase();
  const category = document.getElementById('category').value;
  const isbn = document.getElementById('isbn').value.trim();
  const status = document.getElementById('status').value;

  // 模拟后端接口请求（异步）
  setTimeout(() => {
    // 筛选数据（严格匹配数据库字段）
    journalConfig.filterList = journalConfig.journalList.filter(item => {
      // 关键字筛选（名称/ISBN/出版社/简介）
      const keywordMatch = !keyword || 
        item.NAME.toLowerCase().includes(keyword) || 
        item.ISBN.includes(keyword) || 
        item.publisher.toLowerCase().includes(keyword) || 
        item.description.toLowerCase().includes(keyword);
      // 类别筛选
      const categoryMatch = !category || item.category === category;
      // ISBN筛选
      const isbnMatch = !isbn || item.ISBN === isbn;
      // 状态筛选（匹配数据库STATUS字段）
      const statusMatch = !status || item.STATUS === status;

      return keywordMatch && categoryMatch && isbnMatch && statusMatch;
    });

    // 更新分页配置
    journalConfig.currentPage = 1; // 重置为第一页
    journalConfig.totalCount = journalConfig.filterList.length;
    journalConfig.totalPages = Math.ceil(journalConfig.totalCount / journalConfig.pageSize);

    // 更新页面
    updatePagination();
    renderJournalTable();

    alert(`查询完成，共找到 ${journalConfig.totalCount} 条符合条件的期刊`);
  }, 500); // 模拟接口延迟500ms
}

/**
 * 处理重置逻辑
 */
function handleReset() {
  // 清空表单
  document.getElementById('searchForm').reset();
  // 重置筛选数据
  journalConfig.filterList = [...journalConfig.journalList];
  journalConfig.currentPage = 1;
  journalConfig.totalCount = journalConfig.filterList.length;
  journalConfig.totalPages = Math.ceil(journalConfig.totalCount / journalConfig.pageSize);
  // 更新页面
  updatePagination();
  renderJournalTable();
}

/**
 * 渲染期刊表格（适配数据库字段）
 */
function renderJournalTable() {
  const tableBody = document.getElementById('journalTableBody');
  tableBody.innerHTML = ''; // 清空表格

  // 更新总数显示
  document.getElementById('totalCount').textContent = journalConfig.totalCount;

  // 无数据时显示提示
  if (journalConfig.totalCount === 0) {
    const emptyTr = document.createElement('tr');
    emptyTr.innerHTML = `<td colspan="8" class="empty-cell">暂无符合条件的期刊数据</td>`;
    tableBody.appendChild(emptyTr);
    return;
  }

  // 计算当前页显示的数据范围
  const startIndex = (journalConfig.currentPage - 1) * journalConfig.pageSize;
  const endIndex = Math.min(startIndex + journalConfig.pageSize, journalConfig.filterList.length);
  const currentPageData = journalConfig.filterList.slice(startIndex, endIndex);

  // 渲染当前页数据（严格匹配数据库字段）
  currentPageData.forEach(item => {
    const tr = document.createElement('tr');
    // 状态文本转换
    const statusText = item.STATUS === 'available' ? '可预约' : '不可预约';
    // 状态样式类
    const statusClass = item.STATUS === 'available' ? 'status-available' : 'status-unavailable';

    tr.innerHTML = `
      <td>${item.NAME}</td>
      <td>${item.ISBN}</td>
      <td>${item.category}</td>
      <td>${item.publisher}</td>
      <td>${item.publish_date}</td>
      <td>${item.available_quantity}</td> <!-- 显示可借数量（对应数据库available_quantity） -->
      <td><span class="${statusClass}">${statusText}</span></td>
      <td>
        <button class="btn-operate detail-btn" data-id="${item.id}">
          <i class="fas fa-info-circle"></i> 详情/借阅
        </button>
      </td>
    `;
    tableBody.appendChild(tr);

    // 绑定详情/借阅按钮事件
    tr.querySelector('.detail-btn').addEventListener('click', () => openDetailModal(item.id));
  });
}

/**
 * 更新分页控件状态
 */
function updatePagination() {
  // 更新页码显示
  document.getElementById('currentPage').textContent = journalConfig.currentPage;
  document.getElementById('totalPages').textContent = journalConfig.totalPages;

  // 禁用/启用分页按钮
  document.getElementById('firstPage').disabled = journalConfig.currentPage === 1;
  document.getElementById('prevPage').disabled = journalConfig.currentPage === 1;
  document.getElementById('nextPage').disabled = journalConfig.currentPage === journalConfig.totalPages;
  document.getElementById('lastPage').disabled = journalConfig.currentPage === journalConfig.totalPages;
}

/**
 * 切换页码
 * @param {number} targetPage 目标页码
 */
function changePage(targetPage) {
  // 边界校验
  if (targetPage < 1 || targetPage > journalConfig.totalPages) return;
  
  journalConfig.currentPage = targetPage;
  updatePagination();
  renderJournalTable();
}

/**
 * 打开期刊详情/借阅模态框（适配数据库字段）
 * @param {number} journalId 期刊ID
 */
function openDetailModal(journalId) {
  // 查找对应期刊数据（匹配数据库字段）
  const journal = journalConfig.journalList.find(item => item.id === journalId);
  if (!journal) return;

  // 渲染模态框标题
  document.getElementById('modalTitle').textContent = `${journal.NAME} - 详情与借阅预约`;

  // 渲染期刊详情（完整展示数据库所有字段）
  const detailContent = document.getElementById('journalDetailContent');
  detailContent.innerHTML = `
    <div class="detail-grid">
      <div class="detail-item">
        <label>期刊名称：</label>
        <span>${journal.NAME}</span>
      </div>
      <div class="detail-item">
        <label>ISBN：</label>
        <span>${journal.ISBN}</span>
      </div>
      <div class="detail-item">
        <label>类别：</label>
        <span>${journal.category}</span>
      </div>
      <div class="detail-item">
        <label>出版社：</label>
        <span>${journal.publisher}</span>
      </div>
      <div class="detail-item">
        <label>出版日期：</label>
        <span>${journal.publish_date}</span>
      </div>
      <div class="detail-item">
        <label>期号：</label>
        <span>${journal.issue_number}</span> <!-- 新增数据库issue_number字段 -->
      </div>
      <div class="detail-item">
        <label>总库存数量：</label>
        <span>${journal.total_quantity}</span> <!-- 数据库total_quantity字段 -->
      </div>
      <div class="detail-item">
        <label>可借数量：</label>
        <span>${journal.available_quantity}</span> <!-- 数据库available_quantity字段 -->
      </div>
      <div class="detail-item">
        <label>状态：</label>
        <span class="${journal.STATUS === 'available' ? 'status-available' : 'status-unavailable'}">
          ${journal.STATUS === 'available' ? '可预约' : '不可预约'}
        </span>
      </div>
      <div class="detail-item full-width">
        <label>期刊简介：</label>
        <p>${journal.description}</p> <!-- 数据库description字段（text类型） -->
      </div>
    </div>
  `;

  // 渲染借阅预约表单
  const borrowForm = document.getElementById('borrowFormSection');
  if (journal.STATUS === 'available') {
    borrowForm.innerHTML = `
      <div class="borrow-form-title"><h3><i class="fas fa-hand-holding-book"></i> 借阅预约</h3></div>
      <form id="borrowForm">
        <input type="hidden" id="journalId" value="${journal.id}">
        <div class="form-row">
          <div class="form-col">
            <label for="borrowerName"><i class="fas fa-user"></i> 预约人姓名</label>
            <input type="text" id="borrowerName" placeholder="请输入您的姓名" required>
          </div>
          <div class="form-col">
            <label for="borrowerPhone"><i class="fas fa-phone"></i> 联系电话</label>
            <input type="tel" id="borrowerPhone" placeholder="请输入联系电话" required>
          </div>
        </div>
        <div class="form-row">
          <div class="form-col">
            <label for="borrowDate"><i class="fas fa-calendar"></i> 预约日期</label>
            <input type="date" id="borrowDate" required>
          </div>
          <div class="form-col">
            <label for="borrowDays"><i class="fas fa-calendar-days"></i> 借阅天数</label>
            <select id="borrowDays" required>
              <option value="7">7天</option>
              <option value="14">14天</option>
              <option value="21">21天</option>
              <option value="30">30天</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-col full-width">
            <label for="borrowRemark"><i class="fas fa-comment"></i> 备注（选填）</label>
            <textarea id="borrowRemark" placeholder="请输入备注信息（选填）"></textarea>
          </div>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn-primary borrow-submit">
            <i class="fas fa-paper-plane"></i> 提交预约
          </button>
        </div>
      </form>
    `;

    // 绑定预约表单提交事件
    document.getElementById('borrowForm').addEventListener('submit', function(e) {
      e.preventDefault();
      submitBorrowApply(journal.id);
    });
  } else {
    // 不可预约时显示提示
    borrowForm.innerHTML = `
      <div class="unavailable-tip">
        <i class="fas fa-exclamation-triangle"></i>
        <p>该期刊当前无可用库存（可借数量：${journal.available_quantity}），暂不支持预约！</p>
      </div>
    `;
  }

  // 显示模态框
  document.getElementById('detailModal').style.display = 'block';
}

/**
 * 关闭模态框
 */
function closeModal() {
  document.getElementById('detailModal').style.display = 'none';
  // 清空表单（下次打开时重置）
  const borrowForm = document.getElementById('borrowFormSection');
  if (borrowForm) borrowForm.innerHTML = '';
}

/**
 * 提交借阅预约申请（模拟后端接口）
 * @param {number} journalId 期刊ID
 */
function submitBorrowApply(journalId) {
  // 获取表单数据
  const borrowData = {
    journalId: journalId,
    borrowerName: document.getElementById('borrowerName').value.trim(),
    borrowerPhone: document.getElementById('borrowerPhone').value.trim(),
    borrowDate: document.getElementById('borrowDate').value,
    borrowDays: document.getElementById('borrowDays').value,
    borrowRemark: document.getElementById('borrowRemark').value.trim()
  };

  // 简单表单验证
  if (!borrowData.borrowerName) {
    alert('请输入预约人姓名！');
    return;
  }
  if (!borrowData.borrowerPhone || !/^1[3-9]\d{9}$/.test(borrowData.borrowPhone)) {
    alert('请输入有效的联系电话！');
    return;
  }
  if (!borrowData.borrowDate) {
    alert('请选择预约日期！');
    return;
  }

  // 模拟后端接口请求（预约成功后，模拟数据库可借数量减1）
  setTimeout(() => {
    // 找到对应期刊并更新可借数量（模拟数据库操作）
    const targetJournal = journalConfig.journalList.find(item => item.id === journalId);
    if (targetJournal && targetJournal.available_quantity > 0) {
      targetJournal.available_quantity -= 1;
      // 若可借数量为0，更新状态为不可预约
      if (targetJournal.available_quantity === 0) {
        targetJournal.STATUS = 'unavailable';
      }
      // 同步筛选列表数据
      journalConfig.filterList = journalConfig.filterList.map(item => {
        if (item.id === journalId) return targetJournal;
        return item;
      });
      // 重新渲染表格
      renderJournalTable();
    }

    // 模拟预约成功提示
    alert(`
      预约提交成功！
      期刊ID：${borrowData.journalId}
      预约人：${borrowData.borrowerName}
      联系电话：${borrowData.borrowerPhone}
      预约日期：${borrowData.borrowDate}
      借阅天数：${borrowData.borrowDays}天
      
      （实际项目中此处会调用真实后端接口，将预约数据写入数据库，并返回预约单号）
    `);
    // 关闭模态框
    closeModal();
  }, 800); // 模拟接口延迟
}


// const style = document.createElement('style');
// style.textContent = `
//   /* 模态框基础样式 */
//   .modal-overlay {
//     position: fixed;
//     top: 0;
//     left: 0;
//     width: 100%;
//     height: 100%;
//     background: rgba(0, 0, 0, 0.5);
//     display: none;
//     justify-content: center;
//     align-items: center;
//     z-index: 999;
//   }
//   .modal {
//     background: #fff;
//     width: 80%;
//     max-width: 800px;
//     border-radius: 8px;
//     box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
//     max-height: 90vh;
//     overflow-y: auto;
//   }
//   .modal-header {
//     padding: 16px 20px;
//     border-bottom: 1px solid #eee;
//     display: flex;
//     justify-content: space-between;
//     align-items: center;
//   }
//   .close-btn {
//     background: transparent;
//     border: none;
//     font-size: 24px;
//     cursor: pointer;
//     color: #999;
//     transition: color 0.2s;// 辅助样式（确保模态框、详情等样式正常）
//   }
//   .close-btn:hover {
//     color: #333;
//   }
//   .modal-body {
//     padding: 20px;
//   }
//   /* 详情样式 */
//   .detail-grid {
//     display: grid;
//     grid-template-columns: repeat(2, 1fr);
//     gap: 16px;
//     margin-bottom: 20px;
//   }
//   .detail-item {
//     display: flex;
//     flex-direction: column;
//   }
//   .detail-item.full-width {
//     grid-column: 1 / 3;
//   }
//   .detail-item label {
//     font-weight: 600;
//     color: #666;
//     margin-bottom: 4px;
//   }
//   .detail-item p {
//     margin: 0;
//     line-height: 1.6;
//   }
//   /* 状态样式 */
//   .status-available {
//     color: #28a745;
//     font-weight: 600;
//   }
//   .status-unavailable {
//     color: #dc3545;
//     font-weight: 600;
//   }
//   /* 借阅表单样式 */
//   .borrow-form-title {
//     margin-bottom: 16px;
//     padding-bottom: 8px;
//     border-bottom: 1px solid #eee;
//   }
//   .borrow-form .form-row {
//     margin-bottom: 16px;
//   }
//   .unavailable-tip {
//     text-align: center;
//     padding: 20px;
//     color: #dc3545;
//   }
//   .empty-cell {
//     text-align: center;
//     padding: 40px;
//     color: #999;
//   }
//   /* 按钮样式 */
//   .btn-operate {
//     padding: 6px 12px;
//     border: none;
//     border-radius: 4px;
//     cursor: pointer;
//     background: #007bff;
//     color: #fff;
//     transition: background 0.2s;
//   }
//   .btn-operate:hover {
//     background: #0056b3;
//   }
// `;
// document.head.appendChild(style);