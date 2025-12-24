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
        // 1. 统一设置响应格式（只配置ContentType，绝不提前获取Writer/OutputStream）
        response.setContentType("application/json;charset=UTF-8");
        response.setCharacterEncoding("UTF-8");

        // 2. 排除无需拦截的接口（登录/注册/登出）
        String requestURI = request.getRequestURI();
        if (requestURI.contains("/login") || requestURI.contains("/register") || requestURI.contains("/logout")) {
            return true; // 放行，不处理
        }

        // 3. 拦截管理员接口：仅未登录时才写响应流
        if (requestURI.contains("/api/admin/")) {
            Object loginAdmin = request.getSession().getAttribute("loginAdmin");
            if (loginAdmin == null) {
                // 仅拦截时才获取Writer，写完立即释放
                try (PrintWriter out = response.getWriter()) { // 用try-with-resources自动关闭流
                    Result<?> failResult = Result.fail(401, "管理员未登录，请先登录");
                    out.write(objectMapper.writeValueAsString(failResult));
                    out.flush();
                }
                return false; // 拦截请求
            }
            return true; // 已登录，放行
        }

        // 4. 拦截教师接口：仅未登录时才写响应流
        if (requestURI.contains("/api/teacher/")) {
            Object loginTeacher = request.getSession().getAttribute("loginTeacher");
            if (loginTeacher == null) {
                // 仅拦截时才获取Writer，写完立即释放
                try (PrintWriter out = response.getWriter()) { // 自动关闭流，避免内存泄漏
                    Result<?> failResult = Result.fail(401, "教师未登录，请先登录");
                    out.write(objectMapper.writeValueAsString(failResult));
                    out.flush();
                }
                return false; // 拦截请求
            }
            return true; // 已登录，放行
        }

        // 其他接口默认放行
        return true;
    }
}
