package com.journalsystem.springprogram.controller;


import com.journalsystem.springprogram.common.Constants;
import com.journalsystem.springprogram.common.PageRequest;
import com.journalsystem.springprogram.common.PageResult;
import com.journalsystem.springprogram.common.Result;
import com.journalsystem.springprogram.dto.JournalDTO;
import com.journalsystem.springprogram.exception.BusinessException;
import com.journalsystem.springprogram.pojo.JournalInfo;
import com.journalsystem.springprogram.service.BorrowService;
import com.journalsystem.springprogram.service.JournalService;
import com.journalsystem.springprogram.service.TeacherService;
import com.journalsystem.springprogram.util.DtoUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
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
     * 查询所有期刊（分页+可选ISSN搜索）
     * @param page 当前页码（默认第1页）
     * @param pageSize 每页显示数量（默认10条）
     * @param ssbn ISSN搜索字符串（可选）
     * @return 分页结果（包含期刊列表和分页信息）
     *        成功：{
     *            "code": 200,
     *            "msg": "查询期刊列表成功",
     *            "data": {
     *                "total": 100, // 总记录数
     *                "list": [ // 期刊列表
     *                    {
     *                        "id": 1,
     *                        "name": "期刊A",
     *                        "issn": "1234-5678",
     *                        "category": "科技",
     *                        "status": "可借阅"
     *                    },
     *                    // ... 其他期刊
     *                ]
     *            }
     *        }
     *        失败：{
     *            "code": 500,
     *            "msg": "查询期刊列表失败：[异常信息]"
     *        }
     */
    @GetMapping("/journals")
    public Result<PageResult<JournalInfo>> getAllJournals(// 必选参数+默认值
                                                      @RequestParam(required = true, defaultValue = "1") Integer page,
                                                      @RequestParam(required = true, defaultValue = "10") Integer pageSize,
                                                        // 可选参数：ISSN搜索
                                                            @RequestParam(required = false) String ssbn
    ) {
        try {
            // 1. 封装分页请求对象（排序字段/方向默认空，用Service默认排序）
            PageRequest pageRequest = new PageRequest();
            pageRequest.setPageNum(page);
            pageRequest.setPageSize(pageSize);
            pageRequest.setSortField(null);
            pageRequest.setSortOrder(null);

            // 2. 调用Service查询（传入分页参数+ISSN参数）
            PageResult<JournalInfo> pageResult = journalService.getJournalsByPage(pageRequest, ssbn);

            // 3. 封装通用Result返回（符合接口文档格式）
            return Result.success(pageResult, "查询期刊列表成功");
        } catch (Exception e) {
            // 统一异常处理：返回标准化错误信息
            return Result.fail(500, "查询期刊列表失败：" + e.getMessage() );
        }


    }


    /**
     * 根据ID查询期刊详情
     * @param id 期刊ID（路径参数）
     * @return 期刊详情（包含ID、名称、ISSN、分类、状态等字段）
     *        成功：{
     *            "code": 200,
     *            "msg": "查询期刊成功",
     *            "data": {
     *                "id": 1,
     *                "name": "期刊A",
     *                "issn": "1234-5678",
     *                "category": "科技",
     *                "status": "可借阅"
     *                ..其他字段
     *            }
     *        }
     *        失败：{
     *            "code": 500,
     *            "msg": "查询期刊失败：[异常信息]"
     *        }
     */
    @GetMapping("/{id}")
    public Result<JournalDTO> getJournalById(@PathVariable Integer id) {
        try {
            JournalInfo journal = journalService.getJournal(id);
            JournalDTO journalDTO = new JournalDTO();
            DtoUtil.copyAllFields(journal, journalDTO);
            return Result.success(journalDTO, "查询期刊成功");
        } catch (Exception e) {
            return Result.fail(500, "查询期刊失败：" + e.getMessage() );
        }
    }

    /**
     * 添加期刊（管理员操作）
     * @param journalDTO 期刊DTO（请求体）
     * @return 操作结果（成功/失败）
     *        成功：{
     *            "code": 200,
     *            "msg": "添加期刊成功",
     *            "data": null
     *        }
     *        失败：{
     *            "code": 500,
     *            "msg": "添加期刊失败：[异常信息]"
     *        }
     */
    @PostMapping("/admin/add")
    public Result<String>  addJournal(@RequestBody JournalDTO journalDTO) {
        try {
            journalService.addJournal(journalDTO);
            return Result.success(null,"添加期刊成功");
        } catch (Exception e) {
            return Result.fail(500, "添加期刊失败：" + e.getMessage() );
        }
    }

    /**
     * 更新期刊（管理员操作）
     * @param journalDTO 期刊DTO（请求体）
     * @return 操作结果（成功/失败）
     *        成功：{
     *            "code": 200,
     *            "msg": "更新期刊成功",
     *            "data": null
     *        }
     *        失败：{
     *            "code": 500,
     *            "msg": "更新期刊失败：[异常信息]"
     *        }
     */
    @PutMapping("/admin/update")
    public Result<String> updateJournal(@RequestBody JournalDTO journalDTO) {
        try {
            journalService.updateJournal(journalDTO);
            return Result.success(null,"更新期刊成功");
        } catch (Exception e) {
            return Result.fail(500, "更新期刊失败：" + e.getMessage() );
        }
    }

    /**
     * 删除期刊（管理员操作）
     * @param id 期刊ID（路径参数）
     * @return 操作结果（成功/失败）
     *        成功：{
     *            "code": 200,
     *            "msg": "删除期刊成功",
     *            "data": null
     *        }
     *        失败：{
     *            "code": 500,
     *            "msg": "删除期刊失败：[异常信息]"
     *        }
     */
    @DeleteMapping("/admin/delete/{id}")
    public Result<String> deleteJournal(@PathVariable Integer id) {
        try {
            journalService.deleteJournal(id);
            return Result.success(null,"删除期刊成功");
        } catch (Exception e) {
            return Result.fail(500, "删除期刊失败：" + e.getMessage() );
        }
    }



}
