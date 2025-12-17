package com.journalsystem.springprogram.service;

import com.journalsystem.springprogram.dto.TeacherRegDTO;
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
           return false;
       }
       //2.检查教师姓名是否匹配
       if (!teacherInfo.getName().equals(name)){
           return false;
       }
       //3.检查教师手机号是否匹配
        return teacherInfo.getPhone().equals(phone);
    }

    @Override
    public boolean register(TeacherRegDTO teacherRegDTO) {
        //1.检查教师姓名是否已存在
       List<TeacherInfo> teacherList=  teacherRepository.findByName(teacherRegDTO.getName());
       for (TeacherInfo teacherInfo:teacherList){//遍历教师列表，检查姓名和手机号或邮箱是否已存在
           if(teacherRegDTO.getName().equals(teacherInfo.getName())){//检查姓名是否匹配
               //姓名匹配，检查手机号或邮箱是否相同
               if(teacherRegDTO.getPhone().equals(teacherInfo.getPhone())||teacherRegDTO.getEmail().equals(teacherInfo.getEmail())){
                   return false;
               }
           }
       }
       //2.教师姓名不存在(或者同名不同号不同邮箱)，注册教师
       TeacherInfo teacherInfo1=new TeacherInfo();
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
