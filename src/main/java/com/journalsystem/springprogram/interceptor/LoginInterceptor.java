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
        // 1. 定义响应格式：JSON + UTF-8编码
        response.setContentType("application/json;charset=UTF-8");
        PrintWriter out = response.getWriter();
        ObjectMapper objectMapper = new ObjectMapper(); // 用于将Result转为JSON字符串


        //2.排除登录/注册接口，直接放行
        String requestURI = request.getRequestURI();
        if (requestURI.contains("/login") || requestURI.contains("/register")||requestURI.contains("/logout")) { //如果路径包含/login或/register或/logout，直接放行
            return true;
        }

        //3.校验管理员登录态(拦截/admin/**接口)
        if (requestURI.contains("/api/admin/")) {
            Object loginAdmin = request.getSession().getAttribute("loginAdmin");
            if (loginAdmin == null) {
                // 未登录：返回统一错误响应
                Result<?> failResult = Result.fail(401, "管理员未登录，请先登录");
                out.write(objectMapper.writeValueAsString(failResult));
                out.flush();
                out.close();
                return false; // 拦截请求，不允许访问
            }
            return true; // 已登录，放行
        }

        //4.校验教师登录态(拦截/teacher/**接口)
        if (requestURI.contains("/api/teacher/")) {
            Object loginTeacher = request.getSession().getAttribute("loginTeacher");
            if (loginTeacher == null) {
                // 未登录：返回统一错误响应
                Result<?> failResult = Result.fail(401, "教师未登录，请先登录");
                out.write(objectMapper.writeValueAsString(failResult));
                out.flush();
                out.close();
                return false; // 拦截请求，不允许访问
            }
            return true; // 已登录，放行
        }

        //5.其他接口放行
        return true;

    }
}
