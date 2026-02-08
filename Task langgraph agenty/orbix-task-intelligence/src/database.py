"""
Database Configuration

This module handles database connection and session management.
"""

import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import NullPool

from .models import Base


# Database URL from environment
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://orbix:password@localhost:5432/orbix_db"
)

# Create async engine
engine = create_async_engine(
    DATABASE_URL,
    echo=os.getenv("DATABASE_ECHO", "false").lower() == "true",
    pool_size=int(os.getenv("DATABASE_POOL_SIZE", "20")),
    max_overflow=int(os.getenv("DATABASE_MAX_OVERFLOW", "10")),
    poolclass=NullPool if os.getenv("ENVIRONMENT") == "test" else None
)

# Create session factory
async_session = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)


async def init_db():
    """Initialize database (create tables)"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("[Database] Tables created successfully")


async def drop_db():
    """Drop all tables (use with caution!)"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    print("[Database] Tables dropped successfully")


async def get_session() -> AsyncSession:
    """Get database session (dependency injection)"""
    async with async_session() as session:
        yield session
