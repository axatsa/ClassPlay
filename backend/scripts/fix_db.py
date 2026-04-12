from sqlalchemy import text
from database import engine


def add_columns(conn, table_name: str, columns: list[tuple[str, str]]):
    print(f"Starting schema check for table '{table_name}'...")
    for col_name, col_type in columns:
        try:
            check_query = text(f"""
                SELECT count(*)
                FROM information_schema.columns
                WHERE table_name='{table_name}' AND column_name='{col_name}';
            """)
            exists = conn.execute(check_query).scalar()

            if exists == 0:
                print(f"  Adding column '{col_name}'...")
                conn.execute(text(f"ALTER TABLE {table_name} ADD COLUMN {col_name} {col_type};"))
                conn.commit()
                print(f"  Successfully added '{col_name}'.")
            else:
                print(f"  Column '{col_name}' already exists.")
        except Exception as e:
            print(f"  Error processing column '{col_name}': {e}")
    print(f"Schema update for '{table_name}' complete.\n")


def fix_schema():
    users_columns = [
        ("is_active", "BOOLEAN DEFAULT TRUE"),
        ("created_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"),
        ("phone", "VARCHAR"),
        ("school", "VARCHAR"),
        ("tokens_used_this_month", "INTEGER DEFAULT 0"),
        ("tokens_limit", "INTEGER DEFAULT 100000"),
        ("tokens_reset_at", "TIMESTAMP"),
        ("organization_id", "INTEGER REFERENCES organizations(id)"),
        ("onboarding_completed", "BOOLEAN DEFAULT FALSE"),
    ]

    # P0 FIX: class_groups must be scoped to the teacher and organization
    class_groups_columns = [
        ("teacher_id", "INTEGER REFERENCES users(id)"),
        ("organization_id", "INTEGER REFERENCES organizations(id)"),
    ]

    with engine.connect() as conn:
        add_columns(conn, "users", users_columns)
        add_columns(conn, "class_groups", class_groups_columns)


if __name__ == "__main__":
    fix_schema()
