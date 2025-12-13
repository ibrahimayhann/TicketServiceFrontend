 Ticket Management System

Modern bir **Ticket / Issue Tracking** uygulaması.  
Backend **ASP.NET Core Web API**, frontend **React + TypeScript** kullanılarak geliştirilmiştir.

Bu proje; ticket oluşturma, güncelleme, yorumlama ve **dashboard analytics** (status / priority bazlı raporlar) özelliklerini içerir.

---
Teknolojiler

# Backend
- ASP.NET Core Web API
- Entity Framework Core
- SQL Server
- FluentValidation
- Global Exception Handling
- DTO & Layered Architecture

# Frontend
- React + TypeScript
- React Router
- React Query (TanStack Query)
- Axios
- Recharts (Dashboard grafikler)
- CSS (custom, framework yok)

---

# Özellikler

# Ticket Yönetimi
- Ticket oluşturma
- Ticket güncelleme
- Ticket silme
- Status & Priority yönetimi
- Assignee ve tag desteği

# Yorum Sistemi
- Ticket’a yorum ekleme
- Yorum güncelleme
- Yorum silme

# Dashboard (Analytics)
- Toplam ticket sayısı
- Open / Resolved ticket sayıları
- Status bazlı bar chart
- Priority bazlı pie chart
- Veriler **DB üzerinden rapor endpoint’lerinden** çekilir  
  (frontend tarafında hesaplama yok)

---

# Mimari Yaklaşım

# Backend
- Controller → Service → DbContext ayrımı
- Business logic sadece **Service** katmanında
- Exception’lar merkezi olarak handle edilir
- Raporlar için **GROUP BY** kullanan özel endpoint’ler

# Frontend
- API çağrıları `TicketService` üzerinden yapılır
- React Query ile:
  - Cache yönetimi
  - Otomatik refetch
  - Mutation sonrası invalidate
- UI state ile server state net şekilde ayrılmıştır

---

# Backend API Örnekleri


▶️ Projeyi Çalıştırma
Backend
bash
Kodu kopyala
dotnet restore
dotnet run
Varsayılan adres:
https://localhost:7219

Frontend
bash
Kodu kopyala
npm install
npm run dev
Varsayılan adres:
http://localhost:5173

📌 Notlar
Dashboard grafiklerinde renkler priority ve status’a göre sabittir

Create Ticket ekranında status backend tarafından otomatik Open atanır

Tarih/saat formatları frontend tarafında normalize edilmiştir

Kod, production-grade okunabilirlik hedeflenerek yazılmıştır

👨‍💻 Geliştirici
İbrahim  Ayhan
Software Engineer