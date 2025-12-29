package com.journalsystem.springprogram.service;

import com.journalsystem.springprogram.dto.JournalDTO;
import com.journalsystem.springprogram.exception.BusinessException;
import com.journalsystem.springprogram.pojo.JournalInfo;
import com.journalsystem.springprogram.repository.JournalRepository;
import com.journalsystem.springprogram.util.DtoUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

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
        JournalInfo journalInfo=new JournalInfo();
        DtoUtil.copyNonNullFields(addDTO,journalInfo);

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
        JournalInfo targetJournalInfo=journalRepository.findById(updateDTO.getId()).orElseThrow(()->new BusinessException(400, "期刊ID不存在"));
        DtoUtil.copyNonNullFields(updateDTO,targetJournalInfo);
        journalRepository.save(targetJournalInfo);
        return true;
    }
}
