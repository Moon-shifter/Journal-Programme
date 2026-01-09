package com.journalsystem.springprogram.pojo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity //实体类，构造函数是无参构造函数
@DynamicInsert
@DynamicUpdate
@Table(name = "journal_info")
public class JournalInfo {
    @Id//主键
    @Column(name = "id", nullable = false,unique = true)
    private Integer id;

    @Column(name = "NAME", nullable = false, length = 100)
    private String name;

    @Column(name = "ISSN", length = 20)
    private String issn;

    @Column(name = "category", length = 50)
    private String category;

    @Column(name = "publisher", length = 100)
    private String publisher;

    @ColumnDefault("'1970-01-01'")//默认值为1970-01-01
    @Column(name = "publish_date")//发布日期,格式yyyy-MM-dd
    private LocalDate publishDate;

    @Column(name = "issue_number", length = 20)//期刊号
    private String issueNumber;

    @Lob//大文本字段
    @Column(name = "description")
    private String description;

    @ColumnDefault("0")
    @Column(name = "total_quantity")
    private Integer totalQuantity;

    @ColumnDefault("0")
    @Column(name = "available_quantity")
    private Integer availableQuantity;

    @ColumnDefault("'available'")
    @Column(name = "STATUS")
    private String status;

    /**
     * 期刊借阅信息列表
     * 一个期刊可以有多个借阅记录
     */
    @OneToMany(mappedBy = "journal", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JsonIgnore // 避免循环引用
    private List<BorrowInfo> borrowInfos = new ArrayList<>();

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }


    public void setName(String name) {
        this.name = name;
    }

    public String getIssn() {
        return issn;
    }

    public void setIssn(String issn) {
        this.issn = issn;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getPublisher() {
        return publisher;
    }

    public void setPublisher(String publisher) {
        this.publisher = publisher;
    }

    public LocalDate getPublishDate() {
        return publishDate;
    }

    public void setPublishDate(LocalDate publishDate) {
        this.publishDate = publishDate;
    }

    public String getIssueNumber() {
        return issueNumber;
    }

    public void setIssueNumber(String issueNumber) {
        this.issueNumber = issueNumber;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getTotalQuantity() {
        return totalQuantity;
    }

    public void setTotalQuantity(Integer totalQuantity) {
        this.totalQuantity = totalQuantity;
    }

    public Integer getAvailableQuantity() {
        return availableQuantity;
    }

    public void setAvailableQuantity(Integer availableQuantity) {
        this.availableQuantity = availableQuantity;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public List<BorrowInfo> getBorrowInfos() {
        return borrowInfos;
    }

    public void setBorrowInfos(List<BorrowInfo> borrowInfos) {
        this.borrowInfos = borrowInfos;
    }

}