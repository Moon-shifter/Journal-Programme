package com.journalsystem.springprogram.controller;


import com.journalsystem.springprogram.common.Constants;
import com.journalsystem.springprogram.common.Result;
import com.journalsystem.springprogram.dto.BorrowDTO;
import com.journalsystem.springprogram.dto.TeacherDTO;
import com.journalsystem.springprogram.exception.BusinessException;
import com.journalsystem.springprogram.pojo.AdminInfo;
import com.journalsystem.springprogram.pojo.BorrowInfo;
import com.journalsystem.springprogram.pojo.JournalInfo;
import com.journalsystem.springprogram.pojo.TeacherInfo;
import com.journalsystem.springprogram.service.AdminService;

import com.journalsystem.springprogram.service.BorrowService;
import com.journalsystem.springprogram.service.JournalService;
import com.journalsystem.springprogram.service.TeacherService;
import com.journalsystem.springprogram.util.DateUtil;
import com.journalsystem.springprogram.util.DtoUtil;
import jakarta.servlet.http.HttpServletRequest;
import jdk.jfr.DataAmount;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 管理员相关接口
 * 负责超级管理员对普通管理员的新增、查询等操作
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final AdminService adminService;
    private final TeacherService teacherService;
    private final JournalService journalService;
    private final BorrowService borrowService;

    @Autowired//通过构造函数注入adminservice
    public AdminController(AdminService adminService, TeacherService teacherService, JournalService journalService, BorrowService borrowService) {
        this.adminService = adminService;
        this.teacherService = teacherService;
        this.journalService = journalService;
        this.borrowService = borrowService;
    }



    /**
     * 超级管理员添加新管理员接口
     * @apiNote 仅超级管理员可调用，通过路径参数传递管理员账号信息
     * @param username 管理员用户名（不可重复，示例：admin_new01）
     * @param password 管理员登录密码（示例：123456@abc）
     * @param real_name 管理员真实姓名（示例：张新管理员）
     * @return 统一响应结果：
     *         成功：{"code":200,"data":{"adminId":1001,"addSuccess":true},"message":"管理员添加成功"}
     *         失败：{"code":400,"data":null,"message":"添加失败"}
     * @throws BusinessException 失败场景：
     *                               1. 用户名重复 → code=400，message="用户名已存在"
     *                               2. 参数格式错误 → code=400，message="参数格式不合法"
     */
    @GetMapping("/add/username/{username}/password/{password}/realname/{real_name}")
    public Result<Map<String,Object>> addAdmin(@PathVariable String username, @PathVariable String password, @PathVariable String real_name) {
        // 用AdminInfo接收前端传递的用户名、密码、真实姓名
        AdminInfo adminInfo = new AdminInfo();
        adminInfo.setUsername(username);
        adminInfo.setPassword(password);
        adminInfo.setRealName(real_name);
        //如果添加成功，返回添加的管理员信息
        if(adminService.addAdmin(adminInfo)){
            Map<String, Object> data = new HashMap<>();
            data.put("adminId", adminInfo.getId());
            data.put("addSuccess", true);
            return Result.success(data,"管理员添加成功");
        }
        //如果添加失败，返回失败信息
        throw new BusinessException(400,"添加失败");
    }

    /**
     * 管理员查询系统统计信息接口
     * @apiNote 仅管理员可调用，返回系统中期刊、教师、超期未还项目的总数
     * @return 统一响应结果：
     *         成功：{"code":200,"data":{"totalJournals":100,"totalTeachers":50,"overdueItems":10},"message":"统计信息查询成功"}
     *         失败：{"code":400,"data":null,"message":"查询失败"}
     * @throws BusinessException 失败场景：
     *                               1. 系统异常 → code=500，message="系统内部错误"
     */
    @GetMapping("/statistics/summary")
    public Result<Map<String,Object>> getSummaryStatistics() {
        //1.查询期刊总数
        Integer totalJournals = journalService.getAllJournals().size();
        //2.查询教师总数
        Integer totalTeachers= teacherService.getAllTeachers().size();
        //3.查询超期未还总数
        Integer overdueItems = borrowService.getOverdueBorrows().size();

        //4.组装数据准备返回
        Map<String,Object> data = new HashMap<>();
        data.put("totalJournals",totalJournals);
        data.put("totalTeachers",totalTeachers);
        data.put("overdueItems",overdueItems);

        return Result.success(data,"统计信息查询成功");
    }

    /**
     * 管理员查询各部门教师数量接口
     * @apiNote 仅管理员可调用，返回系统中每个部门的教师数量
     * @return 统一响应结果：
     *         成功：{"code":200,"data":[{"name":"文学院","count":10},{"name":"汽修学院","count":8}],"message":"部门教师数量查询成功"}
     *         失败：{"code":400,"data":null,"message":"查询失败"}
     * @throws BusinessException 失败场景：
     *                               1. 系统异常 → code=500，message="系统内部错误"
     */
    @GetMapping("/statistics/department-teachers")
    public Result<List<Map<String,Object>>> getDepartmentTeachers() {

        //1.创建一个列表，用于存储每个部门的教师数量
        List<Map<String,Object>> departmentTeachers = new ArrayList<>();

        //2.遍历每个部门，统计教师数量
        for(String department: Constants.DEPARTMENT_TEACHERS){
            Integer count = teacherService.getTeachersByDepartment(department).size();
            Map<String,Object> departmentTeacher = new HashMap<>();
            departmentTeacher.put("name",department);
            departmentTeacher.put("count",count);
            departmentTeachers.add(departmentTeacher);
        }

        return Result.success(departmentTeachers,"部门教师数量查询成功");

    }

    /**
     * 管理员查询超期未还借阅记录接口
     * @apiNote 仅管理员可调用，返回系统中所有超期未还的借阅记录，包含教师姓名、部门、期刊名称、超期天数
     * @return 统一响应结果：
     *         成功：{"code":200,"data":[{"teacherId":1001,"name":"张三","department":"文学院","journal":"数学期刊","daysOverdue":7},{"teacherId":1002,"name":"李四","department":"汽修学院","journal":"物理期刊","daysOverdue":14}],"message":"超期未还借阅记录查询成功"}
     *         失败：{"code":400,"data":null,"message":"查询失败"}
     * @throws BusinessException 失败场景：
     *                               1. 系统异常 → code=500，message="系统内部错误"
     */
    @GetMapping("/borrow/overdue")
    public Result<List<Map<String,Object>>> getOverdueBorrows() {
        //1.查询超期未还借阅记录
        List<BorrowInfo> overdueBorrows = borrowService.getOverdueBorrows();

        //2.提取其中的教师有关信息并组装返回的数据
        List<Map<String,Object>> overdueBorrowsInfo = new ArrayList<>();
        for(BorrowInfo borrowInfo:overdueBorrows){
            Map<String,Object> borrowInfoMap = new HashMap<>();
            TeacherInfo  teacherInfo = teacherService.findById(borrowInfo.getBorrower().getId());
            JournalInfo journalInfo = journalService.getJournal(borrowInfo.getJournal().getId());
            borrowInfoMap.put("teacherId",teacherInfo.getId());
            borrowInfoMap.put("name",teacherInfo.getName());
            borrowInfoMap.put("department",teacherInfo.getDepartment());
            borrowInfoMap.put("journal",journalInfo.getName());
            borrowInfoMap.put("daysOverdue", DateUtil.calculateOverdueDays(borrowInfo.getEndDate()));
            overdueBorrowsInfo.add(borrowInfoMap);
        }
        return Result.success(overdueBorrowsInfo,"超期未还借阅记录查询成功");
    }

    /**
     * 管理员查询当前登录信息接口
     * @apiNote 仅管理员可调用，返回当前登录管理员的姓名
     * @return 统一响应结果：
     *         成功：{"code":200,"data":{"name":"admin123"},"message":"当前管理员信息查询成功"}
     *         失败：{"code":400,"data":null,"message":"查询失败"}
     * @throws BusinessException 失败场景：
     *                               1. 系统异常 → code=500，message="系统内部错误"
     */
    @GetMapping("/user/current")
    public Result<Map<String,Object>> getCurrentAdminInfo(HttpServletRequest request) {
        //1.获取当前管理员信息
        AdminInfo adminInfo = (AdminInfo) request.getSession().getAttribute("loginAdmin");

        //2.返回数据
        Map<String,Object> data = new HashMap<>();
        data.put("name", adminInfo.getUsername());

        return Result.success(data,"当前管理员信息查询成功");
    }




}