package com.journalsystem.springprogram.controller;


import com.journalsystem.springprogram.common.Result;
import com.journalsystem.springprogram.dto.JournalDTO;
import com.journalsystem.springprogram.exception.BusinessException;
import com.journalsystem.springprogram.pojo.JournalInfo;
import com.journalsystem.springprogram.service.JournalService;
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

     /**
     * 根据期刊ID查询期刊信息
     * @param id 期刊ID
     * @return 统一响应结果：
     *     成功：
     *     {"code": 200,"msg": "期刊查询成功","data": {"journalInfo": {...}}}
     *     失败：
     *     {"code": 400,"msg": "查询失败","data": null}
     */
    @GetMapping("/{id}")
    public Result<Map<String, Object>> getJournal(@PathVariable Integer id) {
        //根据id查询期刊
        JournalInfo journalInfo = journalService.getJournal(id);
        //如果查询成功，返回期刊信息

        if(journalInfo != null){
            Map<String, Object> data = new HashMap<>();
            data.put("journalInfo", journalInfo);
            return Result.success(data,"期刊查询成功");
        }
        //如果查询失败，返回失败信息
        throw new BusinessException(400,"查询失败");
    }

     /**
     * 修改期刊信息
     * @param updateDTO 包含期刊修改信息的DTO对象
     * @return 统一响应结果：
     *     成功：
     *     {"code": 200,"msg": "期刊修改成功","data": {"journalInfo": {...}}}
     *     失败：
     *     {"code": 400,"msg": "修改失败","data": null}
     */
    @PostMapping("/admin/update")
    public Result<Map<String, Object>> updateJournal(@RequestBody JournalDTO updateDTO) {
        //根据id修改期刊
        boolean isSuccess = journalService.updateJournal(updateDTO);

        //调用方法查询修改后的期刊信息
        JournalInfo journalInfo = journalService.getJournal(updateDTO.getId());

        //返回修改后的期刊信息
        Map<String, Object> data = new HashMap<>();
        data.put("journalInfo", journalInfo);
        return Result.success(data,"期刊修改成功");

    }

     /**
     * 删除期刊（管理员）
     * @param id 期刊ID
     * @return 统一响应结果：
     *     成功：
     *     {"code": 200,"msg": "期刊删除成功","data": {"journalId": 123}}
     *     失败：
     *     {"code": 400,"msg": "期刊ID不存在","data": null}
     */
    @DeleteMapping("/admin/{id}")
    public Result<Map<String, Object>> deleteJournal(@PathVariable Integer id) {

        //根据id删除期刊,这个方法在Service自带抛出异常
        journalService.deleteJournal(id);

        //返回被删除的期刊id
        Map<String, Object> data = new HashMap<>();
        data.put("journalId", id);
        return Result.success(data,"期刊删除成功");
    }


     /**
     * 新增期刊（管理员）
     * @param addDTO 包含期刊新增信息的DTO对象
     * @return 统一响应结果：
     *     成功：
     *     {"code": 200,"msg": "期刊添加成功","data": {"journalInfo": {...}}}
     *     失败：
     *     {"code": 400,"msg": "期刊ID/ISSN已存在","data": null}
     */
    @PostMapping("/admin/add")
    public Result<Map<String, Object>> adminAddJournal(@RequestBody JournalDTO addDTO) {

        //根据id添加期刊
        journalService.addJournal(addDTO);

        //返回被添加的期刊信息
        JournalInfo journalInfo = journalService.getJournal(addDTO.getId());

        Map<String, Object> data = new HashMap<>();
        data.put("journalInfo", journalInfo);
        return Result.success(data,"期刊添加成功");

    }















}
