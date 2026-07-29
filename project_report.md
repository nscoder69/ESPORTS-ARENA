# Esports Platform Project Report

This report summarizes the architecture, features, and technologies used in the development of the Esports Platform, along with step-by-step instructions on how to run the application locally.

## 1. Project Overview
We built a modern, premium web application designed to host esports tournaments. The platform includes a secure user authentication system, tournament discovery, team creation, live match tracking, and a fully integrated virtual wallet system for managing deposits and tournament entry fees.

---

## 2. Technology Stack

### Frontend (User Interface)
* **Framework:** React 19 with TypeScript, built using Vite for lightning-fast HMR and optimized builds.
* **Styling:** Tailwind CSS with a custom Glassmorphism design system (translucent panels, blurs, and neon accents).
* **Animations:** Framer Motion for smooth page transitions, micro-interactions, and component reveals.
* **Icons:** Lucide React for consistent, scalable vector icons.
* **Routing & State:** React Router DOM for client-side navigation.
* **API Integration:** Axios for communicating with the backend REST APIs.

### Backend (Server & API)
* **Framework:** Java 17 with Spring Boot 3.3.0.
* **Security:** Spring Security with stateless JWT (JSON Web Token) authentication.
* **Data Access:** Spring Data JPA (Hibernate) for Object-Relational Mapping.
* **Database:** MySQL 8 for robust relational data storage.
* **Migrations:** Flyway for automated, version-controlled database schema migrations (`V1` through `V4`).
* **Build Tool:** Maven.

---

## 3. Key Features Implemented

### Authentication & Profile Management
* **Registration Flow:** Users can create an account using their email and password, and optionally provide an In-Game Name (e.g., Free Fire UID).
* **Avatar Uploads:** During signup, users can upload a custom profile picture (saved securely via `multipart/form-data` to a local backend `uploads` directory). The UI provides an instant preview of the selected image.
* **JWT Security:** Passwords are encrypted using BCrypt, and sessions are securely managed via JWT tokens stored in the browser.

### Virtual Wallet & Payments System
* **Wallet Dashboard:** A dedicated, animated interface where users can view their current balance and a detailed history of their transactions.
* **Transactions:** Implemented atomic transaction recording in the backend to handle `DEPOSIT`, `WITHDRAWAL`, `TOURNAMENT_FEE`, and `PRIZE` flows.
* **Dynamic Header Integration:** The main navigation bar seamlessly displays the user's active wallet balance and custom profile picture upon login.

### Tournaments & Match Tracking
* **Tournament Discovery:** A dashboard displaying upcoming, ongoing, and completed tournaments with details like prize pools and entry fees.
* **Live Match Demo:** An interface designed to stream or track live esports matches.

---

## 4. How to Run the Project Locally

Follow these terminal prompts (commands) to start both the backend server and the frontend development environment.

> [!IMPORTANT]  
> **Prerequisites:** Ensure you have **Java 17**, **Maven**, **Node.js**, and **MySQL** installed and running on your system.

### Step 1: Configure and Run the Backend (Spring Boot)
Open a terminal, navigate to the backend directory, and start the Spring Boot application:

```bash
# 1. Navigate to the backend directory
cd d:\project\gamebuild\backend

# 2. Clean the project and run the server
mvn clean spring-boot:run
```
*The backend server will start on **`http://localhost:8080`**. It will automatically connect to MySQL and execute any pending Flyway database migrations.*

### Step 2: Run the Frontend (React / Vite)
Open a **new, separate terminal tab**, navigate to the frontend directory, and start the Vite development server:

```bash
# 1. Navigate to the frontend directory
cd d:\project\gamebuild\frontend

# 2. Install dependencies (if you haven't already)
npm install

# 3. Start the Vite development server
npm run dev
```
*The frontend application will compile and become accessible in your browser at **`http://localhost:5173`**.*

---

## 5. Directory Structure Highlight

- `frontend/src/pages/` - Contains the React UI views (Home, Login, Signup, WalletDashboard).
- `frontend/src/services/` - Contains Axios API configurations (`api.ts`, `authService.ts`, `walletService.ts`).
- `backend/src/main/java/com/esports/controller/` - Exposes the REST APIs.
- `backend/src/main/java/com/esports/service/` - Contains the business logic (Authentication, File Uploads, Wallet Management).
- `backend/src/main/resources/db/migration/` - Contains the Flyway SQL scripts that build the MySQL database tables.
- `backend/uploads/avatars/` - The dynamically created folder where user profile pictures are securely stored.
