//数据展示获取
document.addEventListener('DOMContentLoaded', function() {
    // 1. 替换为你的 Mock 接口地址
    const ApiUrl = 'http://127.0.0.1:4523/m1/7615921-7363832-default/api/system/system-stats';
    
    // 发起接口请求
    fetch(ApiUrl)  
        .then(response => {
            // 检查请求是否成功
            if (!response.ok) {
                throw new Error('Mock 接口请求失败: ' + response.status);
            }
            // 解析JSON格式的响应数据
            return response.json();
        })
        .then(data => {
            // 2. 将 Mock 返回的数据更新到页面
            // 给数字添加千分位格式化
            const formatNumber = (num) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            
            // 注意：这里的字段名要和 Mock 接口返回的字段完全一致！
            // 如果 Mock 返回的字段是 journalTotal 就用 journalTotal，是 journal_total 就用 journal_total
            document.getElementById('journalCount').textContent = formatNumber(data.journalTotal || data.journal_total || 0);
            document.getElementById('teacherCount').textContent = formatNumber(data.teacherTotal || data.teacher_total || 0);
            document.getElementById('borrowCount').textContent = formatNumber(data.borrowingTotal || data.borrowing_total || 0);
            document.getElementById('overdueCount').textContent = formatNumber(data.overdueTotal || data.overdue_total || 0);
        })
        .catch(error => {
            // 3. 处理请求失败的情况
            console.error('获取 Mock 统计数据失败:', error);
            // 显示错误提示
            document.getElementById('journalCount').textContent = '加载失败';
            document.getElementById('teacherCount').textContent = '加载失败';
            document.getElementById('borrowCount').textContent = '加载失败';
            document.getElementById('overdueCount').textContent = '加载失败';
        });
});



   // 打开模态框
        function openModal(modalType) {
            let modalId = '';
            switch(modalType) {
                case 'journalManage':
                    modalId = 'journalManageModal';
                    break;
                case 'journalAdd':
                    modalId = 'journalAddModal';
                    break;
                case 'quickSearch':
                    modalId = 'quickSearchModal';
                    break;
                 case 'teacherManage':
                    modalId = 'teacherManageModal';
                    break;
                case 'teacherAdd':
                    modalId = 'teacherAddModal';
                    break;
                default:
                    // 模拟其他模态框打开
                    showMessage('功能 "' + modalType + '" 正在开发中...', 'info');
                    return;
            }
            
            document.getElementById(modalId).style.display = 'flex';
        }
        
        // 关闭模态框
        function closeModal(modalId) {
            document.getElementById(modalId).style.display = 'none';
        }
        
        // 退出登录
        function logout() {
            if (confirm('确定要退出系统吗？')) {
                showMessage('正在退出系统...', 'info');
                setTimeout(() => {
                    window.location.href = 'admin-login.html';
                }, 1000);
            }
        }
        
        // 点击模态框外部关闭
        window.onclick = function(event) {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                if (event.target == modal) {
                    modal.style.display = 'none';
                }
            });
        }

         // 显示消息 
        function showMessage(text, type) {
            const messageDiv = document.getElementById('successMessage');
            messageDiv.textContent = text;
            messageDiv.className = 'message ' + (type === 'error' ? 'error' : type === 'warning' ? 'warning' : 'success');
            messageDiv.style.display = 'block';
            
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 3000);
        }
        


     // 保存期刊信息
function saveJournal() {
    const journalData = {
        name: document.getElementById('journalName').value,
        category: document.getElementById('journalCategory').value,
        publisher: document.getElementById('journalPublisher').value,
        publishDate: document.getElementById('publishDate').value,
        status: document.getElementById('journalStatus').value
    };

    // 简单验证
    if (!journalData.name || !journalData.category) {
        alert('请填写期刊名称和类别');
        return;
    }

    // 发送POST请求保存数据
    fetch('/api/journal/save', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(journalData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('保存失败');
        }
        return response.json();
    })
    .then(data => {
        alert('保存成功');
        closeModal('journalManageModal');
        location.reload(); // 或调用刷新函数
    })
    .catch(error => {
        console.error('Error:', error);
        alert('保存失败: ' + error.message);
    });
}

