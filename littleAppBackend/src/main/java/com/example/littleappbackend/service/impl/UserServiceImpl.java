package com.example.littleappbackend.service.impl;

import com.example.littleappbackend.entity.UserAccount;
import com.example.littleappbackend.mapper.UserAccountMapper;
import com.example.littleappbackend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserAccountMapper userAccountMapper;

    @Override
    public boolean register(UserAccount user) {
        // 1. 检查是否已存在
        UserAccount exist = userAccountMapper.selectByUsername(user.getUsername());
        if (exist != null) {
            // 用户名已存在 → 正常返回false，不抛异常！
            return false;
        }

        // 2. 密码不加密（你现在是测试阶段）
        // 3. 插入
        int rows = userAccountMapper.insert(user);
        return rows > 0;
    }

    @Override
    public UserAccount login(String username, String password) {
        UserAccount user = userAccountMapper.selectByUsername(username);
        if (user == null) {
            return null;
        }
        // 明文匹配（你现在没加密）
        if (user.getPassword().equals(password)) {
            return user;
        }
        return null;
    }
}