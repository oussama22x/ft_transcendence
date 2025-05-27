# ft_transcendence 🏓

![Pong Gameplay](https://upload.wikimedia.org/wikipedia/commons/5/5a/Pong.gif)

A full-stack web application built as part of the 42 school curriculum.  
It features a real-time multiplayer **Pong game**, user authentication, and a basic social system — all developed using Django and modern web standards.

## 🧠 Project Concept

The goal of `ft_transcendence` is to build a complete web platform combining:

- 🕹️ Real-time multiplayer game (Pong)
- 🔐 Secure user authentication (JWT, 2FA)
- 👥 Friend system and match history
- 🧑 User profiles and ranking

This project introduces key concepts in **web development**, including RESTful APIs, frontend/backend separation, real-time communication, and authentication.

## ⚙️ Features

- **Authentication**
  - Sign up / login
  - JWT-based authentication
  - Two-factor authentication (2FA)
  - OAuth2 (42 API)

- **Game**
  - Real-time Pong game
  - Matchmaking and private matches

- **Social**
  - Friends list
  - View other users’ profiles

- **User Profile**
  - Avatars and status
  - Match history
  - Player ranking system

## 🛠 Tech Stack

- **Frontend**: JavaScript, Bootstrap 5, CSS  
- **Backend**: Python, Django REST Framework  
- **Database**: PostgreSQL  
- **Auth**: JWT (JSON Web Tokens), 2FA, OAuth2  
- **Real-Time**: WebSockets (Django Channels)  
- **Deployment**: Docker, Nginx

## 🚀 Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ft_transcendence.git
   cd ft_transcendence
