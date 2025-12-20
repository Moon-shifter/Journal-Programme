package com.journalsystem.springprogram.controller;


import com.journalsystem.springprogram.common.Result;
import jakarta.servlet.ServletContext;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
/**
 * 系统控制器类：处理与系统相关的请求
 */
@RequestMapping("/api/system")
public class SystemController  {

    /**
     * 获取当前在线人数
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
