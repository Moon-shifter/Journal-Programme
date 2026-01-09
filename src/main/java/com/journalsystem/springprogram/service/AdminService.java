package com.journalsystem.springprogram.service;

import com.journalsystem.springprogram.common.PageResult;
import com.journalsystem.springprogram.common.PageRequest;
import com.journalsystem.springprogram.pojo.AdminInfo;

import java.util.List;

//管理员服务接口，定义了管理员相关的业务操作
public interface AdminService {
    //1.管理员登录
    boolean login(String username, String password);
    
    //2.新增管理员(超级管理员权限)
    boolean addAdmin(AdminInfo adminInfo);
    
    //3.删除管理员
    boolean deleteAdmin(Integer adminId);
    
    //4.查询所有管理员
    List<AdminInfo> getAllAdmins();
    
    //5.根据管理员ID查询管理员信息
    AdminInfo getAdminById(Integer adminId);
    
    //6.根据用户名查询管理员信息（用于登录验证）
    AdminInfo getAdminByUsername(String username);

    //7.更新管理员信息
    default boolean updateAdmin(AdminInfo adminInfo) {
        return false;
    }

    //8.通过用户名和密码查询管理员信息（用于登录验证）
    AdminInfo getAdminByUsernameAndPwd(String username, String password);

    //9.分页查询管理员
    default PageResult<AdminInfo> getAdminsByPage(PageRequest pageRequest) {
        return null;
    }

    //10.更新管理员密码
    default boolean updateAdminPassword(Integer adminId, String oldPassword, String newPassword) {
        return false;
    }

    //11.重置管理员密码
    default boolean resetAdminPassword(Integer adminId) {
        return false;
    }

    //12.更新管理员状态
    default boolean updateAdminStatus(Integer adminId, String status) {
        return false;
    }

    //13.更新管理员角色
    default boolean updateAdminRole(Integer adminId, String role) {
        return false;
    }

    //14.记录管理员登录时间
    default boolean updateLastLoginTime(String username) {
        return false;
    }
}