package com.journalsystem.springprogram.exception;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;

/**
 * 业务异常类，用于表示业务逻辑中的异常情况
 * 继承自RuntimeException，用于在业务逻辑中抛出异常
 * 包含异常码和异常信息
 */
@EqualsAndHashCode(callSuper = true)
@Data
@AllArgsConstructor
public class BusinessException extends RuntimeException {
    /**
     * 业务异常构造方法
     * @param code 业务状态码，用于标识异常类型
     * @param message 异常提示信息，用于描述异常情况
     */
    private int code; //对应Result中的业务状态码
    private String message; //对应Result中的提示信息
}
