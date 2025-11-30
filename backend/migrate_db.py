import sqlite3
from pathlib import Path

DB_PATH = Path("ciousten.db")

def migrate():
    if not DB_PATH.exists():
        print("Database not found.")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Add annotated_video_path
        try:
            cursor.execute("ALTER TABLE projects ADD COLUMN annotated_video_path TEXT")
            print("Added annotated_video_path column")
        except sqlite3.OperationalError as e:
            print(f"annotated_video_path might already exist: {e}")

        # Add progress
        try:
            cursor.execute("ALTER TABLE projects ADD COLUMN progress INTEGER DEFAULT 0")
            print("Added progress column")
        except sqlite3.OperationalError as e:
            print(f"progress might already exist: {e}")

        # Add status_message
        try:
            cursor.execute("ALTER TABLE projects ADD COLUMN status_message TEXT DEFAULT 'Initialized'")
            print("Added status_message column")
        except sqlite3.OperationalError as e:
            print(f"status_message might already exist: {e}")

        conn.commit()
        print("Migration complete.")
    except Exception as e:
        print(f"Migration failed: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
