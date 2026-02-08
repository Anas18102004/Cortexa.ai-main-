# Mock Data Used in Test

## Mock Employees (5 total)

### 1. Sarah Johnson
- **User ID**: emp_001
- **Role**: IC (Individual Contributor)
- **Team**: Frontend
- **Skills**: React, TypeScript, UI/UX, Figma, CSS
- **Seniority**: SENIOR
- **Capacity**:
  - Total Hours: 40.0h
  - Allocated: 5.0h
  - **Free: 35.0h**
  - Volatility: 0.12
  - Risk: LOW

### 2. Michael Chen
- **User ID**: emp_002
- **Role**: IC
- **Team**: Backend
- **Skills**: Node.js, TypeScript, PostgreSQL, Redis, JWT
- **Seniority**: MID
- **Capacity**:
  - Total Hours: 40.0h
  - Allocated: 22.0h
  - **Free: 18.0h**
  - Volatility: 0.25
  - Risk: MEDIUM

### 3. Emily Rodriguez
- **User ID**: emp_003
- **Role**: IC
- **Team**: Frontend
- **Skills**: React Native, JavaScript, Mobile Development, Animation
- **Seniority**: SENIOR
- **Capacity**:
  - Total Hours: 40.0h
  - Allocated: 8.0h
  - **Free: 32.0h**
  - Volatility: 0.08
  - Risk: LOW

### 4. David Kim
- **User ID**: emp_004
- **Role**: IC
- **Team**: Backend
- **Skills**: Python, FastAPI, PostgreSQL, Docker, AWS
- **Seniority**: MID
- **Capacity**:
  - Total Hours: 40.0h
  - Allocated: 10.0h
  - **Free: 30.0h**
  - Volatility: 0.15
  - Risk: LOW

### 5. Jessica Martinez
- **User ID**: emp_005
- **Role**: TECH_LEAD
- **Team**: Full Stack
- **Skills**: React, Node.js, TypeScript, System Design, Leadership
- **Seniority**: STAFF
- **Capacity**:
  - Total Hours: 40.0h
  - Allocated: 15.0h
  - **Free: 25.0h**
  - Volatility: 0.18
  - Risk: LOW

---

## Mock Project

### E-Commerce Mobile App

**Project ID**: proj_[random]

**Description**:
Build a mobile e-commerce application with the following features:
- User authentication and profile management
- Product catalog with search and filters
- Shopping cart and checkout flow
- Payment integration (Stripe)
- Order tracking and history
- Push notifications

The app should support both iOS and Android platforms and integrate with our existing backend API. Must follow modern UI/UX best practices and ensure secure payment processing.

**Tech Stack**:
- React Native
- TypeScript
- Node.js
- PostgreSQL
- Stripe
- Redis

**Requirements**: Must support iOS and Android, integrate with existing backend, implement secure payment flow

**Priority**: HIGH

**Estimated Duration**: 60 days

**Organization**: org_001

**Created By**: mgr_001

---

## AI Response Structure

The CORTEXA AI system processes this and returns:

