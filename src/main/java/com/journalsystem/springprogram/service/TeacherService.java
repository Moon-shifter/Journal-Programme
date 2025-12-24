package com.journalsystem.springprogram.service;

import com.journalsystem.springprogram.dto.TeacherDTO;
import com.journalsystem.springprogram.pojo.TeacherInfo;

import java.util.List;

//用来处理教师相关业务逻辑的接口
public interface TeacherService {
    //教师登录
    boolean login(Integer id,String name,String phone);
    //教师注册,用的是TeacherRegDTO这个类接受注册信息
    boolean register(TeacherDTO teacherDTO);


    //删除教师，根据id
    boolean delete(Integer id);
    //更新教师信息，根据id查找
    boolean update(Integer id, TeacherDTO updateDTO);
    //根据姓名查询教师信息，用list接受，因为一个姓名可能对应多个教师
    List<TeacherInfo> findByName(String name);
    //根据教师ID查询教师信息
    TeacherInfo findById(Integer id);




}
