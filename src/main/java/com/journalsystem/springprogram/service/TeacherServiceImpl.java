package com.journalsystem.springprogram.service;

import com.journalsystem.springprogram.dto.TeacherDTO;
import com.journalsystem.springprogram.exception.BusinessException;
import com.journalsystem.springprogram.util.DtoUtil;
import org.springframework.stereotype.Service;

import com.journalsystem.springprogram.pojo.TeacherInfo;
import com.journalsystem.springprogram.repository.TeacherRepository;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;


@Service
public class TeacherServiceImpl implements TeacherService {

    private TeacherRepository teacherRepository;
    @Autowired//构造方法注入
    public void setTeacherRepository(TeacherRepository teacherRepository) {
        this.teacherRepository = teacherRepository;
    }

    @Override
    public boolean login(Integer id, String name, String email) {
        //1.根据ID查询教师信息
       TeacherInfo teacherInfo=teacherRepository.findById(id).orElse(null);
       if (teacherInfo==null){
           throw new BusinessException(400, "登录信息不匹配");//这个抛出异常会被全局异常处理器捕获
       }
       //2.检查教师姓名是否匹配
       if (!teacherInfo.getName().equals(name)){
           throw new BusinessException(400, "登录信息不匹配");//这个抛出异常会被全局异常处理器捕获
       }
       //3.检查教师手机号是否匹配
        if (!teacherInfo.getEmail().equals(email)){
            throw new BusinessException(400, "登录信息不匹配");//这个抛出异常会被全局异常处理器捕获
        }
        return true;
    }

    @Override
    public boolean register(TeacherDTO regDTO) {
        //1.检查教师ID是否已存在
       if (teacherRepository.existsById(regDTO.getId())){
           throw new BusinessException(400, "教师ID已存在");//抛出异常
       }

       //2.教师id不存在，注册教师.null值会设置为默认值，见TeacherInfo类的默认值注解
       TeacherInfo teacherInfo1=new TeacherInfo();

       //3.将DTO中非空字段复制到实体中
       DtoUtil.copyNonNullFields(regDTO,teacherInfo1);
       teacherRepository.save(teacherInfo1);

       return true;

    }

    @Override
    public boolean delete(Integer id) {
        //1.根据ID查询教师信息
        TeacherInfo teacherInfo1=teacherRepository.findById(id).orElse(null);
        if (teacherInfo1==null){
           throw new BusinessException(404, "教师ID不存在,删除失败");//抛出异常
        }
        //2.删除教师信息
        teacherRepository.delete(teacherInfo1);
        return true;
    }

    @Override
    public boolean update(Integer id, TeacherDTO updateDTO) {
        // 1. 查询数据库中当前实体（托管状态）
        TeacherInfo target = teacherRepository.findById(id)
                .orElseThrow(() -> new BusinessException(404, "教师ID不存在,修改失败"));

        //2.如果教师存在，调用DtoUtil的copyNonNullFields方法更新非空字段（id,姓名、手机号、邮箱、部门、当前借阅数量、最大借阅数量、状态）
        DtoUtil.copyNonNullFields(updateDTO, target);

        //3.保存更新后的实体
        teacherRepository.save(target);

        return true;
    }

    //根据姓名查询教师信息，返回教师列表
    @Override
    public List<TeacherInfo> findByName(String name) {
        return teacherRepository.findByName(name);
    }

    //根据教师ID查询教师信息，没有查询到返回null
    @Override
    public TeacherInfo findById(Integer id) {
        return teacherRepository.findById(id).orElse(null);
    }
}
