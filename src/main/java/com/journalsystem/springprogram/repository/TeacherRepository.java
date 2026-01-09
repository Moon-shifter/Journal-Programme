package com.journalsystem.springprogram.repository;

import com.journalsystem.springprogram.pojo.TeacherInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeacherRepository extends JpaRepository<TeacherInfo, Integer> {
    //根据姓名查询教师信息，返回教师列表
    List<TeacherInfo> findByName(String name);

    //根据手机号查询教师信息，返回教师实体
    TeacherInfo findByPhone(String phone);
}
