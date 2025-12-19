package com.journalsystem.springprogram.common;
import lombok.Data;


//统一响应体，用于封装API的响应数据，避免了重复编写响应格式
@Data//使用Lombok自动生成getter、setter、toString等方法
public class Result<T> {
    private Integer code; // 业务状态码
    private T data;       // 响应数据（泛型适配不同类型），例如AdminInfo、List<AdminInfo>等
    private String message; // 提示信息

    // 成功响应（带数据）,这里加上<T>表示这是个泛型方法，返回值为Result<T>
    public static <T> Result<T> success(T data, String message) {
        Result<T> result = new Result<>();
        result.setCode(200);
        result.setData(data);
        result.setMessage(message);
        return result;
    }

    // 失败响应（带状态码和提示信息）
    public static <T> Result<T> fail(Integer code, String message) {
        Result<T> result = new Result<>();
        result.setCode(code);
        result.setMessage(message);
        result.setData(null); // 失败时data设为null即可
        return result;
    }
}