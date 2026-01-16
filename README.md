# AssignFlow Hub 🎓  
**A real-time assignment and evaluation platform for teachers and students**

AssignFlow Hub is a full-stack web application designed to simplify classroom assignment workflows with **clear states, real-time readiness, and strict role separation**.

The platform is inspired by tools like Google Classroom, but intentionally focuses on:
- zero confusion
- predictable workflows
- real-time feedback readiness
- beginner-friendly UX for both teachers and students

This project is built **solo** and emphasizes **backend architecture, authorization, and real-world system design**.

---

## 💡 What Problem This Solves

Existing classroom tools often feel:
- overloaded with controls
- confusing for new teachers and students
- unclear about submission states
- slow to reflect updates

AssignFlow Hub solves this by enforcing:
- one subject → clear assignments
- explicit submission states
- intentional user actions
- real-time–ready architecture

---

## ✨ Core Features

### 🔐 Authentication & Roles
- JWT-based authentication
- Role-based access control (Teacher / Student)
- Role is fixed at account creation
- Automatic role-based redirection
- Fully protected routes (no cross-role access)

---

### 👨‍🏫 Teacher Capabilities
- Create and manage subjects (classes)
- Generate unique join codes per subject
- Create assignments with:
  - title
  - description
  - deadline
  - PDF upload
- Draft → Publish assignment lifecycle
- View student submissions **per assignment**
- Clear subject-based navigation

---

### 👨‍🎓 Student Capabilities
- Join subjects using a secure join code
- View assignments subject-wise
- Download assignment PDFs
- Upload submissions (PDF / text)
- **Auto-saved drafts** (similar to Google Classroom)
- Explicit final submission before deadline
- Persistent submission state across sessions

---

## 🔁 Assignment & Submission Lifecycle

**Assignment States**
- `DRAFT`
- `PUBLISHED`

**Submission States**
- `DRAFT`
- `SUBMITTED`
- `LOCKED` *(future-ready)*
- `GRADED` *(future-ready)*

All state transitions are strictly enforced on the backend.

---

## ☁️ Secure File Handling
- AWS S3–based storage
- Private bucket configuration
- Pre-signed URLs for uploads and downloads
- Time-limited access
- No public file exposure

---

## 🧠 Backend Engineering Highlights

This project intentionally demonstrates real-world backend concepts:

- Role-based authorization (RBAC)
- State machines for business logic
- Data isolation:
  - teacher → subject → assignment → submission
- Secure API design with ownership validation
- Defensive request validation
- Event-driven architecture (WebSocket-ready)
- Production-grade error handling

---

## 🛠 Technology Stack

- **Next.js (App Router)**
- **React + TypeScript**
- **MongoDB + Mongoose**
- **JWT Authentication**
- **Zod for request validation**
- **AWS S3 for secure file storage**
- **Tailwind CSS**

---

## 🎯 Project Intent

This is **not a tutorial or CRUD demo**.

AssignFlow Hub is built as a **portfolio-grade, real-world system** to demonstrate:
- architectural thinking
- backend-heavy logic
- secure data handling
- scalable feature design

Designed and implemented as a **solo project**.

---

## 🔮 Future Enhancements
- Assignment grading & feedback
- Real-time updates using WebSockets
- Background jobs for deadline enforcement
- In-app and email notifications
- Admin monitoring panel

---

## 👤 Author

**Karan**  
Full-Stack Developer (Next.js • Node.js • MongoDB • AWS)

---

## 📄 License

This project is intended for educational and portfolio use.
