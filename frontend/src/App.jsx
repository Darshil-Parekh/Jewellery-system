import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/auth-context'
import { AppLayout } from './layouts/AppLayout'
import { InventoryPage } from './pages/InventoryPage'
import { LoginPage } from './pages/auth/LoginPage'
import { PlaceholderPage } from './pages/PlaceholderPage'
import './App.css'

const DashboardPage = lazy(() =>
  import('./pages/dashboard/DashboardPage').then((module) => ({
    default: module.DashboardPage,
  })),
)

function ProtectedRoute({ children }) {
  const { loading, user } = useAuth()

  if (loading) {
    return (
      <div className="route-loading">
        <span className="loading-spinner" aria-label="Checking your session" />
      </div>
    )
  }

  return user ? children : <Navigate to="/login" replace />
}

function GuestRoute({ children }) {
  const { loading, user } = useAuth()
  if (loading) return <div className="route-loading"><span className="loading-spinner" aria-label="Checking your session" /></div>
  return user ? <Navigate to="/dashboard" replace /> : children
}

function AdminRoute({ children }) {
  const { user } = useAuth()
  return user?.role === 'ADMIN' ? children : <Navigate to="/dashboard" replace />
}

function AppRoutes() {
  return (
    <Suspense fallback={<div className="route-loading"><span className="loading-spinner" aria-label="Loading page" /></div>}>
      <Routes>
      <Route
        path="/login"
        element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route
          path="categories"
          element={<AdminRoute><PlaceholderPage title="Categories" description="Keep jewellery collections and product classifications organised." /></AdminRoute>}
        />
        <Route
          path="purchases"
          element={<AdminRoute><PlaceholderPage title="Purchases" description="Record supplier invoices and incoming stock in one place." /></AdminRoute>}
        />
        <Route
          path="sales"
          element={<PlaceholderPage title="Sales & invoices" description="Create sales, track payments and find past invoices." />}
        />
        <Route
          path="sales/:saleId"
          element={<PlaceholderPage title="Invoice details" description="Invoice details will be available when the sales module is implemented. No sample sale data is displayed." />}
        />
        <Route
          path="customers"
          element={<AdminRoute><PlaceholderPage title="Customers" description="Keep customer contact details and purchase history together." /></AdminRoute>}
        />
        <Route
          path="suppliers"
          element={<AdminRoute><PlaceholderPage title="Suppliers" description="Manage supplier details and purchasing relationships." /></AdminRoute>}
        />
        <Route
          path="metal-rates"
          element={<AdminRoute><PlaceholderPage title="Metal rates" description="External rate data is not configured yet. No live rates are displayed." /></AdminRoute>}
        />
        <Route
          path="reports"
          element={<AdminRoute><PlaceholderPage title="Reports" description="Business reports will be available here as the reporting module is built." /></AdminRoute>}
        />
        <Route
          path="staff"
          element={<AdminRoute><PlaceholderPage title="Staff management" description="Manage staff accounts and their access to the workspace." /></AdminRoute>}
        />
        <Route
          path="settings"
          element={<AdminRoute><PlaceholderPage title="Settings" description="Workspace preferences and operational settings will live here." /></AdminRoute>}
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
      </Routes>
    </Suspense>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App
