# AI Agent 實作工作坊 v8（JavaScript 版）

by eddie@5xcampus.com

這個 repo 以 Git 分支保存每一個教學進度。切到教材對應的
分支後，開啟 GitHub Codespaces 即可直接使用 Node.js 22。

```
@ShiunLiaoAUO ➜ /workspaces/AIHW/Q4 (main) $ node function_call.js
=== AI 智慧助理（支援時間與天氣查詢）已啟動 ===
提示：輸入問題後按 Enter，輸入 exit 可離開。

✔ 請輸入您的問題： 現在幾點？

[系統自動呼叫工具] get_current_time({})

AI 回覆：現在是台灣時間 **2026 年 9 月 23 日下午 3:35**。

✔ 請輸入您的問題： 台北天氣如何？

[系統自動呼叫工具] get_weather({"city":"Taipei"})

AI 回覆：台北目前天氣晴朗，氣溫約 **30.3°C**，濕度約 **58%**。外出建議做好防曬並適時補充水分。

✔ 請輸入您的問題： 現在幾點？台北天氣好嗎？

[系統自動呼叫工具] get_current_time({})

[系統自動呼叫工具] get_weather({"city":"Taipei"})

AI 回覆：現在是 **2026 年 9 月 23 日下午 3:36**。

台北目前 **晴天**，氣溫約 **30.3°C**、濕度 **58%**；天氣不錯，但氣溫偏高，外出記得防曬並適時補充水分。

✔ 請輸入您的問題： EXIT
再會~
```