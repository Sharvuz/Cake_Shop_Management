## using Angular CLI version 21.2.10.

### mở terminal 1
	cd Backend
	dotnet watch run --project CakeSoft.Api
### mở terminal 2
	cd cake-soft-web
	npm install
	npm run start
done

### account seed:
    admin
    Admin@123

    employee1
    Employee@123

    employee2
    Employee@123
    
    employee3
    Employee@123

## 📋 Yêu Cầu Hệ Thống

### Backend Requirements:
- **.NET Framework**: `.NET 10.0` (LTS)
- **Runtime**: .NET 10 Runtime
- **Database**: SQL Server 2019+ hoặc SQL Server Express
- **Tools**: Visual Studio 2022 hoặc VS Code + C# Extension

### Frontend Requirements:
- **Node.js**: v18.0.0 trở lên
- **npm**: 11.12.1 trở lên
- **Angular CLI**: 21.2.10
- **Trình duyệt**: Chrome, Firefox, Edge (phiên bản mới nhất)

### Cài Đặt .NET 10:
```bash
# Windows - Download từ
https://dotnet.microsoft.com/download/dotnet/10.0

# Kiểm tra phiên bản
dotnet --version
```

### Cài Đặt Node.js:
```bash
# Windows - Download từ
https://nodejs.org/

# Kiểm tra phiên bản
node --version
npm --version
```

---

## 🏗️ Kiến Trúc Hệ Thống

### 3-Tier Architecture (Ba Tầng)

```
┌─────────────────────────────────────────────────────────────┐
│         🎨 PRESENTATION LAYER (Frontend)                   │
│              Angular 21 Single Page App                     │
│    (Dashboard | Cake Management | Invoice | Auth)          │
└──────────────────────┬──────────────────────────────────────┘
                       │ RESTful API (HTTP/HTTPS)
                       │ JSON Data Exchange
                       ↓
┌─────────────────────────────────────────────────────────────┐
│      📊 BUSINESS LOGIC LAYER (Backend)                      │
│           .NET 10 Web API - Controllers                     │
│  AuthController | CakeController | InvoiceController       │
│  DashboardController | WeatherForecastController           │
└──────────────────────┬──────────────────────────────────────┘
                       │ Services Layer
                       ├─ AuthService
                       ├─ CakeService
                       ├─ InvoiceService
                       └─ DashboardService
                       ↓
┌─────────────────────────────────────────────────────────────┐
│      💾 DATA ACCESS LAYER (DAL)                             │
│        Entity Framework Core 10                             │
│    AppDbContext | Database Migrations                       │
└──────────────────────┬──────────────────────────────────────┘
                       │ Entity Mapping
                       ↓
┌─────────────────────────────────────────────────────────────┐
│         🗄️ DATABASE LAYER                                    │
│            SQL Server Database                              │
│    (Users | Cakes | Categories | Invoices | Details)      │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Cấu Trúc Dự Án

```
Cake_management/
├── README.md                          # File hướng dẫn này
├── BAO_CAO_DA_NGHANH_QUAN_LY_QUAN_BANH_NGOT.md  # Báo cáo đồ án
│
├── Backend/
│   ├── CakeSoft.Api.slnx               # Solution file
│   │
│   ├── CakeSoft.Api/                   # Main Web API Project
│   │   ├── Program.cs                  # Entry point & DI configuration
│   │   ├── appsettings.json            # Config chung
│   │   ├── appsettings.Development.json # Config development
│   │   ├── CakeSoft.Api.csproj         # Project file (.NET 10)
│   │   ├── Controllers/                # API Endpoints
│   │   │   ├── AuthController.cs
│   │   │   ├── CakeController.cs
│   │   │   ├── DashboardController.cs
│   │   │   ├── InvoiceController.cs
│   │   │   └── WeatherForecastController.cs
│   │   └── Properties/
│   │       └── launchSettings.json     # Debug settings
│   │
│   ├── CakeSoft.Api.BLL/               # Business Logic Layer
│   │   ├── CakeSoft.Api.BLL.csproj
│   │   └── Services/
│   │       ├── IAuthService.cs / AuthService.cs
│   │       ├── ICakeService.cs / CakeService.cs
│   │       ├── IDashboardService.cs / DashboardService.cs
│   │       └── IInvoiceService.cs / InvoiceService.cs
│   │
│   ├── CakeSoft.Api.DAL/               # Data Access Layer
│   │   ├── CakeSoft.Api.DAL.csproj
│   │   ├── AppDbContext.cs             # EF Core DbContext
│   │   ├── SeedData.cs                 # Initial data
│   │   ├── Entities/                   # Database models
│   │   │   ├── AppUser.cs
│   │   │   ├── Cake.cs
│   │   │   ├── CakeCategory.cs
│   │   │   ├── Invoice.cs
│   │   │   └── InvoiceDetail.cs
│   │   ├── Migrations/                 # EF Migrations
│   │   │   ├── 20260513053822_InitialCreate.cs
│   │   │   ├── 20260513162418_AddCakeIsActive.cs
│   │   │   └── AppDbContextModelSnapshot.cs
│   │   └── SeedData/                   # JSON data files
│   │       ├── Bánh đông lạnh.json
│   │       ├── Bánh kem.json
│   │       ├── Bánh khô.json
│   │       ├── Bánh mì.json
│   │       ├── Bánh ngọt.json
│   │       └── Đồ uống.json
│   │
│   └── CakeSoft.Api.DTO/               # Data Transfer Objects
│       ├── CakeSoft.Api.DTO.csproj
│       ├── Auth/
│       │   └── AuthDtos.cs
│       ├── Cake/
│       │   └── CakeDtos.cs
│       ├── Dashboard/
│       │   └── DashboardDtos.cs
│       └── Invoice/
│           └── InvoiceDtos.cs
│
└── cake-soft-web/                      # Angular Frontend
    ├── package.json                    # npm dependencies
    ├── angular.json                    # Angular config
    ├── tsconfig.json                   # TypeScript config
    ├── tsconfig.app.json
    ├── tsconfig.spec.json
    ├── README.md
    ├── public/                         # Static assets
    ├── src/
    │   ├── index.html                  # Main HTML
    │   ├── main.ts                     # Angular bootstrap
    │   ├── styles.css                  # Global styles
    │   ├── app/
    │   │   ├── app.ts                  # Root component
    │   │   ├── app.routes.ts           # Routing config
    │   │   ├── app.config.ts           # App providers
    │   │   ├── core/                   # Core services
    │   │   ├── features/               # Feature modules
    │   │   │   ├── auth/               # Authentication
    │   │   │   ├── cake/               # Cake management
    │   │   │   ├── dashboard/          # Dashboard
    │   │   │   └── invoice/            # Invoice management
    │   │   └── layout/                 # Layout components
    │   └── environments/
    │       ├── environment.ts          # Dev environment
    │       └── environment.prod.ts     # Prod environment
    └── node_modules/                   # Dependencies (auto-generated)
