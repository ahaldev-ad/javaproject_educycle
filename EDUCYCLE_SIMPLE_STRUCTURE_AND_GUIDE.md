# EduCycle — Complete Simple Guide (Frontend, Backend, JDBC & APIs)

A clean, easy-to-read guide explaining the complete project structure of **EduCycle**, with dedicated and simple explanations of **JDBC** and all **APIs**.

---

## 📑 Table of Contents
1. [Project Overview](#1-project-overview)
2. [Frontend Structure (React)](#2-frontend-structure-react)
3. [Backend Structure (Spring Boot)](#3-backend-structure-spring-boot)
4. [JDBC Explained Separately](#4-jdbc-explained-separately)
5. [APIs Explained Separately](#5-apis-explained-separately)
6. [How Everything Works Together (Quick Flow)](#6-how-everything-works-together-quick-flow)

---

## 1. Project Overview

**EduCycle** is a web platform for college students to:
* **Share / Donate / Lend Academic Resources** (books, notes, lab kits, components).
* **Exchange Skills** (peer tutoring in coding, design, math, etc.).
* **Connect & Chat** directly with peers.

### High-Level Architecture
```
[ React Frontend ] 
       │  (HTTP / REST with JWT)
       ▼
[ Spring Boot Backend ] 
       │  (Hibernate ORM + Spring Data JPA)
       ▼
[ JDBC & HikariCP Pool ] 
       │  (TCP/IP SSL Connection)
       ▼
[ Neon PostgreSQL Database ]
```

---

## 2. Frontend Structure (React)

The frontend is a single-page application built with **React 18**, **Bootstrap 5**, and custom CSS.

### Directory Layout
```
frontend/src/
├── App.js                   # Main application router and page definitions
├── index.js                 # Entry point that mounts React to index.html
├── firebase.js              # Real-time chat connection (Firebase)
│
├── components/              # Reusable UI building blocks
│   ├── Navbar.js            # Top navigation bar (links, profile, alerts)
│   ├── Footer.js            # Bottom page footer
│   ├── MobileBottomNav.js   # Bottom navigation bar for mobile screens
│   ├── ResourceCard.js      # Card showing a textbook or item listing
│   ├── SkillCard.js         # Card showing a skill offering
│   ├── RequestModal.js      # Pop-up modal to send a borrow/learn request
│   ├── MessageBox.js        # Chat message bubble
│   ├── FlowingBackground.js # Animated ambient background effect
│   └── AnimatedPage.js      # Smooth page-loading animation
│
├── context/                 # Global state management
│   ├── AuthContext.js       # Handles user login, registration, token, and logout
│   └── NotificationContext.js # Manages unread notifications and badge counts
│
├── pages/                   # Main screens
│   ├── Home.js              # Landing page with hero section and statistics
│   ├── Login.js             # User login page
│   ├── Register.js          # Student sign-up page
│   ├── Dashboard.js         # User dashboard (my listings and requests)
│   ├── Resources.js         # Marketplace to browse & search resources
│   ├── Skills.js            # Directory to browse & find peer tutors
│   ├── Messages.js          # Chat screen between exchange partners
│   ├── Profile.js           # Student profile & ratings page
│   ├── AdminPanel.js        # Admin dashboard (approvals, user management)
│   └── NotFound.js          # 404 page
│
├── services/                # Backend API communication
│   ├── api.js               # Central Axios client (attaches JWT token automatically)
│   ├── authService.js       # Calls /api/auth (login, register)
│   ├── resourceService.js   # Calls /api/resources (get, add, delete resources)
│   ├── skillService.js      # Calls /api/skills (get, add, delete skills)
│   ├── requestService.js    # Calls /api/resource-requests & /api/skill-requests
│   ├── userService.js       # Calls /api/users (profile updates)
│   ├── miscServices.js      # Platform stats & health check calls
│   └── firebaseChatService.js # Direct real-time Firebase chat listener
│
└── css/
    └── index.css            # Custom design tokens, glassmorphism, and responsive layout
```

---

## 3. Backend Structure (Spring Boot)

The backend is built with **Spring Boot 3.2.3 (Java 17)** following a clean 4-layer architecture.

### Directory Layout
```
backend/src/main/java/com/educycle/
│
├── EducycleApplication.java     # Entry point (@SpringBootApplication)
│
├── config/                      # Application setup
│   ├── CorsConfig.java          # Allows frontend (React) to access backend
│   └── DataInitializer.java     # Seeds sample data & default categories on startup
│
├── security/                    # Authentication & Protection
│   ├── SecurityConfig.java      # Spring Security filter chain & password encoder
│   ├── JwtTokenProvider.java    # Generates and verifies JWT tokens
│   └── JwtAuthenticationFilter.java # Checks Bearer token on every incoming request
│
├── controller/                  # Layer 1: HTTP Request Handlers (REST Endpoints)
│   ├── AuthController.java      # /api/auth (login, register)
│   ├── UserController.java      # /api/users (user profiles)
│   ├── ResourceController.java  # /api/resources (resource catalog)
│   ├── SkillController.java     # /api/skills (skills catalog)
│   ├── RequestController.java   # /api/resource-requests, /api/skill-requests
│   ├── MessageController.java   # /api/messages (chat history)
│   ├── RatingController.java    # /api/ratings (reviews & ratings)
│   ├── AdminController.java     # /api/admin (stats, approvals, suspensions)
│   ├── StatsController.java     # /api/stats (public statistics)
│   └── HealthController.java    # /health, /api/health (server uptime check)
│
├── service/                     # Layer 2: Business Logic
│   ├── AuthService.java         # Verifies passwords and logs users in
│   ├── UserService.java         # Profile fetching and updating logic
│   ├── ResourceService.java     # Resource filtering and creation logic
│   ├── SkillService.java        # Skill filtering and creation logic
│   ├── RequestService.java      # Handles accept/reject/cancel workflows
│   ├── MessageService.java      # Chat persistence logic
│   ├── RatingService.java       # Rating calculations
│   └── FirebaseService.java     # Firebase synchronization
│
├── repository/                  # Layer 3: Data Access (Spring Data JPA)
│   ├── UserRepository.java      # Database operations for Users table
│   ├── ResourceRepository.java  # Database operations for Resources table
│   ├── SkillRepository.java     # Database operations for Skills table
│   ├── ResourceRequestRepository.java # Operations for Resource Requests table
│   ├── SkillRequestRepository.java    # Operations for Skill Requests table
│   ├── MessageRepository.java   # Operations for Messages table
│   ├── RatingRepository.java    # Operations for Ratings table
│   └── CategoryRepository.java  # Operations for Categories table
│
├── entity/                      # Layer 4: Database Models (Mapped to DB Tables)
│   ├── User.java                # "users" table
│   ├── Resource.java            # "resources" table
│   ├── Skill.java               # "skills" table
│   ├── ResourceRequest.java     # "resource_requests" table
│   ├── SkillRequest.java        # "skill_requests" table
│   ├── Message.java             # "messages" table
│   ├── Rating.java              # "ratings" table
│   ├── Category.java            # "categories" table
│   ├── Notification.java        # "notifications" table
│   └── enums/                   # Status constants (PENDING, ACCEPTED, etc.)
│
├── dto/                         # Data Transfer Objects (Payloads sent over HTTP)
│   ├── AuthRequest.java         # { email, password }
│   ├── AuthResponse.java        # { token, user }
│   ├── RegisterRequest.java     # Registration form data
│   ├── ResourceRequestDTO.java  # Data to post a new resource
│   ├── SkillRequestDTO.java     # Data to post a new skill
│   └── RequestDisplayDTO.java   # Clean format for dashboard request cards
│
└── exception/                   # Error handling
    ├── GlobalExceptionHandler.java # Converts errors into clean JSON responses
    ├── ResourceNotFoundException.java # Thrown when an ID does not exist
    └── UnauthorizedException.java     # Thrown when permission is denied
```

---

## 4. JDBC Explained Separately

### What is JDBC?
**JDBC** stands for **Java Database Connectivity**. It is the fundamental bridge that allows any Java program to talk directly to a relational database like PostgreSQL or MySQL.

```
+-----------------------------------------------------------+
|                        Java Code                          |
|             (e.g., userRepository.save(user))             |
+-----------------------------------------------------------+
                              │
                              ▼
+-----------------------------------------------------------+
|                  Hibernate ORM & JPA                      |
|       (Translates Java objects into standard SQL)         |
+-----------------------------------------------------------+
                              │
                              ▼
+-----------------------------------------------------------+
|                          JDBC                             |
|       - Establishes connection via HikariCP pool          |
|       - Prepares statement: PreparedStatement             |
|       - Transmits SQL across network socket               |
|       - Receives database results into ResultSet          |
+-----------------------------------------------------------+
                              │
                              ▼
+-----------------------------------------------------------+
|               PostgreSQL Database (Neon Cloud)            |
+-----------------------------------------------------------+
```

### The 4 Basic Steps of JDBC (Under the Hood)
Every database query in Java follows these 4 simple steps:
1. **Load Driver & Connect:**  
   The application uses `org.postgresql.Driver` to open a network connection to the database URL.
2. **Create a Statement:**  
   Uses `PreparedStatement` with placeholders (`?`) to prevent SQL Injection attacks.
3. **Execute SQL:**  
   The SQL command (such as `SELECT * FROM users WHERE email = ?`) is sent to the database.
4. **Read Results:**  
   The database sends back rows which JDBC holds in a `ResultSet`, mapping values back into Java objects.

---

### How JDBC is Configured in EduCycle
In `backend/src/main/resources/application.properties`:

```properties
# 1. JDBC Connection URL pointing to Neon Cloud PostgreSQL
spring.datasource.url=jdbc:postgresql://ep-divine-boat-azx66ajr-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require

# 2. Driver Class
spring.datasource.driverClassName=org.postgresql.Driver

# 3. Database Credentials
spring.datasource.username=neondb_owner
spring.datasource.password=npg_8dmxtXON4bQJ

# 4. Hibernate over JDBC Configuration
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=update
```

### Key JDBC Concepts Used in EduCycle:
1. **Connection Pooling (HikariCP):**  
   Opening a new database connection for every student request takes 200–300ms. HikariCP keeps a "pool" of 10 ready-to-use connections open. When a request arrives, it borrows a connection in 1ms and returns it when done.
2. **Spring Data JPA on top of JDBC:**  
   Instead of writing 20 lines of repetitive JDBC code for every query, Spring Data JPA generates the JDBC calls automatically:
   ```java
   // Simply declaring this in UserRepository.java:
   Optional<User> findByEmail(String email);

   // Automatically runs this parameterized JDBC query:
   // "SELECT * FROM users WHERE email = ?"
   ```
3. **Transactions (`@Transactional`):**  
   If an exchange involves two steps (e.g. mark request as `ACCEPTED` and mark book as `RESERVED`), both must succeed together. If one fails, JDBC automatically issues a `ROLLBACK` so data never gets corrupted.

---

## 5. APIs Explained Separately

All API endpoints are simple HTTP requests exchanging JSON. Endpoints that require login expect this header:  
`Authorization: Bearer <your_jwt_token>`

---

### 5.1 Authentication APIs (`/api/auth`)
*Handled by: `AuthController.java`*

| Method | Endpoint | What it does | Who can use it? |
|---|---|---|---|
| `POST` | `/api/auth/register` | Creates a new student account (hashes password with BCrypt) and returns a JWT token | Public (Anyone) |
| `POST` | `/api/auth/login` | Verifies email and password; returns JWT token and user info | Public (Anyone) |

**Example Register Request Body:**
```json
{
  "email": "student@college.edu",
  "password": "mypassword123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "college": "Engineering College",
  "department": "Computer Science"
}
```

---

### 5.2 User Profile APIs (`/api/users`)
*Handled by: `UserController.java`*

| Method | Endpoint | What it does | Who can use it? |
|---|---|---|---|
| `GET` | `/api/users` | Gets list of all student profiles | Logged-in Users |
| `GET` | `/api/users/{id}` | Gets profile details of a specific user | Logged-in Users |
| `PUT` | `/api/users/{id}` | Updates profile info (phone, department, bio, avatar) | Logged-in Users |

---

### 5.3 Academic Resources APIs (`/api/resources`)
*Handled by: `ResourceController.java`*

| Method | Endpoint | What it does | Who can use it? |
|---|---|---|---|
| `GET` | `/api/resources` | Gets all approved books & items (can filter by `?userId=...`) | Public |
| `GET` | `/api/resources/{id}` | Gets details of a single resource | Public |
| `POST` | `/api/resources` | Posts a new resource (book, component, kit) | Logged-in Users |
| `DELETE` | `/api/resources/{id}` | Deletes a resource listing | Resource Owner / Admin |

**Example Add Resource Body:**
```json
{
  "title": "Engineering Physics Textbook",
  "description": "Used for 1st year, clean condition",
  "category": "Physics",
  "condition": "GOOD",
  "exchangeType": "DONATE",
  "quantity": 1,
  "location": "Hostel Block B",
  "userId": 5
}
```

---

### 5.4 Skill Exchange APIs (`/api/skills`)
*Handled by: `SkillController.java`*

| Method | Endpoint | What it does | Who can use it? |
|---|---|---|---|
| `GET` | `/api/skills` | Gets all approved skill tutoring listings | Public |
| `GET` | `/api/skills/{id}` | Gets details of a single skill | Public |
| `POST` | `/api/skills` | Posts a skill you can teach (e.g. Python, CAD) | Logged-in Users |
| `DELETE` | `/api/skills/{id}` | Removes a skill listing | Skill Owner / Admin |

---

### 5.5 Exchange Requests APIs (`/api`)
*Handled by: `RequestController.java`*

| Method | Endpoint | What it does | Who can use it? |
|---|---|---|---|
| `POST` | `/api/resource-requests` | Request to borrow, receive, or exchange a resource | Logged-in Users |
| `GET` | `/api/resource-requests/{id}` | View status of a resource request | Logged-in Users |
| `PUT` | `/api/resource-requests/{id}` | Accept or Reject request (`{"status": "ACCEPTED"}`) | Item Owner |
| `DELETE` | `/api/resource-requests/{id}` | Cancel a request | Request Sender |
| `POST` | `/api/skill-requests` | Request a peer mentoring session | Logged-in Users |
| `PUT` | `/api/skill-requests/{id}` | Accept or Reject a skill session request | Mentor |
| `GET` | `/api/my-requests` | Gets incoming requests received by the user | Logged-in Users |
| `GET` | `/api/my-sent-requests` | Gets outgoing requests sent by the user | Logged-in Users |

---

### 5.6 Chat & Messages APIs (`/api/messages`)
*Handled by: `MessageController.java`*

| Method | Endpoint | What it does | Who can use it? |
|---|---|---|---|
| `GET` | `/api/messages/{requestId}` | Gets all chat messages for a specific exchange | Involved Users |
| `GET` | `/api/messages/{user1Id}/{user2Id}` | Gets direct message history between two users | Involved Users |
| `POST` | `/api/messages` | Sends and saves a new message | Logged-in Users |

---

### 5.7 Peer Ratings APIs (`/api/ratings`)
*Handled by: `RatingController.java`*

| Method | Endpoint | What it does | Who can use it? |
|---|---|---|---|
| `GET` | `/api/ratings/user/{userId}` | Gets all reviews & star ratings for a student | Public |
| `POST` | `/api/ratings` | Submits a star rating (1–5) and review for a peer | Logged-in Users |

---

### 5.8 Admin APIs (`/api/admin`)
*Handled by: `AdminController.java`*

| Method | Endpoint | What it does | Who can use it? |
|---|---|---|---|
| `GET` | `/api/admin/stats` | Gets total users, resources, and pending counts | Admin Only |
| `GET` | `/api/admin/users` | Gets list of all users and suspension status | Admin Only |
| `POST` | `/api/admin/users/{id}/suspend` | Suspends a user account (e.g. for rule breaking) | Admin Only |
| `POST` | `/api/admin/users/{id}/unsuspend` | Restores a suspended user account | Admin Only |
| `PUT` | `/api/admin/resources/{id}/approve` | Approves a student resource for public display | Admin Only |
| `PUT` | `/api/admin/resources/{id}/reject` | Rejects an inappropriate resource listing | Admin Only |
| `PUT` | `/api/admin/skills/{id}/approve` | Approves a skill listing | Admin Only |
| `PUT` | `/api/admin/skills/{id}/reject` | Rejects a skill listing | Admin Only |

---

### 5.9 Public Stats & Health APIs
*Handled by: `StatsController.java` & `HealthController.java`*

| Method | Endpoint | What it does |
|---|---|---|
| `GET` | `/api/stats` | Returns total active students, resources shared, and skills for landing page counters |
| `GET` | `/health` or `/api/health` | Returns server health status (`UP`), timestamp, and uptime in seconds |

---

## 6. How Everything Works Together (Quick Flow)

Here is what happens when a student requests a book:

```
1. STUDENT clicks "Request Resource" on React Frontend.
2. REACT (services/api.js) sends POST /api/resource-requests with JWT token.
3. SPRING BOOT (SecurityConfig & JwtAuthenticationFilter) verifies the JWT token.
4. CONTROLLER (RequestController) receives the request and passes it to RequestService.
5. SERVICE (RequestService) checks if the book is available.
6. REPOSITORY (ResourceRequestRepository) tells Hibernate to save the new request.
7. JDBC borrows an active connection from HikariCP pool and runs:
   "INSERT INTO resource_requests (...) VALUES (...)"
8. POSTGRESQL saves the row and returns the new ID.
9. FRONTEND receives HTTP 200 OK and shows a success confirmation message!
```

---
*Created for EduCycle Project — Group 13*
