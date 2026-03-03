import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, HeartPulse, ArrowRight, Shield, User, Stethoscope } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/index.js';
import { createUser } from '../services/userService.js';
import FormInput from '../components/FormInput.jsx';

const ROLES = [
    { id: 'patient', label: 'Patient', icon: User, color: '#1FA79A', bg: 'rgba(31,167,154,.08)', border: 'rgba(31,167,154,.3)' },
    { id: 'doctor', label: 'Doctor', icon: Stethoscope, color: '#1E5AA8', bg: 'rgba(30,90,168,.08)', border: 'rgba(30,90,168,.3)' },
];

export default function SignupPage() {
    const { isAuthenticated } = useAuthStore();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);
    const { register, handleSubmit, formState: { errors } } = useForm();

    if (isAuthenticated) return <Navigate to="/dashboard" replace />;

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            await createUser({
                ...data,
                role: selectedRole
            });
            toast.success(`Account created as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}! You can now log in.`);
            navigate('/login', { replace: true });
        } catch (err) {
            toast.error(err.message || 'Error creating account');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--bg-app)', padding: 16, position: 'relative', overflow: 'hidden',
        }}>
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
                style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 440 }}
            >
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
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
                        Create Account
                    </h1>
                    <p style={{ margin: '8px 0 0', fontSize: 13.5, color: 'var(--text-2)' }}>
                        Join MediCarePro to get started
                    </p>
                </div>

                <div style={{
                    background: 'var(--bg-surface)', border: '1px solid var(--border)',
                    borderRadius: 16, padding: '32px 32px 24px',
                    boxShadow: '0 8px 40px rgba(31,41,51,.08), 0 1px 3px rgba(31,41,51,.06)',
                }}>
                    {!selectedRole ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <p style={{
                                fontSize: 13, fontWeight: 600, color: 'var(--text-2)', textAlign: 'center', marginBottom: 20
                            }}>
                                I am registering as a:
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                {ROLES.map((role) => (
                                    <button
                                        key={role.id}
                                        type="button"
                                        onClick={() => setSelectedRole(role.id)}
                                        style={{
                                            padding: '24px 16px', borderRadius: 12,
                                            background: role.bg, border: `2px solid ${role.border}`,
                                            cursor: 'pointer', textAlign: 'center', transition: 'all .2s',
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                                    >
                                        <role.icon size={36} color={role.color} />
                                        <span style={{ fontSize: 15, fontWeight: 700, color: role.color }}>{role.label}</span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.form
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            onSubmit={handleSubmit(onSubmit)}
                            style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
                            noValidate
                        >
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4,
                                paddingBottom: 16, borderBottom: '1px solid var(--border)'
                            }}>
                                <button type="button" onClick={() => setSelectedRole(null)} style={{
                                    background: 'none', border: 'none', cursor: 'pointer', fontSize: 12,
                                    color: 'var(--color-primary)', fontWeight: 600, display: 'flex', alignItems: 'center'
                                }}>
                                    ← Back
                                </button>
                                <span style={{ flex: 1, textAlign: 'center', fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>
                                    Registering as {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
                                </span>
                                <div style={{ width: 40 }}></div>
                            </div>

                            <FormInput
                                label="Full Name"
                                type="text"
                                icon={User}
                                placeholder="John Doe"
                                error={errors.name?.message}
                                required
                                {...register('name', { required: 'Name is required' })}
                            />

                            <FormInput
                                label="Email Address"
                                type="email"
                                icon={Mail}
                                placeholder="name@domain.com"
                                error={errors.email?.message}
                                required
                                {...register('email', {
                                    required: 'Email is required',
                                    pattern: { value: /^\S+@\S+$/i, message: 'Invalid email format' }
                                })}
                            />

                            {selectedRole === 'doctor' && (
                                <FormInput
                                    label="Specialization"
                                    type="text"
                                    icon={Stethoscope}
                                    placeholder="e.g. Cardiology"
                                    error={errors.specialization?.message}
                                    required
                                    {...register('specialization', { required: 'Specialization is required' })}
                                />
                            )}

                            <FormInput
                                label="Password"
                                type="password"
                                icon={Lock}
                                placeholder="••••••••"
                                error={errors.password?.message}
                                required
                                {...register('password', {
                                    required: 'Password is required',
                                    minLength: { value: 6, message: 'Minimum 6 characters' }
                                })}
                            />

                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    width: '100%', height: 44,
                                    background: loading ? 'var(--color-primary-hover)' : 'var(--color-primary)',
                                    color: '#fff', border: 'none', borderRadius: 10,
                                    fontSize: 14, fontWeight: 700,
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                    transition: 'all .18s', boxShadow: 'var(--shadow-brand)',
                                    marginTop: 4,
                                }}
                            >
                                {loading ? (
                                    <div style={{
                                        width: 18, height: 18, border: '2.5px solid rgba(255,255,255,.3)',
                                        borderTopColor: '#fff', borderRadius: '50%',
                                        animation: 'spin 0.8s linear infinite',
                                    }} />
                                ) : (
                                    <>Sign Up <ArrowRight size={16} /></>
                                )}
                            </button>
                        </motion.form>
                    )}

                    <div style={{ marginTop: 24, textAlign: 'center' }}>
                        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-2)' }}>
                            Already have an account?{' '}
                            <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'none' }}>
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>

                <div style={{ marginTop: 24, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8 }}>
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
        </div>
    );
}
