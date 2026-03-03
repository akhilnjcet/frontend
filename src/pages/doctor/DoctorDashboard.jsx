import { useNavigate } from 'react-router-dom';
import { Users, Calendar, FileText, Activity, Plus } from 'lucide-react';
import PageWrapper from '../../components/PageWrapper.jsx';
import StatCard from '../../components/StatCard.jsx';
import AnimatedCard from '../../components/AnimatedCard.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';

const DASHBOARD_STATS = {
    totalPatients: 142,
    todayAppointments: 8,
    totalPrescriptions: 845,
    pendingPharmacyOrders: 12
};

const RECENT_PRESCRIPTIONS = [
    { id: 'RX-1029', patient: 'Alice Johnson', date: '2023-10-24', diagnosis: 'Hypertension', status: 'Dispensed' },
    { id: 'RX-1030', patient: 'Bob Smith', date: '2023-10-24', diagnosis: 'Type 2 Diabetes', status: 'Pending' },
    { id: 'RX-1031', patient: 'Charlie Davis', date: '2023-10-23', diagnosis: 'Asthma exacerbation', status: 'Dispensed' },
    { id: 'RX-1032', patient: 'Diana Prince', date: '2023-10-23', diagnosis: 'Migraine', status: 'Pending' },
];

export default function DoctorDashboard() {
    const navigate = useNavigate();

    return (
        <PageWrapper title="Doctor Dashboard" subtitle="Welcome back, Dr. Arjun Kumar">

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
                <StatCard title="Total Patients" value={DASHBOARD_STATS.totalPatients} icon={Users} color="blue" delay={0} />
                <StatCard title="Today Appointments" value={DASHBOARD_STATS.todayAppointments} icon={Calendar} color="teal" delay={1} />
                <StatCard title="Total Prescriptions" value={DASHBOARD_STATS.totalPrescriptions} icon={FileText} color="purple" delay={2} />
                <StatCard title="Pending Pharmacy Orders" value={DASHBOARD_STATS.pendingPharmacyOrders} icon={Activity} color="orange" delay={3} />
            </div>

            {/* Recent Prescriptions Table */}
            <AnimatedCard hover={false} delay={4}>
                <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)' }}>
                    <h3 className="section-title" style={{ margin: 0 }}>Recent Prescriptions</h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table className="tbl">
                        <thead>
                            <tr>
                                <th>Prescription ID</th>
                                <th>Patient Name</th>
                                <th>Date</th>
                                <th>Diagnosis</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {RECENT_PRESCRIPTIONS.map((rx) => (
                                <tr key={rx.id}>
                                    <td style={{ fontWeight: 600, color: 'var(--text-1)' }}>{rx.id}</td>
                                    <td>{rx.patient}</td>
                                    <td>{rx.date}</td>
                                    <td>{rx.diagnosis}</td>
                                    <td><StatusBadge status={rx.status === 'Pending' ? 'Scheduled' : 'Completed'} label={rx.status} size="sm" /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </AnimatedCard>

        </PageWrapper>
    );
}
