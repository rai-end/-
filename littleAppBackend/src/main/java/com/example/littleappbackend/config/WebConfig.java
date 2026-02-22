package com.example.littleappbackend.config;

import com.example.littleappbackend.interceptor.TokenInterceptor;
import jakarta.annotation.Resource;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Resource
    private TokenInterceptor tokenInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // 拦截所有/api/plan/**请求（计划相关），排除登录/注册接口
        registry.addInterceptor(tokenInterceptor)
                .addPathPatterns("/api/plan/**")
                .excludePathPatterns("/api/user/login", "/api/user/register");
    }
}