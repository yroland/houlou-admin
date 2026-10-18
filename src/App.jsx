import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider } from './context/AdminAuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import Produits from './pages/Produits';
import Commandes from './pages/Commandes';
import Coursiers from './pages/Coursiers';
import Livreurs from './pages/Livreurs';
import Promotions from './pages/Promotions';
import Partenaires from './pages/Partenaires';
import Admins from './pages/Admins';

export default function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="categories" element={<Categories />} />
            <Route path="produits" element={<Produits />} />
            <Route path="commandes" element={<Commandes />} />
            <Route path="coursiers" element={<Coursiers />} />
            <Route path="livreurs" element={<Livreurs />} />
            <Route path="admins" element={<Admins />} />
            <Route path="promotions" element={<Promotions />} />
            <Route path="partenaires" element={<Partenaires />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AdminAuthProvider>
    </BrowserRouter>
  );
}