package com.journalsystem.springprogram.controller;

import com.journalsystem.springprogram.common.Constants;
import com.journalsystem.springprogram.common.PageRequest;
import com.journalsystem.springprogram.common.PageResult;
import com.journalsystem.springprogram.common.Result;
import com.journalsystem.springprogram.dto.BorrowDTO;
import com.journalsystem.springprogram.dto.TeacherDTO;
import com.journalsystem.springprogram.pojo.BorrowInfo;
import com.journalsystem.springprogram.pojo.TeacherInfo;
import com.journalsystem.springprogram.service.BorrowService;
import com.journalsystem.springprogram.service.TeacherService;
import com.journalsystem.springprogram.util.DateUtil;
import com.journalsystem.springprogram.util.DtoUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 教师相关接口
 * 提供教师对期刊的查询和借阅等操作
 */
@RestController
@RequestMapping("/api/teacher")
public class TeacherController {
    private final TeacherService teacherService;
    private final BorrowService borrowService;

    @Autowired
    public TeacherController(TeacherService teacherService, BorrowService borrowService) {
        this.teacherService = teacherService;
        this.borrowService = borrowService;
    }


    /**
     * 获取教师基本信息接口
     * @param id 教师id
     * @return 统一响应结果：
     *       成功：
     *       {code:200,msg:"教师信息查询成功",data:{name}}
     *       失败：
     *       {code:404,msg:"教师不存在"}
     */
    @GetMapping("/info")
    public Result<Map<String, String>> getBasicInfo(@RequestParam Integer id) {
        //1.根据教师id查询教师信息
        TeacherInfo teacherInfo=teacherService.findById(id);
        if(teacherInfo==null){
            return Result.fail(404,"教师不存在");
        }
        //2.将教师信息转换为教师DTO
        TeacherDTO teacherDTO=new TeacherDTO();
        DtoUtil.copyNonNullFields(teacherDTO,teacherInfo);

        //3.将教师DTO转换为Map
        Map<String,String> data=new HashMap<>();
        data.put("name",teacherDTO.getName());

        //4.返回教师信息Map
        return Result.success(data,"教师信息查询成功");

    }

    /**
     * 获取教师借阅统计数据接口
     * @param teacherId 教师id
     * @return 统一响应结果：
     *       成功：
     *       {code:200,msg:"获取借阅统计数据成功",data:{currentBorrowCount,renewableCount,upcomingExpireCount,overdueCount,maxBorrowCount}}
     *       失败：
     *       {code:404,msg:"教师不存在"}
     */
    @GetMapping("/borrow/statistics")
    public Result<Map<String, String>> getStatistics(@RequestParam Integer teacherId) {
        //1.根据id查询教师信息
        TeacherInfo teacherInfo=teacherService.findById(teacherId);
        if(teacherInfo==null){
            return Result.fail(404,"教师不存在");
        }

        //2.将教师信息转换为教师DTO
        TeacherDTO teacherDTO=new TeacherDTO();
        DtoUtil.copyNonNullFields(teacherDTO,teacherInfo);

        //3.获取当前借阅数量，剩余可借数量
        Integer currentBorrow=teacherInfo.getCurrentBorrow();
        Integer maxBorrow=teacherInfo.getMaxBorrow();
        Integer remainingBorrow=maxBorrow-currentBorrow;

        //4.获取该教师的借阅信息list
        List<BorrowInfo> borrowInfoList=borrowService.getBorrowsByTeacherId(teacherId);

        //5.计算快到期数量(一天)，已经到期数量
        Integer soonExpireCount=0;
        Integer expiredCount=0;
        for(BorrowInfo borrowInfo:borrowInfoList){
            if(borrowInfo.getStatus().equals(Constants.BORROW_STATUS_OVERDUE)||DateUtil.isOverdue(borrowInfo.getEndDate())){
                expiredCount++;
            }else if(DateUtil.isSoonExpire(borrowInfo.getEndDate())){
                //快到期数量(一天或者当天)
                soonExpireCount++;
            }
        }
        //6.将统计信息转换为Map
        Map<String,String> data=new HashMap<>();
        data.put("currentBorrowCount",currentBorrow.toString());
        data.put("renewableCount",remainingBorrow.toString());
        data.put("upcomingExpireCount",soonExpireCount.toString());
        data.put("overdueCount",expiredCount.toString());
        data.put("maxBorrowCount",maxBorrow.toString());
        //7.返回统计信息Map
        return Result.success(data,"获取借阅统计数据成功");
    }

