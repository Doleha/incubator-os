#!/usr/bin/env python3
"""
scripts/migrate.py — Migration manifest runner
Usage: python3 scripts/migrate.py <phase>   (phase = 1, 2, or 3)

Tracks applied migrations in schema_migrations table.
Safe to re-run — already-applied migrations are skipped.
"""
import os
import sys
import glob
import psycopg2


def get_connection():
    url = os.environ.get("DATABASE_URL")
    if not url:
        print("ERROR: DATABASE_URL not set in environment.")
        sys.exit(1)
    return psycopg2.connect(url)


def ensure_schema_migrations_table(conn):
    with conn.cursor() as cur:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS schema_migrations (
              id SERIAL PRIMARY KEY,
              filename TEXT NOT NULL UNIQUE,
              applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        """)
    conn.commit()


def get_applied(conn):
    with conn.cursor() as cur:
        cur.execute("SELECT filename FROM schema_migrations ORDER BY filename")
        return {row[0] for row in cur.fetchall()}


def apply_migration(conn, filepath, filename):
    with open(filepath, "r") as f:
        sql = f.read()
    with conn.cursor() as cur:
        cur.execute(sql)
        cur.execute(
            "INSERT INTO schema_migrations (filename) VALUES (%s)",
            (filename,)
        )
    conn.commit()
    print(f"  ✓ {filename}")


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 scripts/migrate.py <phase>")
        sys.exit(1)

    phase = sys.argv[1]
    migration_dir = f"migrations/phase{phase}"
    if not os.path.isdir(migration_dir):
        print(f"ERROR: Directory not found: {migration_dir}")
        sys.exit(1)

    files = sorted(glob.glob(f"{migration_dir}/*.sql"))
    if not files:
        print(f"No .sql files found in {migration_dir}")
        sys.exit(0)

    conn = get_connection()
    ensure_schema_migrations_table(conn)
    applied = get_applied(conn)

    skipped = 0
    for filepath in files:
        filename = os.path.basename(filepath)
        if filename in applied:
            skipped += 1
            continue
        try:
            apply_migration(conn, filepath, filename)
        except Exception as e:
            conn.rollback()
            print(f"  ✗ {filename}: {e}")
            conn.close()
            sys.exit(1)

    conn.close()
    if skipped:
        print(f"  ({skipped} already-applied migration(s) skipped)")
    print(f"Phase {phase} migrations complete.")


if __name__ == "__main__":
    main()
