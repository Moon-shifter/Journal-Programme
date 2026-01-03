package com.journalsystem.springprogram.repository;

import com.journalsystem.springprogram.pojo.JournalInfo;
import org.springframework.data.jpa.repository.JpaRepository;
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
}