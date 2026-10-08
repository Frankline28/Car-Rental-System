# 🚗 Car Rental System

A modern full-stack web application for car rental bookings, fleet management, and reservation administration built with **Next.js**, **Spring Boot 3**, **Spring Security (JWT)**, and **MySQL 8**.

---

## 📁 Clean Project Architecture

```
D:\Car-Rental-System/
│
├── 📂 frontend/                # Next.js (App Router), React, Redux Toolkit, CSS UI
│   ├── 📂 src/
│   │   ├── 📂 app/             # App Router pages (Home, Cars, Checkout, Admin, Auth)
│   │   ├── 📂 components/      # UI components (Header, Footer, Modals, Cards)
│   │   ├── 📂 lib/             # API clients, session managers, formatters
│   │   └── 📂 store/           # Redux Toolkit global state slices
│   ├── 📂 public/              # Car images and public assets
│   ├── package.json
│   ├── next.config.js
│   └── .env.local
│
├── 📂 backend/                 # Spring Boot 3.3.5 REST API (Java 21 / Maven)
│   ├── 📂 src/main/java/
│   │   └── 📂 com/carrental/
│   │       ├── 📂 config/      # Security, CORS, Seeders, Migrations
│   │       ├── 📂 controller/  # REST Endpoints (Cars, Bookings, Auth, Users, etc.)
│   │       ├── 📂 dto/         # Request / Response Data Transfer Objects
│   │       ├── 📂 entity/      # JPA Entities (Car, User, Booking, Package, Location)
│   │       ├── 📂 repository/  # Spring Data JPA Repositories
│   │       ├── 📂 security/    # JWT Filter, JwtService, UserDetailsService
│   │       └── 📂 service/     # Business logic & transaction boundaries
│   ├── 📂 src/main/resources/  # application.properties (Cloud & Local profiles)
│   ├── start-dev.bat           # Windows 1-click startup script
│   └── pom.xml                 # Maven build dependencies
│
├── 📂 database/                # MySQL Database exports and scripts
│   ├── car_rental_dump.sql     # Full SQL dump with schema, indexes, constraints, & seed data
│   ├── schema.sql              # Clean DDL schema definitions
│   └── README.md               # Database setup and ER diagram guide
│
├── .gitignore                  # Git ignore rules for frontend, backend, and build artifacts
└── README.md                   # Main project documentation
```

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | [Next.js](https://nextjs.org/) (App Router), [React](https://react.dev/), [Redux Toolkit](https://redux-toolkit.js.org/), CSS |
| **Backend** | [Spring Boot 3.3.5](https://spring.io/projects/spring-boot), Java 21, Spring Data JPA, Spring Security |
| **Authentication** | Stateless JSON Web Tokens (JWT) + BCrypt Password Hashing |
| **Database** | [MySQL 8.0](https://www.mysql.com/) (InnoDB, Foreign Key Constraints) |
| **Build Tools** | Maven 3.9+, Node.js 18+ / npm |

---

## ⚡ Quick Start Guide

### 1. Database Setup (MySQL)
1. Ensure your MySQL server is running on `localhost:3306` (Password: `1234`).
2. Open terminal in `D:\Car-Rental-System\database` and import the database:
```bash
mysql -u root -p1234 -e "CREATE DATABASE IF NOT EXISTS car_rental;"
mysql -u root -p1234 car_rental < car_rental_dump.sql
```

---

### 2. Backend Setup (Spring Boot)

#### Option A: Windows 1-Click Startup
```cmd
cd D:\Car-Rental-System\backend
start-dev.bat
```

#### Option B: Using Maven directly
```bash
cd D:\Car-Rental-System\backend
mvn spring-boot:run
```
The REST API will be live at: **`http://localhost:8080/api`**

---

### 3. Frontend Setup (Next.js)

```bash
cd D:\Car-Rental-System\frontend

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```
Open your browser at: **`http://localhost:3000`**

---

## 🔑 Default Credentials

| Role | Email | Password | Access Area |
|---|---|---|---|
| **Administrator** | `admin@carrental.com` | `Admin@123` | Full Admin Dashboard (`/admin`), Fleet & Booking Management |
| **Sample Customer** | `customer@carrental.com` | `customer123` | Car Browsing, Booking, My Bookings (`/bookings`) |
| **New Customer** | *(Any email)* | *(Any password)* | Register directly at `/register` |

---

## 📡 REST API Reference Summary

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register customer account |
| `POST` | `/api/auth/login` | Public | Authenticate user and receive JWT |
| `GET` | `/api/cars` | Public | List all available rental cars |
| `GET` | `/api/cars/{id}` | Public | Get single car details & features |
| `GET` | `/api/packages` | Public | List rental packages (Hourly, Daily, Weekly, Monthly) |
| `GET` | `/api/locations` | Public | List pickup/dropoff locations |
| `GET` | `/api/bookings/my` | Customer/Admin | List logged-in user's bookings |
| `POST` | `/api/bookings` | Customer/Admin | Create a new reservation |
| `GET` | `/api/bookings` | Admin Only | View all reservations across all users |
| `GET` | `/api/users` | Admin Only | List registered user accounts |
