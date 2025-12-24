package com.journalsystem.springprogram.util;

import com.journalsystem.springprogram.exception.BusinessException;
import org.springframework.validation.BindException;

import java.lang.reflect.Field;


public class DtoUtil {
    private DtoUtil() {}//私有构造方法，防止实例化

    /**
     * 复制DTO中非空字段到实体中
     * @param source DTO对象
     * @param target 实体对象
     */
    public static void copyNonNullFields(Object source, Object target) {
        // 获取DTO和实体的所有字段
        Field[] sourceFields = source.getClass().getDeclaredFields();
        Field[] targetFields = target.getClass().getDeclaredFields();

        try {
            for (Field sField : sourceFields) {
                sField.setAccessible(true); // 允许访问私有字段
                Object value = sField.get(source); // 取DTO的字段值
                if (value == null) continue; // 空值跳过

                // 找到实体中同名的字段，赋值
                for (Field tField : targetFields) {
                    tField.setAccessible(true);
                    if (sField.getName().equals(tField.getName())) {
                        if (sField.getType().equals(tField.getType())) {
                            tField.set(target, value);
                        } else {
                            throw new BusinessException(500, "字段" + sField.getName() + "类型不匹配");
                        }
                        break;
                    }
                }
            }
        } catch (IllegalAccessException e) {
            throw new BusinessException(500, "更新字段失败：" + e.getMessage());
        }
    }
}
