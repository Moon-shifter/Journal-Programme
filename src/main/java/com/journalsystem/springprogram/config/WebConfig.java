package com.journalsystem.springprogram.config;

import com.journalsystem.springprogram.interceptor.LoginInterceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web配置类，用于配置Spring MVC的拦截器
 * 实现WebMvcConfigurer接口，自定义拦截器的添加逻辑
 */

@Configuration

public class WebConfig implements WebMvcConfigurer {
    @Autowired
    private LoginInterceptor loginInterceptor;//注入登录拦截器
    /**
     * 添加登录拦截器到拦截器注册表
     * @param registry 拦截器注册表，用于添加自定义拦截器
     */
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(loginInterceptor)
                .addPathPatterns("/api/**") // 拦截所有/api下的请求
                .excludePathPatterns( // 排除不需要拦截的接口
                        "/api/auth/**/login",    // 登录接口
                        "/api/auth/**/register", // 注册接口
                        "/api/system/**" // 公共接口
                );
    }
}
