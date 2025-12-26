package com.journalsystem.springprogram.controller;


import com.journalsystem.springprogram.common.Result;
import com.journalsystem.springprogram.exception.BusinessException;
import com.journalsystem.springprogram.pojo.AdminInfo;
import com.journalsystem.springprogram.service.AdminService;

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

    @Autowired//通过构造函数注入adminservice
    public AdminController(AdminService adminService) {
        this.adminService = adminService;
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


}