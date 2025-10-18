#!/bin/bash

# --- 請在這裡填寫您所有的 API Keys ---
# 每個 Key 用引號包起來，用空格隔開
KEYS=(
  "AIzaSyAYcB_T8kgkTjYpuE-w81U13Pf8lD5lplA"
  "AIzaSyDPxZ2weHNMc2gYOHiZ9iZOjSqz2ZS3H_s"
  "AIzaSyAyQoAoZz8RABcZW5bAufmIX_MvWWCOXyM"
  "AIzaSyCnzW9Z_65y2RsbQrW_T9boa_91uO6Eea0"
  "AIzaSyALM3QM5D7JfcW-ZRUrGlDH-vj_LFfZFDk"
  # 如果有更多 Key，請繼續往下加
)
# ------------------------------------

# 讓使用者選擇用哪個 Key
echo "🔑 請選擇要使用的 Gemini API Key："

# 動態產生選項列表
for i in "${!KEYS[@]}"; do
  # 為了隱私，只顯示 Key 的部分字符
  key_display="${KEYS[$i]:0:8}...${KEYS[$i]: -4}"
  echo "  $((i+1))) Key $((i+1)) ($key_display)"
done
echo ""

# 讀取使用者的輸入
read -p "請輸入編號 (1-${#KEYS[@]}): " choice

# 驗證輸入是否為數字且在範圍內
if ! [[ "$choice" =~ ^[0-9]+$ ]] || [ "$choice" -lt 1 ] || [ "$choice" -gt "${#KEYS[@]}" ]; then
  echo "❌ 輸入錯誤，請輸入有效的編號。"
  exit 1
fi

# 根據選擇設定對應的 Key
SELECTED_KEY=${KEYS[$((choice-1))]}

echo "✅ 正在使用 Key $choice 啟動 gemini..."
echo "--- 注意：由於您的 gemini CLI 版本限制，對話歷史將無法自動保存和載入 ---"

# --- 核心邏輯：設定代理和 API Key 並啟動 gemini ---
# 下一行命令會同時設定代理 (Proxy)。
# 如果您不需要代理，請將 "HTTPS_PROXY=..." 和 "HTTP_PROXY=..." 這兩個部分刪除。
HTTPS_PROXY="http://127.0.0.1:7890" HTTP_PROXY="http://127.0.0.1:7890" GEMINI_API_KEY=$SELECTED_KEY gemini

echo "----------------------------------------"
echo "👋 對話已結束。若要切換 Key，請再次執行 ./gemini.sh"