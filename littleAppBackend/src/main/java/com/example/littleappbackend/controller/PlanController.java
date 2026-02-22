package com.example.littleappbackend.controller;

import com.example.littleappbackend.common.Result;
import com.example.littleappbackend.entity.Plan;
import com.example.littleappbackend.mapper.PlanMapper;
import com.example.littleappbackend.utils.UserContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

/**
 * 计划接口控制器
 * 功能：处理计划的保存、查询、删除，实现用户数据隔离
 * 路径：/api/plan/* （适配前端request.js的baseUrl拼接）
 */
@RestController
@RequestMapping("/api/plan")  // 核心：和前端拼接后路径为 /api/plan/xxx
public class PlanController {

    // 注入PlanMapper（MyBatis注解版，直接操作数据库）
    @Autowired
    private PlanMapper planMapper;

    // ==================== 内部DTO：接收前端计划数据 ====================
    /**
     * 前端传递的计划数据DTO
     * 注：内部类需为public static，否则无法接收前端JSON参数
     */
    public static class PlanDTO {
        private String planDateStr;  // 计划日期字符串（yyyy-MM-dd）
        private String content;      // 计划内容
        private String planType;     // 计划类型（long_term/memo/urgent）
        private String remindTime;   // 紧急计划提醒时间（HH:MM）

        // Getter & Setter 必须完整（SpringMVC反射赋值用）
        public String getPlanDateStr() {
            return planDateStr;
        }

        public void setPlanDateStr(String planDateStr) {
            this.planDateStr = planDateStr;
        }

        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
        }

        public String getPlanType() {
            return planType;
        }

        public void setPlanType(String planType) {
            this.planType = planType;
        }

        public String getRemindTime() {
            return remindTime;
        }

        public void setRemindTime(String remindTime) {
            this.remindTime = remindTime;
        }
    }

    // ==================== 保存计划接口（POST /api/plan/save） ====================
    /**
     * 保存计划（先删同用户+同日期+同类型的旧计划，再插新计划）
     * @param planDTO 前端传递的计划数据
     * @return 操作结果
     */
    @PostMapping("/save")
    public Result<?> savePlan(@RequestBody PlanDTO planDTO) {
        // 1. 校验必填参数
        if (planDTO == null || planDTO.getPlanDateStr() == null || planDTO.getContent() == null || planDTO.getPlanType() == null) {
            return Result.error("参数错误：日期/内容/类型不能为空");
        }

        try {
            // 2. 获取当前登录用户ID（从ThreadLocal，由Token拦截器注入）
            Long userId = UserContext.getUserId();
            if (userId == null) {
                return Result.error(401, "未登录，请先登录");
            }

            // 3. 转换日期字符串为Date类型
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
            Date planDate = sdf.parse(planDTO.getPlanDateStr());

            // 4. 构建Plan实体
            Plan plan = new Plan();
            plan.setUserId(userId);          // 核心：关联当前用户（数据隔离）
            plan.setPlanDate(planDate);      // 计划日期
            plan.setContent(planDTO.getContent()); // 计划内容
            plan.setPlanType(planDTO.getPlanType()); // 计划类型
            plan.setRemindTime(planDTO.getRemindTime()); // 提醒时间（可选）
            plan.setIsDeleted(0);           // 未删除

            // 5. 先删除同用户+同日期+同类型的旧计划（避免重复）
            planMapper.deleteByDateAndTypeAndUserId(planDate, planDTO.getPlanType(), userId);
            // 6. 插入新计划
            int insertRows = planMapper.insert(plan);

            if (insertRows > 0) {
                return Result.success("计划保存成功", plan.getId()); // 返回计划ID，方便前端存储
            } else {
                return Result.error("计划保存失败：插入数据库失败");
            }
        } catch (ParseException e) {
            return Result.error("日期格式错误：请使用yyyy-MM-dd格式（如2026-02-12）");
        } catch (Exception e) {
            e.printStackTrace(); // 打印异常栈，方便后端排查
            return Result.error("计划保存失败：" + e.getMessage());
        }
    }

    // ==================== 查询计划接口（GET /api/plan/get） ====================
    /**
     * 查询指定用户、指定日期、指定类型的计划
     * @param date 日期字符串（yyyy-MM-dd）
     * @param type 计划类型（long_term/memo/urgent）
     * @return 计划列表
     */
    @GetMapping("/get")
    public Result<?> getPlan(@RequestParam String date, @RequestParam String type) {
        // 1. 校验必填参数
        if (date == null || type == null) {
            return Result.error("参数错误：日期/类型不能为空");
        }

        try {
            // 2. 获取当前登录用户ID
            Long userId = UserContext.getUserId();
            if (userId == null) {
                return Result.error(401, "未登录，请先登录");
            }

            // 3. 转换日期字符串
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
            Date planDate = sdf.parse(date);

            // 4. 查询计划（仅查询当前用户的未删除计划）
            List<Plan> planList = planMapper.selectByDateAndTypeAndUserId(planDate, type, userId);

            return Result.success("查询成功", planList);
        } catch (ParseException e) {
            return Result.error("日期格式错误：请使用yyyy-MM-dd格式（如2026-02-12）");
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("查询计划失败：" + e.getMessage());
        }
    }

    // ==================== 删除计划接口（GET /api/plan/delete） ====================
    /**
     * 删除指定计划（校验归属，防止越权删除）
     * @param id 计划ID
     * @return 操作结果
     */
    @GetMapping("/delete")
    public Result<?> deletePlan(@RequestParam Long id) {
        // 1. 校验参数
        if (id == null || id <= 0) {
            return Result.error("参数错误：计划ID无效");
        }

        try {
            // 2. 获取当前登录用户ID
            Long userId = UserContext.getUserId();
            if (userId == null) {
                return Result.error(401, "未登录，请先登录");
            }

            // 3. 校验计划归属（只能删除自己的计划）
            Plan plan = planMapper.selectById(id);
            if (plan == null) {
                return Result.error("计划不存在：ID=" + id);
            }
            if (!plan.getUserId().equals(userId)) {
                return Result.error(403, "无权删除他人的计划");
            }

            // 4. 逻辑删除（更新is_deleted=1）
            int deleteRows = planMapper.deleteById(id);

            if (deleteRows > 0) {
                return Result.success("计划删除成功");
            } else {
                return Result.error("计划删除失败：数据库更新失败");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("删除计划失败：" + e.getMessage());
        }
    }
}