package com.journalsystem.springprogram.repository;

import com.journalsystem.springprogram.pojo.JournalInfo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository//标记为仓库层组件
public interface JournalRepository extends JpaRepository<JournalInfo, Integer> {
    boolean existsByIssn(String issn);
    
    // 根据分类查询期刊
    List<JournalInfo> findByCategory(String category);
    
    // 根据期刊号查询单个期刊
    JournalInfo findByIssueNumber(String issueNumber);
    
    // 根据发布日期查询期刊
    List<JournalInfo> findByPublishDate(LocalDate publishDate);
    
    // 根据名称模糊查询期刊
    List<JournalInfo> findByNameLike(String name);
    
    // 根据ISSN查询期刊
    JournalInfo findByIssn(String issn);

    // 查询可借阅期刊
    List<JournalInfo> findByStatus(String status);

    // 分页查询可借阅期刊
    Page<JournalInfo> findByStatus(String status, Pageable pageable);

    // 新增：按ISSN模糊查询（忽略大小写）+ 分页
    Page<JournalInfo> findByIssnContainingIgnoreCase(String issn, Pageable pageable);

    // 新增：多条件搜索期刊（支持部分条件为null）+ 分页
    @Query("SELECT j FROM JournalInfo j WHERE " +
           "(:#{#keyword} IS NULL OR j.name LIKE %:#{#keyword}%) AND " +
           "(:#{#category} IS NULL OR j.category = :#{#category}) AND " +
           "(:#{#issn} IS NULL OR j.issn = :#{#issn}) AND " +
           "(:#{#status} IS NULL OR j.status = :#{#status})")
    Page<JournalInfo> findByMultiConditions(
        @Param("keyword") String keyword,
        @Param("category") String category,
        @Param("issn") String issn,
        @Param("status") String status,
        Pageable pageable);
}