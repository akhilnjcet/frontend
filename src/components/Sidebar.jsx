// ═══════════════════════════════════════════════════════
// SIDEBAR — Enterprise, theme-aware, fully accessible
// ═══════════════════════════════════════════════════════
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Users, UserRound, Building2, Calendar,
    FileText, CreditCard, Stethoscope, HeartPulse,
    LogOut, ChevronLeft, ChevronRight, Activity, X,
} from 'lucide-react';
import { useAuthStore, useUIStore } from '../store/index.js';
import { getInitials, getAvatarGradient } from '../utils/index.js';

/* ── Nav config ───────────────────────────────────────── */
const NAV = {
    admin: [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
        { label: 'Users', icon: Users, path: '/admin/users' },
        { label: 'Doctors', icon: Stethoscope, path: '/admin/doctors' },
        { label: 'Patients', icon: UserRound, path: '/admin/patients' },
        { label: 'Departments', icon: Building2, path: '/admin/departments' },
        { label: 'Appointments', icon: Calendar, path: '/admin/appointments' },
        { label: 'Bills', icon: CreditCard, path: '/admin/bills' },
    ],
    doctor: [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/doctor' },
        { label: 'Patients', icon: UserRound, path: '/doctor/patients' },
        { label: 'Appointments', icon: Calendar, path: '/doctor/appointments' },
        { label: 'Prescriptions', icon: FileText, path: '/doctor/prescriptions' },
        { label: 'Pharmacy', icon: HeartPulse, path: '/doctor/pharmacy' },
    ],
    patient: [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/patient' },
        { label: 'Book Appointment', icon: Calendar, path: '/patient/book' },
        { label: 'Appointments', icon: Activity, path: '/patient/appointments' },
        { label: 'Prescriptions', icon: FileText, path: '/patient/prescriptions' },
        { label: 'Bills', icon: CreditCard, path: '/patient/bills' },
    ],
    pharmacy: [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/pharmacy' },
    ],
};

const ROLE_META = {
    admin: { label: 'Administrator', color: '#7C3AED', bg: 'rgba(124,58,237,.1)', border: 'rgba(124,58,237,.2)' },
    doctor: { label: 'Physician', color: '#1E5AA8', bg: 'rgba(30,90,168,.1)', border: 'rgba(30,90,168,.2)' },
    patient: { label: 'Patient', color: '#1FA79A', bg: 'rgba(31,167,154,.1)', border: 'rgba(31,167,154,.2)' },
    pharmacy: { label: 'Pharmacist', color: '#F4A300', bg: 'rgba(244,163,0,.1)', border: 'rgba(244,163,0,.2)' },
};

const EXPANDED_W = 248;
const COLLAPSED_W = 68;

