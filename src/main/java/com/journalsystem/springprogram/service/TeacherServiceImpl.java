package com.journalsystem.springprogram.service;

import com.journalsystem.springprogram.dto.TeacherRegDTO;
import com.journalsystem.springprogram.exception.BusinessException;
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
    public boolean login(Integer id, String name, String phone) {
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
        return teacherInfo.getPhone().equals(phone);
    }

    @Override
    public boolean register(TeacherRegDTO teacherRegDTO) {
        //1.检查教师ID是否已存在
       if (teacherRepository.existsById(teacherRegDTO.getId())){
           throw new BusinessException(400, "教师ID已存在");//抛出异常
       }
       //2.教师姓名不存在(或者同名不同号不同邮箱)，注册教师.由于省略的几项有默认值，插入时会自动填充
       TeacherInfo teacherInfo1=new TeacherInfo();
        teacherInfo1.setId(teacherRegDTO.getId());
       teacherInfo1.setName(teacherRegDTO.getName());
       teacherInfo1.setPhone(teacherRegDTO.getPhone());
       teacherInfo1.setEmail(teacherRegDTO.getEmail());
       teacherInfo1.setDepartment(teacherRegDTO.getDepartment());
       teacherRepository.save(teacherInfo1);
       return true;

    }

    @Override
    public boolean delete(Integer id) {
        //1.根据ID查询教师信息
        TeacherInfo teacherInfo1=teacherRepository.findById(id).orElse(null);
        if (teacherInfo1==null){
            return false;
        }
        //2.删除教师信息
        teacherRepository.delete(teacherInfo1);
        return true;
    }

    @Override
    public boolean update(Integer id, TeacherInfo teacherInfo) {
        //1.根据ID查询教师信息
        TeacherInfo teacherInfo1=teacherRepository.findById(id).orElse(null);
        if (teacherInfo1==null){
            return false;
        }
        //2.如果教师存在，更新教师信息（姓名、手机号、邮箱、部门、当前借阅数量、最大借阅数量、状态）
        teacherInfo1.setName(teacherInfo.getName());
        teacherInfo1.setPhone(teacherInfo.getPhone());
        teacherInfo1.setEmail(teacherInfo.getEmail());
        teacherInfo1.setDepartment(teacherInfo.getDepartment());
        teacherInfo1.setCurrentBorrow(teacherInfo.getCurrentBorrow());
        teacherInfo1.setMaxBorrow(teacherInfo.getMaxBorrow());
        teacherInfo1.setStatus(teacherInfo.getStatus());
        teacherRepository.save(teacherInfo1);
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
