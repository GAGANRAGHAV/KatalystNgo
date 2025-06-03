# Katalyst NGO Chatbot Platform

An AI-powered chatbot platform for [Katalyst India](https://katalystindia.org), designed to empower women by providing instant answers about the NGO's mission, programs, and services. The platform features a user-facing chatbot widget, an admin dashboard for query management, and a robust backend with vector search capabilities.

## 🌟 Features

- **🤖 Intelligent Chatbot Widget**: Users can ask questions about Katalyst's programs and receive instant, AI-powered responses
- **📧 Smart Fallback System**: When the chatbot can't provide confident answers, users can leave their email for personalized responses
- **👨‍💼 Admin Dashboard**: Comprehensive interface for viewing, managing, and responding to user queries
- **🔍 Vector Search**: Powered by Pinecone for semantic search over structured document chunks
- **📊 Query Logging**: MongoDB integration for tracking and analyzing user interactions
- **✉️ Email Integration**: Direct email responses to users through the admin dashboard

## 🏗️ Project Structure

```
KatalystNgoChatbot/
│
├── client/                          # Next.js Frontend Application
│   ├── app/                         # Next.js App Router pages
│   │   ├── admin/                   # Admin dashboard pages
│   │   ├── api/                     # API routes
│   │   ├── globals.css              # Global styles
│   │   ├── layout.tsx               # Root layout
│   │   └── page.tsx                 # Homepage
│   ├── components/                  # Reusable UI components
│   │   ├── ui/                      # shadcn/ui components
│   │   ├── ChatWidget.tsx           # Main chatbot widget
│   │   ├── AdminDashboard.tsx       # Admin interface
│   │   └── ...                      # Other components
│   ├── lib/                         # Utility functions and configurations
│   ├── public/                      # Static assets (images, icons, etc.)
│   ├── package.json                 # Frontend dependencies and scripts
│   ├── next.config.js               # Next.js configuration
│   ├── tailwind.config.js           # Tailwind CSS configuration
│   └── tsconfig.json                # TypeScript configuration
│
├── server/                          # FastAPI Backend Application
│   ├── app/                         # Application modules
│   │   ├── __init__.py
│   │   ├── db.py                    # Pinecone client setup
│   │   ├── mongo.py                 # MongoDB client configuration
│   │   ├── models.py                # Pydantic models
│   │   └── routes.py                # API route handlers
│   ├── main.py                      # FastAPI application entry point
│   ├── katalyst_upload.py           # Document processing and Pinecone upload script
│   ├── katalyst_pinecone.py         # Pinecone testing and query script
│   ├── requirements.txt             # Python dependencies
│   └── .env.example                 # Environment variables template
│
├── docs/                            # Documentation files
├── requirements.txt                 # Root Python dependencies
└── README.md                        # Project documentation
```

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher) - [Download here](https://nodejs.org/)
- **Python** (3.9.0 or higher) - [Download here](https://python.org/)
- **Git** - [Download here](https://git-scm.com/)

### Required Services

- **MongoDB Atlas** account - [Sign up here](https://www.mongodb.com/atlas)
- **Pinecone** account and API key - [Sign up here](https://www.pinecone.io/)
- **OpenAI** API key (if using OpenAI models) - [Get API key](https://platform.openai.com/)

## 📦 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/katalyst-ngo-chatbot.git
cd katalyst-ngo-chatbot
```

### 2. Backend Setup (FastAPI)

```bash
# Navigate to server directory
cd server

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\\Scripts\\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp .env.example .env
```

### 3. Frontend Setup (Next.js)

```bash
# Navigate to client directory (from root)
cd client

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
```

## ⚙️ Environment Configuration

### Backend Environment Variables (`server/.env`)

```env
# Pinecone Configuration
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX_NAME=katalyst-chatbot
PINECONE_ENVIRONMENT=your_pinecone_environment

# MongoDB Configuration
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/katalyst_db

# OpenAI Configuration (if using OpenAI)
OPENAI_API_KEY=your_openai_api_key_here

# FastAPI Configuration
DEBUG=True
HOST=0.0.0.0
PORT=8000
```

### Frontend Environment Variables (`client/.env.local`)

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api

# EmailJS Configuration (for admin responses)
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_emailjs_service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
```

## 🏃‍♂️ Running the Application

### Start the Backend Server

```bash
cd server
source venv/bin/activate  # or venv\\Scripts\\activate on Windows
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend API will be available at: `http://localhost:8000`
API documentation: `http://localhost:8000/docs`

### Start the Frontend Development Server

```bash
cd client
npm run dev
```

The frontend application will be available at: `http://localhost:3000`

## 🔧 Pinecone Index Setup

### 1. Upload Document Chunks

```bash
cd server
python katalyst_upload.py
```

This script will:
- Process your documents
- Create embeddings
- Upload chunks to your Pinecone index

### 2. Test Vector Search

```bash
cd server
python katalyst_pinecone.py
```

This script helps you test and validate your Pinecone search functionality.

## 📱 Usage

### User Interface

1. **Homepage**: Visit `http://localhost:3000` to interact with the chatbot widget
2. **Ask Questions**: Users can ask about Katalyst's programs, mission, and services
3. **Email Fallback**: If the bot can't answer confidently, users can leave their email for follow-up

### Admin Dashboard

1. **Access**: Visit `http://localhost:3000/admin`
2. **View Queries**: See all unanswered user queries
3. **Respond**: Send personalized email responses to users
4. **Manage**: Track and organize user interactions

## 🚀 Deployment

### Backend Deployment

#### Option 1: Render
```bash
# Create render.yaml in server directory
# Deploy via Render dashboard
```

#### Option 2: Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy
railway login
railway init
railway up
```

### Frontend Deployment

#### Vercel (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from client directory
cd client
vercel --prod
```

#### Netlify
```bash
# Build the application
npm run build

# Deploy to Netlify via dashboard or CLI
```

### Post-Deployment Configuration

1. Update `NEXT_PUBLIC_API_URL` in frontend environment variables
2. Configure CORS settings in FastAPI backend
3. Update MongoDB connection strings for production
4. Set up proper SSL certificates

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Email Service**: EmailJS

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.9+
- **Database**: MongoDB (via Motor async driver)
- **Vector Database**: Pinecone
- **Data Validation**: Pydantic
- **ASGI Server**: Uvicorn

### AI & ML
- **Embeddings**: OpenAI text-embedding-ada-002
- **Vector Search**: Pinecone similarity search
- **Language Model**: OpenAI GPT-3.5/GPT-4

## 🔍 API Endpoints

### Chat Endpoints
- `POST /api/chat` - Send message to chatbot
- `GET /api/chat/history` - Get chat history

### Admin Endpoints
- `GET /api/admin/queries` - Get all unanswered queries
- `POST /api/admin/respond` - Send email response
- `PUT /api/admin/queries/{id}` - Update query status

### Health Check
- `GET /api/health` - API health status

## 🐛 Troubleshooting

### Common Issues

#### Backend Issues
```bash
# Port already in use
lsof -ti:8000 | xargs kill -9

# Virtual environment issues
deactivate
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### Frontend Issues
```bash
# Clear Next.js cache
rm -rf .next
npm run dev

# Node modules issues
rm -rf node_modules package-lock.json
npm install
```

#### Database Connection Issues
- Verify MongoDB URI format
- Check network access in MongoDB Atlas
- Ensure IP whitelist includes your deployment IP

## 📊 Monitoring and Analytics

### Logging
- All queries are logged to MongoDB
- Failed queries are tracked for improvement
- Response times and accuracy metrics

### Performance Monitoring
- API response times
- Vector search performance
- User engagement metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Katalyst India** - For their mission to empower women
- **Pinecone** - For vector database services
- **MongoDB Atlas** - For database hosting
- **Vercel** - For frontend hosting
- **FastAPI** - For the excellent Python web framework

## 📞 Support

For support and questions:
- Create an issue in this repository
- Contact the development team
- Visit [Katalyst India](https://katalystindia.org) for organization-related queries

---

**Made with ❤️ for Katalyst India's mission to empower women**
```

This enhanced README includes:

1. **Improved project structure** with clear directory explanations
2. **Proper bash command formatting** with syntax highlighting
3. **Comprehensive setup instructions** with step-by-step guidance
4. **Detailed environment configuration** with example values
5. **Troubleshooting section** for common issues
6. **Deployment guides** for multiple platforms
7. **API documentation** with endpoint descriptions
8. **Professional formatting** with emojis and clear sections

The README now follows best practices and provides everything needed for developers to understand, set up, and contribute to the project[^1].

