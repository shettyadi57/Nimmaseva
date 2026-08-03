from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.models import User, Office, Service, Scheme, Booking, QueueState

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Admin User
        admin = db.query(User).filter(User.email == "admin@nimmaseva.in").first()
        if not admin:
            admin = User(
                full_name="Shivamogga District Admin",
                email="admin@nimmaseva.in",
                phone="9876543210",
                hashed_password=get_password_hash("Admin@123"),
                role="admin"
            )
            db.add(admin)

        # 2. Offices
        gramone = db.query(Office).filter(Office.name == "GramOne Shivamogga Center").first()
        if not gramone:
            gramone = Office(
                name="GramOne Shivamogga Center",
                type="GramOne",
                address="B.H. Road, Near Bus Stand, Shivamogga, Karnataka 577201",
                district="Shivamogga",
                taluk="Shivamogga",
                village="Shivamogga City",
                latitude=13.9299,
                longitude=75.5681,
                phone="08182-271234",
                working_hours="09:00 AM - 05:00 PM",
                lunch_break="12:00 PM - 01:00 PM",
                max_daily_tokens=100,
                server_status="Active"
            )
            db.add(gramone)

        sevasindhu = db.query(Office).filter(Office.name == "Seva Sindhu Mini Vidhana Soudha").first()
        if not sevasindhu:
            sevasindhu = Office(
                name="Seva Sindhu Mini Vidhana Soudha",
                type="SevaSindhu",
                address="District Administrative Complex, Court Road, Shivamogga 577201",
                district="Shivamogga",
                taluk="Shivamogga",
                village="Shivamogga City",
                latitude=13.9350,
                longitude=75.5750,
                phone="08182-279876",
                working_hours="09:00 AM - 05:00 PM",
                lunch_break="12:00 PM - 01:00 PM",
                max_daily_tokens=120,
                server_status="Active"
            )
            db.add(sevasindhu)

        db.commit()

        # 3. Services
        services_data = [
            {
                "name": "Income Certificate",
                "code": "INC-001",
                "category": "Revenue",
                "fee": 40.0,
                "avg_processing_time_mins": 15,
                "daily_capacity": 60,
                "server_status": "Active",
                "required_documents": ["Aadhaar Card", "Ration Card / Voter ID", "Salary Slip / Self Declaration", "Passport Photo"]
            },
            {
                "name": "Caste Certificate",
                "code": "CST-002",
                "category": "Revenue",
                "fee": 40.0,
                "avg_processing_time_mins": 15,
                "daily_capacity": 60,
                "server_status": "Active",
                "required_documents": ["Aadhaar Card", "School Transfer Certificate", "Father Caste Certificate / TC", "Affidavit"]
            },
            {
                "name": "Residence Certificate",
                "code": "RES-003",
                "category": "Revenue",
                "fee": 40.0,
                "avg_processing_time_mins": 10,
                "daily_capacity": 80,
                "server_status": "Active",
                "required_documents": ["Aadhaar Card", "Electricity Bill / Gas Bill", "Ration Card", "Property Tax Receipt"]
            },
            {
                "name": "Birth Certificate",
                "code": "BRT-004",
                "category": "Civil Registration",
                "fee": 50.0,
                "avg_processing_time_mins": 20,
                "daily_capacity": 40,
                "server_status": "Active",
                "required_documents": ["Hospital Discharge Summary", "Parents Aadhaar Cards", "Marriage Certificate"]
            },
            {
                "name": "Death Certificate",
                "code": "DTH-005",
                "category": "Civil Registration",
                "fee": 50.0,
                "avg_processing_time_mins": 20,
                "daily_capacity": 40,
                "server_status": "Active",
                "required_documents": ["Doctor Death Report", "Deceased Aadhaar Card", "Applicant Aadhaar Card", "Burial/Cremation receipt"]
            },
            {
                "name": "Land Records (RTC / Pahani)",
                "code": "LND-006",
                "category": "Bhoomi Revenue",
                "fee": 25.0,
                "avg_processing_time_mins": 10,
                "daily_capacity": 100,
                "server_status": "Active",
                "required_documents": ["Survey Number Details", "Owner Aadhaar Card", "Previous RTC Copy"]
            },
            {
                "name": "Sandhya Suraksha Pension",
                "code": "PEN-007",
                "category": "Social Welfare",
                "fee": 0.0,
                "avg_processing_time_mins": 25,
                "daily_capacity": 30,
                "server_status": "Active",
                "required_documents": ["Aadhaar Card (Age 60+)", "Income Certificate (< Rs. 20,000)", "Bank Passbook", "Passport Photo"]
            },
            {
                "name": "Ration Card Modification",
                "code": "RAT-008",
                "category": "Food & Civil Supplies",
                "fee": 50.0,
                "avg_processing_time_mins": 20,
                "daily_capacity": 50,
                "server_status": "Active",
                "required_documents": ["Existing Ration Card", "New Member Aadhaar Card", "Birth Certificate (for child)"]
            },
            {
                "name": "Aadhaar Demographic Update",
                "code": "ADH-009",
                "category": "UIDAI",
                "fee": 50.0,
                "avg_processing_time_mins": 15,
                "daily_capacity": 70,
                "server_status": "Active",
                "required_documents": ["Current Aadhaar", "Proof of Identity / Address document"]
            },
            {
                "name": "Farmer Registration (FRUITS ID)",
                "code": "FRM-010",
                "category": "Agriculture",
                "fee": 0.0,
                "avg_processing_time_mins": 15,
                "daily_capacity": 60,
                "server_status": "Active",
                "required_documents": ["Aadhaar Card", "Pahani / RTC Copy", "Bank Passbook"]
            },
            {
                "name": "PM Kisan Samman Nidhi",
                "code": "PMK-011",
                "category": "Agriculture",
                "fee": 0.0,
                "avg_processing_time_mins": 15,
                "daily_capacity": 60,
                "server_status": "Active",
                "required_documents": ["Aadhaar Card", "Land Holdings Record", "Bank Passbook"]
            },
            {
                "name": "Gruha Lakshmi Scheme",
                "code": "GLK-012",
                "category": "Women & Child Development",
                "fee": 0.0,
                "avg_processing_time_mins": 15,
                "daily_capacity": 80,
                "server_status": "Active",
                "required_documents": ["Aadhaar Card of Woman Head", "Husband Aadhaar Card", "Bank Account linked with Aadhaar", "Ration Card"]
            }
        ]

        for s_data in services_data:
            existing_s = db.query(Service).filter(Service.code == s_data["code"]).first()
            if not existing_s:
                db.add(Service(**s_data))

        db.commit()

        # 4. Schemes Data
        schemes_data = [
            {
                "title": "Gruha Lakshmi Scheme",
                "category": "Women Empowerment",
                "min_age": 18,
                "max_age": 100,
                "gender_eligibility": "Female",
                "max_income": 200000.0,
                "target_occupation": "All",
                "district": "Shivamogga",
                "description": "Financial assistance of Rs. 2,000 per month to female head of household in Karnataka.",
                "required_documents": ["Aadhaar Card", "Ration Card", "Aadhaar Linked Bank Passbook"],
                "benefits": "Rs. 2,000 monthly direct bank transfer",
                "apply_link": "https://sevasindhugs.karnataka.gov.in"
            },
            {
                "title": "Yuva Nidhi Scheme",
                "category": "Youth Employment",
                "min_age": 20,
                "max_age": 30,
                "gender_eligibility": "All",
                "max_income": 500000.0,
                "target_occupation": "Unemployed",
                "district": "Shivamogga",
                "description": "Unemployment allowance for degree and diploma graduates who passed in 2023-24.",
                "required_documents": ["Aadhaar Card", "Degree / Diploma Certificate", "Bank Account Details"],
                "benefits": "Rs. 3,000/month for Degree graduates, Rs. 1,500/month for Diploma holders",
                "apply_link": "https://sevasindhugs.karnataka.gov.in"
            },
            {
                "title": "Sandhya Suraksha Pension",
                "category": "Senior Citizens",
                "min_age": 60,
                "max_age": 120,
                "gender_eligibility": "All",
                "max_income": 20000.0,
                "target_occupation": "All",
                "district": "Shivamogga",
                "description": "Monthly pension support for senior citizens aged 60 and above with low income.",
                "required_documents": ["Age Proof (Aadhaar/Voter ID)", "Income Certificate", "Bank Account"],
                "benefits": "Rs. 1,200 monthly pension directly to bank account",
                "apply_link": "https://sevasindhu.karnataka.gov.in"
            },
            {
                "title": "Raita Vidya Nidhi",
                "category": "Education & Farmers",
                "min_age": 15,
                "max_age": 25,
                "gender_eligibility": "All",
                "max_income": 300000.0,
                "target_occupation": "Student",
                "district": "Shivamogga",
                "description": "Scholarship for children of farmers studying post-matric courses.",
                "required_documents": ["FRUITS ID", "Student Aadhaar Card", "College Admission Fee Receipt"],
                "benefits": "Rs. 2,500 to Rs. 11,000 annual scholarship based on course",
                "apply_link": "https://ssp.postmatric.karnataka.gov.in"
            }
        ]

        for sc_data in schemes_data:
            existing_sc = db.query(Scheme).filter(Scheme.title == sc_data["title"]).first()
            if not existing_sc:
                db.add(Scheme(**sc_data))

        db.commit()

        # 5. Initialize Queue States
        for off in [gramone, sevasindhu]:
            if off:
                qs = db.query(QueueState).filter(QueueState.office_id == off.id).first()
                if not qs:
                    db.add(QueueState(
                        office_id=off.id,
                        current_token=f"{'GO' if off.type == 'GramOne' else 'SS'}-004",
                        next_token=f"{'GO' if off.type == 'GramOne' else 'SS'}-005",
                        active_counters=3,
                        is_paused=False
                    ))

        db.commit()
        print("Database seeded successfully!")

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
