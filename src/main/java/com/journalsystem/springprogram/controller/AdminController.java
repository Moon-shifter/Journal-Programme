package com.journalsystem.springprogram.controller;


import com.journalsystem.springprogram.common.Result;
import com.journalsystem.springprogram.exception.BusinessException;
import com.journalsystem.springprogram.pojo.AdminInfo;
import com.journalsystem.springprogram.service.AdminService;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth/admin")
public class AdminController {
    private final AdminService adminService;

    @Autowired//通过构造函数注入adminservice
    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }


    //使用泛型Result包装登录响应
    @PostMapping("/login")
    public Result<Map<String, Object>> login(@RequestBody Map<String, String> loginRequest) {
        //1.提取账号密码
        String username=loginRequest.get("username");
        String password=loginRequest.get("password");

       //2.调用service层验证账号密码是否正确
        AdminInfo adminInfo=adminService.getAdminByUsernameAndPwd(username,password);


        //3.登陆成功，组装响应数据
        Map<String, Object> data = new HashMap<>();
        data.put("adminId", adminInfo.getId());
        data.put("username", adminInfo.getUsername());
        data.put("realName", adminInfo.getRealName());
        data.put("role", adminInfo.getRole());
        return Result.success(data, "登录成功");//传到前端的是一个Map对象，包含管理员的id、用户名、真实姓名、角色


    }

    //超级管理员的秘密添加接口
    @GetMapping ("/add/username/{username}/password/{password}/realname/{real_name}")
    public Result<Map<String,Object>> addAdmin(@PathVariable String username, @PathVariable String password, @PathVariable String real_name) {
        // 用AdminInfo接收前端传递的用户名、密码、真实姓名
        AdminInfo adminInfo = new AdminInfo();
        adminInfo.setUsername(username);
        adminInfo.setPassword(BCrypt.hashpw(password,BCrypt.gensalt()));//密码加密存储
        adminInfo.setRealName(real_name);
        //如果添加成功，返回添加的管理员信息
       if(adminService.addAdmin(adminInfo)){
           Map<String, Object> data = new HashMap<>();
           data.put("adminId", adminInfo.getId());
           data.put("username", adminInfo.getUsername());
           data.put("realName", adminInfo.getRealName());
           data.put("role", adminInfo.getRole());
           return Result.success(data,"添加成功");
       }
       //如果添加失败，返回失败信息
        throw new BusinessException(400,"添加失败");
    }
}


