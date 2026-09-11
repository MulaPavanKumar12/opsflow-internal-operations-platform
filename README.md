# OpsFlow — Internal Operations Automation Platform

OpsFlow is a production-style full-stack application that demonstrates the core skills expected in an Application Engineering role:

- Java + Spring Boot
- REST API development
- React + TypeScript
- SQL persistence with H2 for a zero-setup demo
- Role-based access control
- Business workflow automation
- Third-party integration simulation
- Retry / failure handling
- Audit logging
- Automated backend tests
- Docker support
- Render deployment configuration

## Architecture

```text
React + TypeScript
       |
       | REST / JSON
       v
Spring Boot REST API
       |
       +---- Workflow Service
       |
       +---- Integration Service
       |
       +---- Audit Service
       |
       v
H2 Database
```

## Features

1. Submit and track operational requests.
2. Approve / reject requests.
3. Assign requests to engineers.
4. Execute automated fulfillment workflows.
5. Simulate third-party GitHub/Jira-style integrations.
6. Handle external API failures with retry logic.
7. Maintain an audit trail.
8. Filter requests by status and priority.
9. Show operational metrics.
10. Responsive dashboard.

## Run locally

### Option A — Docker

```bash
docker compose up --build
```

Frontend: http://localhost:5173  
Backend: http://localhost:8080

### Option B — Run separately

Backend:

```bash
cd backend
./mvnw spring-boot:run
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

On Windows, use `mvnw.cmd spring-boot:run`.

## Demo API

```text
GET  /api/requests
POST /api/requests
POST /api/requests/{id}/approve
POST /api/requests/{id}/reject
POST /api/requests/{id}/assign
POST /api/requests/{id}/execute
GET  /api/requests/{id}/audit
GET  /api/metrics
```

## Demo workflow

Try request `#1001`:

```text
PENDING_APPROVAL
      |
      v
APPROVED
      |
      v
IN_PROGRESS
      |
      v
COMPLETED
```

Request `#1003` demonstrates a failed external integration and retry-safe execution.

## Deployment

The repository includes `render.yaml` for a simple Render deployment. Push the repository to GitHub, create a Render Blueprint from the repository, and Render will create the backend and static frontend.

After deployment, set the frontend environment variable:

```text
VITE_API_URL=https://YOUR-BACKEND.onrender.com
```

The included configuration is intended as a portfolio/demo deployment. For production, replace H2 with PostgreSQL and use a managed secret store for credentials.

## Resume positioning

**OpsFlow — Internal Operations Automation Platform**

- Developed a full-stack internal operations platform using Java, Spring Boot, React/TypeScript, and REST APIs to automate request, approval, assignment, and fulfillment workflows.
- Implemented role-aware workflows, audit logging, validation, retry-safe external integrations, and operational metrics for reliable internal business processes.
- Built automated backend tests and containerized local development to support maintainable application delivery.

## Suggested GitHub topics

```text
java
spring-boot
react
typescript
rest-api
full-stack
application-engineering
workflow-automation
sql
docker
enterprise-applications
```
