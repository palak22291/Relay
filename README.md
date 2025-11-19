# 🌐 Connectify – A Modern Social Media Platform for Digital Interaction and Community Building

## Live Demo  
 Frontend (Vercel):[https://connectify-palaks-projects-63c6e26a.vercel.app](https://connectify-palaks-projects-63c6e26a.vercel.app)
##  Project Overview

Connectify is a modern, real-time social networking platform designed to provide a clean, responsive, and community-driven experience.  
It empowers users to share posts, interact instantly, and receive live updates — all built with a modular and developer-friendly architecture.

##  Problem Statement

In today’s digital landscape, users demand **real-time interaction** — instant chats, live notifications, and personalized content.  
Most existing platforms are either cluttered or not easily customizable for developers.  

Connectify addresses these issues by offering:
- Real-time communication via Socket.IO
- A clean and modern UI using React + MUI
- Structured data handling with PostgreSQL + Prisma**
- Secure authentication through JWT
- Scalable backend architecture using **Express.js


# System Architecture

| Layer              | Technology Used |
|--------------------|-----------------|
| **Frontend**       | React, React Router, Axios, Material UI |
| **Backend**        | Node.js, Express.js |
| **Database**       | PostgreSQL with Prisma ORM |
| **Authentication** | JWT (JSON Web Token) |
| **Hosting**        | Frontend → Vercel <br> Backend → Render <br> Database → Render (PostgreSQL) |



##  Key Features

| Category | Description |
|-----------|--------------|
| **Authentication & Authorization** | Secure user registration, login, and JWT-based authentication |
| **User Profiles** | Edit bio, update profile image, follow/unfollow users |
| **Social Feed** | Create posts, view global feed, like and comment on posts |
| **CRUD Operations** | Users can Create, Read, Update, and Delete posts |
| **Frontend Routing** | Organized navigation for Login, Signup, Home, and Profile pages |
| **Responsive UI** | Mobile-first, clean design built with Material UI |
| **Real-Time Features** | Live chat, instant notifications, and real-time post feed updates using Socket.IO |
| **Scalability Ready** | Modular API structure and cloud-based deployment |


##  API Overview

| Endpoint | Method | Description | Access |
|-----------|---------|-------------|---------|
| `/api/auth/register` | POST | Register a new user | Public |
| `/api/auth/login` | POST | Authenticate user and generate token | Public |
| `/api/auth/me` | GET | Fetch details of the currently logged-in user | Authenticated |
| `/api/posts` | POST | Create a post | Authenticated |
| `/api/posts/:id` | DELETE | Delete a post | Admin Only |


## Authentication Flow
- Passwords are securely **hashed** before storage.
- Upon login, a **JWT token** is generated and stored on the client side.
- The token can be verified using [jwt.io](https://jwt.io) to confirm valid payload structure and user identity.


##  Deployment Summary
- **Frontend** deployed on [Vercel](https://vercel.com)  
- **Backend** deployed on [Render](https://render.com)  
- **Database** hosted on Render (PostgreSQL)


##  Contributors
**Developed by:** Palak Gupta  
2nd Year Engineering Student  


##  Future Enhancements
- Real-time direct messaging (DMs)  
- Profile customization and themes  
- Friend recommendations based on mutual interests  
- Advanced analytics dashboard  


### Project Status
 **Authentication and Authorization completed**  
 **Frontend and backend successfully deployed**  
 **Next phase:** Real-time communication and advanced social features




