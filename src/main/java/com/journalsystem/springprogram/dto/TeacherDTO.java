package com.journalsystem.springprogram.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

//用来接受封装教师登录数据的类
public class TeacherDTO {
    @NotBlank(message = "教师ID不能为空")
    @Size(max=10 ,message = "教师ID长度不能超过10位")
    private Integer id;
    private String name;
    private String department;
    private String email;
    private String phone;
    private Integer maxBorrow;
    private Integer currentBorrow;
    private String status;


    public TeacherDTO() {
    }

    public TeacherDTO(Integer id, String name, String department, String email, String phone, Integer maxBorrow, Integer currentBorrow, String status) {
        this.id = id;
        this.name = name;
        this.department = department;
        this.email = email;
        this.phone = phone;
        this.maxBorrow = maxBorrow;
        this.currentBorrow = currentBorrow;
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
     * @param id
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
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * 获取
     * @return department
     */
    public String getDepartment() {
        return department;
    }

    /**
     * 设置
     * @param department
     */
    public void setDepartment(String department) {
        this.department = department;
    }

    /**
     * 获取
     * @return email
     */
    public String getEmail() {
        return email;
    }

    /**
     * 设置
     * @param email
     */
    public void setEmail(String email) {
        this.email = email;
    }

    /**
     * 获取
     * @return phone
     */
    public String getPhone() {
        return phone;
    }

    /**
     * 设置
     * @param phone
     */
    public void setPhone(String phone) {
        this.phone = phone;
    }

    /**
     * 获取
     * @return maxBorrow
     */
    public Integer getMaxBorrow() {
        return maxBorrow;
    }

    /**
     * 设置
     * @param maxBorrow
     */
    public void setMaxBorrow(Integer maxBorrow) {
        this.maxBorrow = maxBorrow;
    }

    /**
     * 获取
     * @return currentBorrow
     */
    public Integer getCurrentBorrow() {
        return currentBorrow;
    }

    /**
     * 设置
     * @param currentBorrow
     */
    public void setCurrentBorrow(Integer currentBorrow) {
        this.currentBorrow = currentBorrow;
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
        return "TeacherDTO{id = " + id + ", name = " + name + ", department = " + department + ", email = " + email + ", phone = " + phone + ", maxBorrow = " + maxBorrow + ", currentBorrow = " + currentBorrow + ", status = " + status + "}";
    }
}
