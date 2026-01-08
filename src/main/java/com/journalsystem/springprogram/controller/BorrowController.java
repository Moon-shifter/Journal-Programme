package com.journalsystem.springprogram.controller;


import com.journalsystem.springprogram.common.Constants;
import com.journalsystem.springprogram.common.PageRequest;
import com.journalsystem.springprogram.common.PageResult;
import com.journalsystem.springprogram.common.Result;
import com.journalsystem.springprogram.dto.BorrowDTO;
import com.journalsystem.springprogram.dto.JournalDTO;
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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 借阅相关接口
 * 包含admin-borrow
 */

@RestController
@RequestMapping("/api/borrow")
public class BorrowController {

    private final BorrowService borrowService;
    private final JournalService journalService;
    private final TeacherService teacherService;

    @Autowired
    public BorrowController(BorrowService borrowService, JournalService journalService, TeacherService teacherService) {
        this.borrowService = borrowService;
        this.journalService = journalService;
        this.teacherService = teacherService;
    }

    /**
     * 管理员获取所有借阅记录接口
     *
     * @param status 借阅状态
     * @param limit  分页大小
     * @return 统一响应结果：
     * 成功：
     * {code:200,msg:"获取借阅记录成功",data:{records:[],total:}}
     */
    @GetMapping("/admin/list")
    public Result<Map<String, Object>> borrowListByStatus(@RequestParam String status, @RequestParam(required = false) Integer limit) {
        Map<String, Object> data = new HashMap<>();
        data.put("records", borrowService.getBorrowsByStatus(status, limit));
        data.put("total", borrowService.getBorrowsByStatus(status, limit).size());
        return Result.success(data, "获取借阅记录成功");
    }

    /**
     * 教师获取借阅记录接口
     *
     * @param teacherId 教师id
     * @param status    借阅状态
     * @return 统一响应结果：
     * 成功：
     * {code:200,msg:"获取借阅记录成功",data:[]}
     * 失败：
     * {code:404,msg:"该教师暂无借阅记录"}
     */
    @GetMapping("/teacher/list")
    public Result<List<BorrowDTO>> teacherBorrowList(@RequestParam Integer teacherId, @RequestParam(required = false) String status) {
        //前端传参status:固定为 borrowed和overdue（未归还）
        if (status == null) {
            status = "borrowed";
        }

        //1.根据教师id查询教师信息
        TeacherInfo teacherInfo = teacherService.findById(teacherId);
        if (teacherInfo == null) {
            return Result.fail(404, "该教师不存在");
        }

        //2.根据教师id查询所有借阅记录
        List<BorrowInfo> borrowInfoList = borrowService.getBorrowsByTeacherId(teacherId);
        if (borrowInfoList.isEmpty()) {
            return Result.fail(404, "该教师暂无借阅记录");
        }

        //3.根据借阅状态筛选记录，只返回未归还的记录
        String finalStatus = status;
        List<BorrowDTO> filteredList = borrowInfoList.stream()
                .filter(borrow -> borrow.getStatus().equals(finalStatus) || ("borrowed".equals(finalStatus) && borrow.getStatus().equals("overdue")))
                .map(borrow -> {
                    BorrowDTO dto = new BorrowDTO();
                    dto.setId(borrow.getId()); // borrowId
                    dto.setBorrowerId(borrow.getBorrower().getId());
                    dto.setJournalId(borrow.getJournal().getId());
                    dto.setJournalName(borrow.getJournal().getName());
                    dto.setEndDate(borrow.getEndDate());
                    dto.setStatus(borrow.getStatus());
                    return dto;
                })
                .collect(Collectors.toList());

        //4.返回筛选后的记录
        return Result.success(filteredList, "查询成功");

    }

