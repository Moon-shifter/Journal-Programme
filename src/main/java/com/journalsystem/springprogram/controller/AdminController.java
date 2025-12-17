package com.journalsystem.springprogram.controller;


import com.journalsystem.springprogram.pojo.AdminInfo;
import com.journalsystem.springprogram.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/admin")
public class AdminController {
    private final AdminService adminService;

    @Autowired//通过构造函数注入AdminService
    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }


    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> loginRequest) {
        //用Map接收前端传递的用户名和密码

        String username = loginRequest.get("username");
        String password = loginRequest.get("password");

        boolean loginSuccess = adminService.login(username, password);
        System.out.println("loginSuccess:" + loginSuccess);

        //根据登录结果返回不同的响应，用hasMap存储响应数据
        Map<String, Object> response = new HashMap<>();
        response.put("loginSuccess", loginSuccess);
        return response;
    }

    @GetMapping ("/api/addAdmin/username/{username}/password/{password}/realname/{real_name}")
    public Map<String, Object> addAdmin(@PathVariable String username, @PathVariable String password, @PathVariable String real_name) {
        // 用AdminInfo接收前端传递的用户名、密码、真实姓名
        AdminInfo adminInfo = new AdminInfo();
        adminInfo.setUsername(username);
        adminInfo.setPassword(password);
        adminInfo.setRealName(real_name);
        Map<String, Object> response = new HashMap<>();
        response.put("addSuccess", adminService.addAdmin(adminInfo));
        return response;
    }
}


