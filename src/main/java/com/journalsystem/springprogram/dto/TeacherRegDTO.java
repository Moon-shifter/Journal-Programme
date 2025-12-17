package com.journalsystem.springprogram.dto;

//用来接受封装教师登录数据的类
public class TeacherRegDTO {
    private String name;
    private String department;
    private String email;
    private String phone;


    public TeacherRegDTO() {
    }

    public TeacherRegDTO(String name, String department, String email, String phone) {
        this.name = name;
        this.department = department;
        this.email = email;
        this.phone = phone;
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
     * @param name  //
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
     * @param department //
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
     * @param email //
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
     * @param phone //
     */
    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String toString() {
        return "TeacherRegDTO{name = " + name + ", department = " + department + ", email = " + email + ", phone = " + phone + "}";
    }
}
