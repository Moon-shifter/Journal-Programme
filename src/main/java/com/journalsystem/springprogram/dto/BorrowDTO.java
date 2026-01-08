package com.journalsystem.springprogram.dto;

import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL) // 序列化时忽略值为null的字段
public class BorrowDTO {
    private Integer id;
    private Integer journalId;
    private String journalName;
    private Integer borrowerId;
    private String borrowerName;
    private String borrowerDepartment;
    private String borrowerPhone; // 新增字段
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate returnDate;
    private String status;

    public BorrowDTO() {
    }

    public BorrowDTO(Integer id, Integer journalId, String journalName, Integer borrowerId, 
                   String borrowerName, String borrowerDepartment, String borrowerPhone, LocalDate startDate, 
                   LocalDate endDate, LocalDate returnDate, String status) {
        this.id = id;
        this.journalId = journalId;
        this.journalName = journalName;
        this.borrowerId = borrowerId;
        this.borrowerName = borrowerName;
        this.borrowerDepartment = borrowerDepartment;
        this.borrowerPhone = borrowerPhone;
        this.startDate = startDate;
        this.endDate = endDate;
        this.returnDate = returnDate;
        this.status = status;
    }

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getJournalId() {
        return journalId;
    }

    public void setJournalId(Integer journalId) {
        this.journalId = journalId;
    }

    public String getJournalName() {
        return journalName;
    }

    public void setJournalName(String journalName) {
        this.journalName = journalName;
    }

    public Integer getBorrowerId() {
        return borrowerId;
    }

    public void setBorrowerId(Integer borrowerId) {
        this.borrowerId = borrowerId;
    }

    public String getBorrowerName() {
        return borrowerName;
    }

    public void setBorrowerName(String borrowerName) {
        this.borrowerName = borrowerName;
    }

    public String getBorrowerDepartment() {
        return borrowerDepartment;
    }

    public void setBorrowerDepartment(String borrowerDepartment) {
        this.borrowerDepartment = borrowerDepartment;
    }

    public String getBorrowerPhone() {
        return borrowerPhone;
    }

    public void setBorrowerPhone(String borrowerPhone) {
        this.borrowerPhone = borrowerPhone;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public LocalDate getReturnDate() {
        return returnDate;
    }

    public void setReturnDate(LocalDate returnDate) {
        this.returnDate = returnDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}