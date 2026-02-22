package com.example.littleappbackend.service;

import com.example.littleappbackend.entity.Plan;
import java.util.List;

public interface PlanService {
    /**
     * 查询指定用户指定日期的指定类型计划
     */
    List<Plan> getPlanByType(Long userId, String dateStr, String planType);

    /**
     * 保存/更新计划
     */
    boolean savePlan(Plan plan);

    /**
     * 删除计划
     */
    boolean deletePlan(Long id, Long userId);
}
