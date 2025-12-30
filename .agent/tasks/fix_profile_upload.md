# Task Summary: Fix Profile Picture Upload Error

## Issue
The user reported a 404 error when uploading a profile picture. Steps to reproduce included navigating to the profile settings and attempting to upload an image.

## Diagnosis
1.  **Frontend Inspection**: Checked `frontend/src/pages/Profile.jsx` and found it was making a `POST` request to `/user/upload-profile-picture`.
2.  **Backend Inspection**: Checked `backend/routes/user.routes.js` and found the route was defined as `/upload-profile-pic`.
3.  **Root Cause**: Mismatch between the frontend route (`/upload-profile-picture`) and the backend route definition (`/upload-profile-pic`).

## Resolution
-   Updated `backend/routes/user.routes.js` to rename the route from `/upload-profile-pic` to `/upload-profile-picture`.
-   Verified that `frontend/src/pages/Admin/AdminDashboard.jsx` also uses `/user/upload-profile-picture`, so this fix resolves the issue for both student and admin uploads.
-   Confirmed that other related routes (`get-profile-picture`, `remove-profile-picture`) were already matching correctly.

## Verification
-   Frontend calls: `API.post("/user/upload-profile-picture", ...)`
-   Backend route: `router.post("/upload-profile-picture", ...)` mounted at `/api/user`.
-   This ensures the request URL `http://localhost:3000/api/user/upload-profile-picture` is now correctly handled.
