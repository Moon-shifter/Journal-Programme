package com.journalsystem.springprogram.repository;

import com.journalsystem.springprogram.pojo.BorrowInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BorrowInfoRepository extends JpaRepository<BorrowInfo, Integer> {
}
