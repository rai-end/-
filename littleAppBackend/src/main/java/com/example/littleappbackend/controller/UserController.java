package com.example.littleappbackend.controller;

import com.example.littleappbackend.common.Result;
import com.example.littleappbackend.entity.UserAccount;
import com.example.littleappbackend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    // ====================== 登录 ======================
    @PostMapping("/login")
    public Result<?> login(@RequestBody UserAccount user) {
        if (user.getUsername() == null || user.getUsername().isBlank()) {
            return Result.error("用户名不能为空");
        }
        if (user.getPassword() == null || user.getPassword().isBlank()) {
            return Result.error("密码不能为空");
        }

        UserAccount loginUser = userService.login(user.getUsername(), user.getPassword());
        if (loginUser == null) {
            return Result.error("用户名或密码错误");
        }

        Map<String, Object> data = new HashMap<>();
        data.put("token", loginUser.getId().toString());
        data.put("user", loginUser);
        return Result.success("登录成功", data);
    }

    // ====================== 注册 ======================
    @PostMapping("/register")
    public Result<?> register(@RequestBody UserAccount user) {
        if (user.getUsername() == null || user.getUsername().isBlank()) {
            return Result.error("用户名不能为空");
        }
        if (user.getPassword() == null || user.getPassword().isBlank()) {
            return Result.error("密码不能为空");
        }

        boolean success = userService.register(user);

        if (!success) {
            // 这里就是用户名已存在
            return Result.error("用户名已存在");
        }

        return Result.success("注册成功");
    }
}