export default function Sidebar({ mobile = false, onCloseMobile }) {
    const { user, logout } = useAuthStore();
    const { sidebarCollapsed, toggleSidebar } = useUIStore();
    const location = useLocation();

    const nav = NAV[user?.role?.toLowerCase()] || [];
    const role = ROLE_META[user?.role?.toLowerCase()] || ROLE_META.admin;
    const collapsed = mobile ? false : sidebarCollapsed;
    const w = collapsed ? COLLAPSED_W : EXPANDED_W;

    const isActive = (path) =>
        path.endsWith('/admin') || path.endsWith('/doctor') || path.endsWith('/patient') || path.endsWith('/pharmacy')
            ? location.pathname === path
            : location.pathname.startsWith(path);

    return (
        <motion.aside
            initial={false}
            animate={{ width: w }}
            transition={{ type: 'spring', stiffness: 380, damping: 38 }}
            style={{
                height: '100%',
                background: 'var(--sidebar-bg)',
                borderRight: '1px solid var(--sidebar-border)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                position: 'relative',
                flexShrink: 0,
                zIndex: 30,
            }}
        >
            {/* ── Logo ── */}
            <div style={{
                padding: collapsed ? '0' : '0 20px',
                height: 64,
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: 12,
                flexShrink: 0,
                borderBottom: '1px solid var(--border)',
            }}>
                <div style={{
                    width: 34,
                    height: 34,
                    borderRadius: 9,
                    background: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'var(--shadow-brand)',
                    flexShrink: 0,
                }}>
                    <HeartPulse size={18} color="#fff" strokeWidth={2} />
                </div>

                {!collapsed && (
                    <motion.div
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: .15 }}
                        style={{ flex: 1 }}
                    >
                        <span style={{
                            fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
                            fontWeight: 800,
                            fontSize: 17,
                            letterSpacing: '-.025em',
                            color: 'var(--text-1)',
                        }}>
                            MediCare<span style={{ color: 'var(--color-primary)' }}>Pro</span>
                        </span>
                    </motion.div>
                )}

                {mobile && (
                    <button
                        onClick={onCloseMobile}
                        aria-label="Close sidebar"
                        style={{
                            marginLeft: 'auto',
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-3)',
                            cursor: 'pointer',
                            padding: '4px',
                            borderRadius: 6,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <X size={18} />
                    </button>
                )}
            </div>

            {/* ── User Profile ── */}
            <div style={{
                padding: collapsed ? '14px 0' : '14px 14px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: collapsed ? 'center' : 'stretch',
                borderBottom: '1px solid var(--border)',
                flexShrink: 0,
            }}>
                {!collapsed ? (
                    <div style={{
                        padding: '10px 12px',
                        borderRadius: 10,
                        background: 'var(--bg-panel)',
                        border: '1px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                    }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: 9,
                            background: getAvatarGradient(user?.name),
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontSize: 13, fontWeight: 700,
                            flexShrink: 0,
                        }}>
                            {getInitials(user?.name)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: 'var(--text-1)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}>
                                {user?.name}
                            </div>
                            <div style={{
                                marginTop: 2,
                                display: 'inline-flex',
                                alignItems: 'center',
                                padding: '1px 7px',
                                borderRadius: 99,
                                fontSize: 10,
                                fontWeight: 700,
                                letterSpacing: '.06em',
                                textTransform: 'uppercase',
                                background: role.bg,
                                color: role.color,
                                border: `1px solid ${role.border}`,
                            }}>
                                {role.label}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div
                        title={user?.name}
                        style={{
                            width: 36, height: 36, borderRadius: 9,
                            background: getAvatarGradient(user?.name),
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontSize: 13, fontWeight: 700,
                        }}>
                        {getInitials(user?.name)}
                    </div>
                )}
            </div>

            {/* ── Navigation ── */}
            <nav
                aria-label="Main navigation"
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: collapsed ? '12px 8px' : '12px 10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    scrollbarWidth: 'none',
                }}
            >
                {!collapsed && (
                    <div style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: 'var(--text-3)',
                        textTransform: 'uppercase',
                        letterSpacing: '.12em',
                        padding: '0 6px 8px',
                    }}>
                        Main Menu
                    </div>
                )}

                {nav.map((item) => {
                    const active = isActive(item.path);
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={mobile ? onCloseMobile : undefined}
                            title={collapsed ? item.label : undefined}
                            aria-current={active ? 'page' : undefined}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                padding: collapsed ? '10px 0' : '9px 12px',
                                borderRadius: 8,
                                textDecoration: 'none',
                                fontSize: '13.5px',
                                fontWeight: active ? 600 : 500,
                                color: active ? 'var(--color-primary)' : 'var(--text-2)',
                                background: active ? 'var(--color-primary-light)' : 'transparent',
                                border: active ? '1px solid var(--color-primary-mid)' : '1px solid transparent',
                                transition: 'all 0.15s ease',
                                justifyContent: collapsed ? 'center' : 'flex-start',
                                position: 'relative',
                            }}
                            onMouseEnter={e => {
                                if (!active) {
                                    e.currentTarget.style.color = 'var(--color-primary)';
                                    e.currentTarget.style.background = 'var(--color-primary-light)';
                                }
                            }}
                            onMouseLeave={e => {
                                if (!active) {
                                    e.currentTarget.style.color = 'var(--text-2)';
                                    e.currentTarget.style.background = 'transparent';
                                }
                            }}
                        >
                            <Icon
                                size={17}
                                strokeWidth={active ? 2.5 : 2}
                                style={{ flexShrink: 0 }}
                            />
                            {!collapsed && <span style={{ flex: 1 }}>{item.label}</span>}
                            {active && !collapsed && (
                                <div style={{
                                    width: 6, height: 6,
                                    borderRadius: '50%',
                                    background: 'var(--color-primary)',
                                    flexShrink: 0,
                                }} />
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            {/* ── Footer ── */}
            <div style={{
                padding: collapsed ? '12px 8px' : '12px 10px',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                flexShrink: 0,
            }}>
                <button
                    onClick={logout}
                    title="Sign out"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: collapsed ? '9px 0' : '9px 12px',
                        borderRadius: 8,
                        fontSize: '13.5px',
                        fontWeight: 500,
                        color: 'var(--color-error)',
                        background: 'transparent',
                        border: '1px solid transparent',
                        cursor: 'pointer',
                        width: '100%',
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        transition: 'all 0.15s ease',
                        fontFamily: 'inherit',
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = 'var(--color-error-light)';
                        e.currentTarget.style.borderColor = 'rgba(214,69,69,0.2)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.borderColor = 'transparent';
                    }}
                >
                    <LogOut size={17} strokeWidth={2} />
                    {!collapsed && <span>Sign Out</span>}
                </button>

                {!mobile && (
                    <button
                        onClick={toggleSidebar}
                        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '100%',
                            height: 30,
                            background: 'var(--bg-panel)',
                            border: '1px solid var(--border)',
                            borderRadius: 7,
                            color: 'var(--text-3)',
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.color = 'var(--color-primary)';
                            e.currentTarget.style.borderColor = 'var(--color-primary-mid)';
                            e.currentTarget.style.background = 'var(--color-primary-light)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.color = 'var(--text-3)';
                            e.currentTarget.style.borderColor = 'var(--border)';
                            e.currentTarget.style.background = 'var(--bg-panel)';
                        }}
                    >
                        {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
                    </button>
                )}
            </div>
        </motion.aside>
    );
}
