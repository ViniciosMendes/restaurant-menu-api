# Restaurant Menu API 🍔

A robust RESTful API for managing restaurant menus, built with Node.js, TypeScript, and PostgreSQL. This project features secure authentication, automated testing, and containerized database infrastructure.

## 🚀 Tech Stack

- **Language:** TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL (via Docker)
- **ORM:** TypeORM
- **Authentication:** JWT (JSON Web Tokens) & bcryptjs
- **Testing:** Jest
- **Documentation:** Swagger (OpenAPI)
- **Validation:** Zod

## ⚙️ Features

- **Authentication:** Secure User Registration and Login with JWT.
- **Role-Based Access:** Public read access; authenticated write access (Create/Update/Delete).
- **CRUD Operations:** Full management of Restaurants, Menu Sections, and Menu Items.
- **Relations:** Proper relational database modeling (OneToMany/ManyToOne).
- **Soft Delete:** Data safety implementation.

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18+)
- Docker & Docker Compose
- NPM

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/ViniciosMendes/restaurant-menu-api.git
    cd restaurant-menu-api
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

---

## 🏃 Running the Application

You have two options to run the application:

### Option 1: Local Development (Recommended)

Run the API on your local machine and the database in a Docker container.

1.  **Configure Environment Variables**  
    Create a `.env` file in the root directory. This connects your local API to the Dockerized database.
    ```
    DATABASE_HOST=localhost
    DATABASE_PORT=5434
    DATABASE_USER=postgres
    DATABASE_PASS=admin
    DATABASE_NAME=restaurant_api
    JWT_SECRET=your_super_secret_key
    ```

2.  **Start the Database Container**  
    This command starts only the PostgreSQL service.
    ```bash
    docker-compose up -d db
    ```

3.  **Run the API**
    ```bash
    npm run dev
    ```

### Option 2: Full Dockerized Environment

Run both the API and the Database in separate Docker containers.

1.  **Build and Run the Containers**  
    This command builds and starts both services. The `.env` file is not used in this setup.
    ```bash
    docker-compose up -d --build
    ```

---
In both cases, the server will be available at:  
👉 http://localhost:3000

## 📖 Documentation

Access Swagger at:  
👉 http://localhost:3000/api-docs

Use “Authorize” and paste your JWT token to test protected routes.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage
```

## 🔒 Authentication Flow

- **Register:** `POST /v1/auth/register` — `{ name, email, password }`
- **Login:** `POST /v1/auth/login` — `{ email, password }`
- **Token:** Extract from login response
- **Access:** Send in header `Authorization: Bearer <token>`

## 👥 Authors

- Rodrigo de Lima Araujo — https://github.com/ro-drigolima
- Ricardo Augusto — https://github.com/Ricardo-Brand
- Vinicios Mendes — https://github.com/ViniciosMendes

_Project developed for the Web Programming course at FATEC Ribeirão Preto, taught by Prof. Eduardo Araújo — https://github.com/edcaraujo_
