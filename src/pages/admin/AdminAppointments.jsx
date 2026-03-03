// ═══════════════════════════════════════════════════════
// ADMIN - APPOINTMENTS MANAGEMENT PAGE
// ═══════════════════════════════════════════════════════
import { useEffect, useState } from 'react';
import { Calendar, CheckCircle, XCircle, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import PageWrapper from '../../components/PageWrapper.jsx';
import AnimatedCard from '../../components/AnimatedCard.jsx';
import DataTable from '../../components/DataTable.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import Modal from '../../components/Modal.jsx';
import AnimatedButton from '../../components/AnimatedButton.jsx';
import { getAllAppointments, updateAppointmentStatus } from '../../services/appointmentService.js';
import { formatDate, formatTime, formatCurrency } from '../../utils/index.js';
import { exportTableToPDF } from '../../utils/pdfExport.js';
import { Download } from 'lucide-react';

export default function AdminAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);

    const load = async () => {
        setLoading(true);
        const data = await getAllAppointments();
        setAppointments(data);
        setLoading(false);
    };
    useEffect(() => { load(); }, []);

    const handleStatus = async (id, status) => {
        await updateAppointmentStatus(id, status);
        toast.success(`Appointment ${status.toLowerCase()}`);
        load();
    };

    const handleExport = () => {
        const columns = ['ID', 'Patient', 'Doctor', 'Date', 'Time', 'Status', 'Bill Amount'];
        const data = appointments.map(row => [
            row.id,
            row.patient?.user?.name || 'N/A',
            row.doctor?.user?.name || 'N/A',
            formatDate(row.appointment_date),
            formatTime(row.appointment_time),
            row.status,
            row.bill ? formatCurrency(row.bill.amount) : 'N/A'
        ]);
        exportTableToPDF('Admin Appointments Report', columns, data, 'Admin_Appointments_Report');
    };

    const columns = [
        { key: 'id', label: '#', render: (id) => <span className="text-gray-500 text-xs">#{id}</span> },
        {
            key: 'patient',
            label: 'Patient',
            render: (_, row) => (
                <span className="text-white font-medium">{row.patient?.user?.name}</span>
            )
        },
        {
            key: 'doctor',
            label: 'Doctor',
            render: (_, row) => (
                <span className="text-gray-300">{row.doctor?.user?.name}</span>
            )
        },
        {
            key: 'appointment_date',
            label: 'Date',
            sortable: true,
            render: (d) => <span className="text-gray-300 text-sm">{formatDate(d, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        },
        { key: 'appointment_time', label: 'Time', render: (t) => <span className="text-gray-400 text-sm">{formatTime(t)}</span> },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            render: (s) => <StatusBadge status={s} />
        },
        {
            key: 'bill',
            label: 'Bill',
            render: (_, row) => row.bill
                ? <span className={`text-sm font-semibold ${row.bill.status === 'Paid' ? 'text-emerald-400' : 'text-yellow-400'}`}>{formatCurrency(row.bill.amount)}</span>
                : <span className="text-gray-600">—</span>
        },
        {
            key: 'id',
            label: 'Actions',
            render: (_, row) => (
                <div className="flex gap-1.5">
                    <button onClick={() => setSelected(row)} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors" title="View"><Eye size={14} /></button>
                    {row.status === 'Scheduled' && (
                        <>
                            <button onClick={() => handleStatus(row.id, 'Completed')} className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-400/10 transition-colors" title="Complete"><CheckCircle size={14} /></button>
                            <button onClick={() => handleStatus(row.id, 'Cancelled')} className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors" title="Cancel"><XCircle size={14} /></button>
                        </>
                    )}
                </div>
            )
        },
    ];

    return (
        <PageWrapper title="Appointments" subtitle={`${appointments.length} total appointments`}>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: 'Scheduled', status: 'Scheduled', color: 'blue', icon: '📅' },
                    { label: 'Completed', status: 'Completed', color: 'green', icon: '✅' },
                    { label: 'Cancelled', status: 'Cancelled', color: 'red', icon: '❌' },
                ].map(s => (
                    <div key={s.label} className={`bg-slate-800/60 border border-${s.color}-500/20 rounded-xl p-4 text-center`}>
                        <p className="text-2xl mb-1">{s.icon}</p>
                        <p className="text-xl font-bold text-white">{appointments.filter(a => a.status === s.status).length}</p>
                        <p className="text-xs text-gray-500">{s.label}</p>
                    </div>
                ))}
            </div>

            <AnimatedCard hover={false}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-white">All Appointments</h2>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-sm font-medium text-gray-300 hover:bg-slate-700 hover:text-white transition-colors"
                    >
                        <Download size={14} /> Export PDF
                    </button>
                </div>
                <DataTable
                    columns={columns}
                    data={appointments}
                    loading={loading}
                    searchable
                    searchKeys={['patient.user.name', 'doctor.user.name', 'status']}
                    emptyMessage="No appointments found"
                />
            </AnimatedCard>

            {/* Detail Modal */}
            <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Appointment Details" size="md">
                {selected && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: 'Patient', value: selected.patient?.user?.name },
                                { label: 'Doctor', value: selected.doctor?.user?.name },
                                { label: 'Date', value: formatDate(selected.appointment_date) },
                                { label: 'Time', value: formatTime(selected.appointment_time) },
                                { label: 'Status', value: null },
                                { label: 'Amount', value: selected.bill ? formatCurrency(selected.bill.amount) : 'N/A' },
                            ].map(({ label, value }) => (
                                <div key={label} className="bg-slate-800/60 rounded-xl p-3">
                                    <p className="text-xs text-gray-500 mb-1">{label}</p>
                                    {label === 'Status' ? <StatusBadge status={selected.status} /> : <p className="text-sm font-medium text-white">{value}</p>}
                                </div>
                            ))}
                        </div>
                        {selected.prescription && (
                            <div className="bg-slate-800/60 rounded-xl p-4">
                                <p className="text-xs text-gray-500 mb-2">Prescription</p>
                                <p className="text-sm font-semibold text-teal-400">{selected.prescription.diagnosis}</p>
                                <p className="text-xs text-gray-400 mt-1">{selected.prescription.note}</p>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </PageWrapper>
    );
}
