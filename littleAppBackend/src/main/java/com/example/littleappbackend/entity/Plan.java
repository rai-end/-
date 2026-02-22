package com.example.littleappbackend.entity;

import lombok.Data;
import java.util.Date;

/**
 * 计划实体类（对应t_plan表）
 */
@Data
public class Plan {
    private Long id;             // 计划ID
    private Long userId;         // 用户ID
    private Date planDate;       // 计划日期
    private String content;      // 计划内容
    private String planType;     // 计划类型：long_term/memo/urgent
    private String remindTime;   // 紧急计划提醒时间
    private Integer isDeleted;   // 是否删除
    private Date createTime;     // 创建时间
    private Date updateTime;     // 更新时间

    // 非数据库字段：接收前端的日期字符串（YYYY-MM-DD）
    private String planDateStr;
    // 非数据库字段：小程序openid（用于关联用户）
    private String openid;
}