```

---

## ⚙️ Cài Đặt

### Bước 1: Chuẩn Bị Môi Trường

#### Cài Đặt .NET 10
```bash
# Tải từ https://dotnet.microsoft.com/download/dotnet/10.0
# Hoặc dùng Chocolatey (Windows)
choco install dotnet-sdk-10.0

# Kiểm tra
dotnet --version  # Kết quả: 10.0.x
```

#### Cài Đặt Node.js & npm
```bash
# Tải từ https://nodejs.org/
# Hoặc dùng Chocolatey (Windows)
choco install nodejs

# Kiểm tra
node --version   # Kết quả: v18.0.0 trở lên
npm --version    # Kết quả: 11.12.1 trở lên
```

### Bước 2: Cấu Hình Database

#### Cập Nhật Connection String
```json
// Backend/CakeSoft.Api/appsettings.json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER;Database=CakeSoft;User Id=sa;Password=YOUR_PASSWORD;"
  }
}
```



### Bước 3: Cài Đặt Backend

```bash
cd Backend/CakeSoft.Api

# Restore NuGet packages
dotnet restore

# Build project
dotnet build

# Chạy application
dotnet run

# Kết quả:
# Application started at: https://localhost:5001
# Swagger UI: https://localhost:5001/swagger
```

### Bước 4: Cài Đặt Frontend

```bash
cd cake-soft-web

# Cài đặt npm dependencies
npm install

# Chạy development server
npm start

# Hoặc sử dụng Angular CLI
ng serve

