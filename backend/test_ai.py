"""
Quick test script for AI features.
Run this to verify Cohere integration is working.
"""

import os
from dotenv import load_dotenv

load_dotenv()

def test_cohere_connection():
    """Test if Cohere API key is configured and working."""
    api_key = os.getenv("COHERE_API_KEY")
    
    if not api_key:
        print("❌ COHERE_API_KEY not found in environment variables")
        return False
    
    print(f"✅ COHERE_API_KEY found: {api_key[:10]}...")
    
    try:
        import cohere
        co = cohere.Client(api_key)
        
        # Test with a simple generation
        response = co.generate(
            model='command',
            prompt='Say "Hello, AI is working!"',
            max_tokens=20
        )
        
        result = response.generations[0].text.strip()
        print(f"✅ Cohere API is working!")
        print(f"   Response: {result}")
        return True
        
    except ImportError:
        print("❌ Cohere package not installed. Run: pip install cohere")
        return False
    except Exception as e:
        print(f"❌ Error connecting to Cohere: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Testing Cohere AI Integration...\n")
    success = test_cohere_connection()
    print("\n" + ("="*50))
    if success:
        print("✅ All tests passed! AI features are ready to use.")
    else:
        print("❌ Tests failed. Please check the errors above.")