// 删除期刊信息
function deleteJournal() {
    if (!journalId || !confirm('确定要删除此期刊吗？')) {
        return;
    }
    // 发送DELETE请求
    fetch(`/api/journal/delete/${journalId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('删除失败');
        }
        return response.json();
    })
    .then(data => {
        alert('删除成功');
        closeModal('journalManageModal');
      updateJournalCount(-1);
    })
    .catch(error => {
        console.error('Error:', error);
        alert('删除失败: ' + error.message);
    });
}

function updateJournalCount(changeNum) {
    // 获取显示期刊总数的DOM元素
    const journalCountEl = document.getElementById('journalCount');
    if (!journalCountEl) return;

    // 1. 去除千分位逗号，转为数字
    const currentCount = parseInt(journalCountEl.textContent.replace(/,/g, '')) || 0;
    // 2. 计算新数值（确保数值≥0）
    const newCount = Math.max(currentCount + changeNum, 0);
    // 3. 重新添加千分位格式化并更新到页面
    const formatNumber = (num) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    journalCountEl.textContent = formatNumber(newCount);
}


//增添期刊信息
async function addJournal() {
    // 收集表单数据
    const journalData = {
        name: document.getElementById('journalName').value.trim(),
        isbn: document.getElementById('journalISBN').value.trim(),
        category: document.getElementById('journalCategory').value,
        publisher: document.getElementById('journalPublisher').value.trim(),
        issueNumber: document.getElementById('journalIssueNumber').value.trim(),
        publishDate: document.getElementById('publishDate').value,
        description: document.getElementById('journalDescription').value.trim(),
        totalQuantity: parseInt(document.getElementById('journalTotalQuantity').value) || 0,
        availableQuantity: parseInt(document.getElementById('journalAvailableQuantity').value) || 0,
        status: document.getElementById('journalStatus').value
    };

    // 简单验证
    if (!journalData.name) {
        alert('请输入期刊名称');
        return;
    }
    
    if (!journalData.issueNumber) {
        alert('请输入期号');
        return;
    }

    try {
        // 发送POST请求到后端
        const response = await fetch('/api/journals/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(journalData)
        });

        const result = await response.json();

        if (response.ok && result.success) {
            alert('添加成功！');
            closeModal('journalAddModal');
            
            // 清空表单
            clearForm();
            
            // 刷新页面或重新加载数据
            location.reload(); // 或调用刷新函数
        } else {
            alert('添加失败：' + (result.message || '未知错误'));
        }
    } catch (error) {
        console.error('添加期刊错误:', error);
        alert('网络错误，请稍后重试');
    }
}


//修改教师信息
function saveTeacher() {
    // 1. 获取表单所有数据
    const teacherId = document.getElementById('teacherId').value.trim();
    const teacherName = document.getElementById('teacherName').value.trim();
    const department = document.getElementById('teacherDepartment').value.trim();
    const email = document.getElementById('teacherEmail').value.trim();
    const phone = document.getElementById('teacherPhone').value.trim();
    const maxBorrow = document.getElementById('teacherMaxBorrow').value.trim();
    const status = document.getElementById('teacherStatus').value;

    // 2. 数据校验（必填项+格式校验）
    // 2.1 编辑场景必须有ID
    if (!teacherId) {
        alert('请输入要修改的教师ID！');
        document.getElementById('teacherId').focus();
        return;
    }
    // 2.2 核心字段不能为空
    if (!teacherName || !department || !email || !phone || !maxBorrow || !status) {
        alert('教师姓名、系部、邮箱、电话、最大可借阅数、状态为必填项！');
        return;
    }
    // 2.3 邮箱格式校验
    const emailReg = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailReg.test(email)) {
        alert('请输入正确的邮箱格式（如：teacher@school.com）！');
        document.getElementById('teacherEmail').focus();
        return;
    }
    // 2.4 手机号格式校验
    const phoneReg = /^1[3-9]\d{9}$/;
    if (!phoneReg.test(phone)) {
        alert('请输入正确的11位手机号！');
        document.getElementById('teacherPhone').focus();
        return;
    }
    // 2.5 最大可借阅数必须是1-20的数字
    if (isNaN(maxBorrow) || Number(maxBorrow) < 1 || Number(maxBorrow) > 20) {
        alert('最大可借阅数必须是1-20之间的数字！');
        document.getElementById('teacherMaxBorrow').focus();
        return;
    }

    // 3. 构造请求数据
    const teacherData = {
        name: teacherName,
        department: department,
        email: email,
        phone: phone,
        max_borrow: Number(maxBorrow),
        status: status
    };

    // 4. 发送PUT请求（修改教师用PUT）
    fetch(`/api/admin/teacherSave/${teacherId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(teacherData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`修改失败：${response.status}（可能教师ID不存在）`);
        }
        return response.json();
    })
    .then(data => {
        if (data.code === 200 || !data.code) {
            alert('教师信息修改成功！');
            closeModal('teacherManageModal'); // 关闭模态框
            resetTeacherForm(); // 清空表单
        } else {
            throw new Error(data.message || '修改失败');
        }
    })
    .catch(error => {
        console.error('修改教师失败:', error);
        alert('修改失败: ' + error.message);
    });
}

