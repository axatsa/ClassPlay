from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from apps.admin.models import Organization, Payment
from apps.auth.models import User
from datetime import datetime, timedelta

def seed_b2b():
    db = SessionLocal()
    try:
        # 1. Create Organizations
        org1 = db.query(Organization).filter(Organization.name == "Greenwood Academy").first()
        if not org1:
            print("Creating organizations...")
            org1 = Organization(
                name="Greenwood Academy",
                contact_person="Alice Smith",
                license_seats=20,
                used_seats=0,
                expires_at=datetime.utcnow() + timedelta(days=365),
                status="active"
            )
            org2 = Organization(
                name="Riverdale High",
                contact_person="Bob Jones",
                license_seats=50,
                used_seats=0,
                expires_at=datetime.utcnow() + timedelta(days=365),
                status="active"
            )
            db.add_all([org1, org2])
            db.commit()
            db.refresh(org1)
            db.refresh(org2)
            print("Organizations created.")
        else:
            org2 = db.query(Organization).filter(Organization.name == "Riverdale High").first()
            print("Organizations already exist.")

        # 2. Link existing teachers to Organizations if they aren't linked
        teachers = db.query(User).filter(User.role == "teacher", User.organization_id == None).all()
        if teachers:
            print(f"Linking {len(teachers)} teachers to Greenwood Academy...")
            for t in teachers:
                t.organization_id = org1.id
                org1.used_seats += 1
            db.commit()

        # 3. Create Payments
        existing_payments = db.query(Payment).count()
        if existing_payments == 0:
            print("Creating payments...")
            p1 = Payment(
                organization_id=org1.id,
                amount=49,
                currency="USD",
                method="Stripe",
                status="paid",
                period="April 2026",
                date=datetime.utcnow() - timedelta(days=2)
            )
            p2 = Payment(
                organization_id=org2.id,
                amount=149,
                currency="USD",
                method="Wire Transfer",
                status="paid",
                period="Yearly 2026",
                date=datetime.utcnow() - timedelta(days=5)
            )
            p3 = Payment(
                organization_id=org1.id,
                amount=49,
                currency="USD",
                method="Stripe",
                status="pending",
                period="May 2026",
                date=datetime.utcnow() + timedelta(days=28)
            )
            db.add_all([p1, p2, p3])
            db.commit()
            print("Payments created.")
        else:
            print("Payments already exist.")

    except Exception as e:
        print(f"Error seeding B2B: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_b2b()