    /**
     * 管理员根据期刊ID查询借阅记录接口
     *
     * @param status    借阅状态
     * @param journalId 期刊ID
     * @return 统一响应结果：
     * 成功：
     * {code:200,msg:"获取借阅记录成功",data:[]}
     * 失败：
     * {code:404,msg:"该期刊暂无借阅记录"}
     */
    @GetMapping("/admin/journal/{journalId}")
    public Result<List<BorrowDTO>> getBorrowByJournalId(@RequestParam(required = false) String status, @PathVariable String journalId) {

        //设置status默认值为borrowed
        if (status == null) {
            status = "borrowed";
        }



        //1.根据期刊ID查阅借阅信息
        List<BorrowInfo>borrowInfos=borrowService.getBorrowsByJournalId(Integer.parseInt(journalId));
        if (borrowInfos.isEmpty()) {
            return Result.fail(404, "该期刊暂无借阅记录");
        }


        //2.根据借阅状态筛选，组成BorrowDTO
        String finalStatus = status;
        List<BorrowDTO>borrowDTOList=borrowInfos.stream()
                .filter(borrow -> borrow.getStatus().equals(finalStatus)|| ("borrowed".equals(finalStatus) && borrow.getStatus().equals("overdue")))
                .map(borrow -> {
                    BorrowDTO dto = new BorrowDTO();
                    dto.setId(borrow.getId()); // borrowId
                    dto.setBorrowerId(borrow.getBorrower().getId());
                    dto.setJournalId(borrow.getJournal().getId());
                    dto.setEndDate(borrow.getEndDate());
                    dto.setStatus(borrow.getStatus());
                    return dto;
                })
                .collect(Collectors.toList());

        //3.返回筛选后的记录
        return Result.success(borrowDTOList, "查询成功");
    }

    /**
     * 教师借阅期刊接口
     *
     * @param borrowCreateRequest 包含borrowerId、journalId、borrowDays的请求体
     * @return 统一响应结果：
     * 成功：
     * {code:200,msg:"借阅成功"}
     * 失败：
     * {code:400,msg:"期刊已可用数量"}
     */
    @PostMapping("/teacher/create")
    public Result<String> teacherBorrow(@RequestBody Map<String, Object> borrowCreateRequest) {

        //1.提取borrowCreateRequest中的borrowerId、journalId、borrowDays
        Integer borrowerId = Integer.parseInt(borrowCreateRequest.get("teacherId").toString());
        Integer journalId = Integer.parseInt(borrowCreateRequest.get("journalId").toString());
        Integer borrowDays = Integer.parseInt(borrowCreateRequest.get("borrowDays").toString());

        //2.计算borrowId,endDate
        LocalDate endDate = LocalDate.now().plusDays(borrowDays);
        Integer borrowId= borrowerId*Constants.BASE_NUM+journalId;

        //3.调用方法创建借阅记录
        borrowService.borrowJournal(borrowId,borrowerId,journalId,endDate);

        //4.返回成功结果
        return Result.success(null,"借阅成功");

    }

    /**
     * 教师归还期刊接口
     *
     * @param borrowReturnRequest 包含borrowId的请求体
     * @return 统一响应结果：
     * 成功：
     * {code:200,msg:"归还办理成功"}
     * 失败：
     * {code:400,msg:"借阅记录不存在"}
     */
    @PutMapping("/teacher/return")
    public Result<String> teacherReturn(@RequestBody Map<String, Object> borrowReturnRequest) {
        //1.提取borrowReturnRequest中的borrowId
        Integer borrowId=null;
        try {
            borrowId = Integer.parseInt(borrowReturnRequest.get("borrowId").toString());
        } catch (NumberFormatException e) {
            throw new BusinessException(400, "borrowId格式错误");
        }

        //2.调用方法返回期刊
        borrowService.returnJournal(borrowId);

        //3.返回成功结果
        return Result.success(null,"归还办理成功");
    }

    /**
     * 教师查询借阅状态接口
     *
     * @param teacherId 教师ID
     * @return 统一响应结果：
     * 成功：
     * {code:200,msg:"查询成功",data:{}}
     * 失败：
     * {code:404,msg:"教师不存在"}
     */
    @GetMapping("/teacher/admin/{teacherId}")
    public Result<TeacherDTO> checkTeacherBorrowStatus(@PathVariable Integer teacherId) {

        //1.查询教师信息
        TeacherInfo teacherInfo = teacherService.findById(teacherId);
        if (teacherInfo == null) {
            return Result.fail(404, "教师不存在");
        }

        //2.复制需要的字段
        Set<String>ignoreFields= Set.of("department","email","phone");


        //3.创建DTO,调用工具
        TeacherDTO teacherDTO = new TeacherDTO();
        DtoUtil.copyNonNullFields(teacherInfo, teacherDTO,ignoreFields);

        //4.返回DTO
        return Result.success(teacherDTO, "查询成功");


    }

