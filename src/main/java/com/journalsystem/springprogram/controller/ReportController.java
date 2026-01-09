package com.journalsystem.springprogram.controller;

import com.journalsystem.springprogram.common.Result;
import com.journalsystem.springprogram.pojo.BorrowInfo;
import com.journalsystem.springprogram.service.BorrowService;
import com.journalsystem.springprogram.util.ExcelUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.List;

/**
 * 报表导出控制器
 */
@RestController
@RequestMapping("/api/report")
public class ReportController {
    
    private final BorrowService borrowService;
    
    @Autowired
    public ReportController(BorrowService borrowService) {
        this.borrowService = borrowService;
    }
    
    /**
     * 导出逾期催还单Excel
     */
    @GetMapping("/export/overdue")
    public ResponseEntity<byte[]> exportOverdueReport() throws IOException {
        // 获取所有逾期借阅记录
        List<BorrowInfo> overdueBorrows = borrowService.getOverdueBorrows();
        
        // 生成Excel文件字节数组
        byte[] excelBytes = ExcelUtil.exportOverdueNotice(overdueBorrows);
        
        // 设置响应头
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", "逾期催还单.xlsx");
        headers.setContentLength(excelBytes.length);
        
        return new ResponseEntity<>(excelBytes, headers, HttpStatus.OK);
    }
    
    /**
     * 导出借阅信息表Excel
     */
    @GetMapping("/export/borrow")
    public ResponseEntity<byte[]> exportBorrowReport() throws IOException {
        // 获取所有借阅记录
        List<BorrowInfo> allBorrows = borrowService.getAllBorrows();
        
        // 生成Excel文件字节数组
        byte[] excelBytes = ExcelUtil.exportBorrowInfo(allBorrows);
        
        // 设置响应头
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", "借阅信息表.xlsx");
        headers.setContentLength(excelBytes.length);
        
        return new ResponseEntity<>(excelBytes, headers, HttpStatus.OK);
    }
}