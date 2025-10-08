"""
Simple test script to verify Anthropic API key and AI service functionality
Run this to diagnose AI generation issues
"""

import os
import sys
import asyncio
from dotenv import load_dotenv

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.ai_service import AIService

def print_header(text: str):
    """Print formatted header"""
    print("\n" + "=" * 60)
    print(f"  {text}")
    print("=" * 60)

async def test_ai_service():
    """Test the AI service"""
    
    print_header("AI SERVICE TEST")
    
    # Load environment variables
    load_dotenv()
    
    # Check if API key is set
    api_key = os.getenv("ANTHROPIC_API_KEY")
    
    if not api_key:
        print("\n❌ ERROR: ANTHROPIC_API_KEY not found in environment variables")
        print("\nPlease create a .env file in the backend/ directory with:")
        print("ANTHROPIC_API_KEY=your_api_key_here")
        return False
    
    print(f"\n✓ API key found: {api_key[:10]}...{api_key[-4:]}")
    
    # Initialize AI service
    try:
        print("\n🔧 Initializing AI service...")
        ai_service = AIService(api_key)
        print(f"✓ Using model: {ai_service.model}")
    except Exception as e:
        print(f"\n❌ Failed to initialize AI service: {str(e)}")
        return False
    
    # Test API key validation
    print("\n🔍 Validating API key...")
    try:
        is_valid = ai_service.validate_api_key()
        if is_valid:
            print("✓ API key is valid!")
        else:
            print("❌ API key validation failed - key may be invalid or expired")
            return False
    except Exception as e:
        print(f"❌ API key validation error: {str(e)}")
        return False
    
    # Test answer generation
    print("\n🤖 Testing answer generation...")
    test_question = "What is information security?"
    test_context = """
    Information security refers to the processes and methodologies designed to protect 
    information from unauthorized access, use, disclosure, disruption, modification, or destruction.
    """
    
    try:
        print(f"   Question: {test_question}")
        print("   Generating answer...")
        
        answer = await ai_service.generate_answer(test_question, test_context)
        
        print("\n✓ Answer generated successfully!")
        print("\n" + "-" * 60)
        print("ANSWER:")
        print("-" * 60)
        print(answer)
        print("-" * 60)
        
        return True
        
    except Exception as e:
        print(f"\n❌ Answer generation failed: {str(e)}")
        print(f"   Error type: {type(e).__name__}")
        return False

def main():
    """Main test function"""
    print("\n" + "╔" + "=" * 58 + "╗")
    print("║  SUMMIT SECURITY QUESTIONNAIRE - AI SERVICE TEST       ║")
    print("╚" + "=" * 58 + "╝")
    
    # Run async test
    success = asyncio.run(test_ai_service())
    
    # Print summary
    print_header("TEST SUMMARY")
    if success:
        print("\n✅ All tests passed! AI service is working correctly.")
        print("\nIf answers are still not generating in the app:")
        print("  1. Check that policy documents have been uploaded")
        print("  2. Check backend server logs for errors")
        print("  3. Try restarting the backend server")
        print("  4. Visit /debug page in the frontend for more diagnostics")
    else:
        print("\n❌ Tests failed. Please fix the issues above.")
        print("\nCommon solutions:")
        print("  1. Verify your Anthropic API key is correct")
        print("  2. Check that you have API credits available")
        print("  3. Ensure you have internet connectivity")
        print("  4. Try regenerating your API key at https://console.anthropic.com")
    
    print("\n")
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()