    /**
     * 教师查询期刊状态接口
     *
     * @param journalId 期刊ID
     * @return 统一响应结果：
     * 成功：
     * {code:200,msg:"查询成功",data:{}}
     * 失败：
     * {code:404,msg:"期刊不存在"}
     */
    @GetMapping("/journal/{journalId}")
    public Result<JournalDTO> checkJournalBorrowStatus(@PathVariable Integer journalId) {
        //1.查询期刊信息
        JournalInfo journalInfo = journalService.getJournal(journalId);
        if (journalInfo == null) {
            return Result.fail(404, "期刊不存在");
        }

        //2.复制需要的字段
        Set<String>ignoreFields= Set.of("category","publisher","publishDate","issueNumber","issn","description","totalQuantity");
        JournalDTO journalDTO = new JournalDTO();
        DtoUtil.copyNonNullFields(journalInfo, journalDTO,ignoreFields);

        //3.返回DTO
        return Result.success(journalDTO, "查询成功");
    }


    /**
     * 管理员查询逾期借阅记录接口
     *
     * @param pageNum  页码，默认值为1
     * @param pageSize 每页记录数，默认值为10
     * @return 统一响应结果：
     * 成功：
     * {code:200,msg:"查询成功",data:{total:100,list:[ ]}}
     * 失败：
     * {code:400,msg:"分页参数错误"}
     */
    @GetMapping("/admin/overdue/list")
    public Result<Map<String, Object>> checkOverdueBorrows(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize
    ){
        // 1. 创建 PageRequest 对象
        PageRequest pageRequest = new PageRequest();
        pageRequest.setPageNum(pageNum);
        pageRequest.setPageSize(pageSize);
        pageRequest.setSortField("endDate"); // 默认按结束日期排序
        pageRequest.setSortOrder("desc"); // 默认降序
    
        // 2. 调用服务层获取逾期借阅记录
        PageResult<BorrowInfo> overdueBorrowsPage = borrowService.getOverdueBorrowsByPage(pageRequest);
    
        // 3. 转换 BorrowInfo 为 BorrowDTO
        List<BorrowDTO> borrowDTOList = overdueBorrowsPage.getData().stream()
                .map(borrowInfo -> {
                    BorrowDTO borrowDTO = new BorrowDTO();
                    borrowDTO.setId(borrowInfo.getId());
                    borrowDTO.setBorrowerId(borrowInfo.getBorrower().getId());
                    borrowDTO.setBorrowerName(borrowInfo.getBorrower().getName());
                    borrowDTO.setBorrowerDepartment(borrowInfo.getBorrower().getDepartment());
                    borrowDTO.setJournalId(borrowInfo.getJournal().getId());
                    borrowDTO.setJournalName(borrowInfo.getJournal().getName());
                    borrowDTO.setStartDate(borrowInfo.getStartDate());
                    borrowDTO.setEndDate(borrowInfo.getEndDate());
                    borrowDTO.setStatus(borrowInfo.getStatus());
                    return borrowDTO;
                })
                .collect(Collectors.toList());
    
        // 4. 创建符合要求的响应结构
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("total", overdueBorrowsPage.getTotal());
        responseData.put("list", borrowDTOList);
    
        return Result.success(responseData, "success");
    }


