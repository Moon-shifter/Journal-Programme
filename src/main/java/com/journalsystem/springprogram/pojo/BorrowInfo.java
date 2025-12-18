package com.journalsystem.springprogram.pojo;

import jakarta.persistence.*;
import org.hibernate.annotations.ColumnDefault;

import java.time.LocalDate;

@Entity
@Table(name = "borrow_info")
public class BorrowInfo {
    @Id
    @Column(name = "borrow_id", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)//多对一，级联操作，非空
    @JoinColumn(name = "journal_id", nullable = false)
    private JournalInfo journal;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)//多对一，级联操作，非空
    @JoinColumn(name = "borrower_id", nullable = false)
    private TeacherInfo borrower;

    @ColumnDefault("'1970-01-01'")
    @Column(name = "start_date", nullable = false,insertable = false)//后续再更新状态
    private LocalDate startDate;

    @ColumnDefault("'1970-01-01'")
    @Column(name = "end_date", nullable = false,insertable = false)//后续再更新状态
    private LocalDate endDate;

    @ColumnDefault("'1970-01-01'")
    @Column(name = "return_date",insertable = false)//后续再更新状态
    private LocalDate returnDate;

    @ColumnDefault("'returned'")
    @Lob
    @Column(name = "STATUS",insertable = false)//后续再更新状态
    private String status;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public JournalInfo getJournal() {
        return journal;
    }

    public void setJournal(JournalInfo journal) {
        this.journal = journal;
    }

    public TeacherInfo getBorrower() {
        return borrower;
    }

    public void setBorrower(TeacherInfo borrower) {
        this.borrower = borrower;
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