// 删除教师信息
function deleteTeacher() {
    // 2.1 获取并校验教师ID
    const teacherId = document.getElementById('teacherId').value.trim();
    if (!teacherId || !confirm('确定要删除此教师信息吗？删除后不可恢复！')) {
        return;
    }

    // 2.2 发送DELETE请求
    fetch(`/api/admin/teacherDelete/${teacherId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('删除失败：可能该教师不存在或有未归还的借阅记录');
        }
        return response.json();
    })
    .then(data => {
        alert('删除成功');
        closeModal('teacherManageModal'); // 关闭模态框
        updateTeacherCount(-1); // 联动更新教师总数-1
        resetTeacherForm(); // 清空表单
        // 可选：刷新教师列表
        // loadTeacherList();
    })
    .catch(error => {
        console.error('删除教师失败:', error);
        alert('删除失败: ' + error.message);
    });
}

//  添加新教师
function addNewTeacher() {
    // 1. 获取新增表单数据（注意ID用add前缀区分，避免和编辑表单冲突）
    const teacherName = document.getElementById('addTeacherName').value.trim();
    const department = document.getElementById('addTeacherDepartment').value.trim();
    const email = document.getElementById('addTeacherEmail').value.trim();
    const phone = document.getElementById('addTeacherPhone').value.trim();
    const maxBorrow = document.getElementById('addTeacherMaxBorrow').value.trim();
    const status = document.getElementById('addTeacherStatus').value;

    // 2. 数据校验（比编辑更严格，无ID）
    // 2.1 核心字段不能为空
    if (!teacherName) {
        alert('请输入教师姓名！');
        document.getElementById('addTeacherName').focus();
        return;
    }
    if (!department) {
        alert('请输入所属系部！');
        document.getElementById('addTeacherDepartment').focus();
        return;
    }
    // 2.2 邮箱格式校验
    const emailReg = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!email || !emailReg.test(email)) {
        alert('请输入正确的邮箱格式（如：teacher@school.com）！');
        document.getElementById('addTeacherEmail').focus();
        return;
    }
    // 2.3 手机号格式校验
    const phoneReg = /^1[3-9]\d{9}$/;
    if (!phone || !phoneReg.test(phone)) {
        alert('请输入正确的11位手机号！');
        document.getElementById('addTeacherPhone').focus();
        return;
    }
    // 2.4 最大可借阅数校验
    if (isNaN(maxBorrow) || Number(maxBorrow) < 1 || Number(maxBorrow) > 20) {
        alert('最大可借阅数必须是1-20之间的数字！');
        document.getElementById('addTeacherMaxBorrow').focus();
        return;
    }

    // 3. 构造新增请求数据（无ID，由后端生成）
    const teacherData = {
        name: teacherName,
        department: department,
        email: email,
        phone: phone,
        max_borrow: Number(maxBorrow),
        status: status
    };

    // 4. 发送POST请求（新增用POST）
    fetch('/api/admin/teacherAdd', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(teacherData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`新增失败：${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.code === 200 || !data.code) {
            alert('新教师添加成功！');
            closeModal('addTeacherModal'); // 关闭新增模态框
            updateTeacherCount(1); // 教师总数+1
        } else {
            throw new Error(data.message || '新增失败');
        }
    })
    .catch(error => {
        console.error('添加教师失败:', error);
        alert('添加失败: ' + error.message);
    });
}
function updateTeacherCount(changeNum) {
    const teacherCountEl = document.getElementById('teacherCount');
    if (!teacherCountEl) return;

    // 去除千分位逗号，转为数字
    const currentCount = parseInt(teacherCountEl.textContent.replace(/,/g, '')) || 0;
    // 计算新值（确保≥0）
    const newCount = Math.max(currentCount + changeNum, 0);
    // 重新格式化千分位并更新
    const formatNumber = (num) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    teacherCountEl.textContent = formatNumber(newCount);
}

