# DreamIt - Modern Q&A Platform

A beautiful, mobile-responsive Q&A web application built with React, TypeScript, and modern UI components.

## 🚀 Features

### User Roles & Permissions

#### Guest Users (Not Logged In)
- Browse questions with search and filtering
- View question details and answers
- See vote counts and answer statistics
- Cannot vote, answer, or ask questions (redirected to login)

#### Authenticated Users
- All guest features plus:
- Ask new questions with rich text editor
- Submit answers to questions
- Upvote/downvote questions and answers
- Real-time notifications via Socket.io
- Accept answers (if question author)
- User profile with stats and activity

#### Admin Users
- All user features plus:
- Admin panel for user management
- Ban/unban users
- Delete questions and answers
- View platform statistics

### 🎨 Modern UI/UX
- **Beautiful gradient design system** with purple-to-blue theme
- **Fully responsive** mobile-first design
- **Real-time notifications** with toast messages
- **Smooth animations** and hover effects
- **Dark/light mode support**
- **Glassmorphism effects** for modern feel

### 🔧 Technical Features
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Socket.io** for real-time features
- **Axios** for API calls
- **React Router** for navigation
- **Context API** for state management
- **JWT authentication** with automatic token refresh

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Custom Design System
- **UI Components**: Shadcn/ui, Custom Components
- **State Management**: React Context API
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Real-time**: Socket.io-client
- **Animations**: Framer Motion
- **Build Tool**: Vite
- **Package Manager**: npm

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (shadcn/ui)
│   ├── QuestionCard.tsx
│   ├── VoteButtons.tsx
│   └── ...
├── pages/              # Page components
│   ├── Home.tsx
│   ├── QuestionDetail.tsx
│   ├── AskQuestion.tsx
│   └── Profile.tsx
├── context/            # React Context providers
│   ├── AuthContext.tsx
│   └── NotificationContext.tsx
├── services/           # API service layer
│   └── api.ts
├── utils/              # Utility functions
│   └── env.ts
├── hooks/              # Custom React hooks
└── styles/             # Global styles and design system
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend API server running

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sumit171204/Hackathon_2025
   cd client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your backend API URL:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_WS_URL=http://localhost:5000
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 📱 Pages & Routes

- `/` - Home page with question list and search
- `/questions/:id` - Question detail page with answers
- `/ask` - Ask new question form (authenticated only)
- `/profile/:username` - User profile with questions/answers
- `/admin` - Admin panel (admin users only)

## 🎨 Design System

The app uses a custom design system with:

- **Primary Colors**: Purple-to-blue gradient theme
- **Typography**: Modern font hierarchy
- **Spacing**: Consistent spacing scale
- **Shadows**: Soft shadows with primary color tints
- **Animations**: Smooth transitions and hover effects
- **Components**: Reusable component variants

### Key Design Tokens
```css
--primary: Purple gradient (#6366f1 to #3b82f6)
--secondary: Accent blue (#0ea5e9)
--success: Green (#10b981)
--warning: Amber (#f59e0b)
--destructive: Red (#ef4444)
```

## 🔌 API Integration

The app connects to a Node.js backend with these endpoints:

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/me` - Get current user

### Questions
- `GET /questions` - List questions with pagination/search
- `GET /questions/:id` - Get question details
- `POST /questions` - Create new question
- `PUT /questions/:id` - Update question
- `DELETE /questions/:id` - Delete question

### Answers
- `POST /answers/:questionId` - Create answer
- `POST /answers/vote/:answerId` - Vote on answer
- `PATCH /answers/:id/accept` - Accept answer

### Real-time Features
- Socket.io connection for live notifications
- Real-time vote updates
- New answer notifications

## 🔒 Authentication Flow

1. User logs in via modal form
2. JWT token stored in localStorage
3. Token added to Axios headers automatically
4. Socket.io authenticated with same token
5. Auto-refresh on token expiration
6. Secure logout clears all auth data

## 🌟 Key Features Implemented

- ✅ Beautiful responsive design with gradients
- ✅ Complete authentication system
- ✅ Question/answer CRUD operations
- ✅ Real-time notifications
- ✅ Vote system with visual feedback
- ✅ Search and filtering
- ✅ User profiles and stats
- ✅ Mobile-responsive navigation
- ✅ Loading states and error handling
- ✅ Toast notifications
- ✅ Rich text editing for content

## 🚀 Deployment

The app is configured for easy deployment to:
- **Vercel** (recommended)
- **Netlify**
- **AWS S3 + CloudFront**
- **Any static hosting service**

Build command: `npm run build`
Output directory: `dist/`

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**DreamIt** - Where developers ask, answer, and grow together! 🚀
