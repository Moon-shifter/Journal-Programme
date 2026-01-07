package com.journalsystem.springprogram.controller;

import com.journalsystem.springprogram.common.Constants;
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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.*;

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
        Integer currentBorrow=teacherDTO.getCurrentBorrow();
        Integer maxBorrow=teacherDTO.getMaxBorrow();
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







}
