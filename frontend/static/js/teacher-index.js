// 页面加载完成后的初始化
        document.addEventListener('DOMContentLoaded', function() {
            loadTeacherInfo();
            loadBorrowData();
        });
 
 // 加载教师信息
function loadTeacherInfo() {
    // 显示加载状态
    const teacherInfo = document.getElementById('teacherInfo');
    teacherInfo.innerHTML = "加载中...";

    // 发起请求到后端接口
    fetch('/api/teacher/info')  // 后端接口地址
        .then(response => {
            // 检查响应是否成功（HTTP状态码200-299）
            if (!response.ok) {
                throw new Error('网络响应异常');
            }
            // 解析JSON数据
            return response.json();
        })
        .then(data => {
            // 假设后端返回的数据结构与之前的teacherData一致
            // 更新页面显示
            teacherInfo.innerHTML = `
                ${data.name} | ${data.department}<br>
                邮箱：${data.email} | 电话：${data.phone}
            `;
            // 更新统计信息
            document.getElementById('totalBorrows').textContent = data.max_borrow;
            document.getElementById('currentBorrows').textContent = data.current_borrow;
            // 计算剩余可借阅数（可用于后续显示）
            const remaining = data.max_borrow - data.current_borrow;
        })
        .catch(error => {
            // 处理错误（如网络故障、接口错误等）
            console.error('获取教师信息失败：', error);
            teacherInfo.innerHTML = "加载失败，请刷新页面重试";
        });
}

// 加载借阅数据（从后端获取）
function loadBorrowData() {
    // 显示加载状态
    document.getElementById('loadingBorrows').style.display = 'flex';
    document.getElementById('borrowTableContainer').style.display = 'none';
    document.getElementById('noBorrowData').style.display = 'none';
    document.getElementById('overdueWarning').style.display = 'none'; // 先隐藏超期警告

    // 发起请求到后端借阅数据接口
    fetch('/api/teacher/borrows')  // 后端接口地址（需替换为实际接口）
        .then(response => {
            // 检查响应是否成功
            if (!response.ok) {
                throw new Error('获取借阅数据失败，状态码：' + response.status);
            }
            // 解析JSON数据（假设后端返回借阅列表）
            return response.json();
        })
        .then(borrowDataFromBackend => {
            // 后端返回的真实借阅数据（结构应与原模拟数据一致）
            // 计算统计数据
            const currentBorrows = borrowDataFromBackend.filter(item => item.STATUS === 'borrowed');
            const overdueBorrows = borrowDataFromBackend.filter(item => item.STATUS === 'overdue');
            const historyBorrows = borrowDataFromBackend.length; // 总借阅记录数

            // 更新统计数字
            document.getElementById('historyBorrows').textContent = historyBorrows;
            document.getElementById('overdueItems').textContent = overdueBorrows.length;

            // 显示/隐藏超期警告
            if (overdueBorrows.length > 0) {
                document.getElementById('overdueWarning').style.display = 'flex';
                document.getElementById('overdueCount').textContent = overdueBorrows.length;
            }

            // 渲染当前借阅列表（仅显示 borrowed 状态）
            renderBorrowTable(currentBorrows);

            // 切换显示状态（隐藏加载，显示表格或无数据）
            document.getElementById('loadingBorrows').style.display = 'none';
            if (currentBorrows.length > 0) {
                document.getElementById('borrowTableContainer').style.display = 'block';
            } else {
                document.getElementById('noBorrowData').style.display = 'block';
            }
        })
        .catch(error => {
            // 处理请求错误（如网络故障、接口异常）
            console.error('加载借阅数据出错：', error);
            document.getElementById('loadingBorrows').style.display = 'none';
            // 显示错误提示（可替换为更友好的UI）
            document.getElementById('noBorrowData').innerHTML = `
                <i class="fas fa-exclamation-circle" style="font-size: 48px; margin-bottom: 15px; color: #e74c3c;"></i>
                <p>加载失败，请稍后重试</p>
            `;
            document.getElementById('noBorrowData').style.display = 'block';
        });
}
  // 渲染借阅表格
        function renderBorrowTable(borrows) {
            const tbody = document.getElementById('borrowTableBody');
            tbody.innerHTML = '';

            borrows.forEach(borrow => {
                const row = document.createElement('tr');
                
                // 判断是否即将超期（7天内到期）
                const endDate = new Date(borrow.end_date);
                const today = new Date();
                const daysRemaining = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
                const isDueSoon = daysRemaining <= 7 && daysRemaining > 0;
                
                let statusBadge = '';
                if (borrow.STATUS === 'borrowed') {
                    statusBadge = isDueSoon 
                        ? `<span class="status-badge status-borrowed" style="background: #fff3e0; color: #f39c12;">
                            <i class="fas fa-clock"></i> ${daysRemaining}天后到期
                           </span>`
                        : `<span class="status-badge status-borrowed">借阅中</span>`;
                } else if (borrow.STATUS === 'overdue') {
                    statusBadge = `<span class="status-badge status-overdue">已超期</span>`;
                }

                row.innerHTML = `
                    <td>
                        <strong>${borrow.journal_name}</strong><br>
                        <small style="color: #666;">ID: ${borrow.journal_id}</small>
                    </td>
                    <td>${borrow.start_date}</td>
                    <td>
                        ${borrow.end_date}
                        ${isDueSoon ? '<br><small style="color: #f39c12;">即将到期</small>' : ''}
                    </td>
                    <td>${statusBadge}</td>
                    <td>
                        <button class="action-btn renew-btn" 
                                onclick="renewJournal(${borrow.borrow_id})"
                                ${isDueSoon ? '' : 'disabled'}>
                            ${isDueSoon ? '续借' : '未到期'}
                        </button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        }

// 刷新统计数据
        function refreshStats() {
             loadBorrowData();
        }
 
 
 // 退出登录
        function logout() {
            if (confirm('确定要退出登录吗？')) {
                alert('正在退出...');
             window.location.href = 'teacher-login-regist.html';
            }
        }
// 跳转到期刊查询页面
        function goToJournalSearch() {
            window.location.href = '../journal-search.html';
        }