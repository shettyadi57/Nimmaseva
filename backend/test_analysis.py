import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"

print("--- 1. Testing Offices API ---")
res = requests.get(f"{BASE_URL}/offices?lat=13.9299&lng=75.5681")
print("Offices Count:", len(res.json()))
print("First Office:", res.json()[0]['name'], "| Distance:", res.json()[0]['distance_km'], "km")

print("\n--- 2. Testing Services API ---")
res_srv = requests.get(f"{BASE_URL}/services")
print("Services Available:", len(res_srv.json()))
for s in res_srv.json()[:3]:
    print(f" - {s['code']}: {s['name']} (Fee: Rs.{s['fee']})")

print("\n--- 3. Testing Token Creation & Slot Allocation ---")
booking_payload = {
    "citizen_name": "Ramesh Gowda",
    "phone": "9876543210",
    "aadhaar": "123456789012",
    "age": 65,
    "gender": "Male",
    "is_priority": True,
    "priority_reason": "Senior Citizen (60+)",
    "booking_type": "Online",
    "office_id": 1,
    "service_id": 1
}
res_booking = requests.post(f"{BASE_URL}/bookings", json=booking_payload)
booking_data = res_booking.json()
print("Token Generated:", booking_data.get("token_number"))
print("Verification Code:", booking_data.get("verification_code"))
print("Visit Date & Slot:", booking_data.get("visit_date"), "@", booking_data.get("visit_time"))
print("Tatkal AI Completion Chance:", booking_data.get("tatkal_probability"), "%")

print("\n--- 4. Testing PDF Generation Endpoint ---")
tok_num = booking_data.get("token_number")
res_pdf = requests.get(f"{BASE_URL}/bookings/pdf/{tok_num}")
print("PDF Status Code:", res_pdf.status_code, "| Content Length:", len(res_pdf.content), "bytes")

print("\n--- 5. Testing Live Queue Board API ---")
res_queue = requests.get(f"{BASE_URL}/queue/1")
print("Live Queue State:", json.dumps(res_queue.json(), indent=2))

print("\n--- 6. Testing Admin Dashboard Summary ---")
res_admin = requests.get(f"{BASE_URL}/admin/summary")
print("Admin Summary Data:", json.dumps(res_admin.json(), indent=2))
