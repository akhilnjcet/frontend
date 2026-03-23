import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, FileText, Activity, Plus } from 'lucide-react';
import PageWrapper from '../../components/PageWrapper.jsx';
import StatCard from '../../components/StatCard.jsx';
import AnimatedCard from '../../components/AnimatedCard.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { useAuthStore } from '../../store/index.js';
import { getDoctorByUserId } from '../../services/doctorService.js';
import { getAppointmentsByDoctor } from '../../services/appointmentService.js';
import { getAllPatients } from '../../services/patientService.js';
import { formatDate, formatTime } from '../../utils/index.js';

export default function DoctorDashboard() {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalPatients: 0,
        todayAppointments: 0,
        totalPrescriptions: 0,
        pendingPharmacyOrders: 0
    });
    const [recentAppointments, setRecentAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.id) return;
        
        const load = async () => {
            try {
                const doc = await getDoctorByUserId(user.id);
                const [allAppts, allPatients] = await Promise.all([
                    getAppointmentsByDoctor(doc.id),
                    getAllPatients()
                ]);

                // Calculate statistics
                const today = new Date().toISOString().split('T')[0];
                const todayCount = allAppts.filter(a => a.appointment_date === today).length;

                setStats({
                    totalPatients: allPatients.length,
                    todayAppointments: todayCount,
                    totalPrescriptions: allAppts.filter(a => a.status === 'Completed').length,
                    pendingPharmacyOrders: 0
                });

                setRecentAppointments(allAppts.slice(0, 5));
            } catch (err) {
                console.error("Dashboard stats error:", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [user?.id]);

    return (
        <PageWrapper title="Doctor Dashboard" subtitle={`Welcome back, Dr. ${user.name}`}>

            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                <button
                    onClick={() => navigate('/doctor/patients')}
                    className="btn btn-primary"
                >
                    <Plus size={16} /> Add Prescription
                </button>
                <button
                    onClick={() => navigate('/doctor/patients')}
                    className="btn btn-outline-primary"
                    style={{ background: 'var(--bg-card)' }}
                >
                    <Users size={16} /> View Patients
                </button>
            </div>

            {/* Statistic Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
                <StatCard title="Total Patients" value={loading ? '...' : stats.totalPatients} icon={Users} color="blue" delay={0} />
                <StatCard title="Today Appointments" value={loading ? '...' : stats.todayAppointments} icon={Calendar} color="teal" delay={1} />
                <StatCard title="Completed Consultations" value={loading ? '...' : stats.totalPrescriptions} icon={FileText} color="purple" delay={2} />
                <StatCard title="Pending Pharmacy Orders" value={stats.pendingPharmacyOrders} icon={Activity} color="orange" delay={3} />
            </div>

            {/* Recent Appointments Table */}
            <AnimatedCard hover={false} delay={4}>
                <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)' }}>
                    <h3 className="section-title" style={{ margin: 0 }}>Recent Schedule</h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table className="tbl">
                        <thead>
                            <tr>
                                <th>Patient Name</th>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" style={{ textAlign: 'center', padding: 20 }}>Loading schedule data...</td></tr>
                            ) : recentAppointments.length === 0 ? (
                                <tr><td colSpan="5" style={{ textAlign: 'center', padding: 20 }}>No recently scheduled appointments found.</td></tr>
                            ) : (
                                recentAppointments.map((appt) => (
                                    <tr key={appt.id}>
                                        <td style={{ fontWeight: 600, color: 'var(--text-1)' }}>{appt.patient?.user?.name || 'Anonymous'}</td>
                                        <td>{formatDate(appt.appointment_date)}</td>
                                        <td>{formatTime(appt.appointment_time)}</td>
                                        <td><StatusBadge status={appt.status} size="sm" /></td>
                                        <td>
                                            <button 
                                                onClick={() => navigate('/doctor/appointments')}
                                                style={{ fontSize: 11, background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', textDecoration: 'underline' }}
                                            >
                                                Manage
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </AnimatedCard>

        </PageWrapper>
    );
}
