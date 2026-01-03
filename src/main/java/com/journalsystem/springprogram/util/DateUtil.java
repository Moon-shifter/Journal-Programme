package com.journalsystem.springprogram.util;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Date;

/**
 * 日期时间工具类
 * 提供期刊借阅系统中常用的日期时间处理方法
 */
public class DateUtil {
    
    // 默认日期格式：yyyy-MM-dd
    public static final DateTimeFormatter DEFAULT_DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    
    // 默认日期时间格式：yyyy-MM-dd HH:mm:ss
    public static final DateTimeFormatter DEFAULT_DATETIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    
    private DateUtil() {
        // 私有构造方法，防止实例化
    }
    
    /**
     * 获取当前日期（LocalDate）
     * @return 当前日期
     */
    public static LocalDate getCurrentDate() {
        return LocalDate.now();
    }
    
    /**
     * 获取当前时间（LocalDateTime）
     * @return 当前时间
     */
    public static LocalDateTime getCurrentDateTime() {
        return LocalDateTime.now();
    }
    
    /**
     * 获取当前时间戳（Instant）
     * @return 当前时间戳
     */
    public static Instant getCurrentInstant() {
        return Instant.now();
    }
    
    /**
     * 将LocalDate格式化为字符串（yyyy-MM-dd）
     * @param date LocalDate对象
     * @return 格式化后的日期字符串
     */
    public static String formatDate(LocalDate date) {
        return date == null ? null : date.format(DEFAULT_DATE_FORMATTER);
    }
    
    /**
     * 将字符串解析为LocalDate（yyyy-MM-dd）
     * @param dateStr 日期字符串
     * @return LocalDate对象
     */
    public static LocalDate parseDate(String dateStr) {
        return dateStr == null ? null : LocalDate.parse(dateStr, DEFAULT_DATE_FORMATTER);
    }
    
    /**
     * 将LocalDateTime格式化为字符串（yyyy-MM-dd HH:mm:ss）
     * @param dateTime LocalDateTime对象
     * @return 格式化后的日期时间字符串
     */
    public static String formatDateTime(LocalDateTime dateTime) {
        return dateTime == null ? null : dateTime.format(DEFAULT_DATETIME_FORMATTER);
    }
    
    /**
     * 将字符串解析为LocalDateTime（yyyy-MM-dd HH:mm:ss）
     * @param dateTimeStr 日期时间字符串
     * @return LocalDateTime对象
     */
    public static LocalDateTime parseDateTime(String dateTimeStr) {
        return dateTimeStr == null ? null : LocalDateTime.parse(dateTimeStr, DEFAULT_DATETIME_FORMATTER);
    }
    
    /**
     * 计算两个日期之间的天数差
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @return 天数差
     */
    public static long getDaysBetween(LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null) {
            return 0;
        }
        return ChronoUnit.DAYS.between(startDate, endDate);
    }
    
    /**
     * 计算应还日期（当前日期+借阅天数）
     * @param borrowDays 借阅天数
     * @return 应还日期
     */
    public static LocalDate calculateDueDate(int borrowDays) {
        return getCurrentDate().plusDays(borrowDays);
    }
    
    /**
     * 计算应还日期（开始日期+借阅天数）
     * @param startDate 开始日期
     * @param borrowDays 借阅天数
     * @return 应还日期
     */
    public static LocalDate calculateDueDate(LocalDate startDate, int borrowDays) {
        return startDate == null ? null : startDate.plusDays(borrowDays);
    }
    
    /**
     * 判断是否逾期
     * @param dueDate 应还日期
     * @return true：已逾期，false：未逾期
     */
    public static boolean isOverdue(LocalDate dueDate) {
        if (dueDate == null) {
            return false;
        }
        return LocalDate.now().isAfter(dueDate);
    }
    
    /**
     * 判断是否逾期
     * @param endDate 应还日期
     * @param returnDate 实际归还日期
     * @return true：已逾期，false：未逾期
     */
    public static boolean isOverdue(LocalDate endDate, LocalDate returnDate) {
        if (endDate == null || returnDate == null) {
            return false;
        }
        return returnDate.isAfter(endDate);
    }
    
    /**
     * 计算逾期天数
     * @param dueDate 应还日期
     * @return 逾期天数
     */
    public static long calculateOverdueDays(LocalDate dueDate) {
        if (dueDate == null || !isOverdue(dueDate)) {
            return 0;
        }
        return getDaysBetween(dueDate, LocalDate.now());
    }
    
    /**
     * 计算逾期天数
     * @param endDate 应还日期
     * @param returnDate 实际归还日期
     * @return 逾期天数
     */
    public static long calculateOverdueDays(LocalDate endDate, LocalDate returnDate) {
        if (endDate == null || returnDate == null || !isOverdue(endDate, returnDate)) {
            return 0;
        }
        return getDaysBetween(endDate, returnDate);
    }
    
    /**
     * LocalDate转换为Instant
     * @param localDate LocalDate对象
     * @return Instant对象
     */
    public static Instant localDateToInstant(LocalDate localDate) {
        if (localDate == null) {
            return null;
        }
        return localDate.atStartOfDay(ZoneId.systemDefault()).toInstant();
    }
    
    /**
     * Instant转换为LocalDate
     * @param instant Instant对象
     * @return LocalDate对象
     */
    public static LocalDate instantToLocalDate(Instant instant) {
        if (instant == null) {
            return null;
        }
        return instant.atZone(ZoneId.systemDefault()).toLocalDate();
    }
    
    /**
     * Date转换为LocalDate
     * @param date Date对象
     * @return LocalDate对象
     */
    public static LocalDate dateToLocalDate(Date date) {
        if (date == null) {
            return null;
        }
        return date.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
    }
    
    /**
     * LocalDate转换为Date
     * @param localDate LocalDate对象
     * @return Date对象
     */
    public static Date localDateToDate(LocalDate localDate) {
        if (localDate == null) {
            return null;
        }
        return Date.from(localDate.atStartOfDay(ZoneId.systemDefault()).toInstant());
    }
    
    /**
     * 判断日期是否在有效范围内
     * @param date 要判断的日期
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @return true：在范围内，false：不在范围内
     */
    public static boolean isBetween(LocalDate date, LocalDate startDate, LocalDate endDate) {
        if (date == null || startDate == null || endDate == null) {
            return false;
        }
        return !date.isBefore(startDate) && !date.isAfter(endDate);
    }
    
    /**
     * 判断是否即将到期（默认提前1天）
     * @param dueDate 应还日期
     * @return true：即将到期，false：未即将到期
     */
    public static boolean isSoonExpire(LocalDate dueDate) {
        if (dueDate == null) {
            return false;
        }
        LocalDate now = LocalDate.now();
        return dueDate.isEqual(now) || dueDate.isEqual(now.plusDays(1));
    }
    
    /**
     * 判断是否在指定天数内到期
     * @param dueDate 应还日期
     * @param days 指定天数
     * @return true：在指定天数内到期，false：不在指定天数内到期
     */
    public static boolean isSoonExpire(LocalDate dueDate, int days) {
        if (dueDate == null || days < 0) {
            return false;
        }
        LocalDate now = LocalDate.now();
        LocalDate threshold = now.plusDays(days);
        return !dueDate.isBefore(now) && !dueDate.isAfter(threshold);
    }
}