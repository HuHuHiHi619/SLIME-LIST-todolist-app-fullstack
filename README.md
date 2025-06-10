# 🧪 SlimeList - Gamified Todo List Application
<div align="center">
  <img src="https://slimelist.netlify.app/images/Logo-slime.png" width="200" alt="SlimeList Logo">
  
  [Live Demo](https://slimelist.netlify.app/) | [GitHub Repository](https://github.com/HuHuHiHi619/slimelist)

  *Transform your daily tasks into an engaging journey with SlimeList - where productivity meets fun!*
</div>

## ✨ Features

### 📝 Task Management
- **CRUD Operations:** Create, read, update, and delete tasks effortlessly
- **Rich Task Details:** 
  - Add detailed notes
  - Set start dates and deadlines
  - Organize with categories
  - Track progress with subtasks
- **Search:** Quickly find tasks with the search functionality
- **Task Tracking:** Monitor tasks by:
  - Deadline status
  - Pending tasks
  - Completed tasks
  - Category tasks

### 🎮 Gamification
- **Streak System:** Build and maintain daily completion streaks
- **Level Progression:** Level up by completing tasks
- **Badge Collection:** Earn badges for achievements
- **Ranking System:** Compete with yourself and track progress

### 📊 Dashboard & Analytics
- **Interactive Graphics:** Visual representation of your productivity
- **Task Statistics:** Track completion rates and patterns
- **Category Analysis:** Monitor task distribution across categories

### 👤 User Experience
- **Guest Mode:** Try the app without registration
- **User Authentication:** Secure login with JWT
- **Responsive Design:** Works seamlessly on all devices

## 💻 Tech Stack
<div align="center">
  <img src="https://go-skill-icons.vercel.app/api/icons?i=react,express,vite,mongodb,tailwind,nodejs" alt="Tech Stack">
</div>

- **Frontend:**
  - React 18 (UI Library)
  - Vite (Build Tool)
  - Tailwind CSS (Styling)
  - Redux Toolkit (State Management)
  - React Router (Navigation)

- **Backend:**
  - Node.js (Runtime)
  - Express.js (Server Framework)
  - MongoDB (Database)
  - JWT (Authentication)
  - Node-cron (Scheduled Tasks)
  - Jest (Testing)

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [MongoDB](https://www.mongodb.com/) (local installation or MongoDB Atlas account)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/HuHuHiHi619/slimelist.git
   cd slimelist
   ```

2. **Install Backend Dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Environment Setup

1. **Create Backend Environment File**
   Create a `.env` file in the `backend` directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/slimelist
   # or use MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/slimelist
   LOCAL_URI=your-local-mongodb
   NODE_ENV=development
   ACCESS_TOKEN_SECRET=your-secret-jwt-key
   REFRESH_TOKEN_SECRET=your-secret-jwt-key
   IS_PRODUCTION=true
 
   ```

2. **Create Frontend Environment File**
   Create a `.env` file in the `frontend` directory:
   ```env
   VITE_LOCAL_API_URL = http://localhost:5000/api
   ```

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd server
   npm run dev
   # Server will run on http://localhost:5000
   ```

2. **Start the Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   # Application will run on http://localhost:3000
   ```

3. **Access the Application**
   Open your browser and navigate to `http://localhost:3000`

### Build for Production

1. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Build Backend**
   ```bash
   cd server
   npm start
   ```
   
## 🌟 Key Features Explained

### Gamification System
- **Streak Tracking:** Maintains daily task completion streaks
- **Automatic score:** Cron jobs calculate and update user streak

### Authentication
- **Dual Mode:** Supports both guest and registered users
- **JWT Integration:** Secure token-based authentication
- **Cookie Management:** Handles session persistence across devices

### Cross-Platform Compatibility
- **iOS Fix:** Resolved cookie issues through proxy configuration
- **Responsive Design:** Mobile-first approach with Tailwind CSS


## 🌟 Roadmap
- [ ] Mobile application (React Native)
- [ ] Advanced analytics dashboard
- [ ] Integration with calendar apps
- [ ] Custom theme builder
- [ ] Notification system


## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
<div align="center">
  Made with ❤️ by HuHuHiHi619
</div>
