"""
Tests for claim endpoints:
- POST /api/claims
- GET /api/claims/my
- GET /api/claims/{id}
- Admin approve/reject
"""


def _create_found_item(client, headers, found_item_data):
    """Helper: create a found item and return its ID."""
    resp = client.post("/api/items/found", json=found_item_data, headers=headers)
    return resp.json()["data"]["id"]


def _register_and_login(client, user_data):
    """Helper: register a user and return their auth headers."""
    client.post("/api/auth/register", json=user_data)
    login_resp = client.post(
        "/api/auth/login",
        json={"email": user_data["email"], "password": user_data["password"]},
    )
    token = login_resp.json()["data"]["access_token"]
    return {"Authorization": f"Bearer {token}"}


def _seed_admin(client, db):
    """Helper: seed the admin user directly into the test DB."""
    from app.core.security import hash_password
    from app.models.user import User, UserRole

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


def _get_admin_headers(client, db):
    """Helper: seed admin and return admin auth headers."""
    _seed_admin(client, db)
    login_resp = client.post(
        "/api/auth/login",
        json={"email": "admin@test.com", "password": "Admin@123"},
    )
    token = login_resp.json()["data"]["access_token"]
    return {"Authorization": f"Bearer {token}"}


class TestCreateClaim:
    def test_create_claim_success(
        self, client, db, student_headers, student2_data, found_item_data
    ):
        """A student should be able to claim another student's found item."""
        # student2 reports a found item
        student2_headers = _register_and_login(client, student2_data)
        item_id = _create_found_item(client, student2_headers, found_item_data)

        # student1 claims the found item
        claim_data = {
            "item_id": item_id,
            "reason": "This is my lost earbuds",
            "identification_details": "There is a scratch on the case",
        }
        response = client.post("/api/claims", json=claim_data, headers=student_headers)
        assert response.status_code == 201
        body = response.json()
        assert body["success"] is True
        assert body["data"]["status"] == "PENDING"

    def test_cannot_claim_own_item(
        self, client, student_headers, found_item_data
    ):
        """A student cannot claim their own found item."""
        item_id = _create_found_item(client, student_headers, found_item_data)

        claim_data = {
            "item_id": item_id,
            "reason": "This is mine",
            "identification_details": "I know my stuff",
        }
        response = client.post("/api/claims", json=claim_data, headers=student_headers)
        assert response.status_code == 400

    def test_cannot_claim_lost_item(
        self, client, student_headers, student2_data, lost_item_data
    ):
        """A student cannot claim a LOST item — only FOUND items can be claimed."""
        student2_headers = _register_and_login(client, student2_data)
        # student2 reports a LOST item
        lost_resp = client.post("/api/items/lost", json=lost_item_data, headers=student2_headers)
        item_id = lost_resp.json()["data"]["id"]

        claim_data = {
            "item_id": item_id,
            "reason": "I think that's mine",
            "identification_details": "It's black",
        }
        response = client.post("/api/claims", json=claim_data, headers=student_headers)
        assert response.status_code == 400

    def test_prevent_duplicate_claim(
        self, client, student_headers, student2_data, found_item_data
    ):
        """A user cannot submit multiple PENDING claims for the same item."""
        student2_headers = _register_and_login(client, student2_data)
        item_id = _create_found_item(client, student2_headers, found_item_data)

        claim_data = {
            "item_id": item_id,
            "reason": "First claim",
            "identification_details": "Scratch on case",
        }
        client.post("/api/claims", json=claim_data, headers=student_headers)

        # Second claim for the same item
        response = client.post("/api/claims", json=claim_data, headers=student_headers)
        assert response.status_code == 409

    def test_cannot_claim_returned_item(
        self, client, db, student_headers, student2_data, found_item_data
    ):
        """Cannot claim an item that has already been RETURNED."""
        student2_headers = _register_and_login(client, student2_data)
        item_id = _create_found_item(client, student2_headers, found_item_data)

        # Admin approves a claim first
        admin_headers = _get_admin_headers(client, db)

        # student1 claims it
        claim_data = {
            "item_id": item_id,
            "reason": "Mine",
            "identification_details": "Has scratch",
        }
        claim_resp = client.post("/api/claims", json=claim_data, headers=student_headers)
        claim_id = claim_resp.json()["data"]["id"]

        # Admin approves → item becomes RETURNED
        client.put(
            f"/api/admin/claims/{claim_id}/approve",
            json={"admin_remark": "Verified"},
            headers=admin_headers,
        )

        # Register student3 and try to claim the same item
        student3_data = {
            "student_id": "STU003",
            "name": "Third Student",
            "email": "student3@test.com",
            "phone": "9999999999",
            "password": "Password@123",
            "department": "MBA",
        }
        student3_headers = _register_and_login(client, student3_data)
        response = client.post("/api/claims", json=claim_data, headers=student3_headers)
        assert response.status_code == 400


