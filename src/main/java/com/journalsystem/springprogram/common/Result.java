package com.journalsystem.springprogram.common;
import lombok.Data;

/**
 * API接口统一响应数据格式
 * 用于封装所有接口的响应结果，避免重复编写响应结构，保证前后端交互格式一致
 * @param <T> 响应数据（data字段）的类型，支持任意业务数据类型（如单个实体、集合、Map等）
 */
@Data // 使用Lombok自动生成getter、setter、toString等方法
public class Result<T> {

    /** 业务状态码（自定义规则：如200 代表成功，其他数值代表对应失败场景） */
    private Integer code;

    /** 响应业务数据（成功时返回具体内容，失败时固定为null） */
    private T data;

    /** 交互提示信息（成功/失败的描述文案，用于前端展示） */
    private String message;

    /**
     * 构建「成功场景」的响应结果
     * @param data 成功时要返回的业务数据（类型由调用时传入的泛型动态决定）
     * @param message 成功对应的提示信息
     * @param <T> 响应数据的泛型类型
     * @return 封装完成的成功响应Result对象
     */
    public static <T> Result<T> success(T data, String message) {
        Result<T> result = new Result<>();
        result.setCode(200); // 成功默认状态码固定为200
        result.setData(data);
        result.setMessage(message);
        return result;
    }

    /**
     * 构建「失败场景」的响应结果
     * @param code 失败对应的业务状态码（需和前端约定具体含义）
     * @param message 失败对应的提示信息
     * @param <T> 响应数据的泛型类型（失败时data固定为null，仅用于类型匹配）
     * @return 封装完成的失败响应Result对象
     */
    public static <T> Result<T> fail(Integer code, String message) {
        Result<T> result = new Result<>();
        result.setCode(code);
        result.setMessage(message);
        result.setData(null); // 失败场景下，业务数据固定为null
        return result;
    }
}