package com.journalsystem.springprogram.dto;

//用来接受封装教师登录数据的类
public class TeacherDTO {
    private Integer id;
    private String name;
    private String department;
    private String email;
    private String phone;
    private String maxBorrow;
    private String currentBorrow;
    private String status;


    public TeacherDTO() {
    }

    public TeacherDTO(Integer id, String name, String department, String email, String phone, String maxBorrow, String currentBorrow, String status) {
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
    public String getMaxBorrow() {
        return maxBorrow;
    }

    /**
     * 设置
     * @param maxBorrow
     */
    public void setMaxBorrow(String maxBorrow) {
        this.maxBorrow = maxBorrow;
    }

    /**
     * 获取
     * @return currentBorrow
     */
    public String getCurrentBorrow() {
        return currentBorrow;
    }

    /**
     * 设置
     * @param currentBorrow
     */
    public void setCurrentBorrow(String currentBorrow) {
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
        return "TeacherRegDTO{id = " + id + ", name = " + name + ", department = " + department + ", email = " + email + ", phone = " + phone + ", maxBorrow = " + maxBorrow + ", currentBorrow = " + currentBorrow + ", status = " + status + "}";
    }
}
