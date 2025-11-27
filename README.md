# 🎓 IIIT-NR Attendance System

<div align="center">

![IIIT-NR Attendance](https://img.shields.io/badge/IIIT--NR-Attendance%20System-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?style=for-the-badge&logo=typescript)
![Flask](https://img.shields.io/badge/Flask-3.0.0-000000?style=for-the-badge&logo=flask)
![MongoDB](https://img.shields.io/badge/MongoDB-Cloud-47A248?style=for-the-badge&logo=mongodb)

**A modern, AI-powered attendance management system for IIIT Naya Raipur**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [Usage](#-usage) • [Documentation](#-documentation)

</div>

---

## 📋 Overview

IIIT-NR Attendance System is a comprehensive attendance management solution designed specifically for educational institutions. It combines a beautiful, responsive web interface with powerful AI capabilities to streamline attendance tracking, generate insights, and provide personalized student analytics.

### ✨ Key Highlights

- 🤖 **AI-Powered Analytics** - Intelligent attendance summaries and predictions using Ollama (Llama 3)
- 📱 **Cross-Platform** - Works as a web app and Android mobile app (via Capacitor)
- 🎨 **Modern UI/UX** - Beautiful glassmorphic design with dark/light theme support
- 🔄 **Real-time Sync** - MongoDB cloud integration for seamless data synchronization
- 👥 **Multi-Role Support** - Separate dashboards for students and teachers
- 📊 **Advanced Reporting** - Generate comprehensive attendance reports with visual analytics

---

## 🚀 Features

### For Teachers
- ✅ **Quick Attendance Taking** - Mark attendance for entire classes in seconds
- 📚 **Course Management** - Create and manage courses with student enrollment
- 👨‍🎓 **Student Management** - Add, edit, and organize student records
- 📈 **AI-Generated Reports** - Get intelligent insights on class performance
- 🎯 **At-Risk Detection** - Automatically identify students with low attendance
- 📊 **Visual Analytics** - Interactive charts and attendance distribution graphs

### For Students
- 📱 **Personal Dashboard** - View attendance across all enrolled courses
- 📉 **Attendance Tracking** - Monitor attendance percentage in real-time
- 🎯 **Goal Setting** - AI-powered attendance goal recommendations
- 🔮 **Performance Prediction** - Predict end-of-semester attendance trends
- 💬 **AI Chatbot** - Get personalized academic advice and support

### AI Features
- 📝 **Attendance Summaries** - Automatically generated course-level insights
- 🎓 **Student Summaries** - Personalized performance feedback
- 🎯 **Goal Generation** - Smart attendance improvement suggestions
- 🔮 **Trend Prediction** - Forecast future attendance patterns
- 💬 **Interactive Chat** - AI-powered academic assistant

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19.2.0 with TypeScript
- **Build Tool**: Vite 6.2.0
- **UI Libraries**: 
  - Framer Motion (animations)
  - Lucide React (icons)
  - React Markdown (rich text rendering)
- **Mobile**: Capacitor 7.4.4 for Android APK generation
- **Styling**: Custom CSS with glassmorphism effects

### Backend
- **Framework**: Flask 3.0.0 (Python)
- **Database**: MongoDB Cloud (Atlas)
- **AI Engine**: Ollama with Llama 3 model
- **API**: RESTful API with CORS support

### Infrastructure
- **Service Worker**: PWA support for offline functionality
- **State Management**: React Hooks with localStorage persistence
- **API Communication**: Axios for HTTP requests

---

## 📦 Installation

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **Python** (v3.8 or higher)
- **MongoDB Atlas Account** (for cloud database)
- **Ollama** (for AI features)

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/iiit-nr-attendance.git
cd iiit-nr-attendance
```

### Step 2: Frontend Setup

```bash
# Install dependencies
npm install

# Create environment files
cp .env.local.example .env.local
cp .env.production.example .env.production
```

### Step 3: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
```

Edit `backend/.env` and add your MongoDB connection string:

```env
MONGODB_URI=your_mongodb_connection_string_here
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3
PORT=5001
```

### Step 4: Install and Configure Ollama

```bash
# Install Ollama (macOS/Linux)
curl -fsSL https://ollama.com/install.sh | sh

# Pull the Llama 3 model
ollama pull llama3

# Start Ollama service
ollama serve
```

### Step 5: MongoDB Setup

1. Create a free MongoDB Atlas account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Add it to `backend/.env`

For detailed MongoDB setup instructions, see [MONGODB_GUIDE.md](MONGODB_GUIDE.md)

---

## 🎯 Usage

### Running Locally (Development)

#### Option 1: Using Helper Scripts (Recommended)

```bash
# Start all services (frontend + backend + ollama check)
./start-all.sh

# Check service status
./check-status.sh

# Stop all services
./stop-all.sh
```

#### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
cd backend
python app_mongodb.py
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

**Terminal 3 - Ollama:**
```bash
ollama serve
```

The application will be available at:
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:5001
- **Ollama**: http://localhost:11434

### Default Login Credentials

**Teacher Account:**
- Email: `dsai-teacher@iiitnr.edu.in`
- Password: `pass123`

**Student Account:**
- Students can be created by teachers
- Login using student email and password

---

## 📱 Building Android APK

To build the Android mobile app:

```bash
# Build the web app
npm run build

# Sync with Capacitor
npx cap sync android

# Open in Android Studio
npx cap open android
```

For detailed APK build instructions, see [APK_BUILD_GUIDE.md](APK_BUILD_GUIDE.md)

---

## 📚 Documentation

- **[SETUP.md](SETUP.md)** - Detailed setup and configuration guide
- **[MONGODB_GUIDE.md](MONGODB_GUIDE.md)** - MongoDB integration and migration
- **[APK_BUILD_GUIDE.md](APK_BUILD_GUIDE.md)** - Android app build instructions
- **[MOBILE_SETUP.md](MOBILE_SETUP.md)** - Mobile-specific configuration
- **[SERVICE_MANAGEMENT.md](SERVICE_MANAGEMENT.md)** - Service management scripts

---

## 🏗️ Project Structure

```
iiit-nr-attendance/
├── components/              # React components
│   ├── AttendanceTaker.tsx  # Attendance marking interface
│   ├── CourseManager.tsx    # Course management
│   ├── StudentManager.tsx   # Student management
│   ├── StudentDashboard.tsx # Student view
│   ├── TeacherDashboard.tsx # Teacher view
│   ├── ReportGenerator.tsx  # Report generation
│   ├── Chatbot.tsx          # AI chatbot
│   └── ...
├── backend/                 # Flask backend
│   ├── app_mongodb.py       # Main Flask app
│   ├── database.py          # MongoDB operations
│   ├── requirements.txt     # Python dependencies
│   └── .env                 # Environment variables
├── services/                # Frontend services
│   ├── apiService.ts        # API communication
│   └── geminiService.ts     # Gemini AI integration
├── android/                 # Capacitor Android project
├── dist/                    # Production build output
├── public/                  # Static assets
├── *.sh                     # Helper scripts
└── package.json             # Node dependencies
```

---

## 🔧 Configuration

### Frontend Configuration

Edit `capacitor.config.ts` to configure the backend URL:

```typescript
const config: CapacitorConfig = {
  appId: 'com.iiitnr.attendance',
  appName: 'IIIT-NR Attendance',
  webDir: 'dist',
  server: {
    url: 'http://your-backend-ip:3001',
    // ...
  }
};
```

### Backend Configuration

Edit `backend/.env`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3
PORT=5001
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👨‍💻 Author

**Aditya Tyagi**
- Email: adityat25102@iiitnr.edu.in
- Institution: IIIT Naya Raipur

---

## 🙏 Acknowledgments

- IIIT Naya Raipur for the educational environment
- Ollama team for the amazing AI integration
- MongoDB for reliable cloud database services
- React and Flask communities for excellent documentation

---

## 📞 Support

If you encounter any issues or have questions:

1. Check the [documentation](#-documentation)
2. Review existing issues on GitHub
3. Create a new issue with detailed information
4. Contact: adityat25102@iiitnr.edu.in

---

<div align="center">

**Made with ❤️ for IIIT Naya Raipur**

⭐ Star this repo if you find it helpful!

</div>

