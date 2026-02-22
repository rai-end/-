package com.example.littleappbackend.entity;

import lombok.Data;
import java.util.Date;

@Data
public class UserAccount {
    private Long id;
    private String username;
    private String password;
    private Date createTime;
    private Date updateTime;
}
