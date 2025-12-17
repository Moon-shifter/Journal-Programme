package com.journalsystem.springprogram.service;

import com.journalsystem.springprogram.pojo.AdminInfo;

import java.util.List;

//管理员服务接口，定义了管理员相关的业务操作
public interface AdminService {
    //1.管理员登录
    boolean login(String username, String password);
    //2.新增管理员
    boolean addAdmin(AdminInfo adminInfo);
    //3.删除管理员
    boolean deleteAdmin(Integer adminId);
    //4.查询所有管理员
    List<AdminInfo> getAllAdmins();
    //5.根据管理员ID查询管理员信息
    AdminInfo getAdminById(Integer adminId);
    //6.根据用户名查询管理员信息（用于登录验证）
    AdminInfo getAdminByUsername(String username);

    //7.更新管理员信息,待实现
    public default boolean updateAdmin(AdminInfo adminInfo) {
        return false;
    }
}