   /**
     * 获取教师借阅记录接口
     * @param teacherId 教师id
     * @return 统一响应结果：
     *       成功：
     *       {code:200,msg:"获取借阅记录成功",data:{borrowList}}
     *       失败：
     *       {code:404,msg:"教师不存在"}
     */
    @GetMapping("/borrow/teacher/list")
    public Result<Map<String, Object>> getBorrowList(@RequestParam Integer teacherId) {
        //1.根据id查询教师信息
        TeacherInfo teacherInfo=teacherService.findById(teacherId);
        if(teacherInfo==null){
            return Result.fail(404,"教师不存在");
        }

        //2.根据教师id查询该教师的所有借阅记录
        List<BorrowInfo> borrowInfoList = borrowService.getBorrowsByTeacherId(teacherId);
        if (borrowInfoList.isEmpty()) {
            return Result.fail(404, "该教师没有借阅记录");
        }

        //3.将借阅记录转换为用户要求的格式
        List<Map<String, Object>> borrowList = new ArrayList<>();
        for (BorrowInfo borrowInfo : borrowInfoList) {
            Map<String, Object> borrowMap = new HashMap<>();
            borrowMap.put("id", borrowInfo.getId());
            borrowMap.put("journalName", borrowInfo.getJournal().getName());
            borrowMap.put("volumeIssue", borrowInfo.getJournal().getIssueNumber());
            borrowMap.put("borrowDate", DateUtil.formatDate(borrowInfo.getStartDate()));
            borrowMap.put("dueDate", DateUtil.formatDate(borrowInfo.getEndDate()));

            // 计算状态标识
            String status;
            if (borrowInfo.getStatus().equals(Constants.BORROW_STATUS_OVERDUE) || DateUtil.isOverdue(borrowInfo.getEndDate())) {
                status = "OVERDUE";
            } else if (DateUtil.isSoonExpire(borrowInfo.getEndDate())) {
                status = "UPCOMING_EXPIRE";
            } else {
                status = "NORMAL";
            }
            borrowMap.put("status", status);

            borrowList.add(borrowMap);
        }
        //4.将结果转换为Map
        Map<String, Object> data = new HashMap<>();
        data.put("borrowList", borrowList);
        //5.返回借阅记录Map
        return Result.success(data, "获取借阅记录成功");


    }

