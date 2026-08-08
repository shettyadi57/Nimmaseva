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

        # 3. Services (20 Comprehensive Services with Document Requirements)
        services_data = [
            {
                "name": "Income Certificate",
                "code": "INC-001",
                "category": "Revenue",
                "fee": 40.0,
                "avg_processing_time_mins": 15,
                "daily_capacity": 60,
                "server_status": "Active",
                "required_documents": [
                    "Aadhaar Card of Applicant",
                    "Ration Card / Voter ID Card",
                    "Salary Slip / Form 16 or Self Declaration of Annual Income",
                    "Passport Size Photograph",
                    "Land Revenue Receipt or Building Tax Receipt (if applicable)"
                ],
                "description": "Official government income certificate issued by Nadakacheri/Revenue Department for education scholarships, fee concessions, and government welfare benefits."
            },
            {
                "name": "Caste Certificate",
                "code": "CST-002",
                "category": "Revenue",
                "fee": 40.0,
                "avg_processing_time_mins": 15,
                "daily_capacity": 60,
                "server_status": "Active",
                "required_documents": [
                    "Aadhaar Card of Applicant",
                    "School Transfer Certificate (TC) showing Caste/Category",
                    "Father or Paternal Relative Caste Certificate / School TC",
                    "Self Declaration / Notarized Affidavit",
                    "Ration Card / Address Proof"
                ],
                "description": "Caste status verification certificate (SC/ST/OBC/Category 1, 2A, 2B, 3A, 3B) required for reservations and welfare programs."
            },
            {
                "name": "Income & Caste Combined Certificate",
                "code": "ICC-003",
                "category": "Revenue",
                "fee": 40.0,
                "avg_processing_time_mins": 15,
                "daily_capacity": 80,
                "server_status": "Active",
                "required_documents": [
                    "Aadhaar Card",
                    "BPL / APL Ration Card",
                    "School Leaving / Transfer Certificate (TC)",
                    "Income Proof (Salary Slip / Revenue Officer Report)",
                    "Family Tree / Genealogic Chart (if requested)"
                ],
                "description": "Combined Income & Caste certificate widely accepted for college admissions (CET/NEET) and Karnataka Govt recruitments."
            },
            {
                "name": "Residence / Domicile Certificate",
                "code": "RES-004",
                "category": "Revenue",
                "fee": 40.0,
                "avg_processing_time_mins": 10,
                "daily_capacity": 80,
                "server_status": "Active",
                "required_documents": [
                    "Aadhaar Card",
                    "Electricity Bill / Water Bill / Gas Connection Receipt",
                    "Registered Rent Agreement / Property Tax Receipt",
                    "Voter ID Card",
                    "Passport Photo"
                ],
                "description": "Proof of continuous residency in Karnataka state for educational, recruitment, and legal requirements."
            },
            {
                "name": "Solvency Certificate",
                "code": "SLV-005",
                "category": "Revenue",
                "fee": 50.0,
                "avg_processing_time_mins": 20,
                "daily_capacity": 40,
                "server_status": "Active",
                "required_documents": [
                    "Aadhaar Card",
                    "Encumbrance Certificate (EC) of Property",
                    "Property Tax Paid Receipt & Valuation Report",
                    "Bank Balance Certificate / Fixed Deposit Records",
                    "Self Declaration Affidavit"
                ],
                "description": "Certificate establishing financial creditworthiness for bank loans, court bail bonds, and government tenders."
            },
            {
                "name": "New Ration Card Application",
                "code": "RAT-006",
                "category": "Food & Civil Supplies",
                "fee": 50.0,
                "avg_processing_time_mins": 25,
                "daily_capacity": 50,
                "server_status": "Active",
                "required_documents": [
                    "Aadhaar Cards of All Family Members (Mandatory)",
                    "Passport Photo of Head of Family (Female head preferred)",
                    "Income Certificate issued by Revenue Dept",
                    "Electricity Bill / House Rent Agreement / Tax Receipt",
                    "De-duplication / NOC Certificate (if moving from another district)"
                ],
                "description": "Fresh BPL / APL Ration Card issuance for eligible families under Food & Civil Supplies Department."
            },
            {
                "name": "Ration Card Member Addition / Modification",
                "code": "RAT-007",
                "category": "Food & Civil Supplies",
                "fee": 50.0,
                "avg_processing_time_mins": 20,
                "daily_capacity": 50,
                "server_status": "Active",
                "required_documents": [
                    "Existing Original Ration Card",
                    "New Member Aadhaar Card",
                    "Birth Certificate (for adding newborns)",
                    "Marriage Certificate / Surrender Certificate (for married female member)",
                    "Head of Family Consent Letter"
                ],
                "description": "Update family members, correct names/address, or transfer names on existing Ration Card."
            },
            {
                "name": "RTC / Pahani Land Record Copy",
                "code": "LND-008",
                "category": "Bhoomi Revenue",
                "fee": 25.0,
                "avg_processing_time_mins": 8,
                "daily_capacity": 150,
                "server_status": "Active",
                "required_documents": [
                    "Survey Number & Hissa Number",
                    "District, Taluk, Hobli, and Village Name",
                    "Land Owner Aadhaar Card (for verification)"
                ],
                "description": "Certified legal copy of Record of Rights, Tenancy and Crops (RTC/Pahani) from Bhoomi Karnataka portal."
            },
            {
                "name": "Land Mutation / Khata Transfer",
                "code": "LND-009",
                "category": "Bhoomi Revenue",
                "fee": 100.0,
                "avg_processing_time_mins": 30,
                "daily_capacity": 30,
                "server_status": "Active",
                "required_documents": [
                    "Registered Sale Deed / Gift Deed / Partition Deed",
                    "Encumbrance Certificate (EC) for 13+ years",
                    "Latest RTC / Pahani Copy",
                    "Death Certificate & Family Tree (in case of inheritance/succession)",
                    "Aadhaar Cards of Buyer and Seller / Legal Heirs"
                ],
                "description": "Official transfer of land title ownership in Revenue records following property purchase or inheritance."
            },
            {
                "name": "Sandhya Suraksha Senior Pension",
                "code": "PEN-010",
                "category": "Social Welfare",
                "fee": 0.0,
                "avg_processing_time_mins": 20,
                "daily_capacity": 40,
                "server_status": "Active",
                "required_documents": [
                    "Aadhaar Card proving Age 60+",
                    "Income Certificate (Annual Income below Rs. 20,000)",
                    "Aadhaar-seeded Bank Passbook (DBT enabled)",
                    "Karnataka Domicile Proof",
                    "Passport Photo & Self Declaration"
                ],
                "description": "Monthly pension assistance scheme of ₹1,200/month for senior citizens above 60 years."
            },
            {
                "name": "Disability Pension & UDID Card",
                "code": "PEN-011",
                "category": "Social Welfare",
                "fee": 0.0,
                "avg_processing_time_mins": 25,
                "daily_capacity": 30,
                "server_status": "Active",
                "required_documents": [
                    "Disability Certificate issued by Govt Medical Officer (40%+ disability)",
                    "Aadhaar Card of Applicant",
                    "Income Certificate",
                    "Aadhaar-linked Bank Account Passbook",
                    "Full Length & Passport Photographs showing disability"
                ],
                "description": "Financial monthly pension & Unique Disability ID (UDID) card for persons with physical/mental challenges."
            },
            {
                "name": "Widow / Destitute Pension (Indira Gandhi)",
                "code": "PEN-012",
                "category": "Social Welfare",
                "fee": 0.0,
                "avg_processing_time_mins": 20,
                "daily_capacity": 35,
                "server_status": "Active",
                "required_documents": [
                    "Death Certificate of Husband",
                    "Marriage Proof / Ration Card / Voters ID",
                    "Aadhaar Card of Applicant",
                    "Income Certificate (Low Income proof)",
                    "Bank Passbook linked to Aadhaar"
                ],
                "description": "Monthly social security pension scheme for widows and destitute women in Karnataka."
            },
            {
                "name": "Senior Citizen ID Card & Pass",
                "code": "WLF-013",
                "category": "Social Welfare",
                "fee": 0.0,
                "avg_processing_time_mins": 10,
                "daily_capacity": 60,
                "server_status": "Active",
                "required_documents": [
                    "Proof of Age (60+ years) (Aadhaar / Voter ID / Passport)",
                    "Karnataka Residence Proof",
                    "Blood Group Test Report from certified lab",
                    "2 Recent Passport Photographs"
                ],
                "description": "Official Senior Citizen Identification Card providing travel concessions, medical discounts, and priority queue pass."
            },
            {
                "name": "Gruha Lakshmi Guarantee Scheme",
                "code": "GLK-014",
                "category": "Karnataka Guarantees",
                "fee": 0.0,
                "avg_processing_time_mins": 15,
                "daily_capacity": 100,
                "server_status": "Active",
                "required_documents": [
                    "Aadhaar Card of Female Head of Family",
                    "Husband's Aadhaar Card",
                    "BPL / APL / Antyodaya Ration Card",
                    "Aadhaar-Seeded Bank Passbook (NPCI mapped)",
                    "Mobile Phone linked to Aadhaar for OTP"
                ],
                "description": "Karnataka Govt guarantee scheme offering ₹2,000 monthly direct bank transfer to eligible female family heads."
            },
            {
                "name": "Yuva Nidhi Graduate Allowance",
                "code": "YVN-015",
                "category": "Karnataka Guarantees",
                "fee": 0.0,
                "avg_processing_time_mins": 15,
                "daily_capacity": 90,
                "server_status": "Active",
                "required_documents": [
                    "Degree or Diploma Completion Certificate & All Semester Marksheets",
                    "Aadhaar Card of Student",
                    "Karnataka Domicile / SSLC School Study Certificate",
                    "Unemployment Self-Declaration Affidavit",
                    "Aadhaar-linked Bank Account Passbook"
                ],
                "description": "Unemployment financial stipend (₹3,000/mo for Graduates, ₹1,500/mo for Diploma holders) for up to 2 years."
            },
            {
                "name": "FRUITS Farmer Registration & ID",
                "code": "FRM-016",
                "category": "Agriculture",
                "fee": 0.0,
                "avg_processing_time_mins": 15,
                "daily_capacity": 70,
                "server_status": "Active",
                "required_documents": [
                    "Aadhaar Card of Farmer",
                    "RTC / Pahani Copy of Land Holding",
                    "Bank Account Passbook Copy",
                    "Mobile Number linked with Aadhaar",
                    "Caste & Income Certificate (for subsidy bonus)"
                ],
                "description": "Farmer Registration & Unified Beneficiary Information System (FRUITS) ID for crop loss compensation, fertilizer & seed subsidies."
            },
            {
                "name": "PM Kisan Samman Nidhi Enrolment",
                "code": "PMK-017",
                "category": "Agriculture",
                "fee": 0.0,
                "avg_processing_time_mins": 15,
                "daily_capacity": 70,
                "server_status": "Active",
                "required_documents": [
                    "Aadhaar Card of Landowning Farmer",
                    "FRUITS Farmer ID / RTC Pahani Record",
                    "Aadhaar-Seeded Active Bank Account",
                    "e-KYC Verification"
                ],
                "description": "Central government income support scheme delivering ₹6,000 per year in three equal installments to farmer families."
            },
            {
                "name": "Birth Certificate Issuance",
                "code": "BRT-018",
                "category": "Civil Registration",
                "fee": 50.0,
                "avg_processing_time_mins": 20,
                "daily_capacity": 40,
                "server_status": "Active",
                "required_documents": [
                    "Hospital Birth Discharge Summary / Form-1 Report",
                    "Mother & Father Aadhaar Cards",
                    "Parents Marriage Certificate / Ration Card",
                    "Informant ID Proof"
                ],
                "description": "Official birth registration and certified certificate issuance by Municipal Corporation / Panchayat authority."
            },
            {
                "name": "Death Certificate Issuance",
                "code": "DTH-019",
                "category": "Civil Registration",
                "fee": 50.0,
                "avg_processing_time_mins": 20,
                "daily_capacity": 40,
                "server_status": "Active",
                "required_documents": [
                    "Medical Cause of Death Report from Hospital / Doctor",
                    "Burial / Cremation Ground Receipt",
                    "Deceased Person's Aadhaar Card & Voter ID",
                    "Applicant (Nearest Kin) Aadhaar Card & Relationship Proof"
                ],
                "description": "Legal certificate registering the death of a citizen for insurance claims, property succession, and bank account settlement."
            },
            {
                "name": "Aadhaar Demographic & Address Update",
                "code": "ADH-020",
                "category": "UIDAI",
                "fee": 50.0,
                "avg_processing_time_mins": 15,
                "daily_capacity": 75,
                "server_status": "Active",
                "required_documents": [
                    "Existing Aadhaar Card / Number",
                    "Proof of Identity (POI) (Voter ID / Passport / PAN Card / Driving License)",
                    "Proof of Address (POA) (Electricity Bill / Gas Bill / Bank Statement / Marriage Certificate)",
                    "Biometric / Mobile OTP verification"
                ],
                "description": "Update name, date of birth, address, or mobile number on Aadhaar record at GramOne / Seva Sindhu UIDAI counters."
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
                "title": "Gruha Lakshmi Scheme (ಗೃಹ ಲಕ್ಷ್ಮಿ)",
                "category": "Karnataka 5 Guarantees",
                "min_age": 18,
                "max_age": 100,
                "gender_eligibility": "Female",
                "max_income": 2000000.0,
                "target_occupation": "All",
                "district": "Shivamogga",
                "description": "Financial assistance of Rs. 2,000 per month to female head of household in Karnataka.",
                "required_documents": ["Aadhaar Card of Female Head", "Husband Aadhaar Card", "Ration Card", "Bank Passbook"],
                "benefits": "Rs. 2,000 monthly direct bank transfer",
                "apply_link": "https://sevasindhugs.karnataka.gov.in"
            },
            {
                "title": "Gruha Jyothi Scheme (ಗೃಹ ಜ್ಯೋತಿ)",
                "category": "Karnataka 5 Guarantees",
                "min_age": 18,
                "max_age": 100,
                "gender_eligibility": "All",
                "max_income": 10000000.0,
                "target_occupation": "All",
                "district": "Shivamogga",
                "description": "Zero electricity bill for residential households consuming up to 200 units of electricity per month across Karnataka.",
                "required_documents": ["Electricity Account ID (MESCOM)", "Aadhaar Card", "House Ownership / Rental Agreement"],
                "benefits": "Up to 200 units free electricity monthly",
                "apply_link": "https://sevasindhugs.karnataka.gov.in"
            },
            {
                "title": "Yuva Nidhi Scheme (ಯುವ ನಿಧಿ)",
                "category": "Karnataka 5 Guarantees",
                "min_age": 20,
                "max_age": 35,
                "gender_eligibility": "All",
                "max_income": 500000.0,
                "target_occupation": "Unemployed",
                "district": "Shivamogga",
                "description": "Unemployment allowance for degree (Rs. 3,000/mo) and diploma graduates (Rs. 1,500/mo) who passed out recently.",
                "required_documents": ["Aadhaar Card", "Degree / Diploma Certificate", "Domicile Certificate", "Bank Passbook"],
                "benefits": "Rs. 3,000/month for Graduates, Rs. 1,500/month for Diploma holders",
                "apply_link": "https://sevasindhugs.karnataka.gov.in"
            },
            {
                "title": "Shakti Scheme (ಶಕ್ತಿ ಯೋಜನೆ)",
                "category": "Karnataka 5 Guarantees",
                "min_age": 5,
                "max_age": 100,
                "gender_eligibility": "Female",
                "max_income": 10000000.0,
                "target_occupation": "All",
                "district": "Shivamogga",
                "description": "Free bus travel for all women and transgender residents across Karnataka state transport buses.",
                "required_documents": ["Karnataka Domicile Proof (Aadhaar Card / Voter ID)"],
                "benefits": "100% Free bus travel across Karnataka state transport buses",
                "apply_link": "https://sevasindhu.karnataka.gov.in"
            },
            {
                "title": "Anna Bhagya Scheme (ಅನ್ನ ಭಾಗ್ಯ)",
                "category": "Karnataka 5 Guarantees",
                "min_age": 0,
                "max_age": 120,
                "gender_eligibility": "All",
                "max_income": 120000.0,
                "target_occupation": "All",
                "district": "Shivamogga",
                "description": "10 kg free food grains per month for every member of BPL and Antyodaya ration cardholder families.",
                "required_documents": ["BPL Ration Card", "Aadhaar Cards of All Members", "Bank Account Details"],
                "benefits": "10 kg free food grains / cash equivalent per person monthly",
                "apply_link": "https://sevasindhugs.karnataka.gov.in"
            },
            {
                "title": "Raita Vidya Nidhi (ರೈತ ವಿದ್ಯಾ ನಿಧಿ)",
                "category": "Education & Farmers",
                "min_age": 15,
                "max_age": 26,
                "gender_eligibility": "All",
                "max_income": 300000.0,
                "target_occupation": "Student",
                "district": "Shivamogga",
                "description": "Scholarship for children of farmers studying post-matric, degree, or professional courses.",
                "required_documents": ["Farmer FRUITS ID / RTC", "Student Aadhaar Card", "College Fee Receipt"],
                "benefits": "Rs. 2,500 to Rs. 11,000 annual scholarship",
                "apply_link": "https://ssp.postmatric.karnataka.gov.in"
            },
            {
                "title": "Sandhya Suraksha Pension (ಸಂಧ್ಯಾ ಸುರಕ್ಷಾ)",
                "category": "Senior Citizens",
                "min_age": 60,
                "max_age": 120,
                "gender_eligibility": "All",
                "max_income": 50000.0,
                "target_occupation": "Senior Citizen",
                "district": "Shivamogga",
                "description": "Monthly pension support for senior citizens aged 60 and above belonging to low-income families.",
                "required_documents": ["Age Proof (Aadhaar/Voter ID)", "Income Certificate", "Bank Account"],
                "benefits": "Rs. 1,200 monthly pension directly to bank account",
                "apply_link": "https://sevasindhu.karnataka.gov.in"
            },
            {
                "title": "Arogya Karnataka / Ayushman Bharat (ಆರೋಗ್ಯ ಕರ್ನಾಟಕ)",
                "category": "Healthcare & Medical",
                "min_age": 0,
                "max_age": 120,
                "gender_eligibility": "All",
                "max_income": 300000.0,
                "target_occupation": "All",
                "district": "Shivamogga",
                "description": "Free secondary and tertiary cashless medical treatment at empaneled government and private hospitals.",
                "required_documents": ["BPL Ration Card / AB-ARK Health Card", "Aadhaar Card"],
                "benefits": "Cashless medical treatment up to Rs. 5,00,000 per family annually",
                "apply_link": "https://arogya.karnataka.gov.in"
            },
            {
                "title": "Ganga Kalyana Irrigation Scheme (ಗಂಗಾ ಕಲ್ಯಾಣ)",
                "category": "Agriculture & Irrigation",
                "min_age": 18,
                "max_age": 65,
                "gender_eligibility": "All",
                "max_income": 150000.0,
                "target_occupation": "Farmer",
                "district": "Shivamogga",
                "description": "100% subsidized borewell drilling and pump set installation for small/marginal farmers from SC/ST/OBC.",
                "required_documents": ["RTC Pahani Land Records", "Caste & Income Certificate", "Small Farmer Certificate"],
                "benefits": "Free borewell drilling, pump set installation & power connection",
                "apply_link": "https://kmdc.karnataka.gov.in"
            },
            {
                "title": "Manasvini & Mythri Pension Scheme (ಮನಸ್ವಿನಿ / ಮೈತ್ರಿ)",
                "category": "Social Welfare & Inclusion",
                "min_age": 18,
                "max_age": 70,
                "gender_eligibility": "All",
                "max_income": 50000.0,
                "target_occupation": "All",
                "district": "Shivamogga",
                "description": "Monthly pension supporting unmarried women over 40, divorced/destitute women, and transgender citizens.",
                "required_documents": ["Aadhaar Card", "Income Certificate", "Single / Transgender Certificate", "Bank Passbook"],
                "benefits": "Rs. 1,200 monthly pension directly to bank account",
                "apply_link": "https://sevasindhu.karnataka.gov.in"
            },
            {
                "title": "Mathru Purna Nutrition Scheme (ಮಾತೃ ಪೂರ್ಣ)",
                "category": "Health & Nutrition",
                "min_age": 18,
                "max_age": 45,
                "gender_eligibility": "Female",
                "max_income": 500000.0,
                "target_occupation": "All",
                "district": "Shivamogga",
                "description": "Daily wholesome hot cooked meal, milk, egg/chikki, and nutritional supplements for pregnant & lactating mothers.",
                "required_documents": ["Thayi Card (Mother Card)", "Aadhaar Card", "Anganwadi Registration"],
                "benefits": "Free daily nutritious meal & health supplements for 15 months",
                "apply_link": "https://dwcd.karnataka.gov.in"
            },
            {
                "title": "Chief Minister Self Employment Scheme (CMEGP)",
                "category": "Business & Entrepreneurship",
                "min_age": 18,
                "max_age": 45,
                "gender_eligibility": "All",
                "max_income": 1000000.0,
                "target_occupation": "All",
                "district": "Shivamogga",
                "description": "Up to 35% government capital subsidy on bank project loans up to Rs. 10 Lakhs for micro-enterprises set up by youth.",
                "required_documents": ["Project Report (DPR)", "Aadhaar Card", "Educational Certificate", "Bank Details"],
                "benefits": "Up to 35% government capital subsidy on loans up to Rs. 10 Lakhs",
                "apply_link": "https://cmegp.kar.nic.in"
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
