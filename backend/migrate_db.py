"""
Simple migration script to add category and due_date columns to tasks table.
"""
import sqlite3

# Connect to database
conn = sqlite3.connect('todo.db')
cursor = conn.cursor()

try:
    # Check if columns exist
    cursor.execute("PRAGMA table_info(tasks)")
    columns = [col[1] for col in cursor.fetchall()]

    # Add category column if it doesn't exist
    if 'category' not in columns:
        cursor.execute("ALTER TABLE tasks ADD COLUMN category VARCHAR(50)")
        print("Added 'category' column")
    else:
        print("'category' column already exists")

    # Add due_date column if it doesn't exist
    if 'due_date' not in columns:
        cursor.execute("ALTER TABLE tasks ADD COLUMN due_date DATETIME")
        print("Added 'due_date' column")
    else:
        print("'due_date' column already exists")

    conn.commit()
    print("\nDatabase migration completed successfully!")

except Exception as e:
    print(f"Error: {e}")
    conn.rollback()
finally:
    conn.close()
