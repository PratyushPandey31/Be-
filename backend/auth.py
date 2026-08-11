import hmac
import hashlib
import base64
import json
import time

SECRET_KEY = "cybershield_ai_jwt_secret_key_ieee_2026_super_secure"
ALGORITHM  = "HS256"
TOKEN_EXPIRE_SECONDS = 86400 * 7 # 7 days

def _b64_url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode('utf-8').replace('=', '')

def _b64_url_decode(data_str: str) -> bytes:
    padding = '=' * (4 - (len(data_str) % 4))
    return base64.urlsafe_b64decode(data_str + padding)

def hash_password(password: str) -> str:
    """Hash password using SHA-256 with salt."""
    salt = "cybershield_salt_2026"
    return hashlib.sha256((password + salt).encode('utf-8')).hexdigest()

def verify_password(password: str, hashed: str) -> bool:
    return hash_password(password) == hashed

def create_jwt_token(user_id: int, username: str, email: str, role: str) -> str:
    """Generate standard JWT HS256 token."""
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {
        "sub": str(user_id),
        "username": username,
        "email": email,
        "role": role,
        "iat": int(time.time()),
        "exp": int(time.time()) + TOKEN_EXPIRE_SECONDS
    }

    header_b64 = _b64_url_encode(json.dumps(header, separators=(',', ':')).encode('utf-8'))
    payload_b64 = _b64_url_encode(json.dumps(payload, separators=(',', ':')).encode('utf-8'))

    signing_input = f"{header_b64}.{payload_b64}".encode('utf-8')
    signature = hmac.new(SECRET_KEY.encode('utf-8'), signing_input, hashlib.sha256).digest()
    signature_b64 = _b64_url_encode(signature)

    return f"{header_b64}.{payload_b64}.{signature_b64}"

def decode_jwt_token(token: str) -> dict:
    """Decode and verify JWT token."""
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return None
        header_b64, payload_b64, signature_b64 = parts

        signing_input = f"{header_b64}.{payload_b64}".encode('utf-8')
        expected_sig = _b64_url_encode(hmac.new(SECRET_KEY.encode('utf-8'), signing_input, hashlib.sha256).digest())

        if not hmac.compare_digest(signature_b64, expected_sig):
            return None

        payload_bytes = _b64_url_decode(payload_b64)
        payload = json.loads(payload_bytes.decode('utf-8'))

        if payload.get("exp", 0) < time.time():
            return None

        return payload
    except Exception:
        return None
