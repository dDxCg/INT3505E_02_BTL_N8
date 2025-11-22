# migrations/env.py
import asyncio
import os
import re
from logging.config import fileConfig

from sqlalchemy import create_engine, pool
from sqlalchemy.engine import Connection
from alembic import context
from dotenv import load_dotenv

# load .env.local to reuse your DATABASE_URL
load_dotenv(".env.local")
APP_DATABASE_URL = os.getenv('DATABASE_URL')

# import your app's Base and (optional) DATABASE_URL variable
from configs.postgre import Base
import models

# Alembic Config object
config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# target metadata for 'autogenerate'
target_metadata = Base.metadata

# derive a sync URL from your async URL (postgresql+asyncpg -> postgresql)
# priority: use APP_DATABASE_URL if present, else fallback to alembic.ini setting
sync_url = APP_DATABASE_URL or config.get_main_option("sqlalchemy.url")

# Ensure sslmode=require is present for Neon
if "sslmode=" not in sync_url:
    if "?" in sync_url:
        sync_url = sync_url + "&sslmode=require"
    else:
        sync_url = sync_url + "?sslmode=require"

# Make config aware of final URL (optional)
config.set_main_option("sqlalchemy.url", sync_url)


def run_migrations_offline():
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(sync_conn: Connection):
    context.configure(
        connection=sync_conn, 
        target_metadata=target_metadata,
        compare_type=True,               # detect type changes only
        compare_server_default=True
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    connectable = create_engine(
        config.get_main_option("sqlalchemy.url"),
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        do_run_migrations(connection)


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
