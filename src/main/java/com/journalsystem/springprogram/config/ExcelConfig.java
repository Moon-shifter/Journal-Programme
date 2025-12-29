package com.journalsystem.springprogram.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Excel配置类
 * 提供Excel相关的通用配置
 */
@Configuration
public class ExcelConfig {

    /**
     * Excel导出时的默认工作表名称
     */
    public static final String DEFAULT_SHEET_NAME = "Sheet1";
    
    /**
     * Excel导出时的默认文件前缀
     */
    public static final String DEFAULT_FILE_PREFIX = "export_";
    
    /**
     * Excel中日期的默认格式
     */
    public static final String DEFAULT_DATE_FORMAT = "yyyy-MM-dd";
    
    /**
     * Excel中日期时间的默认格式
     */
    public static final String DEFAULT_DATETIME_FORMAT = "yyyy-MM-dd HH:mm:ss";
    
    /**
     * 配置Excel最大行数（防止内存溢出）
     * @return 最大行数
     */
    @Bean
    public Integer excelMaxRowCount() {
        return 100000; // 默认最大行数
    }
}