    /**
     * 管理员催还通知接口
     *
     * @param borrowNoticeRequest 请求体参数，包含borrowId
     * @return 统一响应结果：
     * 成功：
     * {code:200,msg:"催还通知发送成功",data:{sendTime:"2023-10-10 10:00:00",channels:["email","sms"],teacherId:123,journalName:"期刊名称"}}
     * 失败：
     * {code:400,msg:"borrowId格式错误"}
     * {code:404,msg:"借阅记录不存在"}
     */
    @PostMapping("/admin/overdue/notice")
    public Result<Map<String,Object>> sendOverdueNotice(@RequestBody Map<String,String> borrowNoticeRequest) {
        //1.提取请求中的borrowId
       Integer borrowId=null;
        try {
            borrowId = Integer.valueOf(borrowNoticeRequest.get("borrowId"));
        } catch (NumberFormatException e) {
            throw new BusinessException(400, "borrowId格式错误");
        }

        //2.查找借阅记录
        BorrowInfo borrowInfo = borrowService.getBorrowById(borrowId);
        if (borrowInfo == null) {
            throw new BusinessException(404, "借阅记录不存在");
        }

        //3.组装返回数据(sendTime,channels,teacherId,journalName)
        Map<String,Object> data=new HashMap<>();
        data.put("sendTime", DateUtil.getCurrentDateTime());
        data.put("channels",new String[]{"email","sms"});
        data.put("teacherId",borrowInfo.getBorrower().getId());
        data.put("journalName",borrowInfo.getJournal().getName());

        return Result.success(data, "催还通知发送成功");

    }

    /**
     * 管理员批量催还通知接口
     *
     * @param borrowNoticeRequest 请求体参数，包含borrowIds列表
     * @return 统一响应结果：
     * 成功：
     * {code:200,msg:"催还通知发送成功",data:{successCount:5,failedCount:2,list:[{borrowId:"BRW123",reason:"教师邮箱或手机号不存在"},{borrowId:"BRW456",reason:"借阅记录不存在"}]}}
     * 失败：
     * {code:400,msg:"borrowIds格式错误"}
     */

    @PostMapping("/admin/overdue/batch-notice")
    public Result<Map<String,Object>> sendBatchOverdueNotice(@RequestBody Map<String,List<String>> borrowNoticeRequest) {
        //1. 提取请求中的 borrowIds 列表
        List<String> borrowIdStrings = borrowNoticeRequest.get("borrowIds");
        if (borrowIdStrings == null || borrowIdStrings.isEmpty()) {
            return Result.fail(400, "borrowIds 不能为空");
        }
    
        //2. 初始化统计信息
        int successCount = 0;
        int failedCount = 0;
        List<Map<String, Object>> failList = new ArrayList<>();
    
        //3. 遍历处理每个 borrowId
        for (String borrowIdStr : borrowIdStrings) {
            Map<String, Object> failItem = new HashMap<>();
            failItem.put("borrowId", borrowIdStr);
    
            try {
                //3.1 转换 borrowId 为 Integer 类型
                Integer borrowId = Integer.valueOf(borrowIdStr.replace("BRW", ""));
    
                //3.2 查找借阅记录
                BorrowInfo borrowInfo = borrowService.getBorrowById(borrowId);
                if (borrowInfo == null) {
                    failItem.put("reason", "借阅记录不存在");
                    failList.add(failItem);
                    failedCount++;
                    continue;
                }
    
                //3.3 检查教师的联系方式
                TeacherInfo teacherInfo = borrowInfo.getBorrower();
                if (teacherInfo.getEmail() == null || teacherInfo.getEmail().isEmpty() ||
                    teacherInfo.getPhone() == null || teacherInfo.getPhone().isEmpty()) {
                    failItem.put("reason", "教师邮箱或手机号不存在");
                    failList.add(failItem);
                    failedCount++;
                    continue;
                }
    
                //3.4 模拟发送通知（这里可以添加实际的通知发送逻辑）
                // ... 发送通知的代码 ...

                successCount++;
            } catch (NumberFormatException e) {
                //3.5 处理 borrowId 格式错误
                failItem.put("reason", "borrowId 格式错误");
                failList.add(failItem);
                failedCount++;
            } catch (Exception e) {
                //3.6 处理其他异常
                failItem.put("reason", "通知发送失败：" + e.getMessage());
                failList.add(failItem);
                failedCount++;
            }
        }
    
        //4. 组装响应数据
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("success", successCount);
        responseData.put("failed", failedCount);
        responseData.put("failList", failList);
    
        return Result.success(responseData, "批量发送完成");
    }



}