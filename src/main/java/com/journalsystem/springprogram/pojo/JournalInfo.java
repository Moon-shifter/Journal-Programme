package com.journalsystem.springprogram.pojo;

import jakarta.persistence.*;
import org.hibernate.annotations.ColumnDefault;

import java.time.LocalDate;

@Entity
@Table(name = "journal_info")
public class JournalInfo {
    @Id//主键
    @Column(name = "id", nullable = false)
    private Integer id;

    @Column(name = "NAME", nullable = false, length = 100)
    private String name;

    @Column(name = "ISBN", length = 20)
    private String isbn;

    @Column(name = "category", length = 50)
    private String category;

    @Column(name = "publisher", length = 100)
    private String publisher;

    @ColumnDefault("'1970-01-01'")//默认值为1970-01-01
    @Column(name = "publish_date")//发布日期,格式yyyy-MM-dd
    private LocalDate publishDate;

    @Column(name = "issue_number", length = 20)//期刊号
    private String issueNumber;

    @Lob//长文本
    @Column(name = "description",insertable = false)//插入时先不写介绍，后续再更新
    private String description;

    @ColumnDefault("0")
    @Column(name = "total_quantity")
    private Integer totalQuantity;

    @ColumnDefault("0")
    @Column(name = "available_quantity")
    private Integer availableQuantity;

    @ColumnDefault("'available'")
    @Lob
    @Column(name = "STATUS",insertable = false)//后续再更新状态
    private String status;

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

    public String getIsbn() {
        return isbn;
    }

    public void setIsbn(String isbn) {
        this.isbn = isbn;
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

}