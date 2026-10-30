# CollabNest — Creator Collaboration Manager

**Manage brand collaborations, track campaign deliverables, and stay on top of deadlines and payments — all in one place.**

CollabNest is a full-stack web application designed to help content creators organize and manage their brand collaborations. It provides a centralized workspace to track campaigns, manage deliverables, monitor payment statuses, and convert unstructured brand briefs into structured campaign records using AI.

**Live Demo:** https://collabnest-murex.vercel.app/

---

## Features

### Campaign Management
- Create, view, update, and delete campaigns.
- Track brand names, campaign details, platforms, and content types.
- Set campaign deadlines and priorities.
- Manage payment amounts, due dates, and payment statuses.
- Track campaign progress through different stages.

### AI-Powered Brief Parsing
- Convert unstructured brand collaboration briefs into structured campaign data.
- Extract campaign details such as brand name, platform, content type, deadline, amount, and notes.
- Use an LLM to interpret natural-language campaign requirements.
- Review extracted campaigns before saving them.

### Bulk Campaign Creation
- Create multiple campaigns from a single parsed brief.
- Review extracted campaign information before submitting.
- Save multiple campaign records through a dedicated bulk creation API.

### Authentication & Authorization
- User registration and login.
- JWT-based authentication.
- Role-based access control with `CREATOR` and `ADMIN` roles.
- Protected API endpoints.

### Campaign Tracking
- Track campaign statuses:
  - `DRAFT`
  - `IN_PROGRESS`
  - `SUBMITTED`
  - `APPROVED`
  - `COMPLETED`
  - `CANCELLED`
- Track payment statuses:
  - `PENDING`
  - `PAID`
  - `OVERDUE`
- Set campaign priorities and monitor deadlines.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite |
| Styling | Tailwind CSS v4 |
| Backend | Java 17, Spring Boot |
| ORM | Spring Data JPA, Hibernate |
| Database | PostgreSQL (Supabase) |
| Authentication | Spring Security, JWT |
| AI Integration | Groq API, Llama 3.3 70B |
| API Communication | REST APIs |
| Deployment | Vercel, Render |
| Backend Packaging | Docker |

---

## Architecture

```text
                 ┌─────────────────────────┐
                 │       React Client      │
                 │   React + TypeScript    │
                 │      Vite + Tailwind    │
                 └────────────┬────────────┘
                              │
                         REST API
                              │
                 ┌────────────▼────────────┐
                 │      Spring Boot       │
                 │        Backend         │
                 ├─────────────────────────┤
                 │   Spring Security      │
                 │   JWT Authentication   │
                 │   REST Controllers     │
                 │   Service Layer        │
                 │   JPA / Hibernate      │
                 └──────┬──────────┬──────┘
                        │          │
              ┌─────────▼────┐  ┌──▼────────────┐
              │  PostgreSQL  │  │   Groq API    │
              │  (Supabase)  │  │  Llama 3.3    │
              └──────────────┘  └───────────────┘
```

### How It Works

1. Users register or log in through the React frontend.
2. The backend authenticates credentials and issues a JWT.
3. The frontend includes the JWT in the Authorization header for protected API requests.
4. Spring Security validates requests and enforces access control.
5. Campaign data is processed through the service layer and persisted using Spring Data JPA and Hibernate.
6. For AI brief parsing, the backend sends the supplied text to the Groq API and processes the model's structured JSON response.
7. Users can review the extracted campaign data and submit multiple campaigns through the bulk creation endpoint.

---

## AI Brief Parsing Workflow

One of CollabNest's key features is its AI-powered campaign brief parser.

Brand collaboration details are often shared through unstructured messages, emails, or briefs. Manually entering every campaign detail can be time-consuming.

CollabNest simplifies this process:

```text
   Unstructured Brand Brief
             │
             ▼
      React Frontend
             │
             ▼
    POST /api/ai/parse-brief
             │
             ▼
   Hybrid Brief Parser Service
             │
       ┌─────┴──────┐
       ▼            ▼
  Rule Parser    AI Parser
                    │
                    ▼
                Groq API
             (Llama 3.3 70B)
                    │
                    ▼
          Structured JSON Output
                    │
                    ▼
          Campaign Preview UI
                    │
                    ▼
       POST /api/campaigns/bulk
                    │
                    ▼
           PostgreSQL Database
```

