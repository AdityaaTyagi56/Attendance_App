# 🎓 IIIT-NR Attendance System

<div align="center">

![IIIT-NR Attendance](https://img.shields.io/badge/IIIT--NR-Attendance%20System-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?style=for-the-badge&logo=typescript)
![Flask](https://img.shields.io/badge/Flask-3.0.0-000000?style=for-the-badge&logo=flask)
![MongoDB](https://img.shields.io/badge/MongoDB-Cloud-47A248?style=for-the-badge&logo=mongodb)
![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=for-the-badge&logo=vercel)
![Render](https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render)

**A modern, AI-powered attendance management system for IIIT Naya Raipur**

[🌐 Live Demo](https://iiit-nr-attendance2.vercel.app/) • [📱 Download APK](#-mobile-app-android) • [📖 Documentation](#-documentation)

</div>

---

## 🌟 **NEW FEATURES & DEPLOYMENT**

### 🚀 **Now Live & Globally Accessible!**
- **✅ Web App**: Deployed on Vercel - Access from anywhere in the world
- **✅ Backend API**: Running on Render - Scalable cloud infrastructure  
- **✅ Database**: MongoDB Atlas - Secure cloud database
- **✅ Mobile Ready**: Build APK for Android devices
- **✅ AI Powered**: Gemini 2.5 Flash integration for intelligent features

### 🔗 **Live URLs**
- **Frontend**: https://iiit-nr-attendance2.vercel.app/
- **Backend API**: https://iiit-nr-attendance-backend.onrender.com/
- **Repository**: https://github.com/AdityaaTyagi56/iiit-nr-attendance2

---

## 📋 Overview

IIIT-NR Attendance System is a comprehensive, cloud-deployed attendance management solution designed specifically for educational institutions. It combines a beautiful, responsive web interface with powerful AI capabilities to streamline attendance tracking, generate insights, and provide personalized student analytics.

### ✨ Key Highlights

- 🌐 **Global Access** - Deploy once, access from anywhere with internet
- 🤖 **AI-Powered Analytics** - Intelligent attendance summaries and predictions powered by Gemini 2.5 Flash
- 📱 **Cross-Platform** - Web app + Android mobile app (via Capacitor)
- ☁️ **Cloud Infrastructure** - Vercel frontend + Render backend + MongoDB Atlas
- 🎨 **Modern UI/UX** - Beautiful glassmorphic design with dark/light theme support
- 🔄 **Real-time Sync** - Cloud database for seamless data synchronization
- 👥 **Multi-Role Support** - Separate dashboards for students and teachers
- 📊 **Advanced Reporting** - Generate comprehensive attendance reports with visual analytics
- 🔒 **Secure** - Environment-based API key management and CORS protection

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

### AI Features (Powered by Gemini 2.5 Flash)
- 📝 **Attendance Summaries** - Automatically generated course-level insights
- 🎓 **Student Summaries** - Personalized performance feedback
- 🎯 **Goal Generation** - Smart attendance improvement suggestions
- 🔮 **Trend Prediction** - Forecast future attendance patterns
- 💬 **Interactive Chat** - AI-powered academic assistant for students and teachers

---

## 🛠️ Tech Stack

### Frontend (Deployed on Vercel)
- **Framework**: React 19.2.0 with TypeScript
- **Build Tool**: Vite 6.2.0
- **UI Libraries**: 
  - Framer Motion (animations)
  - Lucide React (icons)
  - React Markdown (rich text rendering)
- **Mobile**: Capacitor 7.4.4 for Android APK generation
- **Styling**: Custom CSS with glassmorphism effects
- **Deployment**: Vercel with automatic GitHub integration

### Backend (Deployed on Render)
- **Framework**: Flask 3.0.0 (Python)
- **Database**: MongoDB Cloud (Atlas)
- **AI Engine**: Gemini 2.5 Flash via Google Generative AI SDK
- **API**: RESTful API with CORS support
- **Deployment**: Render with automatic GitHub integration

### Infrastructure & Services
- **Database**: MongoDB Atlas (Cloud)
- **AI Service**: Google Gemini 2.5 Flash
- **CDN**: Vercel Edge Network
- **Backend Hosting**: Render Cloud Platform
- **Version Control**: GitHub with automated deployments
- **State Management**: React Hooks with localStorage persistence
- **PWA**: Service Worker for offline functionality

---

## 🌐 Quick Start (Use Live Version)

### For End Users
1. **Visit**: https://iiit-nr-attendance2.vercel.app/
2. **Login** with teacher credentials:
   - Email: `dsai-teacher@iiitnr.edu.in`
   - Password: `pass123`
3. **Start managing attendance** immediately!

### For Mobile Users
1. **Build APK** following the [Mobile App Guide](#-mobile-app-android)
2. **Install** on your Android device
3. **Access** all features offline + online

---

## 📱 Mobile App (Android)

### Build APK
```bash
# Clone the repository
git clone https://github.com/AdityaaTyagi56/iiit-nr-attendance2.git
cd iiit-nr-attendance2

# Install dependencies
npm install

# Build for production
npm run build

# Sync with Capacitor
npx cap sync android

# Open in Android Studio
open -a "Android Studio" android/
```

### Build in Android Studio
1. Wait for Gradle sync to complete
2. **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
3. Find APK at: `android/app/build/outputs/apk/debug/app-debug.apk`

### Install on Device
- Transfer APK to your phone
- Enable "Install from Unknown Sources"
- Install the app
- Enjoy native mobile experience!

---

## 🏗️ Development Setup (Local)

### Prerequisites
- **Node.js** (v18 or higher)
- **Python** (v3.8 or higher)
- **MongoDB Atlas Account**
- **Google AI Studio API key**
- **Android Studio** (for mobile builds)

### Step 1: Clone Repository
```bash
git clone https://github.com/AdityaaTyagi56/iiit-nr-attendance2.git
cd iiit-nr-attendance2
```

### Step 2: Frontend Setup
```bash
npm install
```

### Step 3: Backend Setup
```bash
cd backend
pip install -r requirements.txt

# Create .env file
echo "MONGODB_URI=your_mongodb_connection_string" > .env
echo "GEMINI_API_KEY=your_gemini_api_key" >> .env
echo "PORT=5001" >> .env
```

### Step 4: Run Development Servers
```bash
# Start all services
./scripts/start-all.sh

# Or start individually
# Terminal 1 - Backend
cd backend && python app_mongodb.py

# Terminal 2 - Frontend
npm run dev
```

Visit:
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:5001

---

## 🚀 Deployment Guide

### Deploy to Vercel (Frontend)
1. **Connect GitHub** to Vercel
2. **Import** your forked repository
3. **Configure** build settings:
   - Framework: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **Deploy** - Automatic on every push!

### Deploy to Render (Backend)
1. **Connect GitHub** to Render
2. **Create Web Service** from repository
3. **Configure**:
   - Environment: `Python`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `python app_mongodb.py`
4. **Add Environment Variables**:
   - `MONGODB_URI`
   - `GEMINI_API_KEY`
   - `PORT=5001`
5. **Deploy** - Automatic on every push!

### MongoDB Atlas Setup
1. Create free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create cluster and database
3. Get connection string
4. Add to backend environment variables

---

## 📚 Documentation

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete deployment guide
- **[docs/APK_BUILD_GUIDE.md](docs/APK_BUILD_GUIDE.md)** - Android app build instructions
- **[docs/MONGODB_GUIDE.md](docs/MONGODB_GUIDE.md)** - MongoDB integration guide
- **[docs/SETUP.md](docs/SETUP.md)** - Detailed setup instructions
- **[docs/SERVICE_MANAGEMENT.md](docs/SERVICE_MANAGEMENT.md)** - Service management scripts

---

## 🏗️ Project Structure

```
iiit-nr-attendance2/
├── src/
│   ├── components/           # React components
│   │   ├── AttendanceTaker.tsx
│   │   ├── CourseManager.tsx
│   │   ├── StudentManager.tsx
│   │   ├── TeacherDashboard.tsx
│   │   ├── StudentDashboard.tsx
│   │   ├── ReportGenerator.tsx
│   │   ├── Chatbot.tsx
│   │   └── ...
│   ├── services/            # API services
│   │   ├── apiService.ts
│   │   └── geminiService.ts
│   └── hooks/               # Custom React hooks
├── backend/                 # Flask backend
│   ├── app_mongodb.py       # Main Flask app
│   ├── database.py          # MongoDB operations
│   ├── requirements.txt     # Python dependencies
│   └── .env                 # Environment variables (local)
├── android/                 # Capacitor Android project
├── public/                  # Static assets
├── scripts/                 # Helper scripts
├── docs/                    # Documentation
├── vercel.json             # Vercel deployment config
├── render.yaml             # Render deployment config
└── capacitor.config.ts     # Mobile app configuration
```

---

## 🔧 Configuration

### Environment Variables

**Frontend (.env.production)**
```env
VITE_API_URL=https://iiit-nr-attendance-backend.onrender.com/api
```

**Backend (Render Environment)**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/attendance_db
GEMINI_API_KEY=your_gemini_api_key
PORT=5001
```

### Security Features
- ✅ **API Keys**: Never stored in Git, environment-only
- ✅ **CORS**: Configured for cross-origin requests
- ✅ **HTTPS**: SSL/TLS encryption on all deployed services
- ✅ **Input Validation**: Server-side request validation
- ✅ **Error Handling**: Graceful error responses

---

## 🎯 Usage

### Default Login Credentials

**Teacher Account:**
- Email: `dsai-teacher@iiitnr.edu.in`
- Password: `pass123`

**Student Accounts:**
- Created by teachers through the student management interface
- Login with assigned email and password

### Key Workflows

1. **Teacher Registration**: Use teacher dashboard to manage courses and students
2. **Attendance Taking**: Quick bulk attendance marking with visual feedback
3. **AI Reports**: Generate intelligent insights on student performance
4. **Student Portal**: Personal dashboard with attendance tracking and AI chat
5. **Mobile Access**: Install APK for native mobile experience

---

## 🔄 Updates & Maintenance

### Automatic Deployments
- **Frontend**: Auto-deploys on push to `main` branch (Vercel)
- **Backend**: Auto-deploys on push to `main` branch (Render)
- **Database**: Always available (MongoDB Atlas)

### Manual Updates
```bash
# Update dependencies
npm update
pip install -r requirements.txt --upgrade

# Rebuild and redeploy
npm run build
git add . && git commit -m "Update" && git push
```

### Monitoring
- **Frontend**: Vercel Analytics Dashboard
- **Backend**: Render Metrics and Logs
- **Database**: MongoDB Atlas Monitoring
- **API**: Health check endpoint at `/api/health`

---

## 🤝 Contributing

Contributions are welcome! Here's how to contribute:

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/yourusername/iiit-nr-attendance2.git`
3. **Create branch**: `git checkout -b feature/AmazingFeature`
4. **Make changes** and test locally
5. **Commit**: `git commit -m 'Add some AmazingFeature'`
6. **Push**: `git push origin feature/AmazingFeature`
7. **Create Pull Request** on GitHub

### Development Guidelines
- Follow TypeScript best practices
- Add tests for new features
- Update documentation
- Test mobile builds before submitting
- Ensure all services work in production

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👨‍💻 Author

**Aditya Tyagi**
- 📧 Email: adityat25102@iiitnr.edu.in
- 🏫 Institution: IIIT Naya Raipur
- 💼 GitHub: [@AdityaaTyagi56](https://github.com/AdityaaTyagi56)

---

## 🙏 Acknowledgments

- **IIIT Naya Raipur** for the educational environment
- **Google DeepMind** for Gemini AI models and APIs
- **Vercel** for seamless frontend deployment
- **Render** for reliable backend hosting
- **MongoDB Atlas** for cloud database services
- **React & Flask** communities for excellent documentation

---

## 📞 Support & Contact

If you encounter any issues or have questions:

1. 📖 **Check Documentation**: Review the [docs/](docs/) directory
2. 🐛 **Report Issues**: Create a GitHub issue with details
3. 💬 **Contact**: Email adityat25102@iiitnr.edu.in
4. 🌐 **Live Demo**: Test at https://iiit-nr-attendance2.vercel.app/

### Common Issues & Solutions

**API Connection Issues**:
- Verify backend URL in `.env.production`
- Check Render service status
- Ensure CORS is properly configured

**Mobile Build Issues**:
- Update Android SDK and tools
- Clean and rebuild: `./gradlew clean && ./gradlew assembleDebug`
- Check Capacitor configuration

**AI Features Not Working**:
- Verify Gemini API key is valid
- Check API quota and usage limits
- Review backend logs for errors

---

<div align="center">

## 🌟 **Ready to Transform Attendance Management?**

### **[🚀 Try Live Demo](https://iiit-nr-attendance2.vercel.app/) | [📱 Build Mobile App](#-mobile-app-android) | [⭐ Star on GitHub](https://github.com/AdityaaTyagi56/iiit-nr-attendance2)**

**Made with ❤️ for IIIT Naya Raipur and the global education community**

*Deployed on Vercel & Render • Powered by Gemini AI • Built with React & Flask*

</div>