// 4. 辅助函数：清空教师表单
function resetTeacherForm() {
    document.getElementById('teacherId').value = '';
    document.getElementById('teacherName').value = '';
    document.getElementById('teacherDepartment').value = '';
    document.getElementById('teacherEmail').value = '';
    document.getElementById('teacherPhone').value = '';
    document.getElementById('teacherMaxBorrow').value = '5'; // 重置默认值
    document.getElementById('teacherStatus').value = 'active'; // 重置默认状态
}



// 清空表单函数
function clearForm() {
    document.getElementById('journalName').value = '';
    document.getElementById('journalISBN').value = '';
    document.getElementById('journalCategory').value = '';
    document.getElementById('journalPublisher').value = '';
    document.getElementById('journalIssueNumber').value = '';
    document.getElementById('publishDate').value = '';
    document.getElementById('journalDescription').value = '';
    document.getElementById('journalTotalQuantity').value = '';
    document.getElementById('journalAvailableQuantity').value = '';
    document.getElementById('journalStatus').value = 'available';
}


// 如果你需要编辑时加载数据，可以添加这个函数：
function loadJournalForEdit(journalId) {
    fetch(`/api/journal/get/${journalId}`)
    .then(response => response.json())
    .then(data => {
        if (data.id) {
            document.getElementById('journalName').value = data.name;
            document.getElementById('journalCategory').value = data.category;
            document.getElementById('journalPublisher').value = data.publisher;
            document.getElementById('publishDate').value = data.publishDate;
            document.getElementById('journalStatus').value = data.status;
            // 设置ID到隐藏字段
            let idField = document.getElementById('journalId');
            if (!idField) {
                idField = document.createElement('input');
                idField.type = 'hidden';
                idField.id = 'journalId';
                document.querySelector('.modal-content').appendChild(idField);
            }
            idField.value = data.id;
        }
    })
    .catch(error => {
        console.error('加载数据失败:', error);
    });
}



        // 执行查询
        function performSearch() {
            const keyword = document.getElementById('searchKeyword').value;
            if (!keyword) {
                showMessage('请输入查询关键词', 'error');
                return;
            }
            
            // 模拟查询操作
            setTimeout(() => {
                const resultMessage = document.getElementById('searchResultMessage');
                resultMessage.textContent = `找到 ${Math.floor(Math.random() * 50) + 1} 条相关记录`;
                resultMessage.style.display = 'block';
                
                // 3秒后自动关闭模态框
                setTimeout(() => {
                    closeModal('quickSearchModal');
                    showMessage('查询完成，已显示结果');
                }, 3000);
            }, 1000);
        }
        
        // 导出Excel
        function exportExcel() {
            showMessage('正在生成Excel报表，请稍候...', 'info');
            
            // 模拟导出操作
            setTimeout(() => {
                showMessage('Excel报表已生成，开始下载...');
            }, 1500);
        }
        
      
        
        // 初始化页面
        document.addEventListener('DOMContentLoaded', function() {
            console.log('管理员首页加载完成');
        });