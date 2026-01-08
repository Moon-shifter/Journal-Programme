package com.journalsystem.springprogram.pojo;

import jakarta.persistence.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;
import java.time.LocalDate;

@Entity
@DynamicInsert
@DynamicUpdate
@Table(name = "borrow_info")
public class BorrowInfo {
    @Id
    @Column(name = "borrow_id", nullable = false,unique = true)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)//多对一，非空，延迟加载
    @JoinColumn(name = "journal_id", nullable = false)
    private JournalInfo journal;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)//多对一，非空，延迟加载
    @JoinColumn(name = "borrower_id", nullable = false)
    private TeacherInfo borrower;

    //借阅日期,指的是教师借阅期刊的日期
    @ColumnDefault("'1970-01-01'")
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    //应当归还日期,指的是教师应当归还期刊的日期
    @ColumnDefault("'1970-01-01'")
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    //归还日期,指的是教师实际归还期刊的日期
    @ColumnDefault("'1970-01-01'")
    @Column(name = "return_date")
    private LocalDate returnDate;

    @ColumnDefault("'returned'")
    @Column(name = "STATUS")
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