//数据展示获取
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
        // 刷新页面或更新数据期刊库总数-1
        location.reload();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('删除失败: ' + error.message);
    });
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