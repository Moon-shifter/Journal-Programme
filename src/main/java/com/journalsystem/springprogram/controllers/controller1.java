package com.journalsystem.springprogram.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller


public class controller1 {
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



}
