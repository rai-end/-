package com.example.littleappbackend.utils;

/**
 * 存储当前登录用户的ID（基于ThreadLocal，保证多线程安全）
 */
public class UserContext {
    private static final ThreadLocal<Long> USER_ID = new ThreadLocal<>();

    // 设置当前用户ID
    public static void setUserId(Long userId) {
        USER_ID.set(userId);
    }

    // 获取当前用户ID
    public static Long getUserId() {
        return USER_ID.get();
    }

    // 清除当前用户ID（避免内存泄漏）
    public static void removeUserId() {
        USER_ID.remove();
    }
}
