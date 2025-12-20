package com.journalsystem.springprogram.exception;

import com.journalsystem.springprogram.common.Result;
import org.springframework.validation.BindException;
import org.springframework.validation.ObjectError;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;


//全局异常处理器，响应为JSON格式
@RestControllerAdvice
public class GlobalExceptionHandler {
    //处理业务异常,返回自定义的Result对象,状态码为400,提示信息为异常中的message
    @ExceptionHandler(BusinessException.class)
    public Result<?>handleBusinessException(BusinessException e) {
        return Result.fail(e.getCode(), e.getMessage());
    }

    //处理其他异常,返回自定义的Result对象,状态码为500,提示信息为"系统繁忙,请稍后再试"
    @ExceptionHandler(Exception.class)
    public Result<?> handleException(Exception e) {
        // 打印异常栈（方便后端排查），但返回给前端通用提示
        e.printStackTrace();
        return Result.fail(500, "系统繁忙，请稍后再试");
    }

    //处理参数绑定异常,返回自定义的Result对象,状态码为400,提示信息为"参数错误：" + 具体错误信息
    @ExceptionHandler(BindException.class)
    public Result<?> handleBindException(BindException e) {
        // 提取参数校验的错误提示（比如“出版日期格式错误”）
        ObjectError error = e.getBindingResult().getAllErrors().get(0);
        String errMsg = error.getDefaultMessage();
        // 包装成Result（状态码400）
        return Result.fail(400, "参数错误：" + errMsg);
    }
}
