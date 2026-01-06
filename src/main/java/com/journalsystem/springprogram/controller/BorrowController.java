package com.journalsystem.springprogram.controller;


import com.journalsystem.springprogram.common.Constants;
import com.journalsystem.springprogram.common.Result;
import com.journalsystem.springprogram.dto.BorrowDTO;
import com.journalsystem.springprogram.dto.JournalDTO;
import com.journalsystem.springprogram.dto.TeacherDTO;
import com.journalsystem.springprogram.pojo.AdminInfo;
import com.journalsystem.springprogram.pojo.BorrowInfo;
import com.journalsystem.springprogram.pojo.JournalInfo;
import com.journalsystem.springprogram.pojo.TeacherInfo;
import com.journalsystem.springprogram.service.AdminService;
import com.journalsystem.springprogram.service.BorrowService;
import com.journalsystem.springprogram.service.JournalService;
import com.journalsystem.springprogram.service.TeacherService;
import com.journalsystem.springprogram.util.DtoUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
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
     * {code:400,msg:"期刊已无可用数量"}
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
        Integer borrowId = Integer.parseInt(borrowReturnRequest.get("borrowId").toString());

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



}