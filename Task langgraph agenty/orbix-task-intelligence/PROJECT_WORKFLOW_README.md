# Project-Based Workflow - Quick Start

## Overview

The CORTEXA AI system now supports project-based workflows where you can:
1. Create projects with tech stack and requirements
2. Confirm projects to trigger AI-powered task assignment
3. Get intelligent assignments based on employee skills and capacity

---

## Quick Start

### 1. Run Database Migration

```bash
# Apply migrations to create new tables
alembic upgrade head
```

### 2. Seed Employee Data

You can either:
- Use the example script (includes sample employees)
- Manually insert employees via API or database

### 3. Run Example Script

```bash
python example_project_workflow.py
```

This will:
- Create 5 sample employees with different skills
- Create an e-commerce mobile app project
- Confirm the project and trigger AI assignment
- Display all assignments with explanations

---

## API Usage

### Create a Project

```bash
curl -X POST http://localhost:8000/api/v1/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "E-Commerce Mobile App",
    "description": "Build mobile app with authentication, catalog, cart, payments",
    "tech_stack": ["React Native", "TypeScript", "Node.js", "PostgreSQL"],
    "requirements": "iOS and Android support, Stripe integration",
    "priority": "HIGH",
    "estimated_duration_days": 60,
    "org_id": "org_001",
    "created_by": "mgr_001"
  }'
```

### Confirm Project (Trigger AI)

```bash
curl -X POST http://localhost:8000/api/v1/projects/proj_abc123/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "org_id": "org_001"
  }'
```

### Get Project Assignments

```bash
curl http://localhost:8000/api/v1/projects/proj_abc123/assignments
```

### Get Employee Availability

```bash
curl http://localhost:8000/api/v1/employees/availability?org_id=org_001&min_free_hours=10
```

---

## Database Schema

### New Tables

- **`projects`** - Project details and metadata
- **`employees`** - Employee profiles with skills
- **`employee_capacity`** - Weekly capacity tracking
- **`project_assignments`** - AI-generated assignments

See [implementation_plan.md](file:///C:/Users/moham/.gemini/antigravity/brain/601e2ad2-6ecf-4c46-b792-3ce4156fd50b/implementation_plan.md) for detailed schema.

---

## How It Works

1. **User creates project** → Stored in database (DRAFT status)
2. **User confirms project** → Triggers `POST /api/v1/projects/{id}/confirm`
3. **System fetches data** → Project + Employees + Capacity
4. **AI processes** → 11-node CORTEXA AI pipeline
5. **Assignments created** → Stored in database with confidence scores
6. **Capacity updated** → Employee hours allocated
7. **Results returned** → Complete mission, deliverables, assignments

---

## Key Features

✅ **Intelligent Assignment** - AI matches skills and capacity  
✅ **Capacity Management** - Prevents employee overload  
✅ **Auto-Assign** - High-confidence assignments auto-assigned  
✅ **Proposals** - Low-confidence assignments need approval  
✅ **Escalation** - High-risk assignments escalated to managers  
✅ **Audit Trail** - Every decision tracked and explained  

---

## Next Steps

1. Run migration: `alembic upgrade head`
2. Test with example: `python example_project_workflow.py`
3. Create your own employees and projects via API
4. Monitor assignments and adjust policies as needed

---

## Documentation

- **Implementation Plan**: [implementation_plan.md](file:///C:/Users/moham/.gemini/antigravity/brain/601e2ad2-6ecf-4c46-b792-3ce4156fd50b/implementation_plan.md)
- **Walkthrough**: [walkthrough.md](file:///C:/Users/moham/.gemini/antigravity/brain/601e2ad2-6ecf-4c46-b792-3ce4156fd50b/walkthrough.md)
- **AI Flow**: [ai_flow_explanation.md](file:///C:/Users/moham/.gemini/antigravity/brain/601e2ad2-6ecf-4c46-b792-3ce4156fd50b/ai_flow_explanation.md)
