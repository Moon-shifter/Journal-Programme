package com.journalsystem.springprogram.repository;

import com.journalsystem.springprogram.pojo.Student;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;

@Mapper
@Repository
public interface StuMapper {
    @Insert("insert into student (sno,sname, ssex, sbirth, fav, photoPath) " +
            "values (#{sno},#{sname}, #{ssex}, #{sbirth}, #{fav}, #{photoPath})")
    void insertStudent(Student student);

    @Delete("delete from student where sno=#{sno}")
    void deleteStudent(String sno);


}
