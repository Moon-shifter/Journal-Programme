package com.journalsystem.springprogram.service;

import com.journalsystem.springprogram.common.PageResult;
import com.journalsystem.springprogram.common.PageRequest;
import com.journalsystem.springprogram.dto.TeacherDTO;
import com.journalsystem.springprogram.pojo.TeacherInfo;

import java.util.List;

//用来处理教师相关业务逻辑的接口
public interface TeacherService {
    //教师登录
    boolean login(Integer id, String name, String phone);
    
    //教师注册
    boolean register(TeacherDTO teacherDTO);
    
    //删除教师
    boolean delete(Integer id);
    
    //更新教师信息
    boolean update(Integer id, TeacherDTO updateDTO);

    //根据教师ID查询教师信息
    TeacherInfo findById(Integer id);

    //根据姓名查询教师信息
    default List<TeacherInfo> findByName(String name) {
        return null;
    }

    //查询所有教师
    default List<TeacherInfo> getAllTeachers() {return null;}

    //分页查询教师
    default PageResult<TeacherInfo> getTeachersByPage(PageRequest pageRequest) {
        return null;
    }

    //根据部门查询教师
    default List<TeacherInfo> getTeachersByDepartment(String department) {
        return null;
    }

    //更新教师借阅限额
    default boolean updateMaxBorrow(Integer teacherId, Integer maxBorrow) {
        return false;
    }
    
    //获取教师当前借阅数量
    default Integer getCurrentBorrowCount(Integer teacherId) {
        return null;
    }
    
    //检查教师是否可借阅更多期刊
    default boolean canBorrowMore(Integer teacherId) {
        return false;
    }
    
    //激活/禁用教师账号
    default boolean updateTeacherStatus(Integer teacherId, String status) {
        return false;
    }
    
    //批量导入教师信息
    default boolean batchImportTeachers(List<TeacherDTO> teacherDTOs) {
        return false;
    }
}