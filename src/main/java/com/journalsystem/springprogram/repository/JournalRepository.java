package com.journalsystem.springprogram.repository;

import com.journalsystem.springprogram.pojo.JournalInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository//标记为仓库层组件
public interface JournalRepository extends JpaRepository<JournalInfo, Integer> {
    boolean existsByIssn(String issn);
}
