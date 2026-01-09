package com.journalsystem.springprogram.service;

import com.journalsystem.springprogram.common.Constants;
import com.journalsystem.springprogram.common.PageRequest;
import com.journalsystem.springprogram.common.PageResult;
import com.journalsystem.springprogram.dto.TeacherDTO;
import com.journalsystem.springprogram.exception.BusinessException;
import com.journalsystem.springprogram.util.DtoUtil;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.journalsystem.springprogram.pojo.TeacherInfo;
import com.journalsystem.springprogram.repository.TeacherRepository;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.stream.Collectors;


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

    @Override
    public TeacherInfo findByPhone(String phone) {
        return teacherRepository.findByPhone(phone);
    }


    //查询所有教师
    @Override
    public List<TeacherInfo> getAllTeachers() {
        return teacherRepository.findAll();
    }

    //分页查询教师
    @Override
    public PageResult<TeacherInfo> getTeachersByPage(PageRequest pageRequest) {
        // 1. 验证分页参数
        pageRequest.validate();

        // 2. 构建排序条件
        Sort sort = Sort.unsorted();
        if (pageRequest.getSortField() != null && !pageRequest.getSortField().isEmpty()) {
            Sort.Direction direction = "desc".equalsIgnoreCase(pageRequest.getSortOrder())
                    ? Sort.Direction.DESC
                    : Sort.Direction.ASC;
            sort = Sort.by(direction, pageRequest.getSortField());
        } else {
            // 默认按教师ID升序排序
            sort = Sort.by(Sort.Direction.ASC, "id");
        }

        // 3. 构建JPA分页对象
        org.springframework.data.domain.PageRequest jpaPageRequest =
                org.springframework.data.domain.PageRequest.of(
                        pageRequest.getPageNum() - 1,  // 自定义页码从1开始，JPA从0开始
                        pageRequest.getPageSize(),
                        sort
                );

        // 4. 执行分页查询
        Page<TeacherInfo> teacherPage = teacherRepository.findAll(jpaPageRequest);

        // 5. 转换为自定义分页结果返回
        return PageResult.build(
                pageRequest.getPageNum(),
                pageRequest.getPageSize(),
                teacherPage.getTotalElements(),
                teacherPage.getContent()
        );
    }

    //根据部门查询教师
    @Override
    public List<TeacherInfo> getTeachersByDepartment(String department) {
        if (department == null || department.isEmpty()) {
            throw new BusinessException(400, "部门名称不能为空");
        }

        // 使用Stream API过滤部门
        return teacherRepository.findAll().stream()
                .filter(teacher -> department.equals(teacher.getDepartment()))
                .collect(Collectors.toList());
    }

    //更新教师借阅限额
    @Override
    public boolean updateMaxBorrow(Integer teacherId, Integer maxBorrow) {
        // 1. 检查教师是否存在
        TeacherInfo teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new BusinessException(404, "教师不存在"));

        // 2. 检查借阅限额是否合理
        if (maxBorrow == null || maxBorrow < 0) {
            throw new BusinessException(400, "借阅限额必须大于等于0");
        }

        // 3. 更新借阅限额
        teacher.setMaxBorrow(maxBorrow);
        teacherRepository.save(teacher);

        return true;
    }

    //获取教师当前借阅数量
    @Override
    public Integer getCurrentBorrowCount(Integer teacherId) {
        // 1. 检查教师是否存在
        TeacherInfo teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new BusinessException(404, "教师不存在"));

        return teacher.getCurrentBorrow();
    }


    //检查教师是否可借阅更多期刊
    @Override
    public boolean canBorrowMore(Integer teacherId) {
        // 1. 检查教师是否存在
        TeacherInfo teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new BusinessException(404, "教师不存在"));

        // 2. 检查教师状态是否激活
        if (!Constants.STATUS_ACTIVE.equals(teacher.getStatus())) {
            return false;
        }

        // 3. 检查当前借阅数量是否小于最大借阅限额
        return teacher.getCurrentBorrow() < teacher.getMaxBorrow();
    }

    //更新教师状态
    @Override
    public boolean updateTeacherStatus(Integer teacherId, String status) {
        // 1. 检查教师是否存在
        TeacherInfo teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new BusinessException(404, "教师不存在"));

        // 2. 检查状态是否有效
        if (!Constants.STATUS_ACTIVE.equals(status) && !Constants.STATUS_INACTIVE.equals(status)) {
            throw new BusinessException(400, "无效的教师状态");
        }

        // 3. 更新教师状态
        teacher.setStatus(status);
        teacherRepository.save(teacher);

        return true;
    }


    //批量导入教师信息
    @Override
    public boolean batchImportTeachers(List<TeacherDTO> teacherDTOs) {
        if (teacherDTOs == null || teacherDTOs.isEmpty()) {
            throw new BusinessException(400, "导入的教师信息不能为空");
        }

        // 转换为TeacherInfo列表
        List<TeacherInfo> teacherInfos = teacherDTOs.stream()
                .map(dto -> {
                    TeacherInfo teacher = new TeacherInfo();
                    DtoUtil.copyNonNullFields(dto, teacher);
                    return teacher;
                })
                .collect(Collectors.toList());

        // 批量保存
        teacherRepository.saveAll(teacherInfos);

        return true;
    }




}