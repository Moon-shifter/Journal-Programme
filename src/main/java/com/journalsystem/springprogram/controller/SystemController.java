package com.journalsystem.springprogram.controller;

import com.journalsystem.springprogram.common.Constants;
import com.journalsystem.springprogram.common.Result;
import jakarta.servlet.ServletContext;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
/**
 * 系统公共接口
 * 提供系统级别的公共接口，包括系统设置
 */
@RequestMapping("/api/system")
public class SystemController  {

    /**
     * 获取当前在线人数
     * @param request HttpServletRequest对象，用于获取全局上下文
     * @return 统一响应结果：
     *     成功：
     *     {"code": 200,"msg": "获取在线人数成功","data": 10}
     */
    @GetMapping("/online/count")
    public Result<Integer> getOnlineUserCount(HttpServletRequest request) {
        // 从全局上下文获取在线人数
        ServletContext servletContext = request.getServletContext();
        Integer onlineCount = (Integer) servletContext.getAttribute("onlineUserCount");
        // 避免空值（首次访问时可能为null）
        if (onlineCount == null) {
            onlineCount = 0;
        }
        return Result.success(onlineCount, "获取在线人数成功");
    }

    /**
     * 获取系统设置
     * @param request HttpServletRequest对象，用于获取全局上下文
     * @return 统一响应结果：
     *     成功：
     *     {"code": 200,"msg": "获取系统设置成功","data": {"systemName": "学院期刊管理系统", "defaultBorrowDays": 30, "maxBorrowCount": 5}}
     */
    @GetMapping("/settings")
    public Result<Map<String, Object>> getSettings(HttpServletRequest request) {
        ServletContext servletContext = request.getServletContext();
        
        // 获取系统设置，如果不存在则使用默认值
        String systemName = (String) servletContext.getAttribute("systemName");
        Integer defaultBorrowDays = (Integer) servletContext.getAttribute("defaultBorrowDays");
        Integer maxBorrowCount = (Integer) servletContext.getAttribute("maxBorrowCount");
        
        // 使用默认值（来自Constants类）
        if (systemName == null) {
            systemName = Constants.SYSTEM_NAME;
        }
        if (defaultBorrowDays == null) {
            defaultBorrowDays = Constants.DEFAULT_BORROW_DAYS;
        }
        if (maxBorrowCount == null) {
            maxBorrowCount = Constants.DEFAULT_TEACHER_MAX_BORROW;
        }
        
        // 组装返回数据
        Map<String, Object> settings = new HashMap<>();
        settings.put("systemName", systemName);
        settings.put("defaultBorrowDays", defaultBorrowDays);
        settings.put("maxBorrowCount", maxBorrowCount);
        
        return Result.success(settings, "获取系统设置成功");
    }

    /**
     * 更新系统设置
     * @param request HttpServletRequest对象，用于获取全局上下文
     * @param params 包含系统设置的参数
     * @return 统一响应结果：
     *     成功：
     *     {"code": 200,"msg": "更新系统设置成功","data": null}
     */
    @PostMapping("/settings")
    public Result<Void> updateSettings(HttpServletRequest request, @RequestBody Map<String, Object> params) {
        ServletContext servletContext = request.getServletContext();
        
        // 更新系统名称
        if (params.containsKey("systemName")) {
            String systemName = (String) params.get("systemName");
            servletContext.setAttribute("systemName", systemName);
        }
        
        // 更新默认借阅天数
        if (params.containsKey("defaultBorrowDays")) {
            Integer defaultBorrowDays = (Integer) params.get("defaultBorrowDays");
            servletContext.setAttribute("defaultBorrowDays", defaultBorrowDays);
        }
        
        // 更新教师最大借阅数量
        if (params.containsKey("maxBorrowCount")) {
            Integer maxBorrowCount = (Integer) params.get("maxBorrowCount");
            servletContext.setAttribute("maxBorrowCount", maxBorrowCount);
        }
        
        return Result.success(null, "更新系统设置成功");
    }
}