package com.journalsystem.springprogram.controller;

import com.journalsystem.springprogram.common.Result;
import com.journalsystem.springprogram.dto.TeacherRegDTO;
import com.journalsystem.springprogram.exception.BusinessException;
import com.journalsystem.springprogram.service.TeacherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/teacher")
public class TeacherController {
    private TeacherService teacherService;
    @Autowired
    public void setTeacherService(TeacherService teacherService) {
        this.teacherService = teacherService;
    }


}
