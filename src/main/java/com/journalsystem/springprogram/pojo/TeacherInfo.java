package com.journalsystem.springprogram.pojo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;

import java.util.ArrayList;
import java.util.List;

@Entity
@DynamicUpdate//动态更新，只更新有变化的字段,默认值也会被排除
@DynamicInsert//动态插入，只插入有值的字段，排除了null值，默认值也会被排除
@Table(name = "teacher_info")
public class TeacherInfo {
    @Id//主键
    @Column(name = "teacher_id", nullable = false)//教师id，不可为空
    private Integer id;

    @Column(name = "name", nullable = false, length = 50)
    private String name;

    @Column(name = "department", length = 50)
    private String department;

    @Column(name = "email", length = 100)
    private String email;

    @Column(name = "phone", length = 20)
    private String phone;

    @ColumnDefault("5")
    @Column(name = "max_borrow")
    private Integer maxBorrow;

    @ColumnDefault("0")
    @Column(name = "current_borrow")
    private Integer currentBorrow;

    @ColumnDefault("'inactive'")
    @Column(name = "STATUS")
    private String status;

    /**
     * 教师借阅信息列表
     * 一个教师可以有多个借阅记录
     */
    @OneToMany(mappedBy = "borrower", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
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

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Integer getMaxBorrow() {
        return maxBorrow;
    }

    public void setMaxBorrow(Integer maxBorrow) {
        this.maxBorrow = maxBorrow;
    }

    public Integer getCurrentBorrow() {
        return currentBorrow;
    }

    public void setCurrentBorrow(Integer currentBorrow) {
        this.currentBorrow = currentBorrow;
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