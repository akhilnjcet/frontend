// ═══════════════════════════════════════════════════════
// APP ROUTES - React Router v7
// ═══════════════════════════════════════════════════════
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Pages
import LoginPage from '../pages/LoginPage.jsx';
import SignupPage from '../pages/SignupPage.jsx';
import DashboardLayout from '../layouts/DashboardLayout.jsx';

// Admin pages
import AdminDashboard from '../pages/admin/AdminDashboard.jsx';
import AdminUsers from '../pages/admin/AdminUsers.jsx';
import AdminDoctors from '../pages/admin/AdminDoctors.jsx';
import AdminPatients from '../pages/admin/AdminPatients.jsx';
import AdminDepartments from '../pages/admin/AdminDepartments.jsx';
import AdminAppointments from '../pages/admin/AdminAppointments.jsx';
import AdminBills from '../pages/admin/AdminBills.jsx';

// Doctor pages
import DoctorDashboard from '../pages/doctor/DoctorDashboard.jsx';
import DoctorAppointments from '../pages/doctor/DoctorAppointments.jsx';
import DoctorPatients from '../pages/doctor/DoctorPatients.jsx';
import DoctorPrescriptions from '../pages/doctor/DoctorPrescriptions.jsx';
import PrescriptionWriter from '../pages/doctor/PrescriptionWriter.jsx';
import PatientDetails from '../pages/doctor/PatientDetails.jsx';
import DoctorPharmacy from '../pages/doctor/DoctorPharmacy.jsx';

// Patient pages
import PatientDashboard from '../pages/patient/PatientDashboard.jsx';
import BookAppointment from '../pages/patient/BookAppointment.jsx';
import PatientAppointments from '../pages/patient/PatientAppointments.jsx';
import PatientPrescriptions from '../pages/patient/PatientPrescriptions.jsx';
import PatientBills from '../pages/patient/PatientBills.jsx';

// Pharmacy pages
import PharmacyDashboard from '../pages/pharmacy/PharmacyDashboard.jsx';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <Navigate to="/login" replace />,
    },
    {
        path: '/login',
        element: <LoginPage />,
    },
    {
        path: '/signup',
        element: <SignupPage />,
    },

    // ── Admin Routes ────────────────────────────────────
    {
        path: '/admin',
        element: <DashboardLayout role="admin" />,
        children: [
            { index: true, element: <AdminDashboard /> },
            { path: 'users', element: <AdminUsers /> },
            { path: 'doctors', element: <AdminDoctors /> },
            { path: 'patients', element: <AdminPatients /> },
            { path: 'departments', element: <AdminDepartments /> },
            { path: 'appointments', element: <AdminAppointments /> },
            { path: 'bills', element: <AdminBills /> },
        ],
    },

    // ── Doctor Routes ───────────────────────────────────
    {
        path: '/doctor',
        element: <DashboardLayout role="doctor" />,
        children: [
            { index: true, element: <DoctorDashboard /> },
            { path: 'appointments', element: <DoctorAppointments /> },
            { path: 'patients', element: <DoctorPatients /> },
            { path: 'prescriptions', element: <DoctorPrescriptions /> },
            { path: 'prescriptions/write', element: <PrescriptionWriter /> },
            { path: 'patients/:id', element: <PatientDetails /> },
            { path: 'pharmacy', element: <DoctorPharmacy /> },
        ],
    },

    // ── Patient Routes ──────────────────────────────────
    {
        path: '/patient',
        element: <DashboardLayout role="patient" />,
        children: [
            { index: true, element: <PatientDashboard /> },
            { path: 'book', element: <BookAppointment /> },
            { path: 'appointments', element: <PatientAppointments /> },
            { path: 'prescriptions', element: <PatientPrescriptions /> },
            { path: 'bills', element: <PatientBills /> },
        ],
    },

    // ── Pharmacy Routes ─────────────────────────────────
    {
        path: '/pharmacy',
        element: <DashboardLayout role="pharmacy" />,
        children: [
            { index: true, element: <PharmacyDashboard /> },
        ],
    },

    // ── Catch all – redirect to login ───────────────────
    {
        path: '*',
        element: <Navigate to="/login" replace />,
    },
]);
