package com.journalsystem.springprogram.repository;

import com.journalsystem.springprogram.pojo.AdminInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
// 泛型：JpaRepository<实体类, 主键类型>
public interface AdminRepository extends JpaRepository<AdminInfo, Integer> {
    // 按JPA方法命名规则，自动生成“根据username查询”的SQL(select * from admin_info where username = ?)
    AdminInfo findByUsername(String username);
    boolean existsByUsername(String username);
}