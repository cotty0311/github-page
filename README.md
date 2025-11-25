# Personal Page — 靜態展示

簡單靜態頁面，從 `src/data/history-*.json` 讀取並顯示資料。

本機預覽：

```bash
cd /Users/cotty/Documents/Project/Pages/personal_page
python3 -m http.server 8000
# 打開瀏覽器 http://localhost:8000
```

部署到 GitHub Pages（手動）：
- 推送到 GitHub 的 `main` 分支（或你要使用的分支）。
- 在 GitHub Repo → Settings → Pages，選擇 Branch: `main`、Folder: `/ (root)`。

如果你希望我幫你建立自動部署（GitHub Actions），告訴我我會為你加入 workflow。