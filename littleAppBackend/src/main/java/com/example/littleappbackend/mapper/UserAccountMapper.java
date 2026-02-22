package com.example.littleappbackend.mapper;

import com.example.littleappbackend.entity.UserAccount;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

/**
 * 用户账号的Mapper接口（MyBatis注解版，操作t_user_account表）
 * @Mapper 注解：告诉MyBatis这是Mapper接口，自动生成实现类
 */
@Mapper
public interface UserAccountMapper {

    /**
     * 根据用户名查询用户（注册/登录都需要）
     * @Select 注解：执行SQL查询
     */
    @Select("SELECT * FROM t_user_account WHERE username = #{username}")
    UserAccount selectByUsername(String username);

    // UserAccountMapper.java 新增方法
    @Select("SELECT * FROM t_user_account WHERE id = #{id}")
    UserAccount selectById(Long id);
    /**
     * 插入新用户（注册用）
     * @Insert 注解：执行SQL插入
     * @return 受影响的行数（1=成功，0=失败）
     */
    @Insert("INSERT INTO t_user_account (username, password) VALUES (#{username}, #{password})")
    int insert(UserAccount user);
}
