package com.journalsystem.springprogram.common;

import lombok.Data;

import java.util.List;

/**
 * 分页响应类
 * 用于封装分页查询的响应结果
 * @param <T> 数据类型
 */
@Data
public class PageResult<T> {

    /**
     * 当前页码
     */
    private Integer pageNum;
    
    /**
     * 每页大小
     */
    private Integer pageSize;
    
    /**
     * 总记录数
     */
    private Long total;
    
    /**
     * 总页数
     */
    private Integer totalPages;
    
    /**
     * 当前页数据
     */
    private List<T> data;
    
    /**
     * 是否有下一页
     */
    private Boolean hasNext;
    
    /**
     * 是否有上一页
     */
    private Boolean hasPrevious;
    
    /**
     * 构建分页结果
     * @param pageNum 当前页码
     * @param pageSize 每页大小
     * @param total 总记录数
     * @param data 当前页数据
     * @param <T> 数据类型
     * @return 分页结果
     */
    public static <T> PageResult<T> build(Integer pageNum, Integer pageSize, Long total, List<T> data) {
        PageResult<T> result = new PageResult<>();
        result.setPageNum(pageNum);
        result.setPageSize(pageSize);
        result.setTotal(total);
        
        // 计算总页数
        Integer totalPages = (int) Math.ceil((double) total / pageSize);
        result.setTotalPages(totalPages);
        
        result.setData(data);
        result.setHasNext(pageNum < totalPages);
        result.setHasPrevious(pageNum > 1);
        
        return result;
    }
}