class TestGetClaims:
    def test_get_my_claims(
        self, client, student_headers, student2_data, found_item_data
    ):
        """Student should see their own claims."""
        student2_headers = _register_and_login(client, student2_data)
        item_id = _create_found_item(client, student2_headers, found_item_data)

        claim_data = {
            "item_id": item_id,
            "reason": "Mine",
            "identification_details": "Scratch",
        }
        client.post("/api/claims", json=claim_data, headers=student_headers)

        response = client.get("/api/claims/my", headers=student_headers)
        assert response.status_code == 200
        assert len(response.json()["data"]) >= 1

    def test_get_claim_by_id_own(
        self, client, student_headers, student2_data, found_item_data
    ):
        """Student can view their own claim by ID."""
        student2_headers = _register_and_login(client, student2_data)
        item_id = _create_found_item(client, student2_headers, found_item_data)

        claim_data = {
            "item_id": item_id,
            "reason": "Mine",
            "identification_details": "Scratch",
        }
        claim_resp = client.post("/api/claims", json=claim_data, headers=student_headers)
        claim_id = claim_resp.json()["data"]["id"]

        response = client.get(f"/api/claims/{claim_id}", headers=student_headers)
        assert response.status_code == 200
        assert response.json()["data"]["id"] == claim_id

    def test_cannot_view_another_users_claim(
        self, client, student_headers, student2_data, found_item_data
    ):
        """Student cannot view another student's claim."""
        student2_headers = _register_and_login(client, student2_data)
        item_id = _create_found_item(client, student_headers, found_item_data)

        # student2 creates a claim
        claim_data = {
            "item_id": item_id,
            "reason": "Mine",
            "identification_details": "Scratch",
        }
        # student1 reports found item, student2 claims it
        # Wait — student2 can't claim student2's own item
        # Let's use student1's found item and student2 claims
        found_resp = client.post("/api/items/found", json=found_item_data, headers=student_headers)
        item_id2 = found_resp.json()["data"]["id"]
        claim_data["item_id"] = item_id2
        claim_resp = client.post("/api/claims", json=claim_data, headers=student2_headers)
        claim_id = claim_resp.json()["data"]["id"]

        # student1 tries to view student2's claim
        response = client.get(f"/api/claims/{claim_id}", headers=student_headers)
        assert response.status_code == 403


