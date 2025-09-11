# 🌱 Plante

**Plante** is a smart web application for plant lovers.  
It helps users care for their plants with reminders, recommendations, growth tracking, and plant health analysis.  

---

## ✨ Features

- 🌿 **Water & Fertilizer Reminders** → Notifications via Firebase Cloud Messaging (FCM)  
- 🩺 **Plant Disease Analysis** → Detect early symptoms of plant health issues  
- 🪴 **Plant Recommendation** → Suggests plants based on location, climate, and preferences  
- 📖 **Plant Growth Diary** → Track plant growth (e.g., height, photos, notes)  
- 🔐 **Secure Login** → Firebase OAuth authentication  

---

## 🛠️ Tech Stack

- **Frontend** → [Next.js](https://nextjs.org/) (JavaScript)  
- **Backend** → [Golang](https://go.dev/)  
- **Database** →  
  - [MongoDB](https://www.mongodb.com/) → plant & user collections, photos  
  - [Firebase Realtime Database](https://firebase.google.com/) → reminders & notifications  
- **Authentication** → Firebase OAuth  
- **Messaging** → Firebase Cloud Messaging (FCM)  

---

## 🚀 Getting Started

### 1. Prerequisites
Make sure you have installed:  
- [Node.js](https://nodejs.org/) (>= 18)  
- [Go](https://go.dev/dl/) (>= 1.21)  
- [MongoDB](https://www.mongodb.com/try/download/community) (local or Atlas Cloud)  
- Firebase Project (with OAuth & FCM enabled)

- Install Frontend Dependencies
```bash
npm install
# or
yarn
```
Run development server:
```bash
npm run dev
```
Frontend will be running on 👉 http://localhost:3000

- Run Backend (Golang API)
```bash
cd backend
go mod tidy
go run main.go
```
Backend will be available at 👉 http://localhost:8080
---

### 2. Clone the Project

```bash
git clone https://github.com/thunwaaa/plante.git
cd plante
```
