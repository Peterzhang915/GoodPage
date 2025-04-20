# GoodPage/scripts/set-password.py
import sqlite3
import bcrypt
import argparse
import os
import sys
# Import dotenv
from dotenv import load_dotenv

def set_password():
    parser = argparse.ArgumentParser(description="Set/Update password hash for a member.")
    parser.add_argument("username", help="The username of the member.")
    parser.add_argument("new_password", help="The new plain text password to set.")
    args = parser.parse_args()

    username = args.username
    new_password = args.new_password

    # --- IMPORTANT ---
    print(f"---> Attempting to set password for user: {username}")
    print(f'---> Password provided: "{new_password}" (Keep this safe!)')
    # --- IMPORTANT ---

    # --- Load environment variables from .env file --- 
    # Construct the path to the .env file (assuming it's in the parent directory of scripts, i.e., GoodPage)
    script_dir = os.path.dirname(__file__)
    dotenv_path = os.path.join(script_dir, '..', '.env')
    load_dotenv(dotenv_path=dotenv_path)

    # --- Get database URL from environment variable --- 
    database_url = os.getenv('DATABASE_URL')

    if not database_url:
        print("Error: DATABASE_URL not found in .env file or environment variables.")
        print(f"Looked for .env at: {dotenv_path}")
        sys.exit(1)

    # --- Parse the database path from the URL --- 
    # Expected format: file:./path/to/db.db or file:../path/to/db.db
    if not database_url.startswith('file:'):
        print(f"Error: Invalid DATABASE_URL format. Expected 'file:...', got: {database_url}")
        sys.exit(1)
    
    # Remove the 'file:' prefix
    relative_db_path_from_env = database_url[5:] 
    # Construct the absolute path based on the location of the .env file (GoodPage directory)
    project_root_dir = os.path.dirname(dotenv_path)
    db_path = os.path.abspath(os.path.join(project_root_dir, relative_db_path_from_env))
    print(f"---> Connecting to database at: {db_path}") # Log the actual path being used

    # --- Database connection and operations (rest of the script) --- 
    if not os.path.exists(db_path):
        print(f"Error: Database file not found at derived path: {db_path}")
        print("Please check your .env file and the database file location.")
        sys.exit(1)

    conn = None
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        cursor.execute("SELECT id FROM Member WHERE username = ?", (username,))
        member = cursor.fetchone()

        if member is None:
            print(f'Error: User with username "{username}" not found.')
            sys.exit(1)

        print('Hashing the password...')
        password_bytes = new_password.encode('utf-8')
        hashed_bytes = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
        password_hash_str = hashed_bytes.decode('utf-8')
        print('Password hashed successfully.')

        print(f'Updating password hash for user {username}...')
        cursor.execute("UPDATE Member SET password_hash = ? WHERE username = ?", (password_hash_str, username))
        conn.commit()

        print(f'✅ Successfully updated password hash for user "{username}".')
        print(f'🔑 Remember the password you provided: "{new_password}"')

    except sqlite3.Error as e:
        print(f"An SQLite error occurred: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        sys.exit(1)
    finally:
        if conn:
            conn.close()
            print('Database connection closed.')

if __name__ == "__main__":
    set_password() 