# Kết quả:
# Application running on: http://localhost:4200
```

## 🎯 Tính Năng Chính

### ✅ Quản Lý Xác Thực (Authentication)
- ✔️ Đăng ký tài khoản người dùng
- ✔️ Đăng nhập với JWT Token
- ✔️ Đăng xuất & Quản lý phiên
- ✔️ Bảo vệ API endpoints

### 🍰 Quản Lý Bánh (Cake Management)
- ✔️ Xem danh sách tất cả bánh
- ✔️ Thêm bánh mới với thông tin chi tiết (Tên, Giá, Loại, Hình ảnh)
- ✔️ Chỉnh sửa thông tin bánh
- ✔️ Xóa bánh (Soft delete với cờ `IsActive`)
- ✔️ Phân loại bánh theo danh mục
- ✔️ Tìm kiếm & Lọc bánh

### 🧾 Quản Lý Hóa Đơn (Invoice Management)
- ✔️ Tạo hóa đơn mới
- ✔️ Thêm chi tiết bánh vào hóa đơn
- ✔️ Tính tổng tiền tự động
- ✔️ Xem lịch sử hóa đơn
- ✔️ Xuất/In hóa đơn
- ✔️ Quản lý trạng thái hóa đơn

### 📊 Bảng Điều Khiển (Dashboard)
- ✔️ Thống kê doanh thu
- ✔️ Số lượng bánh bán
- ✔️ Số lượng hóa đơn
- ✔️ Biểu đồ phân tích (Chart.js)
- ✔️ Báo cáo kinh doanh

---

## 🔐 Xác Thực & Bảo Mật

### Cơ Chế Xác Thực

Hệ thống sử dụng **JWT (JSON Web Token)** cho xác thực:

```
1. Người dùng đăng nhập
2. Server xác minh credentials
3. Cấp JWT Token
4. Client lưu token vào localStorage
5. Mỗi request sau đó gửi token trong header: Authorization: Bearer <token>
6. Server xác minh token trước khi xử lý
```

### Cấu Hình JWT

```csharp
// Program.cs
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            // ... configuration
        };
    });
```

### Bảo Mật API

- ✅ **CORS Configuration**: Chỉ cho phép requests từ frontend
- ✅ **HTTPS**: Tất cả kết nối được mã hóa
- ✅ **Password Hashing**: Mật khẩu được hash trước khi lưu
- ✅ **Token Expiration**: JWT token có thời hạn sử dụng

---

## 📚 API Documentation

### API Endpoints Chính

#### Authentication
```
POST   /api/auth/register         - Đăng ký tài khoản
POST   /api/auth/login            - Đăng nhập
POST   /api/auth/logout           - Đăng xuất
POST   /api/auth/refresh-token    - Làm mới token
```

#### Cake Management
```
GET    /api/cake                  - Lấy danh sách bánh
GET    /api/cake/{id}             - Lấy chi tiết bánh
POST   /api/cake                  - Tạo bánh mới
PUT    /api/cake/{id}             - Cập nhật bánh
DELETE /api/cake/{id}             - Xóa bánh
GET    /api/cake/category/{catId} - Lấy bánh theo danh mục
```

#### Invoice Management
```
GET    /api/invoice               - Lấy danh sách hóa đơn
GET    /api/invoice/{id}          - Lấy chi tiết hóa đơn
POST   /api/invoice               - Tạo hóa đơn mới
PUT    /api/invoice/{id}          - Cập nhật hóa đơn
DELETE /api/invoice/{id}          - Xóa hóa đơn
POST   /api/invoice/{id}/export   - Xuất hóa đơn
```

#### Dashboard
```
GET    /api/dashboard/statistics  - Lấy thống kê
GET    /api/dashboard/revenue     - Lấy doanh thu
GET    /api/dashboard/summary     - Lấy tóm tắt kinh doanh
```

### Swagger Documentation
- Truy cập: `https://localhost:5001/swagger`
- Xem tất cả endpoints và test API trực tiếp

---

## 💡 Hướng Dẫn Sử Dụng

### Lần Đầu Sử Dụng

1. **Khởi chạy Backend & Frontend**
   ```bash
   # Terminal 1: Backend
   cd Backend/CakeSoft.Api
   dotnet run

   # Terminal 2: Frontend
   cd cake-soft-web
   npm start
   ```

2. **Đăng Nhập**
   - Truy cập `http://localhost:4200`
   - Đăng ký tài khoản mới hoặc đăng nhập bằng tài khoản demo
   - Tài khoản demo: (nếu có seed data)

3. **Quản Lý Bánh**
   - Vào menu "Quản Lý Bánh"
   - Xem danh sách bánh hiện có
   - Thêm bánh mới bằng nút "+ Thêm"

4. **Tạo Hóa Đơn**
   - Vào menu "Hóa Đơn"
   - Click "+ Tạo Hóa Đơn"
   - Chọn bánh và số lượng
   - Xác nhận và lưu

5. **Xem Thống Kê**
   - Dashboard hiển thị thống kê tổng quát
   - Xem biểu đồ doanh thu và báo cáo kinh doanh

