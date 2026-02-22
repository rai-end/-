package com.example.littleappbackend.service.impl;

import com.example.littleappbackend.entity.Plan;
import com.example.littleappbackend.mapper.PlanMapper;
import com.example.littleappbackend.service.PlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

@Service
public class PlanServiceImpl implements PlanService {

    @Autowired
    private PlanMapper planMapper;

    // 日期格式化（统一处理前端传的YYYY-MM-DD）
    private final SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");

    // ========== 修复：调用PlanMapper中已有的selectByDateAndTypeAndUserId方法 ==========
    @Override
    public List<Plan> getPlanByType(Long userId, String dateStr, String planType) {
        try {
            Date planDate = sdf.parse(dateStr);
            // 替换为PlanMapper中已定义的方法名：selectByDateAndTypeAndUserId
            return planMapper.selectByDateAndTypeAndUserId(planDate, planType, userId);
        } catch (ParseException e) {
            throw new RuntimeException("日期格式错误，需为yyyy-MM-dd");
        }
    }

    // ========== 修复：调用PlanMapper中已有的deleteByDateAndTypeAndUserId + insert方法 ==========
    @Override
    public boolean savePlan(Plan plan) {
        try {
            // 1. 转换日期字符串为Date（兼容前端传递的planDateStr）
            Date planDate = sdf.parse(plan.getPlanDateStr());
            plan.setPlanDate(planDate);

            // 2. 先删除同用户+同日期+同类型的旧计划（避免重复）
            planMapper.deleteByDateAndTypeAndUserId(planDate, plan.getPlanType(), plan.getUserId());
            // 3. 插入新计划
            int rows = planMapper.insert(plan);
            return rows > 0;
        } catch (ParseException e) {
            throw new RuntimeException("日期格式错误：" + e.getMessage());
        }
    }

    // ========== 修复：调用PlanMapper中已有的selectById + deleteById方法（校验+删除） ==========
    @Override
    public boolean deletePlan(Long id, Long userId) {
        // 1. 先校验计划是否属于当前用户
        Plan plan = planMapper.selectById(id);
        if (plan == null || !plan.getUserId().equals(userId)) {
            return false; // 计划不存在或无权删除
        }
        // 2. 调用PlanMapper中已有的deleteById方法
        int rows = planMapper.deleteById(id);
        return rows > 0;
    }
}