package com.journalsystem.springprogram.service;

import com.journalsystem.springprogram.common.Constants;
import com.journalsystem.springprogram.common.PageRequest;
import com.journalsystem.springprogram.common.PageResult;
import com.journalsystem.springprogram.exception.BusinessException;
import com.journalsystem.springprogram.pojo.BorrowInfo;
import com.journalsystem.springprogram.pojo.JournalInfo;
import com.journalsystem.springprogram.pojo.TeacherInfo;
import com.journalsystem.springprogram.repository.BorrowInfoRepository;
import com.journalsystem.springprogram.repository.JournalRepository;
import com.journalsystem.springprogram.repository.TeacherRepository;
import com.journalsystem.springprogram.util.DateUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BorrowServiceImpl implements BorrowService {

    private final BorrowInfoRepository borrowInfoRepository;
    private final TeacherRepository teacherRepository;
    private final JournalRepository journalRepository;

    @Autowired
    public BorrowServiceImpl(BorrowInfoRepository borrowInfoRepository, TeacherRepository teacherRepository, JournalRepository journalRepository) {
        this.borrowInfoRepository = borrowInfoRepository;
        this.teacherRepository = teacherRepository;
        this.journalRepository = journalRepository;
    }



    @Override
    public Boolean borrowJournal(Integer borrowId, Integer teacherId, Integer journalId, LocalDate endDate) {
        // 1. 检查教师是否存在
        TeacherInfo teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new BusinessException(400, "教师不存在"));

        // 2. 检查期刊是否存在
        JournalInfo journal = journalRepository.findById(journalId)
                .orElseThrow(() -> new BusinessException(400, "期刊不存在"));

        // 3. 检查教师是否达到借阅限额
        if (teacher.getCurrentBorrow() >= teacher.getMaxBorrow()) {
            throw new BusinessException(400, "教师已达到最大借阅限额");
        }

        // 4. 检查期刊是否有可借数量
        if (journal.getAvailableQuantity() <= 0) {
            journal.setStatus(Constants.JOURNAL_STATUS_UNAVAILABLE);
            throw new BusinessException(400, "期刊已无可用数量");
        }

        // 5. 创建借阅记录
        BorrowInfo borrowInfo = new BorrowInfo();
        borrowInfo.setId(borrowId);
        borrowInfo.setBorrower(teacher);
        borrowInfo.setJournal(journal);
        borrowInfo.setStartDate(LocalDate.now());
        borrowInfo.setEndDate(endDate);
        borrowInfo.setStatus(Constants.BORROW_STATUS_BORROWED);

        // 6. 更新教师当前借阅数量
        teacher.setCurrentBorrow(teacher.getCurrentBorrow() + 1);

        // 7. 更新期刊可借数量
        journal.setAvailableQuantity(journal.getAvailableQuantity() - 1);

        // 8. 保存借阅记录、教师和期刊信息
        borrowInfoRepository.save(borrowInfo);
        teacherRepository.save(teacher);
        journalRepository.save(journal);

        return true;
    }

    @Override
    public Boolean returnJournal(Integer borrowId) {
        // 1. 检查借阅记录是否存在
        BorrowInfo borrowInfo = borrowInfoRepository.findById(borrowId)
                .orElseThrow(() -> new BusinessException(400, "借阅记录不存在"));

        // 2. 检查借阅记录是否已经归还
        if (Constants.BORROW_STATUS_RETURNED.equals(borrowInfo.getStatus())) {
            throw new BusinessException(400, "该借阅记录已归还");
        }

        // 3. 更新借阅记录状态和实际归还日期
        borrowInfo.setStatus(Constants.BORROW_STATUS_RETURNED);
        borrowInfo.setReturnDate(LocalDate.now());

        // 4. 更新教师当前借阅数量
        TeacherInfo teacher = borrowInfo.getBorrower();
        teacher.setCurrentBorrow(teacher.getCurrentBorrow() - 1);

        // 5. 更新期刊可借数量
        JournalInfo journal = borrowInfo.getJournal();
        journal.setAvailableQuantity(journal.getAvailableQuantity() + 1);

        // 6. 保存借阅记录、教师和期刊信息
        borrowInfoRepository.save(borrowInfo);
        teacherRepository.save(teacher);
        journalRepository.save(journal);

        return true;
    }

    @Override
    public BorrowInfo getBorrowById(Integer borrowId) {
        return borrowInfoRepository.findById(borrowId)
                .orElseThrow(() -> new BusinessException(400, "借阅记录不存在"));
    }

    @Override
    public List<BorrowInfo> getBorrowsByTeacherId(Integer teacherId) {
        // 检查教师是否存在
        TeacherInfo teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new BusinessException(400, "教师不存在"));

        // 查询该教师的所有借阅记录
        return borrowInfoRepository.findAll()
                .stream()
                .filter(borrowInfo -> borrowInfo.getBorrower().getId().equals(teacherId))
                .collect(Collectors.toList());
    }

    @Override
    public List<BorrowInfo> getBorrowsByJournalId(Integer journalId) {
        // 检查期刊是否存在
        JournalInfo journal = journalRepository.findById(journalId)
                .orElseThrow(() -> new BusinessException(400, "期刊不存在"));

        // 查询该期刊的所有借阅记录
        return borrowInfoRepository.findAll()
                .stream()
                .filter(borrowInfo -> borrowInfo.getJournal().getId().equals(journalId))
                .collect(Collectors.toList());
    }

    @Override
    public List<BorrowInfo> getAllBorrows() {
        return borrowInfoRepository.findAll();
    }

    @Override
    public PageResult<BorrowInfo> getBorrowsByPage(PageRequest pageRequest) {
        return null;
    }

    @Override
    public PageResult<BorrowInfo> getBorrowsByTeacherIdAndPage(Integer teacherId, PageRequest pageRequest) {
        return null;
    }

    @Override
    public List<BorrowInfo> getOverdueBorrows() {
        // 获取所有借阅记录
        List<BorrowInfo> borrowInfos = borrowInfoRepository.findAll();

        // 筛选出逾期借阅记录，包括两种情况：
        // 1. 状态为borrowed且已逾期
        // 2. 状态已更新为overdue
        return borrowInfos.stream()
                .filter(borrow -> {
                    boolean isOverdueStatus = Constants.BORROW_STATUS_OVERDUE.equals(borrow.getStatus());
                    boolean isBorrowedAndOverdue = Constants.BORROW_STATUS_BORROWED.equals(borrow.getStatus()) &&
                            borrow.getEndDate().isBefore(LocalDate.now());
                    return isOverdueStatus || isBorrowedAndOverdue;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<BorrowInfo> getUpcomingDueBorrows(Integer days) {
        // 检查days参数
        if (days == null || days < 0) {
            days = 1; // 默认提前1天
        }

        // 查询所有未归还的借阅记录
        Integer finalDays = days;
        return borrowInfoRepository.findAll()
                .stream()
                .filter(borrowInfo -> Constants.BORROW_STATUS_BORROWED.equals(borrowInfo.getStatus()))
                .filter(borrowInfo -> DateUtil.isSoonExpire(borrowInfo.getEndDate(), finalDays))
                .collect(Collectors.toList());
    }

    @Override
    public Boolean updateBorrowStatus(Integer borrowId, String status) {
        // 检查借阅记录是否存在
        BorrowInfo borrowInfo = borrowInfoRepository.findById(borrowId)
                .orElseThrow(() -> new BusinessException(400, "借阅记录不存在"));

        // 更新借阅记录状态
        borrowInfo.setStatus(status);
        borrowInfoRepository.save(borrowInfo);

        return true;
    }

    @Override
    public Boolean extendBorrowPeriod(Integer borrowId, LocalDate newEndDate) {
        // 检查借阅记录是否存在
        BorrowInfo borrowInfo = borrowInfoRepository.findById(borrowId)
                .orElseThrow(() -> new BusinessException(400, "借阅记录不存在"));

        // 检查借阅记录是否已经归还
        if (Constants.BORROW_STATUS_RETURNED.equals(borrowInfo.getStatus())) {
            throw new BusinessException(400, "该借阅记录已归还，无法延期");
        }

        // 检查新的结束日期是否有效
        if (newEndDate.isBefore(borrowInfo.getEndDate())) {
            throw new BusinessException(400, "新的结束日期不能早于原结束日期");
        }

        // 更新借阅记录的结束日期
        borrowInfo.setEndDate(newEndDate);
        borrowInfoRepository.save(borrowInfo);

        return true;
    }

    @Override
    public PageResult<BorrowInfo> getOverdueBorrowsByPage(PageRequest pageRequest) {
        return null;
    }

    @Override
    public Integer getBorrowCountByTeacherId(Integer teacherId) {
        // 检查教师是否存在
        TeacherInfo teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new BusinessException(400, "教师不存在"));

        // 统计该教师的借阅次数
        return (int) borrowInfoRepository.findAll()
                .stream()
                .filter(borrowInfo -> borrowInfo.getBorrower().getId().equals(teacherId))
                .count();
    }

    @Override
    public List<BorrowInfo> getBorrowsByStatus(String status, Integer limit) {
        List<BorrowInfo> borrowInfos;

        // 解析状态参数，支持多个状态用逗号分隔
        if (status != null && !status.isEmpty()) {
            List<String> statuses = List.of(status.split(","));
            borrowInfos = borrowInfoRepository.findAllByStatusIn(statuses);
        } else {
            // 如果没有指定状态，查询所有记录
            borrowInfos = borrowInfoRepository.findAll();
        }

        // 应用limit限制
        if (limit != null && limit > 0 && limit < borrowInfos.size()) {
            return borrowInfos.subList(0, limit);
        }

        return borrowInfos;
    }

}
