import requests
import sys

def test_api():
    base_url = "http://localhost:8000"
    try:
        # Test Health
        print(f"Testing {base_url}/health...")
        response = requests.get(f"{base_url}/health")
        if response.status_code == 200:
            print("✅ Health check passed")
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False

        # Test Projects List
        print(f"Testing {base_url}/api/projects...")
        response = requests.get(f"{base_url}/api/projects")
        if response.status_code == 200:
            print(f"✅ Projects list accessible ({len(response.json())} projects found)")
        else:
            print(f"❌ Projects list failed: {response.status_code}")
            return False

        return True

    except requests.exceptions.ConnectionError:
        print(f"❌ Could not connect to {base_url}. Is the backend running?")
        return False
    except Exception as e:
        print(f"❌ An error occurred: {e}")
        return False

if __name__ == "__main__":
    success = test_api()
    if not success:
        sys.exit(1)
