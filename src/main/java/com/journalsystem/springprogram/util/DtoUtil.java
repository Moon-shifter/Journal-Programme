package com.journalsystem.springprogram.util;

import com.journalsystem.springprogram.exception.BusinessException;

import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * DTO工具类
 * 提供DTO与实体类之间的转换、字段复制等功能
 */
public class DtoUtil {
    private DtoUtil() {
        // 私有构造方法，防止实例化
    }

    /**
     * 复制DTO中非空字段到实体中
     * @param source DTO对象
     * @param target 实体对象
     */
    public static void copyNonNullFields(Object source, Object target) {
        copyNonNullFields(source, target, null);
    }

    /**
     * 复制DTO中非空字段到实体中（忽略指定字段）
     * @param source DTO对象
     * @param target 实体对象
     * @param ignoreFields 忽略的字段集合
     */
    public static void copyNonNullFields(Object source, Object target, Set<String> ignoreFields) {
        if (source == null || target == null) {
            return;
        }

        // 获取DTO和实体的所有字段
        Field[] sourceFields = source.getClass().getDeclaredFields();
        Field[] targetFields = target.getClass().getDeclaredFields();

        try {
            for (Field sField : sourceFields) {
                // 忽略指定字段
                if (ignoreFields != null && ignoreFields.contains(sField.getName())) {
                    continue;
                }

                sField.setAccessible(true); // 允许访问私有字段
                Object value = sField.get(source); // 取DTO的字段值
                if (value == null) continue; // 空值跳过

                // 找到实体中同名的字段，赋值
                for (Field tField : targetFields) {
                    tField.setAccessible(true);
                    if (sField.getName().equals(tField.getName())) {
                        // 处理类型转换
                        Object convertedValue = convertValue(value, tField.getType());
                        tField.set(target, convertedValue);
                        break;
                    }
                }
            }
        } catch (IllegalAccessException e) {
            throw new BusinessException(500, "更新字段失败：" + e.getMessage());
        }
    }

    /**
     * 复制所有字段（包括空值）
     * @param source 源对象
     * @param target 目标对象
     */
    public static void copyAllFields(Object source, Object target) {
        copyAllFields(source, target, null);
    }

    /**
     * 复制所有字段（包括空值，忽略指定字段）
     * @param source 源对象
     * @param target 目标对象
     * @param ignoreFields 忽略的字段集合
     */
    public static void copyAllFields(Object source, Object target, Set<String> ignoreFields) {
        if (source == null || target == null) {
            return;
        }

        // 获取源对象和目标对象的所有字段
        Field[] sourceFields = source.getClass().getDeclaredFields();
        Field[] targetFields = target.getClass().getDeclaredFields();

        try {
            for (Field sField : sourceFields) {
                // 忽略指定字段
                if (ignoreFields != null && ignoreFields.contains(sField.getName())) {
                    continue;
                }

                sField.setAccessible(true); // 允许访问私有字段
                Object value = sField.get(source); // 取源对象的字段值

                // 找到目标对象中同名的字段，赋值
                for (Field tField : targetFields) {
                    tField.setAccessible(true);
                    if (sField.getName().equals(tField.getName())) {
                        // 处理类型转换
                        Object convertedValue = convertValue(value, tField.getType());
                        tField.set(target, convertedValue);
                        break;
                    }
                }
            }
        } catch (IllegalAccessException e) {
            throw new BusinessException(500, "复制字段失败：" + e.getMessage());
        }
    }

    /**
     * 将对象转换为指定类型
     * @param source 源对象
     * @param targetClass 目标类型
     * @param <T> 目标类型泛型
     * @return 转换后的对象
     */
    public static <T> T convertObject(Object source, Class<T> targetClass) {
        if (source == null) {
            return null;
        }

        try {
            T target = targetClass.getDeclaredConstructor().newInstance();
            copyAllFields(source, target);
            return target;
        } catch (InstantiationException | IllegalAccessException | InvocationTargetException | NoSuchMethodException e) {
            throw new BusinessException(500, "对象转换失败：" + e.getMessage());
        }
    }

    /**
     * 将对象列表转换为指定类型列表
     * @param sourceList 源对象列表
     * @param targetClass 目标类型
     * @param <S> 源类型泛型
     * @param <T> 目标类型泛型
     * @return 转换后的对象列表
     */
    public static <S, T> List<T> convertList(List<S> sourceList, Class<T> targetClass) {
        if (sourceList == null || sourceList.isEmpty()) {
            return new ArrayList<>();
        }

        List<T> targetList = new ArrayList<>();
        for (S source : sourceList) {
            targetList.add(convertObject(source, targetClass));
        }
        return targetList;
    }

    /**
     * 类型转换工具方法
     * @param value 原始值
     * @param targetType 目标类型
     * @return 转换后的值
     */
    private static Object convertValue(Object value, Class<?> targetType) {
        if (value == null) {
            return null;
        }

        // 如果类型相同，直接返回
        if (targetType.isAssignableFrom(value.getClass())) {
            return value;
        }

        // 处理常见类型转换
        try {
            // String <-> Integer
            if (targetType == Integer.class || targetType == int.class) {
                return Integer.parseInt(value.toString());
            }
            // String <-> Long
            if (targetType == Long.class || targetType == long.class) {
                return Long.parseLong(value.toString());
            }
            // String <-> Double
            if (targetType == Double.class || targetType == double.class) {
                return Double.parseDouble(value.toString());
            }
            // String <-> Boolean
            if (targetType == Boolean.class || targetType == boolean.class) {
                return Boolean.parseBoolean(value.toString());
            }
            // String <-> Float
            if (targetType == Float.class || targetType == float.class) {
                return Float.parseFloat(value.toString());
            }
            // String <-> Short
            if (targetType == Short.class || targetType == short.class) {
                return Short.parseShort(value.toString());
            }
            // String <-> Byte
            if (targetType == Byte.class || targetType == byte.class) {
                return Byte.parseByte(value.toString());
            }
        } catch (NumberFormatException e) {
            throw new BusinessException(500, "类型转换失败：" + value + " 无法转换为 " + targetType.getName());
        }

        // 如果是枚举类型
        if (targetType.isEnum()) {
            return Enum.valueOf((Class<? extends Enum>) targetType, value.toString());
        }

        // 尝试使用构造函数转换
        try {
            return targetType.getDeclaredConstructor(value.getClass()).newInstance(value);
        } catch (Exception ignored) {
        }

        // 尝试使用静态valueOf方法转换
        try {
            Method valueOfMethod = targetType.getMethod("valueOf", String.class);
            return valueOfMethod.invoke(null, value.toString());
        } catch (Exception ignored) {
        }

        throw new BusinessException(500, "不支持的类型转换：" + value.getClass().getName() + " -> " + targetType.getName());
    }


    /**
     * 将源对象的所有字段复制到目标对象
     * @param source 源对象
     * @param target 目标对象
     */
    public static void mapPutAllFields(Object source, Map<String, Object> target) {
        try {
            for (Field field : source.getClass().getDeclaredFields()) {
                field.setAccessible(true);
                target.put(field.getName(), field.get(source));
            }
        } catch (IllegalAccessException e) {
            throw new BusinessException(500, "复制字段失败：" + e.getMessage());
        }
    }
}