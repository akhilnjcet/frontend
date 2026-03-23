// ═══════════════════════════════════════════════════════
// DOCTOR — APPOINTMENTS PAGE (theme-aware + Rx navigation)
// ═══════════════════════════════════════════════════════
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, FileText, Calendar, Clock, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import PageWrapper from '../../components/PageWrapper.jsx';
import AnimatedCard from '../../components/AnimatedCard.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { SkeletonStatCard } from '../../components/Skeleton.jsx';
import { getDoctorByUserId } from '../../services/doctorService.js';
import { getAppointmentsByDoctor, updateAppointmentStatus } from '../../services/appointmentService.js';
import { useAuthStore } from '../../store/index.js';
import { formatDate, formatTime, getInitials, getAvatarGradient } from '../../utils/index.js';
import { exportTableToPDF } from '../../utils/pdfExport.js';


export default function DoctorAppointments() {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        const loadDoc = async () => {
            if (!user?.id) return;
            setLoading(true);
            try {
                const doc = await getDoctorByUserId(user.id);
                const appts = await getAppointmentsByDoctor(doc.id);
                setAppointments(appts);
            } catch (err) {
                console.error("Error loading doctor appointments:", err);
            } finally {
                setLoading(false);
            }
        };
        loadDoc();
    }, [user?.id]);

    const handleStatus = async (id, status) => {
        await updateAppointmentStatus(id, status);
        toast.success(`Appointment marked as ${status}`);
        // Simple refresh logic
        const doc = await getDoctorByUserId(user.id);
        const appts = await getAppointmentsByDoctor(doc.id);
        setAppointments(appts);
    };

    const STATUS_TABS = ['All', 'Scheduled', 'Completed', 'Cancelled'];

    const filtered = appointments
        .filter(a => filter === 'All' || a.status === filter)
        .filter(a => {
            if (!search) return true;
            const q = search.toLowerCase();
            return (
                a.patient?.user?.name?.toLowerCase().includes(q) ||
                a.appointment_date?.includes(q) ||
                a.status?.toLowerCase().includes(q)
            );
        });

    const btnStyle = (color) => ({
        padding: '5px', borderRadius: 7, border: '1px solid transparent',
        background: 'transparent', cursor: 'pointer', display: 'flex',
        transition: 'all .15s', color,
    });

    const handleExport = () => {
        const columns = ['ID', 'Patient', 'Date', 'Time', 'Status'];
        const data = filtered.map(row => [
            row.id,
            row.patient?.user?.name || 'N/A',
            formatDate(row.appointment_date),
            formatTime(row.appointment_time),
            row.status
        ]);
        exportTableToPDF('My Appointments Schedule', columns, data, 'Doctor_Appointments');
    };

    return (
        <PageWrapper
            title="My Appointments"
            subtitle={`${appointments.length} total appointments`}
        >
            <AnimatedCard hover={false} padding="p-0">
                {/* Toolbar */}
                <div style={{
                    padding: '16px 20px',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', gap: 12,
                    borderBottom: '1px solid var(--border)',
                    flexWrap: 'wrap',
                }}>
                    {/* Status tabs */}
                    <div style={{ display: 'flex', gap: 4 }}>
                        {STATUS_TABS.map(s => (
                            <button
                                key={s}
                                onClick={() => setFilter(s)}
                                style={{
                                    padding: '5px 12px', borderRadius: 7, fontSize: 12.5,
                                    fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
                                    transition: 'all .15s',
                                    border: `1px solid ${filter === s ? 'var(--color-primary-mid)' : 'var(--border)'}`,
                                    background: filter === s ? 'var(--color-primary-light)' : 'var(--bg-panel)',
                                    color: filter === s ? 'var(--color-primary)' : 'var(--text-2)',
                                }}
                            >
                                {s}
                                <span style={{
                                    marginLeft: 5, fontSize: 10, fontWeight: 700, padding: '1px 5px',
                                    borderRadius: 99,
                                    background: filter === s ? 'var(--color-primary)' : 'var(--border)',
                                    color: filter === s ? '#fff' : 'var(--text-3)',
                                }}>
                                    {s === 'All' ? appointments.length : appointments.filter(a => a.status === s).length}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div style={{ position: 'relative' }}>
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search patient, date, status…"
                            style={{
                                height: 34, paddingLeft: 14, paddingRight: 14,
                                background: 'var(--bg-input)', border: '1px solid var(--border-strong)',
                                borderRadius: 8, fontSize: 13, color: 'var(--text-1)',
                                fontFamily: 'inherit', outline: 'none', width: 260,
                                transition: 'all .15s',
                            }}
                            onFocus={e => { e.target.style.borderColor = 'var(--color-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(30,90,168,0.10)'; }}
                            onBlur={e => { e.target.style.borderColor = 'var(--border-strong)'; e.target.style.boxShadow = 'none'; }}
                        />
                    </div>

                    {/* Export Button */}
                    <button
                        onClick={handleExport}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px',
                            background: 'var(--color-primary)', color: '#fff', border: 'none',
                            borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                        }}
                    >
                        <Download size={14} /> Export PDF
                    </button>
                </div>

                {/* Table */}
                <div style={{ overflowX: 'auto' }}>
                    {loading ? (
                        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="skeleton" style={{ height: 56, borderRadius: 8 }} />
                            ))}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                            justifyContent: 'center', padding: '48px 24px', color: 'var(--text-3)',
                        }}>
                            <Calendar size={36} style={{ opacity: .3, marginBottom: 12 }} />
                            <p style={{ margin: 0, fontSize: 13.5 }}>No appointments found</p>
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                    {['#', 'Patient', 'Date', 'Time', 'Status', 'Actions'].map(h => (
                                        <th key={h} style={{
                                            padding: '10px 16px', textAlign: 'left',
                                            fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase',
                                            letterSpacing: '.06em', color: 'var(--text-3)',
                                            background: 'var(--bg-panel)',
                                            whiteSpace: 'nowrap',
                                        }}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((row, idx) => (
                                    <tr
                                        key={row.id}
                                        style={{
                                            borderBottom: idx < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                                            transition: 'background .12s',
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-panel)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        {/* # */}
                                        <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-3)', whiteSpace: 'nowrap' }}>
                                            #{row.id}
                                        </td>

                                        {/* Patient — clickable → Prescription Writer */}
                                        <td style={{ padding: '12px 16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{
                                                    width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                                                    background: getAvatarGradient(row.patient?.user?.name),
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: '#fff', fontSize: 11, fontWeight: 700,
                                                }}>
                                                    {getInitials(row.patient?.user?.name)}
                                                </div>
                                                <div>
                                                    <button
                                                        onClick={() => navigate(`/doctor/prescriptions/write?appointmentId=${row.id}`)}
                                                        style={{
                                                            background: 'none', border: 'none', padding: 0,
                                                            cursor: 'pointer', fontFamily: 'inherit',
                                                            fontSize: 13.5, fontWeight: 600,
                                                            color: 'var(--color-primary)',
                                                            textDecoration: 'underline',
                                                            textDecorationColor: 'var(--color-primary-mid)',
                                                            textUnderlineOffset: 3,
                                                            transition: 'all .15s',
                                                            display: 'block', textAlign: 'left',
                                                        }}
                                                        title="Click to write prescription"
                                                        onMouseEnter={e => e.currentTarget.style.textDecorationColor = 'var(--color-primary)'}
                                                        onMouseLeave={e => e.currentTarget.style.textDecorationColor = 'var(--color-primary-mid)'}
                                                    >
                                                        {row.patient?.user?.name}
                                                    </button>
                                                    <p style={{ margin: 0, fontSize: 11.5, color: 'var(--text-3)', marginTop: 1 }}>
                                                        Age {row.patient?.age} · {row.patient?.gender}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Date */}
                                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <Calendar size={13} style={{ color: 'var(--text-3)' }} />
                                                <span style={{ fontSize: 13, color: 'var(--text-2)' }}>
                                                    {formatDate(row.appointment_date, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Time */}
                                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <Clock size={13} style={{ color: 'var(--text-3)' }} />
                                                <span style={{ fontSize: 13, color: 'var(--text-2)' }}>
                                                    {formatTime(row.appointment_time)}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td style={{ padding: '12px 16px' }}>
                                            <StatusBadge status={row.status} size="sm" />
                                        </td>

                                        {/* Actions */}
                                        <td style={{ padding: '12px 16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                {/* Write Rx — always available */}
                                                <button
                                                    onClick={() => navigate(`/doctor/prescriptions/write?appointmentId=${row.id}`)}
                                                    title="Write Prescription"
                                                    style={btnStyle('var(--color-teal)')}
                                                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-teal-light)'; e.currentTarget.style.borderColor = 'var(--color-teal-mid)'; }}
                                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
                                                >
                                                    <FileText size={14} />
                                                </button>

                                                {row.status === 'Scheduled' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleStatus(row.id, 'Completed')}
                                                            title="Mark as Completed"
                                                            style={btnStyle('var(--color-success)')}
                                                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-success-light)'; e.currentTarget.style.borderColor = 'var(--color-success-mid)'; }}
                                                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
                                                        >
                                                            <CheckCircle size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatus(row.id, 'Cancelled')}
                                                            title="Cancel Appointment"
                                                            style={btnStyle('var(--color-error)')}
                                                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-error-light)'; e.currentTarget.style.borderColor = 'var(--color-error-mid)'; }}
                                                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
                                                        >
                                                            <XCircle size={14} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Footer count */}
                {!loading && filtered.length > 0 && (
                    <div style={{
                        padding: '10px 20px', borderTop: '1px solid var(--border)',
                        fontSize: 12, color: 'var(--text-3)',
                    }}>
                        Showing {filtered.length} of {appointments.length} appointments
                    </div>
                )}
            </AnimatedCard>
        </PageWrapper>
    );
}
