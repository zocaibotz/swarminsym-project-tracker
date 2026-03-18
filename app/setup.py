import os
from app.db import Base, SessionLocal, engine
from app.models import User


def run_setup() -> None:
    Base.metadata.create_all(bind=engine)

    admin_email = os.getenv("ADMIN_EMAIL")
    admin_password = os.getenv("ADMIN_PASSWORD")
    if not admin_email or not admin_password:
        raise RuntimeError("ADMIN_EMAIL and ADMIN_PASSWORD must be set")

    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == admin_email).first()
        if existing is None:
            db.add(User(email=admin_email, password=admin_password, role="admin"))
            db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    run_setup()
