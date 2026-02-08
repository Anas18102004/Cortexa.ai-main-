# CORTEXA AI - Task Intelligence Quick Start

> Get the system running in 5 minutes

### 1. Prerequisites
- Python 3.11+
- OpenAI API key

### 2. Install
```bash
pip install -r requirements.txt
```

### 3. Configure
```bash
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
```

### 4. Run Example
```bash
python example.py
```

That's it! You should see the system process an intent and generate work allocation decisions.

---

## 📖 What You'll See

The example will:
1. **Parse Intent**: "Build user onboarding flow"
2. **Create Mission**: With goal and success criteria
3. **Generate Deliverables**: 3-5 concrete outcomes
4. **Break Down Actions**: 10+ executable work units
5. **Assign Work**: Based on skills and capacity
6. **Make Decisions**: AUTO_ASSIGN, PROPOSE, or ESCALATE
7. **Create Audit Trail**: Full explainability

---

## 🏗️ Production Setup

For production deployment, see [DEPLOYMENT.md](DEPLOYMENT.md)

Key steps:
1. Setup PostgreSQL database
2. Setup Redis cache
3. Run database migrations
4. Configure environment variables
5. Deploy with Docker or Kubernetes

---

## 📚 Learn More

- [README.md](README.md) - Full documentation
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guide
- [ROADMAP.md](ROADMAP.md) - Product roadmap
- [Implementation Plan](implementation_plan.md) - Technical details

---

## 🆘 Need Help?

- Check the [README](README.md) for detailed documentation
- Review the [example.py](example.py) for usage patterns
- See [DEPLOYMENT.md](DEPLOYMENT.md) for production setup

---

**Built with ❤️ by CORTEXA AI**
