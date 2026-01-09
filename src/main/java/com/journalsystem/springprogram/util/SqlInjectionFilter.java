package com.journalsystem.springprogram.util;

public class SqlInjectionFilter {
    private SqlInjectionFilter() {
        // 私有构造函数，防止实例化
    }
    public static String filter(String input) {
        if (input == null) return null;
        // 过滤SQL注入关键字
        return input.replaceAll("(?i)union|and|or|not|select|insert|update|delete|drop|alter", "");
    }
}