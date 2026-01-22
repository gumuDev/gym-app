import { Refine } from '@refinedev/core';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import routerProvider, { NavigateToResource } from '@refinedev/react-router-v6';

import { authProvider } from './providers/authProvider';
import { dataProvider } from './providers/dataProvider';

import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';

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
        ]}
        options={{
          syncWithLocation: true,
          warnWhenUnsavedChanges: true,
        }}
      >
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            element={
              <div>
                <Outlet />
              </div>
            }
          >
            <Route index element={<NavigateToResource resource="dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
        </Routes>
      </Refine>
    </BrowserRouter>
  );
}

export default App;
