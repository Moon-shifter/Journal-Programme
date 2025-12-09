package com.journalsystem.springprogram.controllers;

import com.journalsystem.springprogram.pojo.Student;
import com.journalsystem.springprogram.service.StuService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller


public class controller1 {

    @Autowired
    @Qualifier("stuServiceImpl")
    private StuService stuService;

    @RequestMapping("/index.html")//接受前端请求控制器名字
    String a(){
        return "index.html";
    }

    @RequestMapping("/index2.html")
    String b(){
        return "index2.html";
    }

    @RequestMapping("/index3.html")
    String c(){
        return "index3.html";
    }

    @RequestMapping("/stReg.html")//跳转到注册界面
    String d(){
        return "stReg.html";//默认返回视图
    }

    @PostMapping("/stReg0")
    //@ResponseBody  仅该方法返回JSON
    String e(Student student) { // 需确保Student的属性与表单name一致
        System.out.println("提交的学生信息：" + student);
        stuService.insertStudent(student);
       return "success.html";
    }



}