### Các Lệnh Hữu Ích

#### Backend (C#/.NET)
```bash
# Build project
dotnet build

# Chạy tests
dotnet test

# Publish for production
dotnet publish -c Release

# Xem version
dotnet --version

# Entity Framework
dotnet ef migrations add MigrationName
dotnet ef database update
dotnet ef database drop  # Xóa DB
```

#### Frontend (Angular)
```bash
# Dev server
npm start
# hoặc
ng serve

# Build for production
npm run build
# hoặc
ng build --configuration production

# Chạy unit tests
npm test
# hoặc
ng test

# Format code
ng lint
```

---

## 🐛 Xử Lý Sự Cố

### Lỗi Phổ Biến

#### ❌ "Unable to connect to the server"
**Nguyên nhân**: Backend không chạy hoặc port bị chiếm  
**Giải pháp**:
```bash
# Kiểm tra xem backend có chạy không
# Nếu port 5001 bị chiếm, thay đổi port trong launchSettings.json
```

#### ❌ "CORS Policy Error"
**Nguyên nhân**: Frontend không được phép gọi API  
**Giải pháp**: Cấu hình CORS trong `Program.cs`:
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});
```

#### ❌ "Database Connection Failed"
**Nguyên nhân**: Connection string sai hoặc SQL Server không chạy  
**Giải pháp**:
```bash
# Kiểm tra connection string trong appsettings.json
# Đảm bảo SQL Server đang chạy
# Tạo database: CREATE DATABASE CakeSoft;
# Apply migrations: dotnet ef database update
```

#### ❌ "Module not found" (Frontend)
**Nguyên nhân**: npm dependencies chưa được cài  
**Giải pháp**:
```bash
cd cake-soft-web
rm -rf node_modules package-lock.json
npm install
```

### Debug Mode

#### Backend Debug
```bash
# Visual Studio: F5 hoặc Debug > Start Debugging
# VS Code: Cài C# extension, press F5

# Logs location: 
# bin/Debug/net10.0/
```

#### Frontend Debug
```bash
# Browser DevTools: F12
# Chrome DevTools: F12 > Sources tab
# Logs: F12 > Console tab
```

---

## 📊 Cấu Trúc Dữ Liệu

### Database Entities

#### AppUser
```
- Id (GUID)
- Email (string)
- PasswordHash (string)
- FullName (string)
- CreatedAt (DateTime)
- UpdatedAt (DateTime)
```

#### Cake
```
- Id (GUID)
- Name (string)
- Price (decimal)
- Description (string)
- ImageUrl (string)
- CategoryId (GUID FK)
- IsActive (bool)
- CreatedAt (DateTime)
```

#### CakeCategory
```
- Id (GUID)
- Name (string)
- Description (string)
```

#### Invoice
```
- Id (GUID)
- UserId (GUID FK)
- InvoiceDate (DateTime)
- TotalAmount (decimal)
- Status (enum)
- CreatedAt (DateTime)
```

#### InvoiceDetail
```
- Id (GUID)
- InvoiceId (GUID FK)
- CakeId (GUID FK)
- Quantity (int)
- UnitPrice (decimal)
- LineTotal (decimal)
```

---

## 📝 Phiên Bản & Công Nghệ

| Công Nghệ | Phiên Bản | Mục Đích |
|-----------|----------|---------|
| .NET | 10.0 | Backend Web API |
| Angular | 21.2.x | Frontend SPA |
| Node.js | 18.0+ | Runtime Frontend |
| npm | 11.12.1 | Package Manager |
| SQL Server | 2019+ | Database |
| Entity Framework Core | 10.0.8 | ORM Backend |
| JWT Bearer | 10.0.8 | Authentication |
| PrimeNG | 21.1.7 | UI Components |
| Chart.js | 4.5.1 | Biểu đồ |
| RxJS | 7.8.0 | Reactive |

---

## 🚀 Deployment (Triển Khai)

### Deploy Backend

```bash
# 1. Publish for production
dotnet publish -c Release -o ./publish

# 2. Upload publish folder to server
# 3. Run: dotnet CakeSoft.Api.dll

# 4. Configure IIS (nếu dùng IIS)
# - Enable ASP.NET Core Module
# - Create Application Pool
```

### Deploy Frontend

```bash
# 1. Build for production
npm run build
# Hoặc: ng build --configuration production

# 2. Output: dist/cake-soft-web/
# 3. Upload dist folder to web server
# 4. Configure web server (IIS, nginx, etc.)
```

**Cảm ơn bạn đã sử dụng CakeSoft!** 🍰✨
