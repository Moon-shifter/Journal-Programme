package com.journalsystem.springprogram.repository;

import com.journalsystem.springprogram.pojo.BorrowInfo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

// BorrowInfoRepository.java
@Repository
public interface BorrowInfoRepository extends JpaRepository<BorrowInfo, Integer> {

    List<BorrowInfo> findAllByStatus(String status);
    List<BorrowInfo> findAllByStatusIn(List<String> statuses);
    Page<BorrowInfo> findByBorrowerId(Integer teacherId, Pageable pageable);
    
    // 以下分页查询方法
    Page<BorrowInfo> findByStatus(String status, Pageable pageable);
    Page<BorrowInfo> findByStatusIn(List<String> statuses, Pageable pageable);
    Page<BorrowInfo> findByJournalId(Integer journalId, Pageable pageable);
    Page<BorrowInfo> findAllByStatusIn(List<String> statuses,Pageable pageable);
}