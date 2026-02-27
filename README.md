# Nebula Notes (Supabase Edition)

這是一個以 Next.js + Prisma 建立的個人網站，現在已改成使用 **Supabase PostgreSQL** 儲存資料。

目前會存進資料庫的內容包含：

- 所有貼文（`Post`）
- 網站內容與首頁文案（`Profile`）
- 後台管理員帳密（`AdminUser`，僅存 bcrypt hash，不存明碼）

## Tech Stack

- Next.js 16 (App Router, Server Actions)
- TypeScript + Tailwind CSS v4
- Prisma ORM + Supabase PostgreSQL
- bcryptjs + jose (登入驗證與 session)

## 1) 本地啟動

```bash
npm install
cp .env.example .env
```

接著填好 `.env`：

- `DATABASE_URL`: Supabase pooler 連線字串（給 App Runtime）
- `DIRECT_URL`: Supabase direct 連線字串（給 Prisma migrate）
- `AUTH_SECRET`: JWT 簽章金鑰，建議 32 字元以上
- `SEED_ADMIN_EMAIL`: 種子管理員帳號
- `SEED_ADMIN_PASSWORD_HASH`: 種子管理員密碼 hash（bcrypt）

產生 bcrypt hash：

```bash
npm run hash:admin -- "yourStrongPassword"
```

## 2) 初始化 Supabase 資料庫

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

如果你要隨時更新後台帳密，可直接用：

```bash
npm run admin:upsert -- "admin@example.com" "newPassword"
```

也可傳入已經算好的 bcrypt hash 當第二個參數。

## 3) 開發模式

```bash
npm run dev
```

- 前台：`http://localhost:3000`
- 後台登入：`http://localhost:3000/admin/login`

## Supabase 手把手建置

### Step A - 建立專案

1. 到 Supabase 建立新專案。
2. 選區域（盡量靠近你的伺服器或使用者）。
3. 記下你設定的 Database 密碼。

### Step B - 取得連線字串

1. 進入 Supabase Dashboard -> `Project Settings` -> `Database`。
2. 找到兩組 Connection String：
   - **Transaction pooler**: 放到 `DATABASE_URL`
   - **Direct connection**: 放到 `DIRECT_URL`

`DATABASE_URL` 範例：

```env
DATABASE_URL="postgresql://postgres.<project-ref>:<password>@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
```

`DIRECT_URL` 範例：

```env
DIRECT_URL="postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres"
```

### Step C - 套用 Prisma 結構

在專案根目錄執行：

```bash
npm run db:generate
npm run db:migrate
```

這會建立 `Post`、`Profile`、`AdminUser` 資料表。

### Step D - 匯入初始資料

1. 設定 `.env` 的 `SEED_ADMIN_EMAIL`、`SEED_ADMIN_PASSWORD_HASH`。
2. 執行：

```bash
npm run db:seed
```

完成後就能用 seed 的帳密登入後台。

### Step E - 部署到 Vercel (可選)

1. 在 Vercel 專案環境變數設定以下鍵值：
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `AUTH_SECRET`
2. 重新部署。
3. 部署後執行一次 migration（建議在 CI 或本機連正式 DB 執行 `npm run db:deploy`）。

## 安全注意事項

- `AdminUser.passwordHash` 是 bcrypt hash，不存明碼。
- `AUTH_SECRET` 僅放在環境變數，不可提交到 git。
- `.env*` 需保持在 `.gitignore`。
- 管理後台 mutation 都有 server-side session 檢查。

## 常用指令

- `npm run dev`：本地開發
- `npm run lint`：程式碼檢查
- `npm run build`：產線建置檢查
- `npm run db:generate`：重新產生 Prisma Client
- `npm run db:migrate`：套用 migration
- `npm run db:deploy`：正式環境套用 migration
- `npm run db:seed`：匯入初始資料
- `npm run db:studio`：開 Prisma Studio
- `npm run hash:admin -- "password"`：產生 bcrypt hash
- `npm run admin:upsert -- "email" "password"`：建立/更新後台帳號
