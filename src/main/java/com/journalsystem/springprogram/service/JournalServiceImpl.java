package com.journalsystem.springprogram.service;

import com.journalsystem.springprogram.common.Constants;
import com.journalsystem.springprogram.common.PageRequest;
import com.journalsystem.springprogram.common.PageResult;
import com.journalsystem.springprogram.dto.JournalDTO;
import com.journalsystem.springprogram.exception.BusinessException;
import com.journalsystem.springprogram.pojo.JournalInfo;
import com.journalsystem.springprogram.repository.JournalRepository;
import com.journalsystem.springprogram.util.DtoUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
public class JournalServiceImpl implements JournalService {

    private JournalRepository journalRepository;
    @Autowired//构造注入
    public JournalServiceImpl(JournalRepository journalRepository) {
        this.journalRepository = journalRepository;
    }



    @Override //管理员用
    public Boolean addJournal(JournalDTO addDTO) {
        //1.检查issn和id是否存在
        if (journalRepository.existsById(addDTO.getId())){
            throw new BusinessException(400, "期刊ID已存在");//抛出异常
        }
        if (journalRepository.existsByIssn(addDTO.getIssn())){
            throw new BusinessException(400, "期刊ISSN已存在");//抛出异常
        }

        //2.创造实体类，准备插入
        JournalInfo journalInfo = new JournalInfo();
        DtoUtil.copyNonNullFields(addDTO, journalInfo);

        // 确保期刊状态正确设置
        if (journalInfo.getStatus() == null) {
            journalInfo.setStatus(Constants.JOURNAL_STATUS_AVAILABLE);
        }

        // 确保可借数量不超过总数量
        if (journalInfo.getAvailableQuantity() == null) {
            journalInfo.setAvailableQuantity(journalInfo.getTotalQuantity() != null ? journalInfo.getTotalQuantity() : 0);
        } else if (journalInfo.getTotalQuantity() != null && journalInfo.getAvailableQuantity() > journalInfo.getTotalQuantity()) {
            journalInfo.setAvailableQuantity(journalInfo.getTotalQuantity());
        }

        journalRepository.save(journalInfo);
        return true;
    }

    @Override//管理员用
    public Boolean deleteJournal(Integer id) {
        if (!journalRepository.existsById(id)){
            throw new BusinessException(400, "期刊ID不存在");//抛出异常
        }
        journalRepository.deleteById(id);
        return true;
    }

    @Override//教师或管理员用
    public JournalInfo getJournal(Integer id) {
        return journalRepository.findById(id).orElse(null);
    }

    @Override//教师或管理员用
    public List<JournalInfo> getAllJournals() {
        return journalRepository.findAll();
    }

    @Override//管理员用
    public Boolean updateJournal(JournalDTO updateDTO) {
        JournalInfo targetJournalInfo = journalRepository.findById(updateDTO.getId())
                .orElseThrow(() -> new BusinessException(400, "期刊ID不存在"));

        // 复制非空字段
        DtoUtil.copyNonNullFields(updateDTO, targetJournalInfo);

        // 确保可借数量不超过总数量
        if (targetJournalInfo.getTotalQuantity() != null && targetJournalInfo.getAvailableQuantity() != null) {
            if (targetJournalInfo.getAvailableQuantity() > targetJournalInfo.getTotalQuantity()) {
                targetJournalInfo.setAvailableQuantity(targetJournalInfo.getTotalQuantity());
            }
        }

        journalRepository.save(targetJournalInfo);
        return true;
    }

    @Override
    public Boolean batchDeleteJournals(List<Integer> ids) {
        if (ids == null || ids.isEmpty()) {
            throw new BusinessException(400, "请选择要删除的期刊");
        }

        // 检查所有ID是否存在
        for (Integer id : ids) {
            if (!journalRepository.existsById(id)) {
                throw new BusinessException(400, "期刊ID " + id + " 不存在");
            }
        }

        // 批量删除
        journalRepository.deleteAllById(ids);
        return true;
    }

    @Override
    public PageResult<JournalInfo> getAvailableJournalsByPage(PageRequest pageRequest) {
        return JournalService.super.getAvailableJournalsByPage(pageRequest);
    }

    @Override
    public JournalInfo getJournalByIssn(String issn) {
        if (issn == null || issn.isEmpty()) {
            return null;
        }
        return journalRepository.findByIssn(issn);
    }

    @Override
    public JournalInfo getJournalByIssueNumber(String issueNumber) {
        if (issueNumber == null || issueNumber.isEmpty()) {
            return null;
        }
        return journalRepository.findByIssueNumber(issueNumber);
    }

    @Override
    public List<JournalInfo> getJournalsByCategory(String category) {
        if (category == null || category.isEmpty()) {
            return journalRepository.findAll();
        }
        return journalRepository.findByCategory(category);
    }

    @Override
    public List<JournalInfo> getJournalsByNamesLike(Set<String> names) {
        if (names == null || names.isEmpty()) {
            return journalRepository.findAll();
        }

        // 构建查询条件
        List<JournalInfo> result = new ArrayList<>();
        for (String name : names) {
            if (name == null || name.isEmpty()) {
                continue;
            }
            result.addAll(journalRepository.findByNameLike("%" + name + "%"));
        }
        return result;
    }

    @Override
    public PageResult<JournalInfo> getJournalsByPage(PageRequest pageRequest) {
        return JournalService.super.getJournalsByPage(pageRequest);
    }

    @Override
    public List<JournalInfo> getJournalsByPublishDate(LocalDate publishDate) {
        if (publishDate == null) {
            return journalRepository.findAll();
        }
        return journalRepository.findByPublishDate(publishDate);
    }

    @Override
    public Boolean updateJournalQuantity(Integer journalId, Integer quantityChange) {
        if (journalId == null) {
            throw new BusinessException(400, "期刊ID不能为空");
        }
        if (quantityChange == null) {
            throw new BusinessException(400, "数量变更不能为空");
        }

        // 查询期刊
        JournalInfo journalInfo = journalRepository.findById(journalId)
                .orElseThrow(() -> new BusinessException(400, "期刊ID不存在"));

        // 更新总数量
        if (journalInfo.getTotalQuantity() == null) {
            journalInfo.setTotalQuantity(quantityChange);
        } else {
            journalInfo.setTotalQuantity(journalInfo.getTotalQuantity() + quantityChange);
        }

        // 更新可借数量
        if (journalInfo.getAvailableQuantity() == null) {
            journalInfo.setAvailableQuantity(quantityChange);
        } else {
            journalInfo.setAvailableQuantity(journalInfo.getAvailableQuantity() + quantityChange);
        }

        // 确保数量不为负数
        if (journalInfo.getTotalQuantity() < 0) {
            throw new BusinessException(400, "期刊总数量不能为负数");
        }
        if (journalInfo.getAvailableQuantity() < 0) {
            journalInfo.setAvailableQuantity(0);
        }

        // 更新期刊状态
        if (journalInfo.getTotalQuantity() > 0) {
            journalInfo.setStatus(Constants.JOURNAL_STATUS_AVAILABLE);
        } else {
            journalInfo.setStatus(Constants.JOURNAL_STATUS_UNAVAILABLE);
        }

        journalRepository.save(journalInfo);
        return true;
    }

}
