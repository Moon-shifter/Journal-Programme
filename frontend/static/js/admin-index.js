// admin-index.js - 管理员主页核心逻辑（依赖 common-request.js 已加载）
document.addEventListener("DOMContentLoaded", () => {
    // DOM 元素（需与管理员主页 HTML 对应，可根据实际结构调整选择器）
    const teacherListEl = document.getElementById("teacherList"); // 教师列表容器
    const addTeacherModal = document.getElementById("addTeacherModal"); // 添加教师模态框
    const editTeacherModal = document.getElementById("editTeacherModal"); // 编辑教师模态框
    const addForm = document.getElementById("addTeacherForm"); // 添加教师表单
    const editForm = document.getElementById("editTeacherForm"); // 编辑教师表单

    // 页面加载时初始化：加载所有教师信息
    initAdminPage();

    // ------------------------------
    // 1. 初始化页面：加载教师列表
    // ------------------------------
    async function initAdminPage() {
        try {
            showLoading(true); // 显示加载状态
            // 发起 GET 请求查询教师列表（接口地址根据文档推测，需与后端一致）
            const teacherList = await api.get("/api/admin/teacherList");
            renderTeacherList(teacherList); // 渲染列表到页面
        } catch (error) {
            console.error("加载教师列表失败：", error);
        } finally {
            showLoading(false); // 隐藏加载状态
        }
    }

    // ------------------------------
    // 2. 渲染教师列表到页面
    // ------------------------------
    function renderTeacherList(list = []) {
        if (!teacherListEl) return;

        // 列表为空时的提示
        if (list.length === 0) {
            teacherListEl.innerHTML = `
                <div class="empty-tip">暂无教师信息，请添加教师</div>
            `;
            return;
        }

        // 渲染列表（适配表格/卡片布局，此处以表格为例）
        let html = `
            <table class="teacher-table">
                <thead>
                    <tr>
                        <<th>教师ID</</th>
                        <<th>姓名</</th>
                        <<th>部门</</th>
                        <<th>邮箱</</th>
                        <<th>手机号</</th>
                        <<th>操作</</th>
                    </tr>
                </thead>
                <tbody>
        `;

        list.forEach(teacher => {
            html += `
                <tr data-teacher-id="${teacher.teacherId}">
                    <td>${teacher.teacherId || '-'}</td>
                    <td>${teacher.name || '-'}</td>
                    <td>${teacher.department || '-'}</td>
                    <td>${teacher.email || '-'}</td>
                    <td>${teacher.phone || '-'}</td>
                    <td class="operate-btn-group">
                        <button class="btn-edit" data-teacher='${JSON.stringify(teacher)}'>编辑</button>
                        <button class="btn-delete" data-teacher-id="${teacher.teacherId}">删除</button>
                    </td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        teacherListEl.innerHTML = html;

        // 绑定操作按钮事件（编辑/删除）
        bindOperateEvents();
    }

    // ------------------------------
    // 3. 绑定编辑/删除按钮事件
    // ------------------------------
    function bindOperateEvents() {
        // 编辑按钮事件
        document.querySelectorAll(".btn-edit").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const teacher = JSON.parse(e.currentTarget.dataset.teacher);
                openEditModal(teacher); // 打开编辑模态框并填充数据
            });
        });

        // 删除按钮事件
        document.querySelectorAll(".btn-delete").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const teacherId = e.currentTarget.dataset.teacherId;
                if (confirm(`确定要删除 ID 为 ${teacherId} 的教师吗？`)) {
                    await deleteTeacher(teacherId); // 执行删除操作
                }
            });
        });
    }

    // ------------------------------
    // 4. 删除教师（对接 DEL 接口）
    // ------------------------------
    /**
     * 删除教师信息
     * @param {number} teacherId - 教师ID（Path参数）
     */
    async function deleteTeacher(teacherId) {
        try {
            // 接口地址：DELETE /api/admin/teacherDelete/{teacherId}（Path参数拼接）
            await api.del(`/api/admin/teacherDelete/${teacherId}`);
            // 删除成功后刷新列表（后端响应已由 common-request.js 提示）
            initAdminPage();
        } catch (error) {
            console.error("删除教师失败：", error);
        }
    }

    // ------------------------------
    // 5. 打开编辑模态框并填充数据
    // ------------------------------
    function openEditModal(teacher) {
        if (!editTeacherModal || !editForm) return;

        // 填充表单数据
        editForm.teacherId.value = teacher.teacherId || "";
        editForm.name.value = teacher.name || "";
        editForm.department.value = teacher.department || "";
        editForm.email.value = teacher.email || "";
        editForm.phone.value = teacher.phone || "";

        // 显示模态框（根据实际模态框实现调整，此处为通用逻辑）
        editTeacherModal.style.display = "block";
    }

    // ------------------------------
    // 6. 提交编辑教师信息（对接 PUT 接口）
    // ------------------------------
    if (editForm) {
        editForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const formData = {
                teacherId: editForm.teacherId.value.trim(),
                name: editForm.name.value.trim(),
                department: editForm.department.value.trim(),
                email: editForm.email.value.trim(),
                phone: editForm.phone.value.trim()
            };

            try {
                // 接口地址：PUT /api/admin/teacherUpdate（根据文档推测，需与后端一致）
                await api.put("/api/admin/teacherUpdate", formData);
                // 编辑成功：关闭模态框+刷新列表
                editTeacherModal.style.display = "none";
                initAdminPage();
            } catch (error) {
                console.error("编辑教师失败：", error);
            }
        });
    }

    // ------------------------------
    // 7. 提交添加教师信息（对接 POST 接口）
    // ------------------------------
    if (addForm) {
        addForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const formData = {
                name: addForm.name.value.trim(),
                department: addForm.department.value.trim(),
                email: addForm.email.value.trim(),
                phone: addForm.phone.value.trim()
            };

            // 表单基础校验
            if (!formData.name || !formData.email || !formData.phone) {
                alert("姓名、邮箱、手机号为必填项");
                return;
            }

            try {
                // 接口地址：POST /api/admin/teacherAdd（根据文档推测，需与后端一致）
                await api.post("/api/admin/teacherAdd", formData);
                // 添加成功：重置表单+关闭模态框+刷新列表
                addForm.reset();
                addTeacherModal.style.display = "none";
                initAdminPage();
            } catch (error) {
                console.error("添加教师失败：", error);
            }
        });
    }

    // ------------------------------
    // 辅助函数：显示/隐藏加载状态
    // ------------------------------
    function showLoading(show) {
        const loadingEl = document.getElementById("loading");
        if (loadingEl) {
            loadingEl.style.display = show ? "block" : "none";
        }
    }

    // ------------------------------
    // 模态框关闭逻辑（通用）
    // ------------------------------
    document.querySelectorAll(".modal-close").forEach(btn => {
        btn.addEventListener("click", () => {
            addTeacherModal?.style.display = "none";
            editTeacherModal?.style.display = "none";
        });
    });
});