```json
{
  "mission": {
    "mission_id": "m_[random]",
    "goal": "Build mobile e-commerce app with secure payments",
    "success_criteria": [
      "iOS and Android support",
      "Secure payment integration",
      "80% user completion rate"
    ]
  },
  "deliverables": [
    {
      "deliverable_id": "d_001",
      "outcome": "User authentication and profile management",
      "estimated_effort_hours": 40,
      "action_ids": ["a_001", "a_002", "a_003"]
    },
    {
      "deliverable_id": "d_002",
      "outcome": "Product catalog with search",
      "estimated_effort_hours": 60,
      "action_ids": ["a_004", "a_005", "a_006"]
    },
    {
      "deliverable_id": "d_003",
      "outcome": "Shopping cart and checkout",
      "estimated_effort_hours": 50,
      "action_ids": ["a_007", "a_008"]
    },
    {
      "deliverable_id": "d_004",
      "outcome": "Payment integration",
      "estimated_effort_hours": 70,
      "action_ids": ["a_009", "a_010", "a_011"]
    }
  ],
  "actions": [
    {
      "action": {
        "action_id": "a_001",
        "description": "Design authentication UI in Figma",
        "required_skills": ["UI/UX", "Figma", "Mobile Design"],
        "estimated_hours": 16,
        "deliverable_id": "d_001"
      },
      "decision": {
        "mode": "AUTO_ASSIGN",
        "assignee": "emp_001",  // Sarah Johnson
        "confidence_score": 0.95,
        "risk_level": "LOW",
        "reasoning_summary": "Auto-assigned: Perfect skill match (UI/UX, Figma), safe capacity (35h available), senior experience"
      }
    },
    {
      "action": {
        "action_id": "a_002",
        "description": "Implement React Native authentication screens",
        "required_skills": ["React Native", "TypeScript", "Mobile Development"],
        "estimated_hours": 24,
        "deliverable_id": "d_001"
      },
      "decision": {
        "mode": "AUTO_ASSIGN",
        "assignee": "emp_003",  // Emily Rodriguez
        "confidence_score": 0.92,
        "risk_level": "LOW",
        "reasoning_summary": "Auto-assigned: Excellent React Native skills, 32h available, mobile development expertise"
      }
    },
    {
      "action": {
        "action_id": "a_003",
        "description": "Build authentication API endpoints with JWT",
        "required_skills": ["Node.js", "JWT", "PostgreSQL"],
        "estimated_hours": 20,
        "deliverable_id": "d_001"
      },
      "decision": {
        "mode": "PROPOSE",
        "assignee": "emp_002",  // Michael Chen
        "confidence_score": 0.75,
        "risk_level": "MEDIUM",
        "reasoning_summary": "Proposed: Good skill match but limited capacity (18h free), may need timeline adjustment"
      }
    },
    {
      "action": {
        "action_id": "a_009",
        "description": "Integrate Stripe payment gateway",
        "required_skills": ["Stripe", "Payment Processing", "Security"],
        "estimated_hours": 40,
        "deliverable_id": "d_004"
      },
      "decision": {
        "mode": "ESCALATE",
        "assignee": null,
        "confidence_score": 0.45,
        "risk_level": "HIGH",
        "reasoning_summary": "Escalated: No team member has Stripe integration experience, high security risk, recommend external consultant or training"
      }
    }
  ],
  "summary": {
    "total_actions": 12,
    "auto_assigned": 8,
    "proposed": 3,
    "escalated": 1,
    "total_estimated_hours": 280,
    "employees_involved": 5
  }
}
```

---

## Capacity Impact After Assignment

| Employee | Before | After | Assigned Hours | Tasks |
|----------|--------|-------|----------------|-------|
| Sarah Johnson | 35.0h | 19.0h | 16.0h | 1 task |
| Emily Rodriguez | 32.0h | 8.0h | 24.0h | 1 task |
| Michael Chen | 18.0h | -2.0h ⚠️ | 20.0h | 1 task (PROPOSED - needs approval) |
| David Kim | 30.0h | 10.0h | 20.0h | 2 tasks |
| Jessica Martinez | 25.0h | 15.0h | 10.0h | 1 task |

**Note**: Michael Chen would be overloaded (-2h), which is why his assignment is in PROPOSE mode requiring manager approval.

---

## Decision Modes Explained

### AUTO_ASSIGN (8 tasks)
- High confidence (>0.8)
- Low risk
- Good skill match
- Sufficient capacity
- **Action**: Automatically assigned, no approval needed

### PROPOSE (3 tasks)
- Medium confidence (0.6-0.8)
- Medium risk or capacity concerns
- Skill match but constraints exist
- **Action**: Requires manager approval before assignment

### ESCALATE (1 task)
- Low confidence (<0.6)
- High risk
- Missing critical skills
- **Action**: Escalated to management for decision (hire, train, or outsource)
