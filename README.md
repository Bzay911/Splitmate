# 📱 Splitmate - Expense Splitting Made Easy

A modern, full-stack mobile application built with React Native and Expo for splitting expenses among friends and groups. Track shared expenses, manage debts, and settle payments seamlessly.

![Splitmate Logo](./assets/images/appLogo.png)

## ✨ Features

### 🎯 Core Functionality
- **User Authentication**: Secure sign-up and login with token-based authentication
- **Group Management**: Create and manage expense groups with friends
- **Expense Tracking**: Add, edit, and categorize shared expenses
- **Smart Splitting**: Automatically split expenses among group members
- **Balance Tracking**: View who owes what at a glance
- **Financial Dashboard**: Complete overview of your financial status
- **Easy Bill Upload**: Easy bill upload by just scanning your receipt using mobile cam

### 📊 Financial Features
- Real-time balance calculations
- Credit/Debt tracking
- Expense history

### 👥 Social Features
- Add friends as "Splitmates"
- Group-based expense sharing
- Profile management with custom avatars
- Activity history

### 📱 Mobile Experience
- Beautiful, modern UI with dark theme
- Camera integration for receipt scanning
- Haptic feedback for better UX
- Cross-platform support (iOS & Android)
- Responsive design for different screen sizes

## 🏗️ Architecture

### Frontend (React Native + Expo)
```
├── app/                    # App Router screens
│   ├── (protected)/       # Protected routes requiring authentication
│   │   ├── (tabs)/        # Tab navigation screens
│   │   │   ├── index.tsx  # Dashboard/Home
│   │   │   ├── Groups.tsx # Groups management
│   │   │   ├── History.tsx# Transaction history
│   │   │   └── Profile.tsx# User profile
│   │   ├── AddExpense.tsx # Add new expense
│   │   ├── CreateGroup.tsx# Create new group
│   │   └── GroupDetails.tsx# Group details & management
│   ├── SignIn.tsx         # Authentication screens
│   └── SignUp.tsx
├── components/            # Reusable UI components
├── contexts/             # React Context providers
│   ├── AuthContext.tsx   # Authentication state
│   ├── GroupsContext.tsx # Groups management
│   ├── FinancialContext.tsx # Financial data
│   └── ActivityContext.tsx # Activity tracking
├── constants/            # App constants and configuration
└── hooks/               # Custom React hooks
```

### Backend (Node.js + Express + MongoDB)
```
backend/
├── src/
│   ├── controllers/      # Route handlers
│   │   ├── user.controller.js
│   │   ├── group.controller.js
│   │   └── expense.controller.js
│   ├── models/          # MongoDB schemas
│   │   ├── user.js
│   │   ├── group.js
│   │   ├── expenses.js
│   │   └── activity.js
│   ├── routes/          # API routes
│   └── config/          # Database configuration
├── middleware/          # Custom middleware
└── server.js           # Entry point
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB database
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development)
- Android Studio/Emulator (for Android development)

### Installation

#### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd Splitmate
```

#### 2. Install Frontend Dependencies
```bash
npm install
```

#### 3. Install Backend Dependencies
```bash
cd backend
npm install
```

#### 4. Environment Setup

Create a `.env` file in the `backend` directory:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/splitmate
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development

# Optional: Add other service configurations
GOOGLE_AI_API_KEY=your-google-ai-key
EMAIL_SERVICE_CONFIG=your-email-config
```

#### 5. Configure API URL
Update the API URL in `app.json` and `constants/ApiConfig.ts` to match your backend server:
```json
{
  "expo": {
    "extra": {
      "apiUrl": "http://your-server-ip:3000"
    }
  }
}
```

### 🏃‍♂️ Running the Application

#### Start Backend Server
```bash
cd backend
npm run dev
# Server will run on http://localhost:3000
```

#### Start Frontend Application
```bash
# In the root directory
npx expo start

# Or for specific platforms:
npx expo start --ios     # iOS simulator
npx expo start --android # Android emulator
npx expo start --web     # Web browser
```

## 📱 Usage

### Getting Started
1. **Sign Up**: Create a new account with email and password
2. **Create Profile**: Add your display name and profile picture
3. **Add Friends**: Invite friends to become your "Splitmates"
4. **Create Groups**: Set up groups for different activities (trips, dinners, etc.)
5. **Add Expenses**: Log shared expenses and split them automatically
6. **Track Balances**: Monitor who owes what in real-time
7. **Settle Up**: Mark expenses as paid when settled

### Key Screens
- **Dashboard**: Overview of your financial status and recent activity
- **Groups**: Manage all your expense groups
- **Add Expense**: Quick expense entry with camera integration
- **Group Details**: Detailed view of group expenses and balances
- **Profile**: Manage your account and preferences

## 🛠️ Technology Stack

### Frontend
- **React Native** - Cross-platform mobile development
- **Expo** - Development platform and tools
- **TypeScript** - Type-safe JavaScript
- **React Navigation** - Navigation library
- **Expo Router** - File-based routing
- **React Context** - State management
- **AsyncStorage** - Local data persistence
- **Expo Camera** - Camera integration
- **React Native Reanimated** - Smooth animations

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Multer** - File upload handling
- **CORS** - Cross-origin resource sharing

### Development Tools
- **ESLint** - Code linting
- **TypeScript** - Static type checking
- **Expo CLI** - Development tooling
- **Prettier** - Code formatting (recommended)

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Protected API routes
- Input validation and sanitization
- Secure token storage
- CORS configuration
  
### Development Guidelines
- Follow TypeScript best practices
- Use functional components with hooks
- Implement proper error handling
- Add appropriate comments for complex logic
- Test on both iOS and Android platforms

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/validate` - Token validation
- `GET /api/auth/summary` - Financial summary
- `GET /api/auth/splitmates` - Get user's splitmates

### Groups Endpoints
- `GET /api/groups` - Get user's groups
- `POST /api/groups` - Create new group
- `GET /api/groups/:id` - Get group details
- `PUT /api/groups/:id` - Update group
- `DELETE /api/groups/:id` - Delete group

### Expenses Endpoints
- `GET /api/expenses` - Get expenses
- `POST /api/expenses` - Add new expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
