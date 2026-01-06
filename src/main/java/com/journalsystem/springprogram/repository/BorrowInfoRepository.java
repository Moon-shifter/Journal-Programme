package com.journalsystem.springprogram.repository;

import com.journalsystem.springprogram.pojo.BorrowInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BorrowInfoRepository extends JpaRepository<BorrowInfo, Integer> {
    List<BorrowInfo> findAllByStatus(String status);
    // 添加支持查询多个状态的方法
    List<BorrowInfo> findAllByStatusIn(List<String> statuses);
}
