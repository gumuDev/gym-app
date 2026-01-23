import { Refine } from '@refinedev/core';
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import routerProvider from '@refinedev/react-router-v6';

import { authProvider } from './providers/authProvider';
import { dataProvider } from './providers/dataProvider';

import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';

// Super Admin Pages
import { SuperAdminDashboard } from './pages/super-admin/dashboard';
import { GymsList } from './pages/super-admin/gyms/list';
import { GymsCreate } from './pages/super-admin/gyms/create';
import { GymsShow } from './pages/super-admin/gyms/show';
import { GymsEdit } from './pages/super-admin/gyms/edit';

// Admin Gym Pages
import { AdminGymDashboard } from './pages/admin-gym/dashboard';
import { MembersList } from './pages/admin-gym/members/list';
import { MembersCreate } from './pages/admin-gym/members/create';
import { MembersShow } from './pages/admin-gym/members/show';
import { MembersEdit } from './pages/admin-gym/members/edit';
import { DisciplinesList } from './pages/admin-gym/disciplines/list';
import { DisciplinesCreate } from './pages/admin-gym/disciplines/create';
import { DisciplinesEdit } from './pages/admin-gym/disciplines/edit';
import { PricingList } from './pages/admin-gym/pricing/list';
import { PricingCreate } from './pages/admin-gym/pricing/create';
import { PricingEdit } from './pages/admin-gym/pricing/edit';
import { MembershipsList } from './pages/admin-gym/memberships/list';
import { MembershipsCreate } from './pages/admin-gym/memberships/create';
import { MembershipsEdit } from './pages/admin-gym/memberships/edit';
import { MembershipsRenew } from './pages/admin-gym/memberships/renew';
import { AttendancesList } from './pages/admin-gym/attendances/list';
import { AttendancesScanner } from './pages/admin-gym/attendances/scanner';

function App() {
  return (
    <BrowserRouter>
      <Refine
        routerProvider={routerProvider}
        authProvider={authProvider}
        dataProvider={dataProvider}
        resources={[
          {
            name: 'dashboard',
            list: '/dashboard',
          },
          {
            name: 'super-admin/gyms',
            list: '/super-admin/gyms',
            create: '/super-admin/gyms/create',
            show: '/super-admin/gyms/show/:id',
            edit: '/super-admin/gyms/edit/:id',
          },
          {
            name: 'admin-gym/members',
            list: '/admin-gym/members',
            create: '/admin-gym/members/create',
            show: '/admin-gym/members/show/:id',
            edit: '/admin-gym/members/edit/:id',
          },
          {
            name: 'admin-gym/disciplines',
            list: '/admin-gym/disciplines',
            create: '/admin-gym/disciplines/create',
            edit: '/admin-gym/disciplines/edit/:id',
          },
          {
            name: 'admin-gym/pricing',
            list: '/admin-gym/pricing',
            create: '/admin-gym/pricing/create',
            edit: '/admin-gym/pricing/edit/:id',
          },
          {
            name: 'admin-gym/memberships',
            list: '/admin-gym/memberships',
            create: '/admin-gym/memberships/create',
            edit: '/admin-gym/memberships/edit/:id',
          },
          {
            name: 'admin-gym/attendances',
            list: '/admin-gym/attendances',
          },
        ]}
        options={{
          syncWithLocation: true,
          warnWhenUnsavedChanges: true,
        }}
      >
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Super Admin Routes */}
          <Route path="/super-admin">
            <Route path="dashboard" element={<SuperAdminDashboard />} />
            <Route path="gyms" element={<GymsList />} />
            <Route path="gyms/create" element={<GymsCreate />} />
            <Route path="gyms/show/:id" element={<GymsShow />} />
            <Route path="gyms/edit/:id" element={<GymsEdit />} />
          </Route>

          {/* Admin Gym Routes */}
          <Route path="/admin-gym">
            <Route path="dashboard" element={<AdminGymDashboard />} />
            <Route path="members" element={<MembersList />} />
            <Route path="members/create" element={<MembersCreate />} />
            <Route path="members/show/:id" element={<MembersShow />} />
            <Route path="members/edit/:id" element={<MembersEdit />} />
            <Route path="disciplines" element={<DisciplinesList />} />
            <Route path="disciplines/create" element={<DisciplinesCreate />} />
            <Route path="disciplines/edit/:id" element={<DisciplinesEdit />} />
            <Route path="pricing" element={<PricingList />} />
            <Route path="pricing/create" element={<PricingCreate />} />
            <Route path="pricing/edit/:id" element={<PricingEdit />} />
            <Route path="memberships" element={<MembershipsList />} />
            <Route path="memberships/create" element={<MembershipsCreate />} />
            <Route path="memberships/edit/:id" element={<MembershipsEdit />} />
            <Route path="memberships/renew/:id" element={<MembershipsRenew />} />
            <Route path="attendances" element={<AttendancesList />} />
            <Route path="attendances/scanner" element={<AttendancesScanner />} />
          </Route>

          {/* Default Routes */}
          <Route
            element={
              <div>
                <Outlet />
              </div>
            }
          >
            <Route index element={<Navigate to="/login" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
        </Routes>
      </Refine>
    </BrowserRouter>
  );
}

export default App;
