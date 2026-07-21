# Social Media Backend

A scalable and secure backend application for a **Social Media platform**, built with **Node.js**, **JavaScript**, and **MongoDB**. The project provides RESTful APIs for user authentication, profile management, posts, comments, likes, and social interactions while following a clean, modular, and maintainable architecture.

##  Features

- User Authentication & Authorization using JWT
- User Registration & Login
- Secure Password Hashing
- User Profile Management
- Create, Update, Delete, and Retrieve Posts
- Like & Unlike Posts
- Comment Management
- Follow & Unfollow Users
- Protected Routes
- Input Validation
- Global Error Handling
- Modular Project Structure
- MongoDB Integration with Mongoose
- RESTful API Design

##  Tech Stack

- JavaScript
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT (JSON Web Token)
- bcrypt
- dotenv
- Express Validator

##  Project Structure

```
src/
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── services/
├── utils/
└── app.ts
```

##  Installation

```bash
git clone https://github.com/your-username/social-media-backend.git

cd social-media-backend

npm install

npm run dev
```

##  Environment Variables

Create a `.env` file in the project root and configure the following variables:

```env
PORT=3000
DB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

##  API Overview

- Authentication
- User Management
- Profile Management
- Posts
- Comments
- Likes
- Follow System

##  Learning Objectives

This project was developed to strengthen backend development skills by implementing:

- RESTful API Development
- Authentication & Authorization
- MongoDB Data Modeling
- Scalable Backend Architecture
- Middleware Design
- Error Handling
- API Security
- Social Media Data Relationships

##  Author

**Mostafa Elhenawy**

Backend Software Engineer (Node.js)
