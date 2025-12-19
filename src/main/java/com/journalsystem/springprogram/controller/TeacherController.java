package com.journalsystem.springprogram.controller;

import com.journalsystem.springprogram.dto.TeacherRegDTO;
import com.journalsystem.springprogram.service.TeacherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("api/auth/teacher")
public class TeacherController {
    private TeacherService teacherService;
    @Autowired
    public void setTeacherService(TeacherService teacherService) {
        this.teacherService = teacherService;
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> loginData) {
        //提取前端的JSON数据中的id、name、phone
        String id=loginData.get("id");
        String name=loginData.get("name");
        String phone=loginData.get("phone");

        //调用教师服务层的登录方法
        boolean loginSuccess=teacherService.login(Integer.valueOf(id),name,phone);
        //根据登录结果返回不同的响应，用hasMap存储响应数据
        Map<String, Object> response = new HashMap<>();
        response.put("data", loginSuccess);
        return response;
    }

    @PostMapping("/register")
    public Map<String, Object> register(@RequestBody TeacherRegDTO teacherRegDTO) {
        //调用教师服务层的注册方法
        boolean registerSuccess=teacherService.register(teacherRegDTO);
        //根据注册结果返回不同的响应，用hasMap存储响应数据
        Map<String, Object> response = new HashMap<>();
        response.put("data", registerSuccess);
        return response;
    }

}
