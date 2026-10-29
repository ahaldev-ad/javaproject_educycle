# EduCycle — Presentation Slides (PPT)

---

## Slide 1: Title & Introduction
* **Project Name:** EduCycle
* **Subtitle:** Campus Resource & Peer Skill Sharing Platform
* **Domain:** Full-Stack Web Development & Campus Circular Economy
* **Tech Stack:** React 18 | Spring Boot 3 (Java 17) | PostgreSQL | Firebase
* **Presented by:** [Your Name / Team Name]

---

## Slide 2: Problem Statement
* **Idle Academic Assets:** Expensive textbooks, lab components, and calculators sit unused after exams.
* **Recurring Student Expenses:** High semester costs purchasing items needed for only a few months.
* **Unstructured Peer Learning:** No central platform for students to find peer tutors or exchange skills.
* **Safety & Accountability Issues:** Informal social media groups lack verification, reviews, and moderation.

---

## Slide 3: The Solution (EduCycle)
* **All-in-One Campus Platform:** Central hub built specifically for university students.
* **Resource Sharing:** Donate, lend, or borrow books, notes, and lab equipment.
* **Skill Bartering:** Non-monetary peer-to-peer knowledge exchange (e.g., Learn Python ↔ Teach UI Design).
* **Direct Real-Time Chat:** In-app messaging to discuss exchange logistics securely.
* **Trust & Safety:** User reviews, reputation ratings, and admin moderation.

---

## Slide 4: Key Features & Modules
* **Resource Marketplace:** Filter by Category, Item Condition (New/Good/Fair), and Availability.
* **Skill Directory:** Search peer mentors by category, skill level, and barter preferences.
* **Request Lifecycle:** Structured request management (`Pending` → `Accepted` / `Rejected`).
* **Instant Chat:** Firebase-powered real-time messaging between exchange partners.
* **Admin Dashboard:** Platform stats, manage users, and moderate listings.

---

## Slide 5: System Architecture
* **Frontend Layer:**
  * React 18 Single Page Application (SPA)
  * Bootstrap 5 + Modern Glassmorphism Styling
  * Axios client with automatic JWT token attachment
* **Backend Layer:**
  * Spring Boot 3 REST API (Java 17)
  * 4-Layer Architecture: Controller → Service → Repository → Entity
* **Database & Cloud Services:**
  * **Neon Cloud PostgreSQL:** Relational database for core transactional data
  * **Firebase Realtime Database:** Low-latency live messaging

---

## Slide 6: Database & JDBC Implementation
* **Driver:** `org.postgresql.Driver` over SSL-encrypted connection.
* **Connection Pooling:** HikariCP for high-performance database connection management.
* **ORM Layer:** Hibernate & Spring Data JPA for type-safe database queries.
* **Core Entities:**
  * `User` (Authentication, roles, profile)
  * `Resource` & `Skill` (Catalog listings)
  * `ResourceRequest` & `SkillRequest` (Transaction workflows)
  * `Message` & `Rating` (Communication and peer trust)

---

## Slide 7: Security & Authentication
* **Stateless JWT (JSON Web Tokens):** Token issued on login, verified on every API call.
* **Spring Security 6:** Filter chain protecting all private endpoints via `Bearer` tokens.
* **Password Hashing:** Industry-standard **BCrypt** with automatic salt generation.
* **Role-Based Access Control (RBAC):** Strict boundaries between `STUDENT` and `ADMIN` privileges.

---

## Slide 8: How It Works (User Workflow)
1. **Browse & Search:** Student finds an academic resource or skill mentor.
2. **Send Request:** Student submits borrow/learn request with duration and notes.
3. **Owner Review:** Owner gets instant notification to `Accept` or `Reject`.
4. **Chat & Coordinate:** Built-in chat unlocks on acceptance to arrange handover.
5. **Rate & Review:** Both parties rate each other after exchange to build campus reputation.

---

## Slide 9: Key Highlights & Innovation
* **Zero Monetary Barrier:** Promotes sustainable sharing and equal learning access.
* **Hybrid Data Architecture:** Relational DB for data integrity + Firebase for real-time speed.
* **Clean Code Structure:** Layered separation of concerns and centralized error handling.
* **Responsive Design:** Optimized for mobile phones, tablets, and desktops.

---

## Slide 10: Future Scope & Conclusion
* **Future Roadmap:**
  * College email (`.edu`) auto-verification.
  * AI-powered skill matching recommendations.
  * Campus pickup location mapping.
* **Conclusion:**
  * EduCycle reduces student costs, minimizes waste, and builds an active, collaborative campus community.
