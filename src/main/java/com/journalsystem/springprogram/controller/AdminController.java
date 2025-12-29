package com.journalsystem.springprogram.controller;


import com.journalsystem.springprogram.common.Result;
import com.journalsystem.springprogram.dto.TeacherDTO;
import com.journalsystem.springprogram.exception.BusinessException;
import com.journalsystem.springprogram.pojo.AdminInfo;
import com.journalsystem.springprogram.service.AdminService;

import com.journalsystem.springprogram.service.TeacherService;
import com.journalsystem.springprogram.util.DtoUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 管理员相关接口
 * 负责超级管理员对普通管理员的新增、查询等操作
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final AdminService adminService;
    private final TeacherService teacherService;

    @Autowired//通过构造函数注入adminservice
    public AdminController(AdminService adminService, TeacherService teacherService) {
        this.adminService = adminService;
        this.teacherService = teacherService;
    }




    /**
     * 超级管理员添加新管理员接口
     * @apiNote 仅超级管理员可调用，通过路径参数传递管理员账号信息
     * @param username 管理员用户名（不可重复，示例：admin_new01）
     * @param password 管理员登录密码（示例：123456@abc）
     * @param real_name 管理员真实姓名（示例：张新管理员）
     * @return 统一响应结果：
     *         成功：{"code":200,"data":{"adminId":1001,"addSuccess":true},"message":"管理员添加成功"}
     *         失败：{"code":400,"data":null,"message":"添加失败"}
     * @throws BusinessException 失败场景：
     *                               1. 用户名重复 → code=400，message="用户名已存在"
     *                               2. 参数格式错误 → code=400，message="参数格式不合法"
     */
    //超级管理员的秘密添加接口
    @GetMapping("/add/username/{username}/password/{password}/realname/{real_name}")
    public Result<Map<String,Object>> addAdmin(@PathVariable String username, @PathVariable String password, @PathVariable String real_name) {
        // 用AdminInfo接收前端传递的用户名、密码、真实姓名
        AdminInfo adminInfo = new AdminInfo();
        adminInfo.setUsername(username);
        adminInfo.setPassword(password);
        adminInfo.setRealName(real_name);
        //如果添加成功，返回添加的管理员信息
        if(adminService.addAdmin(adminInfo)){
            Map<String, Object> data = new HashMap<>();
            data.put("adminId", adminInfo.getId());
            data.put("addSuccess", true);
            return Result.success(data,"管理员添加成功");
        }
        //如果添加失败，返回失败信息
        throw new BusinessException(400,"添加失败");
    }

    /**
     * 修改教师信息接口
     * @apiNote 管理员可调用，通过路径参数传递教师ID，请求体传递教师更新信息
     * @param teacherId 教师ID（示例：1001）
     * @param teacherDTO 教师更新信息DTO，包含需要更新的字段（示例：{"name":"新教师姓名","phone":"13800138000"}）
     * @return 统一响应结果：
     *         成功：{"code":200,"data":{"teacherId":1001,...},"message":"教师信息修改成功"}
     *         失败：{"code":404,"data":null,"message":"教师ID不存在,修改失败"}
     * @throws BusinessException 失败场景示例：
     *                               1. 教师ID不存在 → code=404，message="教师ID不存在,修改失败"
     */
    @PutMapping("/teacherUpdate/{teacherId}")
    public Result<Map<String,Object>> updateAdmin(@PathVariable Integer teacherId, @RequestBody TeacherDTO teacherDTO) {
        // 调用教师服务层更新教师信息，如果失败会抛出异常
        teacherService.update(teacherId, teacherDTO);
        
        // 只有当更新成功时才会执行到这里
        Map<String, Object> data = new HashMap<>();
        DtoUtil.mapPutAllFields(teacherDTO, data);
        return Result.success(data, "教师信息修改成功");
    }

    /**
     * 删除教师信息接口
     * @apiNote 管理员可调用，通过路径参数传递教师ID
     * @param teacherId 教师ID（示例：1001）
     * @return 统一响应结果：
     *         成功：{"code":200,"data":{"teacherId":1001},"message":"教师信息删除成功"}
     *         失败：{"code":404,"data":null,"message":"教师ID不存在,删除失败"}
     * @throws BusinessException 失败场景示例：
     *                               1. 教师ID不存在 → code=404，message="教师ID不存在,删除失败"
     */

    @DeleteMapping("/teacherDelete/{teacherId}")
    public Result<Map<String,Object>> deleteAdmin(@PathVariable Integer teacherId) {
        // 调用教师服务层删除教师信息，如果失败会抛出异常
        teacherService.delete(teacherId);

        // 只有当删除成功时才会执行到这里
        Map<String, Object> data = new HashMap<>();
        data.put("teacherId", teacherId);
        return Result.success(data, "教师信息删除成功");
    }

    /**
     * 添加教师信息接口
     * @apiNote 管理员可调用，通过请求体传递教师注册信息
     * @param teacherDTO 教师注册信息DTO，包含教师姓名、手机号、部门、邮箱等等（示例：{"name":"新教师姓名","phone":"13800138000","department":"信息工程学院","email":"newteacher@example.com"}）
     * @return 统一响应结果：
     *         成功：{"code":200,"data":{"teacherId":1001,...},"message":"教师信息添加成功"}
     *         失败：{"code":400,"data":null,"message":"添加失败"}
     * @throws BusinessException 失败场景示例：
     *                               1. 教师ID重复 → code=400，message="教师ID已存在"
     *                               2. 参数格式错误 → code=400，message="参数格式不合法"
     */

    @PostMapping("/teacherAdd")
    public Result<Map<String,Object>> addAdmin(@RequestBody TeacherDTO teacherDTO) {
        // 调用教师服务层添加教师信息，如果失败会抛出异常
        teacherService.register(teacherDTO);
        // 只有当添加成功时才会执行到这里
        Map<String, Object> data = new HashMap<>();
        DtoUtil.mapPutAllFields(teacherDTO, data);
        return Result.success(data, "教师信息添加成功");
    }


}