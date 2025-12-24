package com.journalsystem.springprogram.controller;

import com.journalsystem.springprogram.common.Result;
import com.journalsystem.springprogram.dto.TeacherDTO;
import com.journalsystem.springprogram.exception.BusinessException;
import com.journalsystem.springprogram.pojo.AdminInfo;
import com.journalsystem.springprogram.service.AdminService;
import com.journalsystem.springprogram.service.TeacherService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AdminService adminService;
    private final TeacherService teacherService;
    @Autowired
    public AuthController(AdminService adminService, TeacherService teacherService) {
        this.adminService = adminService;
        this.teacherService = teacherService;
    }


    //管理员登录接口
    @PostMapping("/admin/login")
    public Result<Map<String, Object>> adminLogin(@RequestBody Map<String, String> loginRequest,HttpServletRequest request) {
        //1.提取账号密码
        String username=loginRequest.get("username");
        String password=loginRequest.get("password");

        //2.调用service层验证账号密码是否正确
        AdminInfo adminInfo=adminService.getAdminByUsernameAndPwd(username,password);

        //存储session
        request.getSession().setAttribute("loginAdmin", adminInfo);

        //3.登陆成功，组装响应数据
        Map<String, Object> data = new HashMap<>();
        data.put("adminId", adminInfo.getId());
        data.put("username", adminInfo.getUsername());
        data.put("realName", adminInfo.getRealName());
        data.put("role", adminInfo.getRole());
        return Result.success(data, "登录成功");//传到前端的是一个Map对象，包含管理员的id、用户名、真实姓名、角色
    }

    @PostMapping("/teacher/login")
    public Result<Map<String, Object>> teacherLogin(@RequestBody Map<String, String> loginData,HttpServletRequest request) {

        //提取前端的JSON数据中的id、name、phone
        String id=loginData.get("id");
        String name=loginData.get("name");
        String phone=loginData.get("phone");

        //调用教师服务层的登录方法
        teacherService.login(Integer.valueOf(id),name,phone);

        //返回响应，用hasMap存储响应数据,用result包装响应
        Map<String, Object> data = new HashMap<>();
        data.put("teacherId", id);
        data.put("name", name);
        data.put("phone", phone);

        //存储session
        request.getSession().setAttribute("loginTeacher", data);

        return Result.success(data, "登录成功");


    }


    @PostMapping("/teacher/register")
    public Result<Map<String, Object>> register(@RequestBody TeacherDTO regDTO) {

        //调用教师服务层的注册方法
        teacherService.register(regDTO);

        //返回响应，上方方法自带抛出异常
        Map<String, Object> data = new HashMap<>();//用HashMap存储响应数据
        data.put("teacherId", regDTO.getId());
        data.put("name", regDTO.getName());
        data.put("department", regDTO.getDepartment());
        data.put("email", regDTO.getEmail());
        data.put("phone", regDTO.getPhone());

        return Result.success(data, "注册成功");



    }

    // 退出登录（通用）
    @PostMapping("/logout")
    public Result<?> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);//获取当前请求的session对象，false表示如果不存在session对象，不创建新的session对象
        if (session != null) {
            session.invalidate();//使session对象无效，删除session中的所有属性
        }
        return Result.success(null, "退出成功");//返回一个空的Map对象，前端可以根据这个对象判断是否退出成功
    }



}
