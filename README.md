# ProjectFlow — Full-Stack Project Management Tool

A production-ready project management application built with React (Vite), Node.js, Express.js, MongoDB, and JWT Authentication.

---

## 🚀 Features

- **Authentication** — Register, Login, JWT-protected routes, bcrypt password hashing
- **Dashboard** — Stats cards, pie/bar charts, recent activity, overdue alerts
- **Projects** — Create, edit, delete, search, filter with color-coding and progress tracking
- **Tasks** — Full CRUD, priority/status management, assignment, due dates, comments
- **Board View** — Kanban-style task board per project
- **Dark / Light Mode** — System-aware theme toggle
- **Responsive UI** — Mobile-first sidebar, collapsible navigation
- **Toast Notifications** — Success/error feedback throughout
- **Form Validation** — Client and server-side

---

## 🗂️ Project Structure

```
projectflow/
├── backend/
│   ├── config/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── projectController.js
│   │   ├── taskController.js
│   │   └── userController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── projects.js
│   │   ├── tasks.js
│   │   └── users.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── common/
    │   │   └── layout/
    │   ├── context/
    │   ├── pages/
    │   ├── services/
    │   └── utils/
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### 1. Clone & Install

```bash
git clone https://gitlab.com/<your-username>/projectflow.git
cd projectflow

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Configure Environment Variables

**Backend** — copy `.env.example` to `.env`:
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/projectflow
JWT_SECRET=your_super_secret_jwt_key_at_least_32_chars
JWT_EXPIRE=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

**Frontend** — copy `.env.example` to `.env`:
```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Run Development Servers

Open two terminals:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# Runs on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# Runs on http://localhost:3000
```

Visit `http://localhost:3000` in your browser.

---

## 🗄️ MongoDB Atlas Setup

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user with read/write access
4. Whitelist your IP (or `0.0.0.0/0` for all IPs)
5. Get the connection string and add it to `MONGODB_URI`

---

## 🌐 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |
| PUT | `/api/auth/change-password` | Change password |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | Get all projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id` | Get project + tasks |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |
| GET | `/api/projects/dashboard` | Dashboard stats |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | Get all tasks |
| POST | `/api/tasks` | Create task |
| GET | `/api/tasks/:id` | Get task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| POST | `/api/tasks/:id/comments` | Add comment |
| DELETE | `/api/tasks/:id/comments/:commentId` | Delete comment |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List users |
| GET | `/api/users/:id` | Get user |

---

## ☁️ Deployment

### Backend on Render

1. Push code to GitLab (see below)
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitLab repo
4. Set **Root Directory** to `backend`
5. Set **Build Command**: `npm install`
6. Set **Start Command**: `node server.js`
7. Add Environment Variables:
   ```
   MONGODB_URI=<your atlas connection string>
   JWT_SECRET=<strong random secret>
   JWT_EXPIRE=7d
   NODE_ENV=production
   FRONTEND_URL=https://your-app.netlify.app
   ```
8. Click **Deploy**

### Frontend on Netlify

1. Go to [netlify.com](https://netlify.com) → New Site
2. Connect your GitLab repo
3. Set **Base directory**: `frontend`
4. Set **Build command**: `npm run build`
5. Set **Publish directory**: `frontend/dist`
6. Add Environment Variables:
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   ```
7. Click **Deploy site**
8. Add the Netlify URL as `FRONTEND_URL` in your Render backend env vars

### Netlify Redirects (for SPA routing)

Create `frontend/public/_redirects`:
```
/*    /index.html    200
```

---

## 🦊 GitLab Setup

```bash
# Initialize git repo in project root
cd /path/to/projectflow
git init
git add .
git commit -m "Initial commit: ProjectFlow full-stack app"

# Add GitLab remote (replace with your username/repo)
git remote add origin https://gitlab.com/<username>/projectflow.git

# Push to GitLab
git push -u origin main
```

If your default branch is `master`:
```bash
git push -u origin master
```

### Recommended `.gitignore`
```
# Root
node_modules/
.DS_Store
*.log

# Backend
backend/.env
backend/node_modules/

# Frontend
frontend/.env
frontend/node_modules/
frontend/dist/
```

---

## 🔐 Security Notes

- Never commit `.env` files — they're in `.gitignore`
- Use a strong `JWT_SECRET` (32+ random characters) in production
- Set `NODE_ENV=production` on your server
- Restrict MongoDB Atlas IP whitelist to your server IP in production
- Rotate secrets periodically

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router v6 |
| Styling | CSS Modules, DM Sans font |
| Charts | Recharts |
| HTTP Client | Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose |
| Auth | JWT + bcryptjs |
| Notifications | react-hot-toast |
| Deployment | Netlify (frontend), Render (backend) |

---

## 🧪 Demo Account

Register a new account on the app, or use the "Use demo account" button on the login page.
To seed a demo user on your backend, you can `POST /api/auth/register` with:
```json
{
  "name": "Demo User",
  "email": "demo@projectflow.app",
  "password": "demo123456"
}
```

---

## 📄 License

MIT License — free to use for personal and commercial projects.
