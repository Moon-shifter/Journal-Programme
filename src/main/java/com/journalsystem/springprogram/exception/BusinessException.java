package com.journalsystem.springprogram.exception;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
@AllArgsConstructor
public class BusinessException extends RuntimeException {
    private int code; //对应Result中的业务状态码
    private String message; //对应Result中的提示信息
}
