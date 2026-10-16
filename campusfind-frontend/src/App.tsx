import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/common/Toast';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { AdminRoute } from './components/common/AdminRoute';

// Layouts
import { AuthLayout } from './layouts/AuthLayout';
import { StudentLayout } from './layouts/StudentLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Item Pages
import { ItemsBrowsePage } from './pages/items/ItemsBrowsePage';
import { ItemDetailPage } from './pages/items/ItemDetailPage';
import { ItemMatchesPage } from './pages/items/ItemMatchesPage';
import { ReportLostPage } from './pages/items/ReportLostPage';
import { ReportFoundPage } from './pages/items/ReportFoundPage';
import { EditItemPage } from './pages/items/EditItemPage';

// Student Pages
import { DashboardPage } from './pages/student/DashboardPage';
import { MyItemsPage } from './pages/student/MyItemsPage';
import { ProfilePage } from './pages/student/ProfilePage';
import { MyClaimsPage } from './pages/claims/MyClaimsPage';
import { ClaimDetailPage } from './pages/claims/ClaimDetailPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminItemsPage } from './pages/admin/AdminItemsPage';
import { AdminClaimsPage } from './pages/admin/AdminClaimsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* Authentication Flow */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* General & Student Workspace (StudentLayout) */}
            <Route element={<StudentLayout />}>
              {/* Public item browsing & detail pages */}
              <Route path="/items" element={<ItemsBrowsePage />} />
              <Route path="/items/:id" element={<ItemDetailPage />} />
              <Route path="/items/:id/matches" element={<ItemMatchesPage />} />

              {/* Protected Student Routes */}
              <Route
                path="/student/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/items"
                element={
                  <ProtectedRoute>
                    <MyItemsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/items/report-lost"
                element={
                  <ProtectedRoute>
                    <ReportLostPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/items/report-found"
                element={
                  <ProtectedRoute>
                    <ReportFoundPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/items/:id/edit"
                element={
                  <ProtectedRoute>
                    <EditItemPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/claims"
                element={
                  <ProtectedRoute>
                    <MyClaimsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/claims/:id"
                element={
                  <ProtectedRoute>
                    <ClaimDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Protected Admin Workspace (AdminLayout) */}
            <Route
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/items" element={<AdminItemsPage />} />
              <Route path="/admin/claims" element={<AdminClaimsPage />} />
            </Route>

            {/* 404 Route */}
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
