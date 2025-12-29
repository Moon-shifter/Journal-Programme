package com.journalsystem.springprogram.common;

/**
 * 角色枚举类
 * 定义系统中的用户角色
 */
public enum RoleEnum {

    /**
     * 超级管理员
     */
    SUPER_ADMIN("super", "超级管理员"),
    
    /**
     * 普通管理员
     */
    NORMAL_ADMIN("normal", "普通管理员");
    
    private final String code;
    private final String name;
    
    RoleEnum(String code, String name) {
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
     * @param code 角色代码
     * @return 对应的枚举
     */
    public static RoleEnum getByCode(String code) {
        for (RoleEnum role : RoleEnum.values()) {
            if (role.code.equals(code)) {
                return role;
            }
        }
        return null;
    }
}