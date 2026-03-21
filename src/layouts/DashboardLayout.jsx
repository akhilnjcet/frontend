// ═══════════════════════════════════════════════════════
// DASHBOARD LAYOUT — Fixed, Aligned, Theme-Aware
// ═══════════════════════════════════════════════════════
import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from '../components/Sidebar.jsx';
import Navbar from '../components/Navbar.jsx';
import { useAuthStore, useUIStore } from '../store/index.js';

export default function DashboardLayout({ role }) {
    const { user, isAuthenticated } = useAuthStore();
    const { theme } = useUIStore();
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (role && user?.role?.toLowerCase() !== role.toLowerCase()) return <Navigate to={`/${user?.role?.toLowerCase()}`} replace />;

    return (
        <div data-theme={theme} className="app-shell">
            {/* ── Desktop Sidebar ── */}
            <div className="hidden md:flex">
                <Sidebar />
            </div>

            {/* ── Mobile Sidebar Drawer ── */}
            <AnimatePresence>
                {mobileSidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)', zIndex: 40 }}
                            onClick={() => setMobileSidebarOpen(false)}
                        />
                        <motion.div
                            initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}
                            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                            style={{ position: 'fixed', left: 0, top: 0, bottom: 0, width: 240, zIndex: 50 }}
                        >
                            <Sidebar mobile onCloseMobile={() => setMobileSidebarOpen(false)} />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* ── Main area ── */}
            <div className="app-main">
                <Navbar onMenuClick={() => setMobileSidebarOpen(true)} />
                <div className="app-content">
                    <AnimatePresence mode="wait">
                        <Outlet />
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
