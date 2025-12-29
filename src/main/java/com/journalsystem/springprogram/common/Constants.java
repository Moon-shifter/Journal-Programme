package com.journalsystem.springprogram.common;

/**
 * 系统常量类
 * 定义系统中使用的各种常量
 */
public class Constants {

    // ====================== 系统配置 ======================
    /**
     * 系统名称
     */
    public static final String SYSTEM_NAME = "学院期刊管理系统";
    
    /**
     * 系统版本
     */
    public static final String SYSTEM_VERSION = "V1.0";
    
    // ====================== 用户角色 ======================
    /**
     * 超级管理员角色
     */
    public static final String ROLE_SUPER_ADMIN = "super";
    
    /**
     * 普通管理员角色
     */
    public static final String ROLE_NORMAL_ADMIN = "normal";
    
    // ====================== 用户状态 ======================
    /**
     * 用户状态：活跃
     */
    public static final String STATUS_ACTIVE = "active";
    
    /**
     * 用户状态：非活跃
     */
    public static final String STATUS_INACTIVE = "inactive";
    
    // ====================== 期刊状态 ======================
    /**
     * 期刊状态：可借阅
     */
    public static final String JOURNAL_STATUS_AVAILABLE = "available";
    
    /**
     * 期刊状态：不可借阅
     */
    public static final String JOURNAL_STATUS_UNAVAILABLE = "unavailable";
    
    // ====================== 借阅状态 ======================
    /**
     * 借阅状态：已借出
     */
    public static final String BORROW_STATUS_BORROWED = "borrowed";
    
    /**
     * 借阅状态：已归还
     */
    public static final String BORROW_STATUS_RETURNED = "returned";
    
    /**
     * 借阅状态：逾期
     */
    public static final String BORROW_STATUS_OVERDUE = "overdue";
    
    // ====================== 会话相关 ======================
    /**
     * 管理员登录会话键
     */
    public static final String SESSION_ADMIN_KEY = "loginAdmin";
    
    /**
     * 教师登录会话键
     */
    public static final String SESSION_TEACHER_KEY = "loginTeacher";
    
    // ====================== 分页相关 ======================
    /**
     * 默认分页大小
     */
    public static final Integer DEFAULT_PAGE_SIZE = 10;
    
    /**
     * 最大分页大小
     */
    public static final Integer MAX_PAGE_SIZE = 100;
    
    // ====================== 借阅规则 ======================
    /**
     * 默认借阅天数
     */
    public static final Integer DEFAULT_BORROW_DAYS = 30;
    
    /**
     * 教师默认最大借阅数量
     */
    public static final Integer DEFAULT_TEACHER_MAX_BORROW = 5;
}