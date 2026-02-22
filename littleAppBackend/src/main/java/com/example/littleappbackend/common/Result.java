package com.example.littleappbackend.common;

import lombok.Data;

@Data
public class Result<T> {
    private int code;       // 状态码：200成功，401未登录，403无权限，500错误
    private String msg;     // 提示信息
    private T data;         // 返回数据

    // ========== 新增：无参数的success方法（解决核心报错） ==========
    public static <T> Result<T> success() {
        Result<T> result = new Result<>();
        result.setCode(200);
        result.setMsg("操作成功"); // 默认提示语
        result.setData(null);
        return result;
    }

    // 成功响应（带提示语，无数据）
    public static <T> Result<T> success(String msg) {
        Result<T> result = new Result<>();
        result.setCode(200);
        result.setMsg(msg);
        result.setData(null);
        return result;
    }

    // 成功响应（带提示语+数据）
    public static <T> Result<T> success(String msg, T data) {
        Result<T> result = new Result<>();
        result.setCode(200);
        result.setMsg(msg);
        result.setData(data);
        return result;
    }

    // 错误响应（默认500状态码）
    public static <T> Result<T> error(String msg) {
        Result<T> result = new Result<>();
        result.setCode(500);
        result.setMsg(msg);
        result.setData(null);
        return result;
    }

    // 错误响应（自定义状态码）
    public static <T> Result<T> error(int code, String msg) {
        Result<T> result = new Result<>();
        result.setCode(code);
        result.setMsg(msg);
        result.setData(null);
        return result;
    }
}