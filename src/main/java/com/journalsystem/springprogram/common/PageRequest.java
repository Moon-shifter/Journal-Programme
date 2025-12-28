package com.journalsystem.springprogram.common;

import lombok.Data;

/**
 * 分页请求类
 * 用于封装分页查询的请求参数
 */
@Data
public class PageRequest {

    /**
     * 当前页码
     */
    private Integer pageNum = 1;
    
    /**
     * 每页大小
     */
    private Integer pageSize = Constants.DEFAULT_PAGE_SIZE;
    
    /**
     * 排序字段
     */
    private String sortField;
    
    /**
     * 排序方向（asc/desc）
     */
    private String sortOrder = "asc";
    
    /**
     * 校验并修正分页参数
     */
    public void validate() {
        if (pageNum == null || pageNum < 1) {
            pageNum = 1;
        }
        if (pageSize == null || pageSize < 1) {
            pageSize = Constants.DEFAULT_PAGE_SIZE;
        }
        if (pageSize > Constants.MAX_PAGE_SIZE) {
            pageSize = Constants.MAX_PAGE_SIZE;
        }
        if (sortOrder == null || (!"asc".equalsIgnoreCase(sortOrder) && !"desc".equalsIgnoreCase(sortOrder))) {
            sortOrder = "asc";
        }
    }
}