import { useState } from 'react';
import { Search, Info, Package } from 'lucide-react';
import PageWrapper from '../../components/PageWrapper.jsx';
import AnimatedCard from '../../components/AnimatedCard.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';

// Dummy JSON Data Simulation for Pharmacy
const INITIAL_ORDERS = [
    { id: 'RX-1029', patient: 'Alice Johnson', doctor: 'Dr. Arjun Kumar', medicines: ['Lisinopril 10mg', 'Aspirin 75mg'], status: 'Pending', date: '2023-10-24' },
    { id: 'RX-1030', patient: 'Bob Smith', doctor: 'Dr. Arjun Kumar', medicines: ['Metformin 500mg'], status: 'Dispensed', date: '2023-10-24' },
    { id: 'RX-1031', patient: 'Charlie Davis', doctor: 'Dr. Arjun Kumar', medicines: ['Albuterol Inhaler'], status: 'Pending', date: '2023-10-23' },
    { id: 'RX-1035', patient: 'Diana Prince', doctor: 'Dr. Sarah Lee', medicines: ['Ibuprofen 400mg', 'Amoxicillin 500mg'], status: 'Pending', date: '2023-10-25' },
    { id: 'RX-1040', patient: 'Ethan Hunt', doctor: 'Dr. Arjun Kumar', medicines: ['Paracetamol 500mg'], status: 'Pending', date: '2023-10-26' },
];

export default function DoctorPharmacy() {
    const [orders] = useState(INITIAL_ORDERS);
    const [search, setSearch] = useState('');

    const filteredOrders = orders.filter(
        order =>
            order.patient.toLowerCase().includes(search.toLowerCase()) ||
            order.id.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <PageWrapper title="Pharmacy Status Queue" subtitle="Track your sent prescriptions.">

            {/* Info Banner */}
            <div className="alert alert-info" style={{ marginBottom: 24 }}>
                <div className="alert-icon alert-icon-info"><Info size={18} /></div>
                <div>
                    <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: 'var(--color-info)' }}>Read-only View</p>
                    <p style={{ margin: 0, fontSize: 13, color: 'var(--text-1)', marginTop: 2 }}>
                        This is a read-only tracking view for doctors. The Pharmacist will mark these orders as dispensed from their portal.
                    </p>
                </div>
            </div>

            <AnimatedCard hover={false}>
                {/* Search Bar */}
                <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                    <div style={{ flex: 1, position: 'relative', maxWidth: 400 }}>
                        <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} size={16} />
                        <input
                            type="text"
                            placeholder="Search by Patient Name or RX ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{
                                width: '100%', padding: '10px 14px 10px 40px', borderRadius: 8,
                                border: '1px solid var(--border-strong)', background: 'var(--bg-input)',
                                fontSize: 13.5, color: 'var(--text-1)', outline: 'none'
                            }}
                            onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                            onBlur={e => e.target.style.borderColor = 'var(--border-strong)'}
                        />
                    </div>
                </div>

                {/* Orders List / Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                        <div key={order.id} style={{
                            display: 'flex', flexDirection: 'column', gap: 16, padding: '20px',
                            background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 12
                        }}>
                            {/* Header Info */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-1)' }}>{order.patient}</h3>
                                        <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 600 }}>{order.id}</span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: 13, color: 'var(--text-2)' }}>Prescribed by {order.doctor} on {order.date}</p>
                                </div>
                                <StatusBadge status={order.status === 'Pending' ? 'Scheduled' : 'Completed'} label={order.status} size="md" />
                            </div>

                            {/* Medicines List */}
                            <div style={{ background: 'var(--bg-card)', padding: '12px 16px', borderRadius: 8, border: '1px dashed var(--border-strong)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, color: 'var(--text-2)', fontSize: 13, fontWeight: 600 }}>
                                    <Package size={14} /> Medicines:
                                </div>
                                <ul style={{ margin: 0, paddingLeft: 24, fontSize: 14, color: 'var(--text-1)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    {order.medicines.map((med, i) => (
                                        <li key={i}>{med}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )) : (
                        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-3)' }}>
                            No pharmacy orders found matching your search.
                        </div>
                    )}
                </div>
            </AnimatedCard>
        </PageWrapper>
    );
}
