// ═══════════════════════════════════════════════════════
// PATIENT DASHBOARD PAGE — theme-aware
// ═══════════════════════════════════════════════════════
import { useEffect, useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { Calendar, FileText, CreditCard, ArrowRight, Check, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageWrapper from '../../components/PageWrapper.jsx';
import StatCard from '../../components/StatCard.jsx';
import AnimatedCard from '../../components/AnimatedCard.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import AnimatedButton from '../../components/AnimatedButton.jsx';
import { SkeletonStatCard } from '../../components/Skeleton.jsx';
import { getPatientByUserId } from '../../services/patientService.js';
import { getAppointmentsByPatient } from '../../services/appointmentService.js';
import { getBillsByPatient } from '../../services/billService.js';
import { useAuthStore } from '../../store/index.js';
import { formatDate, formatTime, formatCurrency } from '../../utils/index.js';

const QUICK_ACTIONS = [
    {
        label: 'Book Appointment', icon: Calendar, desc: 'Schedule with a doctor',
        to: '/patient/book', color: 'var(--color-primary)', light: 'var(--color-primary-light)', mid: 'var(--color-primary-mid)',
    },
    {
        label: 'View Prescriptions', icon: FileText, desc: 'Your medical prescriptions',
        to: '/patient/prescriptions', color: 'var(--color-teal)', light: 'var(--color-teal-light)', mid: 'var(--color-teal-mid)',
    },
    {
        label: 'View Bills', icon: CreditCard, desc: 'Payment and billing info',
        to: '/patient/bills', color: 'var(--color-warning)', light: 'var(--color-warning-light)', mid: 'var(--color-warning-mid)',
    },
];

export default function PatientDashboard() {
    const { user } = useAuthStore();
    const [appointments, setAppointments] = useState([]);
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.id) return;
        const load = async () => {
            try {
                const p = await getPatientByUserId(user.id);
                const [appts, b] = await Promise.all([
                    getAppointmentsByPatient(p.id),
                    getBillsByPatient(p.id),
                ]);
                setAppointments(appts);
                setBills(b);
            } catch (err) {
                console.error("Dashboard load error:", err);
            } finally { setLoading(false); }
        };
        load();
    }, [user?.id]);

    const upcoming = appointments.filter(a => a.status === 'Scheduled');
    const completed = appointments.filter(a => a.status === 'Completed');
    const pendingBills = bills.filter(b => b.status === 'Pending');

    const progressSteps = [
        { label: 'Scheduled', Icon: Calendar, done: true },
        { label: 'Confirmed', Icon: Check, done: upcoming.length > 0 },
        { label: 'Completed', Icon: Check, done: completed.length > 0 },
        { label: 'Billed', Icon: CreditCard, done: bills.length > 0 },
    ];

    return (
        <PageWrapper title={`Hello, ${user.name.split(' ')[0]}!`} subtitle="Track your health journey below.">

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                {loading ? (
                    [...Array(3)].map((_, i) => <SkeletonStatCard key={i} />)
                ) : (
                    <>
                        <StatCard title="Upcoming Appointments" value={upcoming.length} icon={Calendar} color="blue" delay={0} />
                        <StatCard title="Total Appointments" value={appointments.length} icon={Clock} color="teal" delay={1} />
                        <StatCard title="Pending Bills" value={pendingBills.length} icon={CreditCard} color="orange" delay={2} />
                    </>
                )}
            </div>

            {/* Quick actions */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                {QUICK_ACTIONS.map(q => {
                    const Icon = q.icon;
                    return (
                        <Link to={q.to} key={q.label} style={{ textDecoration: 'none' }}>
                            <motion.div
                                whileHover={{ y: -3, scale: 1.01 }}
                                style={{
                                    padding: 20, borderRadius: 12,
                                    background: q.light, border: `1px solid ${q.mid}`,
                                    cursor: 'pointer', transition: 'box-shadow .2s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,.08)'}
                                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                    <div style={{
                                        width: 36, height: 36, borderRadius: 9,
                                        background: 'rgba(255,255,255,.6)', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center',
                                        border: `1px solid ${q.mid}`,
                                    }}>
                                        <Icon size={16} style={{ color: q.color }} />
                                    </div>
                                    <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-1)' }}>{q.label}</h3>
                                </div>
                                <p style={{ margin: 0, fontSize: 12, color: 'var(--text-2)', lineHeight: 1.4 }}>{q.desc}</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 12, color: q.color, fontSize: 12, fontWeight: 600 }}>
                                    Go <ArrowRight size={13} />
                                </div>
                            </motion.div>
                        </Link>
                    );
                })}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 16 }}>

                {/* Upcoming Appointments */}
                <AnimatedCard hover={false} padding="p-0">
                    <div style={{
                        padding: '18px 22px 14px', borderBottom: '1px solid var(--border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                        <div>
                            <h3 className="section-title">Upcoming Appointments</h3>
                            <p className="label" style={{ marginTop: 3 }}>{upcoming.length} scheduled</p>
                        </div>
                        <Link to="/patient/appointments">
                            <AnimatedButton variant="ghost" size="xs" icon={ArrowRight} iconRight>View all</AnimatedButton>
                        </Link>
                    </div>

                    {upcoming.length === 0 ? (
                        <div style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                            justifyContent: 'center', padding: '40px 24px', textAlign: 'center',
                        }}>
                            <Calendar size={32} style={{ color: 'var(--text-dim)', marginBottom: 12 }} />
                            <p style={{ margin: 0, color: 'var(--text-3)', fontSize: 13 }}>No upcoming appointments</p>
                            <Link to="/patient/book" style={{ marginTop: 12 }}>
                                <AnimatedButton size="sm">Book Now</AnimatedButton>
                            </Link>
                        </div>
                    ) : (
                        <div>
                            {upcoming.slice(0, 3).map((appt, idx) => (
                                <Motion.div
                                    key={appt.id}
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.05 }}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 14,
                                        padding: '14px 22px',
                                        borderBottom: idx < Math.min(upcoming.length, 3) - 1 ? '1px solid var(--border)' : 'none',
                                        transition: 'background .12s',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-panel)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <div style={{
                                        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                                        background: 'var(--color-primary-light)', border: '1px solid var(--color-primary-mid)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <Calendar size={15} style={{ color: 'var(--color-primary)' }} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {appt.doctor?.user?.name}
                                        </p>
                                        <p style={{ margin: 0, fontSize: 11.5, color: 'var(--text-3)', marginTop: 2 }}>
                                            {appt.doctor?.specialization}
                                        </p>
                                        <p style={{ margin: 0, fontSize: 11.5, color: 'var(--color-primary)', marginTop: 3, fontWeight: 500 }}>
                                            {formatDate(appt.appointment_date, { month: 'short', day: 'numeric' })} · {formatTime(appt.appointment_time)}
                                        </p>
                                    </div>
                                    <StatusBadge status={appt.status} size="sm" />
                                </Motion.div>
                            ))}
                        </div>
                    )}
                </AnimatedCard>

                {/* Right column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                    {/* Journey progress */}
                    {appointments.length > 0 && (
                        <AnimatedCard hover={false}>
                            <h3 className="section-title" style={{ marginBottom: 20 }}>Appointment Journey</h3>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                {progressSteps.map((step, idx) => {
                                    const StepIcon = step.Icon;
                                    return (
                                        <div key={step.label} style={{ display: 'flex', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                                                <div style={{
                                                    width: 34, height: 34, borderRadius: '50%',
                                                    background: step.done ? 'var(--color-primary)' : 'var(--bg-panel)',
                                                    border: `2px solid ${step.done ? 'var(--color-primary)' : 'var(--border-strong)'}`,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    transition: 'all .3s',
                                                }}>
                                                    <StepIcon size={13} style={{ color: step.done ? '#fff' : 'var(--text-3)' }} />
                                                </div>
                                                <span style={{
                                                    fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
                                                    letterSpacing: '.05em',
                                                    color: step.done ? 'var(--color-primary)' : 'var(--text-3)',
                                                }}>
                                                    {step.label}
                                                </span>
                                            </div>
                                            {idx < progressSteps.length - 1 && (
                                                <div style={{
                                                    height: 2, width: 28, margin: '0 4px',
                                                    marginBottom: 20,
                                                    background: step.done ? 'var(--color-primary)' : 'var(--border)',
                                                    borderRadius: 1, transition: 'background .3s',
                                                }} />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </AnimatedCard>
                    )}

                    {/* Pending Bills */}
                    <AnimatedCard hover={false}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                            <h3 className="section-title">Pending Bills</h3>
                            <Link to="/patient/bills">
                                <AnimatedButton variant="ghost" size="xs">View all</AnimatedButton>
                            </Link>
                        </div>
                        {pendingBills.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text-3)', fontSize: 13 }}>
                                No pending bills 🎉
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {pendingBills.map(b => (
                                    <div key={b.id} style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '10px 14px',
                                        background: 'var(--color-warning-light)',
                                        border: '1px solid var(--color-warning-mid)',
                                        borderRadius: 9,
                                    }}>
                                        <div>
                                            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>
                                                {b.appointment?.doctor?.user?.name}
                                            </p>
                                            <p style={{ margin: 0, fontSize: 11.5, color: 'var(--text-3)', marginTop: 2 }}>
                                                {formatDate(b.created_at, { month: 'short', day: 'numeric' })}
                                            </p>
                                        </div>
                                        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-warning)' }}>
                                            {formatCurrency(b.amount)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </AnimatedCard>
                </div>
            </div>
        </PageWrapper>
    );
}
