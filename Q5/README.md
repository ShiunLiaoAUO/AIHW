# AI Agent 實作工作坊 v8（JavaScript 版）

by eddie@5xcampus.com

JavaScript / Node.js 版的 AI Agent 教學課程，用 OpenAI Node SDK v6
（Responses API）、`@openai/agents`、Qdrant 與 MCP 實作。

## 章節進度（分支）

| 分支 | 主題 |
|------|------|
| `0.1-hello-world` | 起步 |
| `1.1-setup-env` | dotenv 環境變數 |
| `1.2-openai-api` | 第一次 Responses API 呼叫 |
| `1.3-openai-api-loop` | 對話迴圈 |
| `1.4-openai-api-with-memory` | lowdb 對話記憶 |
| `2.1-tool-calling-1` | tool calling 概念 |
| `2.2-tool-calling-2` | 真實 OpenWeather tool |
| `2.3-tool-calling-3` | 多 tool + 有上限的多輪 loop |
| `2.4-tool-calling-youbike` | YouBike API + Haversine |
| `2.5-tool-calling-current-time` | Zod schema 與執行期驗證 |
| `3.1-rag-text-to-vector` | Qdrant + Netflix embedding |
| `3.2-rag-search-text` | 語意搜尋 |
| `3.3-rag-tool` | RAG 包成 tool |
| `3.4-rag-for-pdf` | PDF RAG + recursive splitting |
| `4.1-agents-sdk` | Agents SDK 多 agent + handoff |

## 開發環境

GitHub Codespaces 會依 `.devcontainer/devcontainer.json` 建立 Node.js 22
環境。也可以在本機使用 Node.js 22+。

```bash
npm install
cp .env.example .env
npm start
```

章節 3 起另需 Qdrant；天氣工具另需 OpenWeather API key。金鑰只放在
`.env` 或 Codespaces secrets，不要提交到 Git。


