#!/bin/bash

# 简单快速备份脚本
# 适合个人开发使用

DATE=$(date +%Y%m%d_%H%M%S)
current_branch=$(git branch --show-current)

echo "🔄 快速备份当前分支: $current_branch"

# 创建备份分支
backup_name="${current_branch}_backup_${DATE}"
git branch "$backup_name" "$current_branch"

echo "✅ 备份完成: $backup_name"
echo "💡 如需恢复: git checkout $backup_name"
