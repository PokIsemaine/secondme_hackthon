# AI Match API - Timeout Fix Specification

## Overview

为智能匹配 API 添加超时机制和更好的错误处理。

## Requirements

### Timeout

- fetch 请求使用 AbortController 设置 30 秒超时
- 超时时返回 code: 408，message: '请求超时，请重试'

### Error Handling

- 区分超时错误、网络错误、API 错误
- 日志记录错误详情便于调试
