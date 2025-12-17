package com.journalsystem.springprogram.repository;

import com.journalsystem.springprogram.pojo.TeacherInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeacherRepository extends JpaRepository<TeacherInfo, Integer> {
    List<TeacherInfo> findByName(String name);
}
