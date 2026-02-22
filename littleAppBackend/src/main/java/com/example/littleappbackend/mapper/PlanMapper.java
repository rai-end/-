package com.example.littleappbackend.mapper;

import com.example.littleappbackend.entity.Plan;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;
import org.apache.ibatis.annotations.Options;

import java.util.Date;
import java.util.List;

@Mapper
public interface PlanMapper {
    // 按日期+类型+用户ID删除旧计划
    @Update("UPDATE t_plan SET is_deleted = 1 WHERE plan_date = #{planDate} AND plan_type = #{planType} AND user_id = #{userId}")
    int deleteByDateAndTypeAndUserId(Date planDate, String planType, Long userId);

    // 插入新计划（自动生成主键ID）
    @Insert("INSERT INTO t_plan (user_id, plan_date, content, plan_type, remind_time, is_deleted) " +
            "VALUES (#{userId}, #{planDate}, #{content}, #{planType}, #{remindTime}, #{isDeleted})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(Plan plan);

    // 按ID查询计划
    @Select("SELECT * FROM t_plan WHERE id = #{id}")
    Plan selectById(Long id);

    // 按日期+类型+用户ID查询计划
    @Select("SELECT * FROM t_plan WHERE plan_date = #{planDate} AND plan_type = #{planType} AND user_id = #{userId} AND is_deleted = 0")
    List<Plan> selectByDateAndTypeAndUserId(Date planDate, String planType, Long userId);

    // 按ID逻辑删除计划
    @Update("UPDATE t_plan SET is_deleted = 1 WHERE id = #{id}")
    int deleteById(Long id);
}