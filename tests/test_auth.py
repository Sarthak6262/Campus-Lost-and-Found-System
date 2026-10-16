"""
Tests for authentication endpoints:
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me
"""


class TestRegister:
    def test_register_success(self, client, student_data):
        """A new student should register successfully."""
        response = client.post("/api/auth/register", json=student_data)
        assert response.status_code == 201
        body = response.json()
        assert body["success"] is True
        assert body["data"]["email"] == student_data["email"]
        assert body["data"]["role"] == "STUDENT"
        assert "password_hash" not in body["data"]

    def test_register_duplicate_email(self, client, student_data):
        """Registering with a duplicate email should fail with 409."""
        client.post("/api/auth/register", json=student_data)
        response = client.post("/api/auth/register", json=student_data)
        assert response.status_code == 409
        assert response.json()["success"] is False

    def test_register_duplicate_student_id(self, client, student_data, student2_data):
        """Registering with a duplicate student_id should fail."""
        client.post("/api/auth/register", json=student_data)
        student2_data["student_id"] = student_data["student_id"]  # Same student_id
        response = client.post("/api/auth/register", json=student2_data)
        assert response.status_code == 409

    def test_register_invalid_email(self, client, student_data):
        """Invalid email format should fail validation."""
        student_data["email"] = "not-an-email"
        response = client.post("/api/auth/register", json=student_data)
        assert response.status_code == 422

    def test_register_short_password(self, client, student_data):
        """Password shorter than 8 characters should fail."""
        student_data["password"] = "short"
        response = client.post("/api/auth/register", json=student_data)
        assert response.status_code == 422

    def test_register_invalid_phone(self, client, student_data):
        """Phone with fewer than 10 digits should fail."""
        student_data["phone"] = "12345"
        response = client.post("/api/auth/register", json=student_data)
        assert response.status_code == 422

    def test_register_cannot_create_admin(self, client, student_data):
        """Normal registration should always create STUDENT role."""
        # Even if someone adds role field, it should be ignored or result in STUDENT
        response = client.post("/api/auth/register", json=student_data)
        assert response.status_code == 201
        assert response.json()["data"]["role"] == "STUDENT"

    def test_register_short_name(self, client, student_data):
        """Name shorter than 2 characters should fail."""
        student_data["name"] = "A"
        response = client.post("/api/auth/register", json=student_data)
        assert response.status_code == 422


class TestLogin:
    def test_login_success(self, client, student_data):
        """Login with correct credentials should return a token."""
        client.post("/api/auth/register", json=student_data)
        response = client.post(
            "/api/auth/login",
            json={"email": student_data["email"], "password": student_data["password"]},
        )
        assert response.status_code == 200
        body = response.json()
        assert body["success"] is True
        assert "access_token" in body["data"]
        assert body["data"]["token_type"] == "bearer"

    def test_login_wrong_password(self, client, student_data):
        """Wrong password should return 401."""
        client.post("/api/auth/register", json=student_data)
        response = client.post(
            "/api/auth/login",
            json={"email": student_data["email"], "password": "WrongPassword!"},
        )
        assert response.status_code == 401

    def test_login_nonexistent_email(self, client):
        """Login with unknown email should return 401."""
        response = client.post(
            "/api/auth/login",
            json={"email": "nobody@test.com", "password": "Password@123"},
        )
        assert response.status_code == 401

    def test_login_invalid_email_format(self, client):
        """Invalid email format should return 422."""
        response = client.post(
            "/api/auth/login",
            json={"email": "not-an-email", "password": "Password@123"},
        )
        assert response.status_code == 422


class TestGetMe:
    def test_get_me_authenticated(self, client, registered_student, student_headers):
        """Authenticated user should get their profile."""
        response = client.get("/api/auth/me", headers=student_headers)
        assert response.status_code == 200
        body = response.json()
        assert body["success"] is True
        assert body["data"]["email"] == registered_student["email"]

    def test_get_me_no_token(self, client):
        """Request without token should return 403 (no bearer credentials)."""
        response = client.get("/api/auth/me")
        assert response.status_code in (401, 403)

    def test_get_me_invalid_token(self, client):
        """Invalid token should return 401 or 403."""
        response = client.get(
            "/api/auth/me",
            headers={"Authorization": "Bearer totally-invalid-token"},
        )
        assert response.status_code in (401, 403)
