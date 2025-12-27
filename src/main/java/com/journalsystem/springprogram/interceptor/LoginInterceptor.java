package com.journalsystem.springprogram.interceptor;

import com.journalsystem.springprogram.common.Result;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.jspecify.annotations.Nullable;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;
import tools.jackson.databind.ObjectMapper;

import java.io.PrintWriter;

/**
 * 权限拦截器：验证用户（管理员/教师）是否已登录，未登录则拦截请求
 * 核心：区分管理员和教师的登录态，拦截对应权限的接口
 */

// 交给Spring容器管理，方便配置类注入
@Component

public class LoginInterceptor implements HandlerInterceptor {
    // 用于将对象转换为JSON字符串
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, @Nullable Exception ex) throws Exception {
        HandlerInterceptor.super.afterCompletion(request, response, handler, ex);
    }

    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, @Nullable ModelAndView modelAndView) throws Exception {
        HandlerInterceptor.super.postHandle(request, response, handler, modelAndView);
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // 1. 统一设置响应格式
        response.setContentType("application/json;charset=UTF-8");
        response.setCharacterEncoding("UTF-8");
    
        // 2. 排除无需拦截的接口（登录/注册/登出）
        String requestURI = request.getRequestURI();
        if (requestURI.contains("/login") || requestURI.contains("/register") || requestURI.contains("/logout")) {
            return true;
        }
    
        // 3. 拦截管理员接口
        if (requestURI.contains("/api/admin/")) {
            Object loginAdmin = request.getSession().getAttribute("loginAdmin");
            if (loginAdmin == null) {
                // 返回未登录响应
                return false;
            }
            return true;
        }
    
        // 4. 拦截教师接口
        if (requestURI.contains("/api/teacher/")) {
            Object loginTeacher = request.getSession().getAttribute("loginTeacher");
            if (loginTeacher == null) {
                // 返回未登录响应
                return false;
            }
            return true;
        }
        
        // 5. 拦截期刊和借阅相关接口（管理员和教师均可访问）
        if (requestURI.contains("/api/journal/") || requestURI.contains("/api/borrow/")) {
            Object loginAdmin = request.getSession().getAttribute("loginAdmin");
            Object loginTeacher = request.getSession().getAttribute("loginTeacher");
            
            // 管理员或教师登录均可访问
            if (loginAdmin == null && loginTeacher == null) {
                // 返回未登录响应
                try (PrintWriter out = response.getWriter()) {
                    Result<?> failResult = Result.fail(401, "未登录，请先登录");
                    out.write(objectMapper.writeValueAsString(failResult));
                    out.flush();
                }
                return false;
            }
            return true;
        }
    
        // 其他接口默认放行
        return true;
    }
}