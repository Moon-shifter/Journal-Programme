package com.journalsystem.springprogram.service;

import com.journalsystem.springprogram.pojo.AdminInfo;
import com.journalsystem.springprogram.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.mindrot.jbcrypt.BCrypt;

import java.util.List;


@Service // 必须加@Service，让Spring扫描为Bean
public class AdminServiceImpl implements AdminService {

    @Autowired// 自动注入AdminRepository，使得AdminServiceImpl可以调用AdminRepository的方法
    private AdminRepository adminRepository;

    @Override
    public boolean login(String username, String password) {
        AdminInfo adminInfo = adminRepository.findByUsername(username);
        // 先判断用户是否存在，再比较密码（避免空指针）
        if (adminInfo == null) {
            return false;
        }

        //取出数据库密码，解密后与输入密码比较
        return BCrypt.checkpw(password, adminInfo.getPassword());
    }

    @Override
    public boolean addAdmin(AdminInfo adminInfo) {
        // 判断ID是否已存在
        if (adminRepository.existsById(adminInfo.getId())) {
            return false;
        }
        // JPA的save：新增/修改，返回保存后的实体（成功则返回true），这里仅作新增操作
        // 密码加密后存储
        adminInfo.setPassword(BCrypt.hashpw(adminInfo.getPassword(), BCrypt.gensalt()));
        adminRepository.save(adminInfo);
        return true;
    }

    @Override
    public boolean deleteAdmin(Integer adminId) {
        // 判断ID是否存在
        if (!adminRepository.existsById(adminId)) {
            return false;
        }
        adminRepository.deleteById(adminId);
        return true;
    }

    @Override
    public List<AdminInfo> getAllAdmins() {
        // JPA内置findAll()：查询所有数据
        return adminRepository.findAll();
    }

    @Override
    public AdminInfo getAdminById(Integer adminId) {
        // findById返回Optional，orElse(null)表示“没有则返回null”
        return adminRepository.findById(adminId).orElse(null);
    }

    @Override
    //@Transactional// 开启事务，确保数据库操作的一致性
    public AdminInfo getAdminByUsername(String username) {
        // 调用Repository中自定义的findByUsername
        return adminRepository.findByUsername(username);
    }
}