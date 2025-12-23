package com.journalsystem.springprogram.pojo;

import jakarta.persistence.*;
import org.hibernate.annotations.ColumnDefault;

@Entity
@Table(name = "teacher_info")
public class TeacherInfo {
    @Id
    @Column(name = "teacher_id", nullable = false)
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
    @Column(name = "max_borrow",insertable = false)
    private Integer maxBorrow;

    @ColumnDefault("0")
    @Column(name = "current_borrow",insertable = false)
    private Integer currentBorrow;

    @ColumnDefault("'inactive'")
    @Lob
    @Column(name = "STATUS" ,insertable = false)
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

}