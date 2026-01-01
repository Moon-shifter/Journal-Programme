package com.journalsystem.springprogram.repository;

import com.journalsystem.springprogram.pojo.BorrowInfo;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BorrowInfoRepository extends JpaRepository<BorrowInfo, Integer> {
}
