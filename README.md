# STYLE GLAMOUR BEATS

Website bán hàng demo (HTML/CSS/JS) + Node/Express API tuỳ chọn.

## Đường dẫn đúng (hiện tại)

- GitHub repo: https://github.com/NguyenHoangPhuc2003i/SGB_Shop
- GitHub Pages (trang web): https://nguyenhoangphuc2003i.github.io/SGB_Shop/
- Trang chủ thực tế: `index.html` tự chuyển hướng sang `SGBweb.html`.

## Chạy local

### Cách 1: Chạy full bằng Node server (khuyến nghị)

```powershell
Set-Location -LiteralPath "c:\project cá nhân\webfake\SGB_Shop"
npm install
npm start
```

Mở web tại:
- http://127.0.0.1:3000/
- hoặc http://127.0.0.1:3000/SGBweb.html

### Cách 2: Chạy static nhanh

```powershell
Set-Location -LiteralPath "c:\project cá nhân\webfake\SGB_Shop"
python -m http.server 8000
```

Mở web tại:
- http://127.0.0.1:8000/
- hoặc http://127.0.0.1:8000/SGBweb.html

## Deploy GitHub Pages

Repo đã có workflow [pages.yml](.github/workflows/pages.yml) để deploy tự động từ branch `main`.

Sau khi push:
1. Vào GitHub → Settings → Pages.
2. Source chọn **GitHub Actions**.
3. Chờ workflow chạy xong, web live tại: https://nguyenhoangphuc2003i.github.io/SGB_Shop/

## Firebase (tuỳ chọn, theo hybrid strategy)

Mặc định backend hiện chạy theo chế độ đồng bộ Firebase liên tục:
- Firestore cho toàn bộ dữ liệu vận hành (`*`): `users`, `orders`, `ai_logs`, `products`, `categories`, `coupons`, `banners`, `support_requests`, `hero_media`.
- JSON local vẫn được giữ làm backup/mirror khi `JSON_BACKUP_ENABLED=true`.

Thiết lập nhanh:

```powershell
Set-Location -LiteralPath "c:\project cá nhân\webfake\SGB_Shop"
$env:FIREBASE_ENABLED = "true"
$env:FIREBASE_CREDENTIALS = "D:\keys\firebase-service-account.json"
$env:FIREBASE_COLLECTIONS = "*"
npm start
```

Biến môi trường hữu ích:
- `FIREBASE_COLLECTIONS`: danh sách collection dùng Firestore, hỗ trợ `*` để dùng cho tất cả collection (mặc định `*`).
- `JSON_BACKUP_ENABLED`: `true/false`, khi `true` sẽ mirror dữ liệu Firestore xuống file JSON local để backup.

Hoặc dùng biến mặc định của Firebase Admin SDK:

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS = "D:\keys\firebase-service-account.json"
$env:FIREBASE_ENABLED = "true"
npm start
```

Lưu ý bảo mật:
- Không commit file key thật.
- Dùng file mẫu: `scripts/firebase-service-account.example.json`.

## AI Stylist (tuỳ chọn)

Trang: `style-advisor.html`

Nếu muốn gọi cloud model:

```powershell
Set-Location -LiteralPath "c:\project cá nhân\webfake\SGB_Shop"
$env:OPENAI_API_KEY = "<your-openai-key>"
# optional
$env:OPENAI_MODEL = "gpt-4o-mini"
npm start
```

## Ghi chú

- Static hosting (GitHub Pages/Netlify) không chạy được API Node `/api/*`.
- Mode demo static sẽ fallback sang localStorage cho auth.
- Nếu cần backend thật, deploy `server.js` lên Render/Railway/Fly.io và trỏ lại API.