The parser uses a hybrid approach:

- **Rule-based parsing:** Handles structured inputs using predefined parsing logic.
- **AI-based parsing:** Uses an LLM to interpret unstructured natural-language briefs.

The extracted information is converted into campaign data and presented to the user for review before saving.

---

## Campaign Data Model

A campaign contains information such as:

| Field | Description |
|---|---|
| `brandName` | Brand associated with the collaboration |
| `campaignName` | Name of the campaign |
| `platform` | Instagram, YouTube, LinkedIn, X, or Other |
| `contentType` | Reel, Post, Story, Short, Video, or Other |
| `deadline` | Campaign delivery deadline |
| `amount` | Collaboration payment amount |
| `priority` | Campaign priority |
| `paymentStatus` | Pending, Paid, or Overdue |
| `paymentDueDate` | Expected payment date |
| `paymentReceivedDate` | Date payment was received |
| `campaignStatus` | Current campaign progress |
| `contactName` | Brand contact person |
| `contactEmail` | Brand contact email |
| `notes` | Additional campaign information |

---

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Authenticate a user |

### Campaign Management

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/campaigns` | Retrieve campaigns |
| POST | `/api/campaigns` | Create a campaign |
| GET | `/api/campaigns/{id}` | Retrieve campaign details |
| PUT | `/api/campaigns/{id}` | Update a campaign |
| DELETE | `/api/campaigns/{id}` | Delete a campaign |
| POST | `/api/campaigns/bulk` | Create multiple campaigns |

### AI Integration

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/ai/parse-brief` | Parse an unstructured brief into campaign data |

---

## Project Structure

### Backend

```text
backend/
├── src/
│   └── main/
│       ├── java/
│       │   └── ...
│       │       ├── config/
│       │       ├── controller/
│       │       ├── dto/
│       │       ├── entity/
│       │       ├── enums/
│       │       ├── repository/
│       │       ├── security/
│       │       └── service/
│       └── resources/
│           └── application.properties
├── Dockerfile
└── pom.xml
```

### Frontend

```text
frontend/
├── src/
│   ├── components/
│   ├── context/
│   ├── hooks/
│   ├── pages/
│   ├── services/
│   ├── types/
│   └── ...
├── public/
├── package.json
└── vite.config.ts
```

*Note: Directory names are representative; adjust them to match the actual repository structure.*

---

## Running Locally

### Prerequisites

- Java 17
- Node.js and npm
- PostgreSQL database
- Groq API key

### 1. Clone the repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd CollabNest
```

### 2. Start the Backend

Navigate to the backend directory:

```bash
cd backend
```

Configure your environment variables:

```env
DATABASE_URL=your_database_url
DATABASE_USERNAME=your_database_username
DATABASE_PASSWORD=your_database_password

JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key

FRONTEND_URL=http://localhost:5173
```

Start the Spring Boot application:

```bash
./mvnw spring-boot:run
```

### 3. Start the Frontend

Open another terminal:

```bash
cd frontend
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:8080/api
```

Start the development server:

```bash
npm run dev
```

The application should now be available at:

```text
http://localhost:5173
```

---

## Deployment

| Component | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | Supabase PostgreSQL |
| Backend Containerization | Docker |

Configure production environment variables through the respective hosting platforms. Never commit API keys, database credentials, or JWT secrets to the repository.

---

## Security Considerations

- JWT-based authentication for protected endpoints.
- Role-based authorization.
- Environment-based configuration for sensitive credentials.
- Database access controls through Supabase Row Level Security policies.

---

## Future Improvements

- More robust AI extraction and validation.
- Support for importing briefs from emails and documents.
- Improved campaign analytics and reporting.
- Payment reminders and notification workflows.
- Enhanced campaign collaboration features.
- Automated testing and CI/CD improvements.

---

## Author

**Birinder Singh**

Full Stack Developer | Java | Spring Boot | React | TypeScript

---

*CollabNest — Making creator collaborations easier to manage.*
