"""
Tests for admin endpoints:
- GET /api/admin/dashboard
- GET /api/admin/users
- GET /api/admin/users/{id}
- PUT /api/admin/users/{id}/status
- DELETE /api/admin/users/{id}
- GET /api/admin/items
- DELETE /api/admin/items/{id}
"""
from app.core.security import hash_password
from app.models.user import User, UserRole


def _seed_admin(db):
    """Seed an admin user into the test database."""
    existing = db.query(User).filter(User.email == "admin@test.com").first()
    if not existing:
        admin = User(
            student_id="ADMIN001",
            name="Test Admin",
            email="admin@test.com",
            phone="0000000000",
            password_hash=hash_password("Admin@123"),
            department="Administration",
            role=UserRole.ADMIN,
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
        return admin
    return existing


def _get_admin_headers(client, db):
    """Seed admin and return their auth headers."""
    _seed_admin(db)
    login_resp = client.post(
        "/api/auth/login",
        json={"email": "admin@test.com", "password": "Admin@123"},
    )
    token = login_resp.json()["data"]["access_token"]
    return {"Authorization": f"Bearer {token}"}


class TestAdminDashboard:
    def test_dashboard_returns_stats(self, client, db):
        """Admin dashboard should return all required stat fields."""
        admin_headers = _get_admin_headers(client, db)
        response = client.get("/api/admin/dashboard", headers=admin_headers)
        assert response.status_code == 200
        data = response.json()["data"]

        required_keys = [
            "total_users", "total_lost_items", "total_found_items",
            "active_items", "claimed_items", "returned_items",
            "pending_claims", "approved_claims", "rejected_claims",
        ]
        for key in required_keys:
            assert key in data, f"Missing key: {key}"

    def test_dashboard_student_forbidden(self, client, student_headers):
        """Students cannot access the admin dashboard."""
        response = client.get("/api/admin/dashboard", headers=student_headers)
        assert response.status_code == 403

    def test_dashboard_unauthenticated_forbidden(self, client):
        """Unauthenticated access to admin dashboard should be rejected."""
        response = client.get("/api/admin/dashboard")
        assert response.status_code in (401, 403)


class TestAdminUserManagement:
    def test_get_all_users(self, client, db, registered_student):
        """Admin should be able to list all users."""
        admin_headers = _get_admin_headers(client, db)
        response = client.get("/api/admin/users", headers=admin_headers)
        assert response.status_code == 200
        assert response.json()["success"] is True
        assert response.json()["total"] >= 1

    def test_get_user_by_id(self, client, db, registered_student, student_headers):
        """Admin can get a specific user by ID."""
        admin_headers = _get_admin_headers(client, db)
        # Get the student's profile first
        me_resp = client.get("/api/auth/me", headers=student_headers)
        user_id = me_resp.json()["data"]["id"]

        response = client.get(f"/api/admin/users/{user_id}", headers=admin_headers)
        assert response.status_code == 200
        assert response.json()["data"]["id"] == user_id

    def test_deactivate_user(self, client, db, registered_student, student_headers):
        """Admin can deactivate a user account."""
        admin_headers = _get_admin_headers(client, db)
        me_resp = client.get("/api/auth/me", headers=student_headers)
        user_id = me_resp.json()["data"]["id"]

        response = client.put(
            f"/api/admin/users/{user_id}/status",
            json={"is_active": False},
            headers=admin_headers,
        )
        assert response.status_code == 200
        assert response.json()["data"]["is_active"] is False

    def test_activate_user(self, client, db, registered_student, student_headers):
        """Admin can reactivate a deactivated user."""
        admin_headers = _get_admin_headers(client, db)
        me_resp = client.get("/api/auth/me", headers=student_headers)
        user_id = me_resp.json()["data"]["id"]

        # Deactivate first
        client.put(
            f"/api/admin/users/{user_id}/status",
            json={"is_active": False},
            headers=admin_headers,
        )
        # Then reactivate
        response = client.put(
            f"/api/admin/users/{user_id}/status",
            json={"is_active": True},
            headers=admin_headers,
        )
        assert response.status_code == 200
        assert response.json()["data"]["is_active"] is True

    def test_admin_cannot_delete_own_account(self, client, db):
        """Admin cannot delete their own account."""
        admin = _seed_admin(db)
        login_resp = client.post(
            "/api/auth/login",
            json={"email": "admin@test.com", "password": "Admin@123"},
        )
        token = login_resp.json()["data"]["access_token"]
        admin_headers = {"Authorization": f"Bearer {token}"}

        response = client.delete(f"/api/admin/users/{admin.id}", headers=admin_headers)
        assert response.status_code == 400

    def test_delete_user(self, client, db, registered_student, student_headers):
        """Admin can delete a student account."""
        admin_headers = _get_admin_headers(client, db)
        me_resp = client.get("/api/auth/me", headers=student_headers)
        user_id = me_resp.json()["data"]["id"]

        response = client.delete(f"/api/admin/users/{user_id}", headers=admin_headers)
        assert response.status_code == 200

    def test_get_user_not_found(self, client, db):
        """Getting a non-existent user should return 404."""
        admin_headers = _get_admin_headers(client, db)
        response = client.get("/api/admin/users/99999", headers=admin_headers)
        assert response.status_code == 404


class TestAdminItemManagement:
    def test_get_all_items(self, client, db, student_headers, lost_item_data):
        """Admin should see all items."""
        admin_headers = _get_admin_headers(client, db)
        client.post("/api/items/lost", json=lost_item_data, headers=student_headers)

        response = client.get("/api/admin/items", headers=admin_headers)
        assert response.status_code == 200
        assert response.json()["total"] >= 1

    def test_admin_delete_item(self, client, db, student_headers, lost_item_data):
        """Admin can delete any item."""
        admin_headers = _get_admin_headers(client, db)
        create_resp = client.post("/api/items/lost", json=lost_item_data, headers=student_headers)
        item_id = create_resp.json()["data"]["id"]

        response = client.delete(f"/api/admin/items/{item_id}", headers=admin_headers)
        assert response.status_code == 200

        # Confirm item is gone
        get_resp = client.get(f"/api/items/{item_id}", headers=student_headers)
        assert get_resp.status_code == 404

    def test_admin_update_item_status(self, client, db, student_headers, lost_item_data):
        """Admin can update item status."""
        admin_headers = _get_admin_headers(client, db)
        create_resp = client.post("/api/items/lost", json=lost_item_data, headers=student_headers)
        item_id = create_resp.json()["data"]["id"]

        response = client.put(
            f"/api/admin/items/{item_id}/status",
            json={"status": "CLOSED"},
            headers=admin_headers,
        )
        assert response.status_code == 200
        assert response.json()["data"]["status"] == "CLOSED"
