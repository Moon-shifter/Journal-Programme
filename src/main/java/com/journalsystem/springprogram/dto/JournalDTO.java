package com.journalsystem.springprogram.dto;
import java.time.LocalDate;

public class JournalDTO {
    private Integer id;
    private String name;
    private String issn;
    private String category;
    private String publisher;
    private LocalDate publishDate; //格式yyyy-MM-dd
    private String issueNumber;
    private String description;
    private Integer totalQuantity;
    private Integer availableQuantity;
    private String status;


    public JournalDTO() {
    }

    public JournalDTO(Integer id, String name, String issn, String category, String publisher, LocalDate date, String issueNumber, String description, Integer totalQuantity, Integer availableQuantity, String status) {
        this.id = id;
        this.name = name;
        this.issn = issn;
        this.category = category;
        this.publisher = publisher;
        this.publishDate = publishDate;
        this.issueNumber = issueNumber;
        this.description = description;
        this.totalQuantity = totalQuantity;
        this.availableQuantity = availableQuantity;
        this.status = status;
    }

    /**
     * 获取
     * @return id
     */
    public Integer getId() {
        return id;
    }

    /**
     * 设置
     * @param
     * @return null
     */
    public void setId(Integer id) {
        this.id = id;
    }

    /**
     * 获取
     * @return name
     */
    public String getName() {
        return name;
    }

    /**
     * 设置
     * @param name
     * @return null
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * 获取
     * @return issn
     */
    public String getIssn() {
        return issn;
    }

    /**
     * 设置
     * @param issn
     * @return null
     */
    public void setIssn(String issn) {
        this.issn = issn;
    }

    /**
     * 获取
     * @return category
     */
    public String getCategory() {
        return category;
    }

    /**
     * 设置
     * @param category
     * @return null
     */
    public void setCategory(String category) {
        this.category = category;
    }

    /**
     * 获取
     * @return publisher
     */
    public String getPublisher() {
        return publisher;
    }

    /**
     * 设置
     * @param publisher
     * @return null
     */
    public void setPublisher(String publisher) {
        this.publisher = publisher;
    }

    /**
     * 获取
     * @return date
     */
    public LocalDate getPublishDate() {
        return publishDate;
    }

    /**
     * 设置
     * @param publishDate
     * @return null
     */
    public void setPublishDate(LocalDate publishDate) {
        this.publishDate = publishDate;
    }

    /**
     * 获取
     * @return issueNumber
     */
    public String getIssueNumber() {
        return issueNumber;
    }

    /**
     * 设置
     * @param issueNumber
     * @return null
     */
    public void setIssueNumber(String issueNumber) {
        this.issueNumber = issueNumber;
    }

    /**
     * 获取
     * @return description
     */
    public String getDescription() {
        return description;
    }

    /**
     * 设置
     * @param description
     * @return null
     */
    public void setDescription(String description) {
        this.description = description;
    }

    /**
     * 获取
     * @return totalQuantity
     */
    public Integer getTotalQuantity() {
        return totalQuantity;
    }

    /**
     * 设置
     * @param totalQuantity
     * @return null
     */
    public void setTotalQuantity(Integer totalQuantity) {
        this.totalQuantity = totalQuantity;
    }

    /**
     * 获取
     * @return availableQuantity
     */
    public Integer getAvailableQuantity() {
        return availableQuantity;
    }

    /**
     * 设置
     * @param availableQuantity
     * @return null
     */
    public void setAvailableQuantity(Integer availableQuantity) {
        this.availableQuantity = availableQuantity;
    }

    /**
     * 获取
     * @return status
     */
    public String getStatus() {
        return status;
    }

    /**
     * 设置
     * @param status
     */
    public void setStatus(String status) {
        this.status = status;
    }

    public String toString() {
        return "JournalAddDTO{id = " + id + ", name = " + name + ", issn = " + issn + ", category = " + category + ", publisher = " + publisher + ", publishDate = " + publishDate + ", issueNumber = " + issueNumber + ", description = " + description + ", totalQuantity = " + totalQuantity + ", availableQuantity = " + availableQuantity + ", status = " + status + "}";
    }
}
