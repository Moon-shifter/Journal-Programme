// pretend.js - 模拟后端数据接口
const api = {
  // 模拟教师信息接口
  get: function(url, params) {
    return new Promise((resolve, reject) => {
      // 模拟网络延迟
      setTimeout(() => {
        try {
          // 教师信息接口
          if (url === '/teacher/info') {
            // 模拟不同教师ID返回不同数据
            const teacherInfoMap = {
              '1001': { id: '1001', name: '李教授', department: '计算机学院', title: '教授' },
              '1002': { id: '1002', name: '王老师', department: '电子信息学院', title: '副教授' },
              '1003': { id: '1003', name: '张老师', department: '数学学院', title: '讲师' }
            };
            
            // 默认返回李教授信息
            const teacherInfo = teacherInfoMap[params.id] || teacherInfoMap['1001'];
            resolve(teacherInfo);
          }
          
          // 借阅统计数据接口
          else if (url === '/teacher/borrow/statistics') {
            resolve({
              currentBorrowCount: Math.floor(Math.random() * 10) + 1, // 1-10本
              overdueCount: Math.floor(Math.random() * 3), // 0-2本
              upcomingExpireCount: Math.floor(Math.random() * 5) + 1, // 1-5本
              renewableCount: Math.floor(Math.random() * 4) + 1 // 1-4本
            });
          }
          
          // 借阅列表接口
          else if (url === '/teacher/borrow/list') {
            // 模拟期刊数据
            const journals = [
              { name: '《计算机学报》', volume: '2025年第3期' },
              { name: '《人工智能进展》', volume: '2025年第2期' },
              { name: '《软件学报》', volume: '2025年第1期' },
              { name: '《计算机应用》', volume: '2025年第4期' },
              { name: '《计算机科学》', volume: '2025年第2期' },
              { name: '《自动化学报》', volume: '2025年第5期' },
              { name: '《电子学报》', volume: '2025年第3期' }
            ];
            
            // 生成随机日期的工具函数
            function getRandomDate(days) {
              const date = new Date();
              date.setDate(date.getDate() - days);
              return date.toISOString().split('T')[0];
            }
            
            // 生成借阅列表
            const borrowList = [];
            const count = Math.floor(Math.random() * 5) + 2; // 2-6条记录
            
            for (let i = 0; i < count; i++) {
              // 随机选择期刊
              const journal = journals[Math.floor(Math.random() * journals.length)];
              
              // 随机生成借阅状态
              const statusOptions = ['OVERDUE', 'UPCOMING_EXPIRE', 'NORMAL'];
              const status = statusOptions[Math.floor(Math.random() * statusOptions.length)];
              
              // 根据状态生成不同的日期
              let borrowDate, dueDate;
              
              if (status === 'OVERDUE') {
                // 已超期：借阅日期较早，应还日期已过
                borrowDate = getRandomDate(40);
                dueDate = getRandomDate(10);
              } else if (status === 'UPCOMING_EXPIRE') {
                // 即将到期：应还日期在未来3天内
                borrowDate = getRandomDate(25);
                dueDate = getRandomDate(-2);
              } else {
                // 正常：应还日期在未来
                borrowDate = getRandomDate(15);
                dueDate = getRandomDate(-15);
              }
              
              borrowList.push({
                id: `borrow_${params.teacherId}_${i + 1}`,
                journalName: journal.name,
                volumeIssue: journal.volume,
                borrowDate: borrowDate,
                dueDate: dueDate,
                status: status
              });
            }
            
            resolve(borrowList);
          }
          
          // 未知接口
          else {
            reject(new Error('未知接口地址'));
          }
        } catch (error) {
          reject(error);
        }
      }, 500); // 模拟500ms网络延迟
    });
  },
  
}
// 初始化时将用户信息存入localStorage（模拟登录状态）
document.addEventListener('DOMContentLoaded', function() {
  // 检查是否已有用户信息，没有则初始化
  if (!localStorage.getItem('teacherInfo')) {
    const defaultTeacher = { id: '1001', name: '李教授' };
    localStorage.setItem('teacherInfo', JSON.stringify(defaultTeacher));
  }
});