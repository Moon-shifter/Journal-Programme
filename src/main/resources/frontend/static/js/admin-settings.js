// ==================== API路径配置 ====================
const SETTINGS_API_PATHS = {
    // 获取系统设置
    GET_SETTINGS: '/api/settings',
    // 更新系统设置
    UPDATE_SETTINGS: '/api/settings'
};

// ==================== 页面初始化 ====================
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
});

async function initializePage() {
    try {
        // 加载侧边栏
        loadSidebar();
        // 加载管理员信息
        loadAdminInfo();
        // 加载系统设置
        await loadSettings();
        // 绑定表单提交事件
        bindFormEvents();
    } catch (error) {
        console.error('页面初始化失败:', error);
    }
}

// ==================== 加载侧边栏 ====================
function loadSidebar() {
    // 侧边栏折叠功能
    const toggleBtn = document.getElementById('toggleSidebar');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');

    toggleBtn.addEventListener('click', function() {
        sidebar.classList.toggle('sidebar-collapsed');
        mainContent.classList.toggle('main-content-expanded');
    });
}

// ==================== 加载管理员信息 ====================
function loadAdminInfo() {
    // 从cookie获取管理员信息
    const adminInfo = getAdminInfoFromCookie();
    if (adminInfo) {
        const userInfoElement = document.querySelector('.user-info span');
        if (userInfoElement) {
            userInfoElement.textContent = adminInfo.username || '管理员';
        }
    }
}

// ==================== 加载系统设置 ====================
async function loadSettings() {
    try {
        // 调用API获取设置
        const response = await api.get(SETTINGS_API_PATHS.GET_SETTINGS);
        const settings = response.data || {};
        
        // 填充基础设置表单
        document.getElementById('systemName').value = settings.systemName || '学院期刊管理系统';
        document.getElementById('systemVersion').value = settings.systemVersion || '1.0.0';
        document.getElementById('contactEmail').value = settings.contactEmail || 'admin@example.com';
        document.getElementById('contactPhone').value = settings.contactPhone || '010-12345678';
        
        // 填充借阅设置表单
        document.getElementById('borrowDuration').value = settings.borrowDuration || 30;
        document.getElementById('maxBorrowCount').value = settings.maxBorrowCount || 5;
        document.getElementById('overdueFine').value = settings.overdueFine || 0.5;
        
        // 填充通知设置表单
        document.getElementById('enableOverdueNotice').checked = settings.enableOverdueNotice !== false;
        document.getElementById('noticeBeforeDays').value = settings.noticeBeforeDays || 3;
        document.getElementById('noticeTime').value = settings.noticeTime || '09:00';
        
    } catch (error) {
        console.error('加载系统设置失败:', error);
        // 如果API调用失败，使用默认值
        console.log('使用默认设置值');
    }
}

// ==================== 绑定表单事件 ====================
function bindFormEvents() {
    // 基础设置表单
    document.getElementById('basicSettingsForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveSettings('basic');
    });
    
    // 借阅设置表单
    document.getElementById('borrowSettingsForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveSettings('borrow');
    });
    
    // 通知设置表单
    document.getElementById('notificationSettingsForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveSettings('notification');
    });
}

// ==================== 保存系统设置 ====================
async function saveSettings(type) {
    try {
        let settings = {};
        
        // 根据类型获取表单数据
        switch (type) {
            case 'basic':
                settings = {
                    systemName: document.getElementById('systemName').value,
                    contactEmail: document.getElementById('contactEmail').value,
                    contactPhone: document.getElementById('contactPhone').value
                };
                break;
            case 'borrow':
                settings = {
                    borrowDuration: parseInt(document.getElementById('borrowDuration').value),
                    maxBorrowCount: parseInt(document.getElementById('maxBorrowCount').value),
                    overdueFine: parseFloat(document.getElementById('overdueFine').value)
                };
                break;
            case 'notification':
                settings = {
                    enableOverdueNotice: document.getElementById('enableOverdueNotice').checked,
                    noticeBeforeDays: parseInt(document.getElementById('noticeBeforeDays').value),
                    noticeTime: document.getElementById('noticeTime').value
                };
                break;
        }
        
        // 调用API保存设置
        await api.put(SETTINGS_API_PATHS.UPDATE_SETTINGS, settings);
        
        // 显示成功提示
        alert(`${getSettingsTypeName(type)}保存成功！`);
        
    } catch (error) {
        console.error('保存设置失败:', error);
        alert(`${getSettingsTypeName(type)}保存失败，请重试！`);
    }
}

// ==================== 辅助函数 ====================
function getSettingsTypeName(type) {
    const typeNames = {
        'basic': '基础设置',
        'borrow': '借阅设置',
        'notification': '通知设置'
    };
    return typeNames[type] || '设置';
}

// ==================== 原生JavaScript实现选项卡功能 ====================
function initTabs() {
    const tabButtons = document.querySelectorAll('.nav-tabs button');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // 移除所有激活状态
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => {
                pane.classList.remove('show', 'active');
            });
            
            // 添加当前激活状态
            button.classList.add('active');
            const targetPane = document.querySelector(button.getAttribute('data-bs-target'));
            if (targetPane) {
                targetPane.classList.add('show', 'active');
            }
        });
    });
}

// 初始化选项卡
initTabs();