from database import engine
from sqlalchemy import text

def add_column():
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE transactions ADD COLUMN usd_rate DOUBLE PRECISION"))
            conn.commit()
            print("Successfully added usd_rate column to transactions table.")
        except Exception as e:
            print(f"Error adding column (it might already exist): {e}")

if __name__ == "__main__":
    add_column()
