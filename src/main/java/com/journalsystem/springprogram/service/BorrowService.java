package com.journalsystem.springprogram.service;

import com.journalsystem.springprogram.common.PageResult;
import com.journalsystem.springprogram.common.PageRequest;
import com.journalsystem.springprogram.pojo.BorrowInfo;

import java.time.LocalDate;
import java.util.List;

//借阅服务接口，定义了借阅相关的业务操作
public interface BorrowService {
    //1.借阅期刊
    Boolean borrowJournal(Integer borrowId, Integer teacherId, Integer journalId, LocalDate endDate);
    
    //2.归还期刊
    Boolean returnJournal(Integer borrowId);
    
    //3.根据借阅ID查询借阅记录
    BorrowInfo getBorrowById(Integer borrowId);
    
    //4.根据教师ID查询借阅记录
    List<BorrowInfo> getBorrowsByTeacherId(Integer teacherId);
    
    //5.根据期刊ID查询借阅记录
    List<BorrowInfo> getBorrowsByJournalId(Integer journalId);
    
    //6.查询所有借阅记录
    List<BorrowInfo> getAllBorrows();
    
    //7.分页查询借阅记录
    PageResult<BorrowInfo> getBorrowsByPage(PageRequest pageRequest);
    
    //8.根据教师ID分页查询借阅记录
    PageResult<BorrowInfo> getBorrowsByTeacherIdAndPage(Integer teacherId, PageRequest pageRequest);
    
    //9.查询逾期未还的借阅记录
    List<BorrowInfo> getOverdueBorrows();
    
    //10.查询即将到期的借阅记录（N天内）
    List<BorrowInfo> getUpcomingDueBorrows(Integer days);
    
    //11.更新借阅记录状态
    Boolean updateBorrowStatus(Integer borrowId, String status);
    
    //12.延期归还期刊
    Boolean extendBorrowPeriod(Integer borrowId, LocalDate newEndDate);
    
    //13.批量查询逾期未还记录
    PageResult<BorrowInfo> getOverdueBorrowsByPage(PageRequest pageRequest);
    
    //14.统计教师借阅次数
    Integer getBorrowCountByTeacherId(Integer teacherId);

    //15.按状态查询并支持限制返回数量
    List<BorrowInfo> getBorrowsByStatus(String status, Integer limit);
}