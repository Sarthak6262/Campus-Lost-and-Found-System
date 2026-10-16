"""
Tests for item endpoints:
- POST /api/items/lost
- POST /api/items/found
- GET /api/items
- GET /api/items/{id}
- PUT /api/items/{id}
- DELETE /api/items/{id}
- GET /api/items/search
- GET /api/items/{id}/matches
"""


class TestCreateLostItem:
    def test_create_lost_item_success(self, client, student_headers, lost_item_data):
        """Authenticated student should create a lost item."""
        response = client.post("/api/items/lost", json=lost_item_data, headers=student_headers)
        assert response.status_code == 201
        body = response.json()
        assert body["success"] is True
        assert body["data"]["type"] == "LOST"
        assert body["data"]["item_name"] == lost_item_data["item_name"]
        assert body["data"]["status"] == "ACTIVE"

    def test_create_lost_item_unauthenticated(self, client, lost_item_data):
        """Unauthenticated request should be rejected."""
        response = client.post("/api/items/lost", json=lost_item_data)
        assert response.status_code in (401, 403)

    def test_create_lost_item_reporter_from_jwt(self, client, student_headers, lost_item_data, db):
        """reported_by should come from JWT, not client input."""
        lost_item_data["reported_by"] = 999  # Attempt injection
        response = client.post("/api/items/lost", json=lost_item_data, headers=student_headers)
        assert response.status_code == 201
        # reported_by should be the actual logged-in user, not 999
        assert response.json()["data"]["reported_by"] != 999

    def test_create_lost_item_missing_required_field(self, client, student_headers):
        """Missing required fields should return 422."""
        response = client.post(
            "/api/items/lost",
            json={"category": "WALLET"},  # Missing required fields
            headers=student_headers,
        )
        assert response.status_code == 422


class TestCreateFoundItem:
    def test_create_found_item_success(self, client, student_headers, found_item_data):
        """Authenticated student should create a found item."""
        response = client.post("/api/items/found", json=found_item_data, headers=student_headers)
        assert response.status_code == 201
        body = response.json()
        assert body["data"]["type"] == "FOUND"
        assert body["data"]["status"] == "ACTIVE"


class TestGetItems:
    def test_get_all_items(self, client, student_headers, lost_item_data):
        """Should return paginated items list."""
        client.post("/api/items/lost", json=lost_item_data, headers=student_headers)
        response = client.get("/api/items", headers=student_headers)
        assert response.status_code == 200
        body = response.json()
        assert body["success"] is True
        assert "data" in body
        assert body["total"] >= 1

    def test_get_lost_items(self, client, student_headers, lost_item_data, found_item_data):
        """GET /api/items/lost should only return LOST items."""
        client.post("/api/items/lost", json=lost_item_data, headers=student_headers)
        client.post("/api/items/found", json=found_item_data, headers=student_headers)
        response = client.get("/api/items/lost", headers=student_headers)
        assert response.status_code == 200
        for item in response.json()["data"]:
            assert item["type"] == "LOST"

    def test_get_found_items(self, client, student_headers, lost_item_data, found_item_data):
        """GET /api/items/found should only return FOUND items."""
        client.post("/api/items/lost", json=lost_item_data, headers=student_headers)
        client.post("/api/items/found", json=found_item_data, headers=student_headers)
        response = client.get("/api/items/found", headers=student_headers)
        assert response.status_code == 200
        for item in response.json()["data"]:
            assert item["type"] == "FOUND"

    def test_get_item_by_id(self, client, student_headers, lost_item_data):
        """Should return a single item by ID."""
        create_resp = client.post("/api/items/lost", json=lost_item_data, headers=student_headers)
        item_id = create_resp.json()["data"]["id"]

        response = client.get(f"/api/items/{item_id}", headers=student_headers)
        assert response.status_code == 200
        assert response.json()["data"]["id"] == item_id

    def test_get_item_not_found(self, client, student_headers):
        """Requesting a non-existent item should return 404."""
        response = client.get("/api/items/99999", headers=student_headers)
        assert response.status_code == 404

    def test_get_items_pagination(self, client, student_headers, lost_item_data):
        """Pagination parameters should be respected."""
        response = client.get("/api/items?page=1&limit=5", headers=student_headers)
        assert response.status_code == 200
        assert response.json()["limit"] == 5


