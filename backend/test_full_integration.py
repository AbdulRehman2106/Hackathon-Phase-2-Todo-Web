import requests
import json

# Test authentication and AI endpoints
BASE_URL = "http://localhost:8080"

print("=" * 60)
print("TESTING TODO APP - AUTHENTICATION & AI FEATURES")
print("=" * 60)

# Test 1: Sign In
print("\n1. Testing Sign-In...")
signin_data = {
    "email": "testuser999@example.com",
    "password": "TestPassword123!"
}

response = requests.post(f"{BASE_URL}/api/auth/signin", json=signin_data)
print(f"Status: {response.status_code}")

if response.status_code == 200:
    data = response.json()
    token = data['token']
    print(f"✅ Sign-in successful!")
    print(f"User ID: {data['user']['id']}")
    print(f"Email: {data['user']['email']}")
    print(f"Token: {token[:50]}...")

    # Test 2: AI Health Check
    print("\n2. Testing AI Health Check...")
    response = requests.get(f"{BASE_URL}/api/ai/health")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        print(f"✅ AI Service: {response.json()}")

    # Test 3: AI Task Suggestions (Protected)
    print("\n3. Testing AI Task Suggestions (Protected Endpoint)...")
    headers = {"Authorization": f"Bearer {token}"}
    ai_data = {"context": "Planning a birthday party", "count": 3}

    response = requests.post(
        f"{BASE_URL}/api/ai/suggestions",
        json=ai_data,
        headers=headers,
        timeout=30
    )
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        suggestions = response.json()['suggestions']
        print(f"✅ AI Suggestions received:")
        for i, suggestion in enumerate(suggestions, 1):
            print(f"   {i}. {suggestion}")
    else:
        print(f"❌ Error: {response.text}")

    # Test 4: AI Categorization
    print("\n4. Testing AI Task Categorization...")
    cat_data = {
        "title": "Review quarterly financial reports",
        "description": "Analyze Q4 revenue and expenses"
    }

    response = requests.post(
        f"{BASE_URL}/api/ai/categorize",
        json=cat_data,
        headers=headers,
        timeout=30
    )
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Categorization:")
        print(f"   Category: {result['category']}")
        print(f"   Priority: {result['priority']}")
        print(f"   Tags: {', '.join(result['tags'])}")
    else:
        print(f"❌ Error: {response.text}")

    print("\n" + "=" * 60)
    print("✅ ALL TESTS COMPLETED!")
    print("=" * 60)
else:
    print(f"❌ Sign-in failed: {response.text}")