class TestAdminClaims:
    def test_approve_claim(
        self, client, db, student_headers, student2_data, found_item_data
    ):
        """Admin should be able to approve a PENDING claim."""
        student2_headers = _register_and_login(client, student2_data)
        item_id = _create_found_item(client, student2_headers, found_item_data)
        admin_headers = _get_admin_headers(client, db)

        claim_data = {
            "item_id": item_id,
            "reason": "Mine",
            "identification_details": "Scratch",
        }
        claim_resp = client.post("/api/claims", json=claim_data, headers=student_headers)
        claim_id = claim_resp.json()["data"]["id"]

        response = client.put(
            f"/api/admin/claims/{claim_id}/approve",
            json={"admin_remark": "Ownership verified"},
            headers=admin_headers,
        )
        assert response.status_code == 200
        assert response.json()["data"]["status"] == "APPROVED"

        # Item should now be RETURNED
        item_resp = client.get(f"/api/items/{item_id}", headers=student_headers)
        assert item_resp.json()["data"]["status"] == "RETURNED"

    def test_reject_claim(
        self, client, db, student_headers, student2_data, found_item_data
    ):
        """Admin should be able to reject a PENDING claim."""
        student2_headers = _register_and_login(client, student2_data)
        item_id = _create_found_item(client, student2_headers, found_item_data)
        admin_headers = _get_admin_headers(client, db)

        claim_data = {
            "item_id": item_id,
            "reason": "Mine",
            "identification_details": "Scratch",
        }
        claim_resp = client.post("/api/claims", json=claim_data, headers=student_headers)
        claim_id = claim_resp.json()["data"]["id"]

        response = client.put(
            f"/api/admin/claims/{claim_id}/reject",
            json={"admin_remark": "Ownership not verified"},
            headers=admin_headers,
        )
        assert response.status_code == 200
        assert response.json()["data"]["status"] == "REJECTED"

        # Item should remain ACTIVE
        item_resp = client.get(f"/api/items/{item_id}", headers=student_headers)
        assert item_resp.json()["data"]["status"] == "ACTIVE"

    def test_approve_rejects_other_pending_claims(
        self, client, db, student_headers, student2_data, found_item_data
    ):
        """Approving one claim should auto-reject all other pending claims for the same item."""
        admin_headers = _get_admin_headers(client, db)

        # student1 reports a found item
        item_id = _create_found_item(client, student_headers, found_item_data)

        # Register 2 more students who both claim the item
        student2_headers = _register_and_login(client, student2_data)
        student3_data = {
            "student_id": "STU003",
            "name": "Third Student",
            "email": "student3@test.com",
            "phone": "9999999999",
            "password": "Password@123",
            "department": "MBA",
        }
        student3_headers = _register_and_login(client, student3_data)

        claim_data = {
            "item_id": item_id,
            "reason": "Mine",
            "identification_details": "Scratch",
        }
        claim2_resp = client.post("/api/claims", json=claim_data, headers=student2_headers)
        claim2_id = claim2_resp.json()["data"]["id"]

        claim3_resp = client.post("/api/claims", json=claim_data, headers=student3_headers)
        claim3_id = claim3_resp.json()["data"]["id"]

        # Admin approves claim 2
        client.put(
            f"/api/admin/claims/{claim2_id}/approve",
            json={"admin_remark": "Verified"},
            headers=admin_headers,
        )

        # Claim 3 should now be REJECTED
        claim3_resp = client.get(f"/api/claims/{claim3_id}", headers=student3_headers)
        assert claim3_resp.json()["data"]["status"] == "REJECTED"

    def test_student_cannot_approve_claim(
        self, client, student_headers, student2_data, found_item_data
    ):
        """Regular students cannot access admin claim endpoints."""
        student2_headers = _register_and_login(client, student2_data)
        item_id = _create_found_item(client, student2_headers, found_item_data)

        claim_data = {
            "item_id": item_id,
            "reason": "Mine",
            "identification_details": "Scratch",
        }
        claim_resp = client.post("/api/claims", json=claim_data, headers=student_headers)
        claim_id = claim_resp.json()["data"]["id"]

        response = client.put(
            f"/api/admin/claims/{claim_id}/approve",
            json={"admin_remark": "Unauthorized"},
            headers=student_headers,
        )
        assert response.status_code == 403

    def test_admin_get_all_claims_and_filters(
        self, client, db, student_headers, student2_data, found_item_data
    ):
        """Admin can list all claims with enriched student and item details, and filter by status."""
        admin_headers = _get_admin_headers(client, db)
        student2_headers = _register_and_login(client, student2_data)
        item_id = _create_found_item(client, student2_headers, found_item_data)

        claim_data = {
            "item_id": item_id,
            "reason": "Test reason",
            "identification_details": "Test proof",
        }
        create_resp = client.post("/api/claims", json=claim_data, headers=student_headers)
        assert create_resp.status_code == 201

        # Query all claims as admin
        resp = client.get("/api/admin/claims", headers=admin_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True
        assert len(data["data"]) >= 1

        # Verify enriched claimant and item fields
        first_claim = data["data"][0]
        assert "claimant_name" in first_claim
        assert "claimant_email" in first_claim
        assert "claimant_student_id" in first_claim
        assert "item_name" in first_claim
        assert first_claim["claimant_name"] is not None
        assert first_claim["item_name"] is not None

        # Filter by PENDING status
        pending_resp = client.get("/api/admin/claims?status=PENDING", headers=admin_headers)
        assert pending_resp.status_code == 200
        pending_claims = pending_resp.json()["data"]
        assert all(c["status"] == "PENDING" for c in pending_claims)

    def test_mutual_contact_details_shared_on_claim_approval(
        self, client, db, student_headers, student2_data, found_item_data
    ):
        """When an admin approves a claim, finder and owner can access mutual contact details."""
        admin_headers = _get_admin_headers(client, db)
        finder_headers = _register_and_login(client, student2_data)
        item_id = _create_found_item(client, finder_headers, found_item_data)

        # Owner submits claim
        claim_data = {
            "item_id": item_id,
            "reason": "This belongs to me",
            "identification_details": "Unique engraving #ENG-99",
        }
        claim_resp = client.post("/api/claims", json=claim_data, headers=student_headers)
        claim_id = claim_resp.json()["data"]["id"]

        # Admin approves claim
        approve_resp = client.put(
            f"/api/admin/claims/{claim_id}/approve",
            json={"admin_remark": "Engraving verified. Contact finder for pickup."},
            headers=admin_headers,
        )
        assert approve_resp.status_code == 200
        approved_data = approve_resp.json()["data"]
        assert approved_data["status"] == "APPROVED"
        assert approved_data["finder_name"] == student2_data["name"]
        assert approved_data["finder_phone"] == student2_data["phone"]
        assert approved_data["finder_email"] == student2_data["email"]
        assert approved_data["collection_location"] == found_item_data["location"]

        # 1. Owner views claim via GET /api/claims/{id} -> Sees finder's contact details
        owner_claim_resp = client.get(f"/api/claims/{claim_id}", headers=student_headers)
        assert owner_claim_resp.status_code == 200
        owner_view = owner_claim_resp.json()["data"]
        assert owner_view["finder_name"] == student2_data["name"]
        assert owner_view["finder_phone"] == student2_data["phone"]
        assert owner_view["finder_email"] == student2_data["email"]
        assert owner_view["collection_location"] == found_item_data["location"]

        # 2. Finder views approved claim via GET /api/claims/item/{item_id} -> Sees owner's contact details
        finder_item_claim = client.get(f"/api/claims/item/{item_id}", headers=finder_headers)
        assert finder_item_claim.status_code == 200
        finder_view = finder_item_claim.json()["data"]
        assert finder_view["claimant_name"] is not None
        assert finder_view["claimant_phone"] is not None
        assert finder_view["claimant_email"] is not None
        assert finder_view["identification_details"] == "Unique engraving #ENG-99"

        # 3. Finder can also view claim via GET /api/claims/{claim_id} now that it's approved
        finder_direct = client.get(f"/api/claims/{claim_id}", headers=finder_headers)
        assert finder_direct.status_code == 200
        assert finder_direct.json()["data"]["id"] == claim_id