class TestUpdateItem:
    def test_update_own_item(self, client, student_headers, lost_item_data):
        """Owner should be able to update their item."""
        create_resp = client.post("/api/items/lost", json=lost_item_data, headers=student_headers)
        item_id = create_resp.json()["data"]["id"]

        response = client.put(
            f"/api/items/{item_id}",
            json={"item_name": "Updated Wallet Name"},
            headers=student_headers,
        )
        assert response.status_code == 200
        assert response.json()["data"]["item_name"] == "Updated Wallet Name"

    def test_cannot_update_another_users_item(
        self, client, student_headers, student2_data, lost_item_data
    ):
        """Students should not be able to update another user's item."""
        # Create item as student 1
        create_resp = client.post("/api/items/lost", json=lost_item_data, headers=student_headers)
        item_id = create_resp.json()["data"]["id"]

        # Register and login as student 2
        client.post("/api/auth/register", json=student2_data)
        login_resp = client.post(
            "/api/auth/login",
            json={"email": student2_data["email"], "password": student2_data["password"]},
        )
        student2_token = login_resp.json()["data"]["access_token"]
        student2_headers = {"Authorization": f"Bearer {student2_token}"}

        # Attempt to update student 1's item as student 2
        response = client.put(
            f"/api/items/{item_id}",
            json={"item_name": "Unauthorized Update"},
            headers=student2_headers,
        )
        assert response.status_code == 403


class TestDeleteItem:
    def test_delete_own_item(self, client, student_headers, lost_item_data):
        """Owner should be able to delete their item."""
        create_resp = client.post("/api/items/lost", json=lost_item_data, headers=student_headers)
        item_id = create_resp.json()["data"]["id"]

        response = client.delete(f"/api/items/{item_id}", headers=student_headers)
        assert response.status_code == 200

        # Confirm it's gone
        get_resp = client.get(f"/api/items/{item_id}", headers=student_headers)
        assert get_resp.status_code == 404

    def test_cannot_delete_another_users_item(
        self, client, student_headers, student2_data, lost_item_data
    ):
        """Students cannot delete another user's item."""
        create_resp = client.post("/api/items/lost", json=lost_item_data, headers=student_headers)
        item_id = create_resp.json()["data"]["id"]

        client.post("/api/auth/register", json=student2_data)
        login_resp = client.post(
            "/api/auth/login",
            json={"email": student2_data["email"], "password": student2_data["password"]},
        )
        student2_token = login_resp.json()["data"]["access_token"]
        student2_headers = {"Authorization": f"Bearer {student2_token}"}

        response = client.delete(f"/api/items/{item_id}", headers=student2_headers)
        assert response.status_code == 403


class TestSearchItems:
    def test_search_by_category(self, client, student_headers, lost_item_data, found_item_data):
        """Search by category should filter correctly."""
        client.post("/api/items/lost", json=lost_item_data, headers=student_headers)
        client.post("/api/items/found", json=found_item_data, headers=student_headers)

        response = client.get("/api/items/search?category=WALLET", headers=student_headers)
        assert response.status_code == 200
        for item in response.json()["data"]:
            assert item["category"] == "WALLET"

    def test_search_by_type(self, client, student_headers, lost_item_data, found_item_data):
        """Search by type should filter correctly."""
        client.post("/api/items/lost", json=lost_item_data, headers=student_headers)
        client.post("/api/items/found", json=found_item_data, headers=student_headers)

        response = client.get("/api/items/search?type=FOUND", headers=student_headers)
        assert response.status_code == 200
        for item in response.json()["data"]:
            assert item["type"] == "FOUND"

    def test_search_returns_pagination(self, client, student_headers):
        """Search should return pagination metadata."""
        response = client.get("/api/items/search?page=1&limit=5", headers=student_headers)
        assert response.status_code == 200
        body = response.json()
        assert "page" in body
        assert "limit" in body
        assert "total" in body
        assert "pages" in body


class TestSmartMatching:
    def test_matching_finds_opposite_type(
        self, client, student_headers, student2_data, lost_item_data, found_item_data
    ):
        """Smart matching should find opposite-type matches."""
        # Create a lost wallet
        lost_resp = client.post("/api/items/lost", json=lost_item_data, headers=student_headers)
        lost_id = lost_resp.json()["data"]["id"]

        # Create a found wallet (same category, similar name)
        client.post("/api/auth/register", json=student2_data)
        login_resp = client.post(
            "/api/auth/login",
            json={"email": student2_data["email"], "password": student2_data["password"]},
        )
        student2_token = login_resp.json()["data"]["access_token"]
        student2_headers = {"Authorization": f"Bearer {student2_token}"}

        found_data = {
            "item_name": "Black Wallet",
            "category": "WALLET",
            "description": "Found a black leather wallet",
            "color": "Black",
            "location": "College Library",
            "item_date": "2026-10-01",
        }
        client.post("/api/items/found", json=found_data, headers=student2_headers)

        # Get matches for the lost wallet
        response = client.get(f"/api/items/{lost_id}/matches", headers=student_headers)
        assert response.status_code == 200
        body = response.json()
        assert body["data"]["item_id"] == lost_id
        assert len(body["data"]["matches"]) > 0
        # First match should have high score
        assert body["data"]["matches"][0]["match_score"] >= 40
