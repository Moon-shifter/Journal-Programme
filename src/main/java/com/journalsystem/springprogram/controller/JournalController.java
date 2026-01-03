package com.journalsystem.springprogram.controller;


import com.journalsystem.springprogram.common.Result;
import com.journalsystem.springprogram.dto.JournalDTO;
import com.journalsystem.springprogram.exception.BusinessException;
import com.journalsystem.springprogram.pojo.JournalInfo;
import com.journalsystem.springprogram.service.JournalService;
import com.journalsystem.springprogram.util.DtoUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
/**
 * 期刊相关接口
 * 提供管理员对期刊的操作，以及管理员和教师对期刊的不同查询
 */

@RestController
@RequestMapping("/api/journal")
public class JournalController {
    private final JournalService journalService;

    @Autowired
    public JournalController(JournalService journalService) {
        this.journalService = journalService;
    }


    @GetMapping("/{id}")
    public Result<Map<String, Object>> getJournal(@PathVariable Integer id) {
        JournalInfo journal = journalService.getJournal(id);
        if (journal == null) {
            throw new BusinessException(404, "期刊不存在");
        }

        JournalDTO journalDTO = new JournalDTO();
        DtoUtil.copyAllFields(journal,journalDTO);

        Map<String,Object> data = new HashMap<>();
        DtoUtil.mapPutAllFields(journalDTO,data);


        return Result.success(data,"查询成功");
    }

    @PostMapping("/borrow")
    public Result<Map<String, Object>> createJournal(@RequestBody JournalDTO journalDTO) {
        return null;
    }





}