```
@ShiunLiaoAUO ➜ /workspaces/AIHW/Q5 (main) $ npm start

> ai-agent-js-v8@0.1.0 start
> node main.js

[AGENTS.md] 已載入 /workspaces/AIHW/Q5/AGENTS.md
[tenlong-tools MCP server] running on stdio
✔ 請輸入你的問題： 請問 CSS Grid 跟 Flexbox 差在哪裡？RWD 怎麼寫？

[由 CSS 老師 回答]
CSS Grid 跟 Flexbox 的差異，最簡單可以這樣理解：

- **Flexbox：一維排版**
  - 主要處理 **一排（橫向）** 或 **一列（直向）**
  - 適合：導覽列、按鈕排列、卡片內部對齊、置中
- **Grid：二維排版**
  - 同時處理 **列 + 欄**
  - 適合：整個頁面版型、卡片牆、儀表板、複雜區塊布局

---

## 1. Flexbox 是什麼？

Flexbox 比較像「沿著一條軸線排版」。

### 常用情境
- Navbar 內的選單
- 圖示與文字水平排列
- 元素水平置中、垂直置中
- 一排卡片自動分配寬度

### 範例
```css
.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
```

### 常見特性
- `justify-content`：主軸對齊
- `align-items`：交叉軸對齊
- `flex-direction`：決定橫排或直排
- `gap`：項目間距

---

## 2. Grid 是什麼？

Grid 比較像「先畫好格子，再把東西放進去」。

### 常用情境
- 首頁整體版型
- 圖片/卡片網格
- 左側欄 + 主內容 + 右側欄
- 需要明確控制列與欄

### 範例
```css
.container {
  display: grid;
  grid-template-columns: 200px 1fr 300px;
  gap: 16px;
}
```

### 常見特性
- `grid-template-columns`：欄寬
- `grid-template-rows`：列高
- `gap`：格線間距
- `grid-column` / `grid-row`：控制元素跨幾欄幾列

---

## 3. Flexbox 跟 Grid 怎麼選？

### 用 Flexbox 的時機
- 內容是一條線排開
- 元素彼此大小可能不同
- 只需要控制「一個方向」的排列

### 用 Grid 的時機
- 你在設計整體版面
- 需要列與欄一起控制
- 版型比較規則、像表格一樣

### 簡單口訣
- **一維用 Flexbox**
- **二維用 Grid**

---

# RWD 怎麼寫？

RWD（響應式網頁設計）就是讓網頁在不同螢幕尺寸下，版面自動調整。

---

## 1. 先加 viewport

這是 RWD 很重要的一步，放在 `<head>`：

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

---

## 2. 使用百分比、rem、vw 等相對單位

不要太常寫死像 `width: 1200px`，比較容易爆版。

### 常見做法
```css
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}
```

### 常用相對單位
- `%`：相對父層
- `rem`：相對根字型大小
- `vw` / `vh`：相對視窗寬高
- `fr`：Grid 專用彈性單位

---

## 3. 用 Media Query

最基本的 RWD 寫法就是媒體查詢。

### 範例：手機版、平板、桌機
```css
.container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 768px) {
  .container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .container {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

這代表：
- 手機：1 欄
- 平板：2 欄
- 桌機：3 欄

---

## 4. 先做小螢幕，再加大螢幕

這是比較推薦的寫法，叫做 **Mobile First**。

### 寫法重點
- 預設樣式先給手機
- 螢幕變大後再用 `min-width` 覆蓋

### 例子
```css
.card {
  width: 100%;
}

@media (min-width: 768px) {
  .card {
    width: 50%;
  }
}
```

---

## 5. 常見 RWD 排版範例

### Flexbox RWD
```css
.row {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

@media (min-width: 768px) {
  .row {
    flex-direction: row;
  }
}
```

### Grid RWD
```css
.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1200px) {
  .grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

---

# 給你一個實戰建議

## 如果是「一排內容」：
用 **Flexbox**

例如：
- header 導覽列
- 按鈕群組
- 圖片 + 文字

## 如果是「整頁版型」：
用 **Grid**

例如：
- 首頁區塊
- 商品列表
- Dashboard

## 如果是「RWD」：
常常是 **Grid / Flexbox + Media Query** 一起用

---

# 一句話總結

- **Flexbox**：處理單一方向的排列
- **Grid**：處理列與欄的整體版型
- **RWD**：用相對單位 + Media Query，讓版面依螢幕自動調整

---

如果你想，我也可以直接幫你整理成：
1. **Flexbox vs Grid 對照表**
2. **RWD 常用 Media Query 尺寸**
3. **一個完整的 RWD 網頁範例**  
你可以直接選一個，我幫你寫。

✔ 請輸入你的問題： 請問 PHP 怎麼宣告陣列？

[由 PHP 老師 回答]
PHP 宣告陣列有幾種常見寫法，最基本的是這兩種：

---

## 1. 傳統寫法 `array()`

```php
$fruits = array("apple", "banana", "orange");
```

---

## 2. 短語法 `[]`（PHP 5.4+）

```php
$fruits = ["apple", "banana", "orange"];
```

這兩種效果一樣，現在通常都用 `[]`，比較簡潔。

---

# 陣列的幾種型態

## 1. 索引陣列
沒有特別指定 key，PHP 會從 `0` 開始自動編號。

```php
$fruits = ["apple", "banana", "orange"];
```

存取方式：

```php
echo $fruits[0]; // apple
```

---

## 2. 關聯陣列
自己指定 key，像是字典一樣。

```php
$user = [
    "name" => "John",
    "age" => 25,
    "city" => "Taipei"
];
```

存取方式：

```php
echo $user["name"]; // John
echo $user["age"];  // 25
```

---

## 3. 多維陣列
陣列裡面還有陣列。

```php
$users = [
    [
        "name" => "John",
        "age" => 25
    ],
    [
        "name" => "Mary",
        "age" => 30
    ]
];
```

存取方式：

```php
echo $users[0]["name"]; // John
echo $users[1]["age"];  // 30
```

---

# 常見操作

## 新增資料

```php
$fruits[] = "grape";
```

或

```php
$fruits[3] = "grape";
```

---

## 修改資料

```php
$fruits[1] = "melon";
```

---

## 印出陣列內容

```php
print_r($fruits);
```

如果想看得更清楚，可以用：

```php
echo "<pre>";
print_r($fruits);
echo "</pre>";
```

---

# 補充：如何判斷是不是陣列

```php
if (is_array($fruits)) {
    echo "這是陣列";
}
```

---

如果你要，我也可以接著幫你整理：
- **PHP 陣列的常用函式**
- **陣列迴圈 foreach 怎麼寫**
- **關聯陣列在 Laravel 常見用法**

✔ 請輸入你的問題： 現在幾點？

[由 班導師 回答]
現在是 **2026/9/23 下午 3:47:59（台灣時間）**。

✔ 請輸入你的問題： 請問台北現在的天氣如何？

[由 班導師 回答]
台北目前天氣是 **晴，少雲**，溫度約 **30.0°C**，濕度 **59%**。

✔ 請輸入你的問題： EXIT
再會~

```