// ═══════════════════════════════════════════════════════
// LOGIN PAGE — Enterprise Medical, theme-aware
// ═══════════════════════════════════════════════════════
import { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, HeartPulse, ArrowRight, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { loginUser } from '../services/userService.js';
import { useAuthStore } from '../store/index.js';
import FormInput from '../components/FormInput.jsx';

const QUICK_LOGINS = [
    { role: 'Admin', color: '#7C3AED', bg: 'rgba(124,58,237,.08)', border: 'rgba(124,58,237,.2)', email: 'admin@medicare.pro', password: 'admin123', badge: '👑' },
    { role: 'Doctor', color: '#1E5AA8', bg: 'rgba(30,90,168,.08)', border: 'rgba(30,90,168,.2)', email: 'james.wilson@medicare.pro', password: 'doctor123', badge: '🩺' },
    { role: 'Pharmacy', color: '#F4A300', bg: 'rgba(244,163,0,.08)', border: 'rgba(244,163,0,.2)', email: 'pharmacy@medicare.pro', password: 'pharmacy123', badge: '💊' },
    { role: 'Patient', color: '#1FA79A', bg: 'rgba(31,167,154,.08)', border: 'rgba(31,167,154,.2)', email: 'alice@example.com', password: 'patient123', badge: '👤' },
];

export default function LoginPage() {
    const { isAuthenticated, user, login } = useAuthStore();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit, setValue, formState: { errors } } = useForm();

    if (isAuthenticated) return <Navigate to={`/${user.role.toLowerCase()}`} replace />;

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const res = await loginUser(data.email, data.password, data.role);
            login(res.user, res.token);
            toast.success(`Welcome back, ${res.user.name.split(' ')[0]}!`);
            navigate(`/${res.user.role.toLowerCase()}`, { replace: true });
        } catch (err) {
            toast.error(err.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    const fillLogin = (ql) => {
        setValue('email', ql.email);
        setValue('password', ql.password);
        setValue('role', ql.role.toUpperCase());
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--bg-app)', padding: 16, position: 'relative', overflow: 'hidden',
        }}>
            {/* Soft bg orbs */}
            <div style={{
                position: 'absolute', top: '-8%', right: '-5%', width: 480, height: 480,
                borderRadius: '50%', background: 'rgba(30,90,168,.06)', filter: 'blur(80px)', pointerEvents: 'none',
            }} />
            <div style={{
                position: 'absolute', bottom: '-8%', left: '-5%', width: 480, height: 480,
                borderRadius: '50%', background: 'rgba(31,167,154,.05)', filter: 'blur(80px)', pointerEvents: 'none',
            }} />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: .35, ease: [.4, 0, .2, 1] }}
                style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 420 }}
            >
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 52, height: 52, borderRadius: 14,
                        background: 'var(--color-primary)',
                        boxShadow: 'var(--shadow-brand)',
                        marginBottom: 20,
                    }}>
                        <HeartPulse size={24} color="#fff" strokeWidth={2} />
                    </div>
                    <h1 style={{
                        margin: 0, fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
                        fontSize: 26, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-.03em',
                    }}>
                        MediCare<span style={{ color: 'var(--color-primary)' }}>Pro</span>
                    </h1>
                    <p style={{ margin: '8px 0 0', fontSize: 13.5, color: 'var(--text-2)' }}>
                        Enterprise Hospital Management System
                    </p>
                </div>

                {/* Form card */}
                <div style={{
                    background: 'var(--bg-surface)', border: '1px solid var(--border)',
                    borderRadius: 16, padding: 32,
                    boxShadow: '0 8px 40px rgba(31,41,51,.08), 0 1px 3px rgba(31,41,51,.06)',
                }}>
                    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 20 }} noValidate>
                        <FormInput
                            label="Email Address"
                            type="email"
                            icon={Mail}
                            placeholder="name@company.com"
                            error={errors.email?.message}
                            required
                            autoComplete="email"
                            {...register('email', {
                                required: 'Email is required',
                                pattern: { value: /^\S+@\S+$/i, message: 'Invalid email format' }
                            })}
                        />

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                <label style={{
                                    fontSize: 11.5, fontWeight: 600, textTransform: 'uppercase',
                                    letterSpacing: '.05em', color: 'var(--text-2)',
                                }}>
                                    Password <span style={{ color: 'var(--color-error)' }} aria-hidden="true">*</span>
                                </label>
                                <button
                                    type="button"
                                    style={{
                                        fontSize: 11.5, fontWeight: 700, color: 'var(--color-primary)',
                                        background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary-hover)'}
                                    onMouseLeave={e => e.currentTarget.style.color = 'var(--color-primary)'}
                                >
                                    Forgot password?
                                </button>
                            </div>
                            <FormInput
                                type="password"
                                icon={Lock}
                                placeholder="••••••••"
                                error={errors.password?.message}
                                autoComplete="current-password"
                                {...register('password', { required: 'Password is required' })}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                            <label style={{
                                fontSize: 11.5, fontWeight: 600, textTransform: 'uppercase',
                                letterSpacing: '.05em', color: 'var(--text-2)',
                            }}>
                                Role <span style={{ color: 'var(--color-error)' }} aria-hidden="true">*</span>
                            </label>
                            <select
                                {...register('role', { required: 'Role is required' })}
                                style={{
                                    width: '100%', height: 44, padding: '0 14px',
                                    borderRadius: 10, border: '1px solid var(--border)',
                                    background: 'var(--bg-app)', color: 'var(--text-1)',
                                    fontSize: 14, fontFamily: 'inherit',
                                    outline: 'none', transition: 'border-color .15s'
                                }}
                            >
                                <option value="">Select Role...</option>
                                <option value="ADMIN">Admin</option>
                                <option value="DOCTOR">Doctor</option>
                                <option value="PATIENT">Patient</option>
                                <option value="PHARMACY">Pharmacy</option>
                            </select>
                            {errors.role && <span style={{ fontSize: 11, color: 'var(--color-error)' }}>{errors.role.message}</span>}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%', height: 44,
                                background: loading ? 'var(--color-primary-hover)' : 'var(--color-primary)',
                                color: '#fff', border: 'none', borderRadius: 10,
                                fontSize: 14, fontWeight: 700, fontFamily: 'inherit',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                transition: 'all .18s', boxShadow: 'var(--shadow-brand)',
                                marginTop: 4,
                            }}
                            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'var(--color-primary-hover)'; }}
                            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = 'var(--color-primary)'; }}
                        >
                            {loading ? (
                                <div style={{
                                    width: 18, height: 18, border: '2.5px solid rgba(255,255,255,.3)',
                                    borderTopColor: '#fff', borderRadius: '50%',
                                    animation: 'spin 0.8s linear infinite',
                                }} />
                            ) : (
                                <>Sign In <ArrowRight size={16} /></>
                            )}
                        </button>
                    </form>

                    {/* Quick Demo Access */}
                    <div style={{ marginTop: 28, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
                        <p style={{
                            fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.1em',
                            color: 'var(--text-3)', textAlign: 'center', marginBottom: 14,
                        }}>
                            Quick Demo Access
                        </p>
                        <div style={{ display: 'flex', gap: 8 }}>
                            {QUICK_LOGINS.map(ql => (
                                <motion.button
                                    key={ql.role}
                                    whileHover={{ y: -2, scale: 1.02 }}
                                    whileTap={{ scale: .97 }}
                                    onClick={() => fillLogin(ql)}
                                    title={`Login as ${ql.role}`}
                                    style={{
                                        flex: 1, padding: '10px 6px', borderRadius: 9,
                                        background: ql.bg, border: `1px solid ${ql.border}`,
                                        cursor: 'pointer', textAlign: 'center', transition: 'all .15s',
                                        fontFamily: 'inherit',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,.08)'}
                                    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                                >
                                    <div style={{ fontSize: 18, marginBottom: 4, lineHeight: 1 }}>{ql.badge}</div>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: ql.color, letterSpacing: '.04em' }}>{ql.role}</div>
                                </motion.button>
                            ))}
                        </div>
                        <p style={{ margin: '10px 0 0', fontSize: 10.5, color: 'var(--text-3)', textAlign: 'center', lineHeight: 1.4 }}>
                            Click a role to fill credentials → then Sign In
                        </p>
                    </div>
                    {/* Sign Up Link */}
                    <div style={{ marginTop: 24, textAlign: 'center' }}>
                        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-2)' }}>
                            New here?{' '}
                            <Link to="/signup" style={{ color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'none' }}>
                                Create an Account
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ marginTop: 24, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <p style={{ fontSize: 11.5, color: 'var(--text-3)', margin: 0 }}>
                        By signing in, you agree to our{' '}
                        <span style={{ color: 'var(--text-2)', fontWeight: 600, cursor: 'pointer' }}>Terms of Service</span>
                    </p>
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                        fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.09em',
                        color: 'var(--text-dim)',
                    }}>
                        <Shield size={9} />
                        HIPAA Compliant · Enterprise Grade Security
                    </div>
                </div>
            </motion.div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