    /**
     * 获取所有教师接口
     * @param pageNum 页码
     * @param pageSize 每页大小
     * @return 统一响应结果：
     *       成功：
     *       {code:200,msg:"获取所有教师成功",data:{teacherList}}
     *       失败：
     *       {code:404,msg:"教师不存在"}
     */
    @GetMapping("/admin/list")
    public Result<PageResult<TeacherDTO>> getAllTeacher(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        // 1. 构造分页请求
        PageRequest pageRequest = new PageRequest();
        pageRequest.setPageNum(pageNum);
        pageRequest.setPageSize(pageSize);

        // 2. 分页查询教师信息
        PageResult<TeacherInfo> pageResult = teacherService.getTeachersByPage(pageRequest);

        // 3. 转换为DTO
        List<TeacherDTO> teacherDTOList = DtoUtil.convertList(pageResult.getData(), TeacherDTO.class);

        // 4. 构造分页结果返回
        PageResult<TeacherDTO> resultPage = PageResult.build(
                pageResult.getPageNum(),
                pageResult.getPageSize(),
                pageResult.getTotal(),
                teacherDTOList
        );
        return Result.success(resultPage, "获取所有教师成功");
    }
    /**
     * 获取教师接口
     * @param teacherId 教师id
     * @return 统一响应结果：
     *       成功：
     *       {code:200,msg:"获取教师成功",data:{teacherDTO}}
     *       失败：
     *       {code:404,msg:"教师不存在"}
     */
    @GetMapping("/admin/{teacherId}")
    public Result<TeacherDTO> getTeacher(@PathVariable Integer teacherId){
        //1.根据id查询教师信息
        TeacherInfo teacherInfo=teacherService.findById(teacherId);
        if(teacherInfo==null){
            return Result.fail(404,"教师不存在");
        }
        //2.将教师信息转换为教师DTO
        TeacherDTO teacherDTO=new TeacherDTO();
        DtoUtil.copyAllFields(teacherInfo,teacherDTO);
        //3.返回教师DTO
        return Result.success(teacherDTO,"获取教师成功");
    }

    /**
     * 添加教师接口
     * @param teacherDTO 教师DTO
     * @return 统一响应结果：
     *       成功：
     *       {code:200,msg:"添加教师成功",data:{teacherDTO}}
     *       失败：
     *       {code:400,msg:"添加教师失败"}
     */
    @PostMapping("/admin/add")
    public Result<TeacherDTO> addTeacher(@RequestBody TeacherDTO teacherDTO){
        teacherService.register(teacherDTO);
        return Result.success(teacherDTO,"添加教师成功");
    }

    /**
     * 更新教师接口
     * @param teacherDTO 教师DTO
     * @return 统一响应结果：
     *       成功：
     *       {code:200,msg:"更新教师成功",data:{teacherDTO}}
     *       失败：
     *       {code:400,msg:"更新教师失败"}
     */
    @PutMapping("/admin/update")
    public Result<TeacherDTO> updateTeacher(@RequestBody TeacherDTO teacherDTO){
        teacherService.update(teacherDTO.getId(),teacherDTO);
        return Result.success(teacherDTO,"更新教师成功");
    }

    /**
     * 删除教师接口
     * @param teacherId 教师id
     * @return 统一响应结果：
     *       成功：
     *       {code:200,msg:"删除教师成功"}
     *       失败：
     *       {code:400,msg:"删除教师失败"}
     */
    @DeleteMapping("/admin/delete/{teacherId}")
    public Result<Integer> deleteTeacher(@PathVariable Integer teacherId){
        teacherService.delete(teacherId);
        return Result.success(teacherId,"删除教师成功");
    }

    /**
     * 根据手机号查询教师接口
     * @param phone 教师手机号
     * @return 统一响应结果：
     *       成功：
     *       {code:200,msg:"获取教师成功",data:{teacherDTO}}
     *       失败：
     *       {code:404,msg:"教师不存在"}
     */
    @GetMapping("/admin/search")
    public Result<PageResult<TeacherDTO>> searchTeacherByPhone(
            @RequestParam String phone,
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        // 1. 根据手机号查询教师信息
        TeacherInfo teacherInfo = teacherService.findByPhone(phone);

        List<TeacherDTO> teacherDTOList = new ArrayList<>();
        if (teacherInfo != null) {
            // 2. 将教师信息转换为教师DTO
            TeacherDTO teacherDTO = new TeacherDTO();
            DtoUtil.copyAllFields(teacherInfo, teacherDTO);
            teacherDTOList.add(teacherDTO);
        }

        // 3. 构造分页结果返回
        PageResult<TeacherDTO> resultPage = PageResult.build(
                pageNum,
                pageSize,
                (long) teacherDTOList.size(),
                teacherDTOList
        );

        return Result.success(resultPage, teacherInfo != null ? "获取教师成功" : "未找到匹配的教师");
    }






}
