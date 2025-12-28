package com.journalsystem.springprogram.common;

/**
 * 状态枚举类
 * 定义系统中通用的状态枚举
 */
public enum StatusEnum {

    /**
     * 活跃状态
     */
    ACTIVE("active", "活跃"),
    
    /**
     * 非活跃状态
     */
    INACTIVE("inactive", "非活跃"),
    
    /**
     * 可用状态
     */
    AVAILABLE("available", "可用"),
    
    /**
     * 不可用状态
     */
    UNAVAILABLE("unavailable", "不可用"),
    
    /**
     * 已借出状态
     */
    BORROWED("borrowed", "已借出"),
    
    /**
     * 已归还状态
     */
    RETURNED("returned", "已归还"),
    
    /**
     * 逾期状态
     */
    OVERDUE("overdue", "逾期");
    
    private final String code;
    private final String name;
    
    StatusEnum(String code, String name) {
        this.code = code;
        this.name = name;
    }
    
    public String getCode() {
        return code;
    }
    
    public String getName() {
        return name;
    }
    
    /**
     * 根据代码获取枚举
     * @param code 状态代码
     * @return 对应的枚举
     */
    public static StatusEnum getByCode(String code) {
        for (StatusEnum status : StatusEnum.values()) {
            if (status.code.equals(code)) {
                return status;
            }
        }
        return null;
    }
}