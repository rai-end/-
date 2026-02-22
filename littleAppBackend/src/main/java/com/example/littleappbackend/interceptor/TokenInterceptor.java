package com.example.littleappbackend.interceptor;

import com.example.littleappbackend.entity.UserAccount;
import com.example.littleappbackend.mapper.UserAccountMapper;
import com.example.littleappbackend.utils.UserContext;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * 拦截所有请求，解析Token获取用户ID，存入UserContext
 */
@Component
public class TokenInterceptor implements HandlerInterceptor {

    @Resource
    private UserAccountMapper userAccountMapper;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // 1. 获取请求头中的Token
        String authorization = request.getHeader("Authorization");
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            response.setStatus(401); // 未授权
            return false;
        }
        String token = authorization.substring(7); // 去掉"Bearer "前缀

        // 2. 模拟从Token解析用户ID（实际项目用JWT，这里简化：token=用户ID）
        // 注：真实项目中，Token应存储用户ID+过期时间，这里为了演示，直接把用户ID作为Token
        Long userId;
        try {
            userId = Long.parseLong(token);
        } catch (NumberFormatException e) {
            response.setStatus(401);
            return false;
        }

        // 3. 验证用户是否存在
        UserAccount user = userAccountMapper.selectById(userId);
        if (user == null) {
            response.setStatus(401);
            return false;
        }

        // 4. 将用户ID存入ThreadLocal，供后续业务使用
        UserContext.setUserId(userId);
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        // 清除ThreadLocal中的用户ID，避免内存泄漏
        UserContext.removeUserId();
    }
}