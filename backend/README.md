# Adverse Vaccine Reaction Prediction Backend API

A high-performance FastAPI backend for machine learning-based prediction of adverse vaccine reactions and symptom onset times, featuring complete user management and clinical prediction history.

---

## Features

- **Machine Learning Inference Service**:
  - Multi-label symptom occurrence classification (CatBoost & Hybrid Stacking, achieving 90.0% exact match accuracy).
  - Continuous onset time regression (Hybrid Stacking Regressor: RF, GB, ET with RidgeCV meta-model).
  - Models load into memory once on startup for sub-10ms response times.
  - Clinical risk stratification: `Low`, `Medium`, `High`.
  - Symptom probabilities and estimated onset hours (e.g. fever in ~8.9h, pain in ~2.8h).

- **User Management & Authentication**:
  - JWT (JSON Web Tokens) with secure bcrypt password hashing.
  - Role-based permissions (`admin`, `parent`).
  - First registered user automatically promoted to Administrator.
  - Full user CRUD operations (`/api/users`).
  - Audit trail & prediction history per user.

- **Developer & Integration Friendly**:
  - Interactive OpenAPI/Swagger documentation at `/docs`.
  - ReDoc documentation at `/redoc`.
  - CORS enabled for React, Next.js, and Vite frontends.
  - Native **MongoDB Atlas** database support with auto-indexing and atomic sequence generation.
  - Swappable database engines configured via `.env` (`DB_TYPE=mongodb` or `DB_TYPE=sqlite`).

---

## Quick Start

### 1. Install Requirements

```bash
pip install -r backend/requirements.txt
```

### 2. Configure Environment (`.env`)

Configure your `.env` file (a template is provided in `.env.example`):

```env
DB_TYPE=mongodb
MONGODB_URI=mongodb+srv://pdikavindi_db_user:<db_password>@cluster0.krivlpg.mongodb.net/?appName=Cluster0
MONGODB_DB_NAME=adverse_reaction_prediction
```
> Replace `<db_password>` with your MongoDB Atlas database user password.

### 3. Launch Server

```bash
python run_backend.py
```
Or with Uvicorn directly:
```bash
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Open Interactive Documentation

Visit [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) in your browser.

---

## API Endpoints Overview

### Authentication & Users
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login with username and password, returns JWT token |
| `GET` | `/api/auth/me` | Get current authenticated user profile |
| `GET` | `/api/users` | List all registered users (Authenticated) |
| `GET` | `/api/users/{id}` | Get user by ID |
| `PUT` | `/api/users/{id}` | Update user details or role |
| `DELETE` | `/api/users/{id}` | Delete user account (Admin only) |

### Predictions & Clinical Records
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/predict` | Predict adverse reaction and onset times (logs to history if authenticated) |
| `GET` | `/api/predict/history` | List prediction history for current user (or all if admin) |
| `GET` | `/api/predict/{id}` | Retrieve specific prediction record by ID |
| `DELETE` | `/api/predict/{id}` | Delete prediction record |

### System & Metadata
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check & model loading status |
| `GET` | `/api/metadata/options` | Form dropdown options (vaccines, gender, binary choices) |

---

## Running Automated Tests

Run the test suite with:

```bash
python backend/tests/test_api.py
```
