package com.journalsystem.springprogram.service;

import com.journalsystem.springprogram.dto.JournalDTO;
import com.journalsystem.springprogram.pojo.JournalInfo;

import java.time.LocalDate;
import java.util.List;

//定义服务层接口,用于处理期刊相关业务逻辑
public interface JournalService {
    //1.添加期刊
    Boolean addJournal(JournalDTO addDTO);
    //2.删除期刊
    Boolean deleteJournal(Integer id);
    //3.根据id查询期刊
    JournalInfo getJournal(Integer id);
    //4.查询所有期刊
    List<JournalInfo> getAllJournals();
    //5.更新期刊
    Boolean updateJournal(JournalDTO updateDTO);

    ///////////以下是待实现接口

    //6.根据分类查询期刊
    default List<JournalInfo> getJournalsByCategory(String category) {
        return null;
    }

    //7.根据期刊号查询单个期刊
    default JournalInfo getJournalByIssueNumber(String issueNumber) {
        return null;
    }

    //8.根据发布日期查询期刊
    default List<JournalInfo> getJournalsByPublishDate(LocalDate publishDate) {
        return null;
    }
}
