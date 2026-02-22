package com.example.littleappbackend.service;

import com.example.littleappbackend.entity.UserAccount;

/**
 * 用户注册/登录的Service接口（定义业务方法）
 * 接口只声明方法，具体实现写在impl文件夹的实现类中
 */
public interface UserService {

    /**
     * 用户注册
     * @param user 前端传递的用户信息（用户名+密码）
     * @return 注册结果：true=成功，false=失败（用户名已存在）
     */
    boolean register(UserAccount user);

    /**
     * 用户登录
     * @param username 用户名
     * @param password 密码（前端明文，后端加密后校验）
     * @return 登录成功返回用户信息，失败返回null
     */
    UserAccount login(String username, String password);
}