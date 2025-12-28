package com.journalsystem.springprogram.dto;

import java.time.Instant;

public class AdminDTO {
    private Integer id;
    private String username;
    private String realName;
    private String role;
    private Instant lastLogin;
    private String status;

    public AdminDTO() {
    }

    public AdminDTO(Integer id, String username, String realName, String role, Instant lastLogin, String status) {
        this.id = id;
        this.username = username;
        this.realName = realName;
        this.role = role;
        this.lastLogin = lastLogin;
        this.status = status;
    }

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getRealName() {
        return realName;
    }

    public void setRealName(String realName) {
        this.realName = realName;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Instant getLastLogin() {
        return lastLogin;
    }

    public void setLastLogin(Instant lastLogin) {
        this.lastLogin = lastLogin;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}