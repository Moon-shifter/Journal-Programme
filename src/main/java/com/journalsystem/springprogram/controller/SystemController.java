package com.journalsystem.springprogram.controller;


import com.journalsystem.springprogram.common.Result;
import jakarta.servlet.ServletContext;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
/**
 * 系统公共接口
 * 提供系统级别的公共接口，不需验证都可以访问
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
}
