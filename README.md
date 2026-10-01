特教教學使用

## 直式乘法教學與學習單

[數學互動式乘法與學習單產生](數學互動式乘法與學習單產生.html) 提供七種題型：一位×一位、二位×一位、二位×二位、三位×一位、三位×二位、三位×三位、四位×一位。
支援隨機出題、自訂數字、對應乘法表、數字鍵盤、部分積與進位提示、逐格答案檢查。
學習單可選 5／10／15／20 題，提供 A4 預覽、列印或另存 PDF，以及 Word 相容 HTML 格式的 `.doc` 下載（沿用除法工具的相容方式，並非原生 `.docx`）。可另附參考答案頁。
此乘法工具不需要外部 CDN；保留 `assets/multiplication.js` 即可在本機使用。

計算與學習單測試：`node --test tests/multiplication.test.cjs`。

原始 GitHub 儲存庫：[happy690331/teacher](https://github.com/happy690331/teacher)

線上網站：[AI教學遊戲天地](https://happy690331.github.io/teacher/)

## 本機預覽

本專案已包含網站 HTML、遊戲預覽圖、`images/` 圖卡、`exam paper/` 與 `exam paper2/` 考卷。
在專案資料夾執行：

```powershell
node scripts/generate-catalog.mjs
python -m http.server 8000
```

使用瀏覽器開啟 http://localhost:8000/ 。首頁也可直接開啟 `index.html`，但需要讀取檔案或使用相機的遊戲建議透過本機伺服器或 HTTPS 網站使用。
原網站使用的外部 CDN、Google 字型、AI 服務與部分遊戲的 GitHub API 功能仍需網路；本專案不是完全離線版本。

## GitHub Pages 自動部署

1. 儲存庫 **Settings → Pages → Build and deployment → Source** 選擇 **GitHub Actions**。
2. 將修改提交並推送至 `main` 分支。
3. **Actions → Deploy static content to Pages** 會自動更新遊戲清單並部署，也可選擇 **Run workflow** 手動執行。
4. 部署成功後，網站位址為 https://happy690331.github.io/teacher/ 。

工作流程設定：`.github/workflows/static.yml`。
新增遊戲時，將 `.html` 放在專案根目錄，預覽圖使用同名 `.jpg`、`.png`、`.jpeg` 或 `.webp`。
執行 `node scripts/generate-catalog.mjs` 後一併提交 `games.js`；部署時也會自動重新產生。
首頁使用本地清單與相對連結，不需透過 GitHub API 取得遊戲列表。

部署方式參考：[GitHub Pages 自訂工作流程官方文件](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。

本次新增四選一版本：

- [數學基礎計算合作打怪遊戲｜四選一版](數學基礎計算合作打怪遊戲_四選一版.html)
- [數學基礎計算合作打怪遊戲｜三人四選一版](數學基礎計算合作打怪遊戲_三人四選一版.html)
- [數學魔法對戰遊戲｜四選一版](數學魔法對戰遊戲_四選一版.html)
- [數學基礎計算拔河遊戲恐龍殭屍版｜四選一版](數學基礎計算拔河遊戲恐龍殭屍版_四選一版.html)
