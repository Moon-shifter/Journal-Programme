package com.journalsystem.springprogram.controller;

import com.journalsystem.springprogram.common.Result;
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
    public Result<Map<String, Object>> login(@RequestBody Map<String, String> loginData) {

        //提取前端的JSON数据中的id、name、phone
        String id=loginData.get("id");
        String name=loginData.get("name");
        String phone=loginData.get("phone");

        //调用教师服务层的登录方法
        boolean loginSuccess=teacherService.login(Integer.valueOf(id),name,phone);

        //根据登录结果返回不同的响应，用hasMap存储响应数据,用result包装响应
        if(loginSuccess){
            Map<String, Object> data = new HashMap<>();
            data.put("id", id);
            data.put("name", name);
            data.put("phone", phone);
            return Result.success(data, "登录成功");
        }

        //如果登录失败，返回失败信息
        return Result.fail(400,"登录失败");

    }

    @PostMapping("/register")
    public Result<Map<String, Object>> register(@RequestBody TeacherRegDTO teacherRegDTO) {
        //调用教师服务层的注册方法
        boolean registerSuccess=teacherService.register(teacherRegDTO);
        //根据注册结果返回不同的响应，用hasMap存储响应数据
        if(registerSuccess){
            Map<String, Object> data = new HashMap<>();
            data.put("name", teacherRegDTO.getName());
            data.put("department", teacherRegDTO.getDepartment());
            data.put("email", teacherRegDTO.getEmail());
            data.put("phone", teacherRegDTO.getPhone());
            return Result.success(data, "注册成功");
        }

        return Result.fail(400,"注册失败");
    }

}
