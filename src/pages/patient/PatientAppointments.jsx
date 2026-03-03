// ═══════════════════════════════════════════════════════
// PATIENT - MY APPOINTMENTS PAGE
// ═══════════════════════════════════════════════════════
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, FileText, ChevronDown, Download } from 'lucide-react';
import PageWrapper from '../../components/PageWrapper.jsx';
import AnimatedCard from '../../components/AnimatedCard.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import AnimatedButton from '../../components/AnimatedButton.jsx';
import { getPatientByUserId } from '../../services/patientService.js';
import { getAppointmentsByPatient } from '../../services/appointmentService.js';
import { useAuthStore } from '../../store/index.js';
import { formatDate, formatTime, formatCurrency, getInitials, getAvatarGradient } from '../../utils/index.js';
import { exportTableToPDF } from '../../utils/pdfExport.js';

const FILTERS = ['All', 'Scheduled', 'Completed', 'Cancelled'];

export default function PatientAppointments() {
    const { user } = useAuthStore();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [expanded, setExpanded] = useState(null);

    useEffect(() => {
        const load = async () => {
            const patient = await getPatientByUserId(user.id);
            const appts = await getAppointmentsByPatient(patient.id);
            setAppointments(appts.sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date)));
            setLoading(false);
        };
        load();
    }, []);

    const filtered = filter === 'All' ? appointments : appointments.filter(a => a.status === filter);

    if (loading) {
        return (
            <PageWrapper title="My Appointments">
                <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>
            </PageWrapper>
        );
    }

    const handleExport = () => {
        const columns = ['Doctor', 'Specialization', 'Date', 'Time', 'Status', 'Bill'];
        const data = filtered.map(appt => [
            appt.doctor?.user?.name || 'N/A',
            appt.doctor?.specialization || 'N/A',
            formatDate(appt.appointment_date),
            formatTime(appt.appointment_time),
            appt.status,
            appt.bill ? formatCurrency(appt.bill.amount) : 'Free'
        ]);
        exportTableToPDF('My Appointments History', columns, data, 'Patient_Appointments');
    };

    return (
        <PageWrapper
            title="My Appointments"
            subtitle={`${appointments.length} total appointments`}
            actions={
                <AnimatedButton icon={Download} size="sm" onClick={handleExport}>
                    Export History
                </AnimatedButton>
            }
        >
            {/* Filter tabs */}
            <div className="flex flex-wrap gap-2">
                {FILTERS.map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${filter === f
                            ? 'bg-blue-600 text-white border-blue-500'
                            : 'bg-slate-800/60 text-gray-400 border-white/10 hover:border-blue-500/30 hover:text-white'
                            }`}
                    >
                        {f}
                        <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${filter === f ? 'bg-white/20' : 'bg-white/5'}`}>
                            {f === 'All' ? appointments.length : appointments.filter(a => a.status === f).length}
                        </span>
                    </button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-gray-500">
                    <Calendar size={48} className="mb-4 opacity-30" />
                    <p className="text-sm">No {filter.toLowerCase()} appointments</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((appt, idx) => (
                        <motion.div
                            key={appt.id}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.04 }}
                            className="bg-slate-800/60 border border-white/8 rounded-2xl overflow-hidden"
                        >
                            {/* Card header */}
                            <div
                                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-white/3 transition-colors"
                                onClick={() => setExpanded(expanded === appt.id ? null : appt.id)}
                            >
                                <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                                    style={{ background: getAvatarGradient(appt.doctor?.user?.name) }}>
                                    {getInitials(appt.doctor?.user?.name)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-white">{appt.doctor?.user?.name}</p>
                                    <p className="text-xs text-gray-400">{appt.doctor?.specialization}</p>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-sm text-white font-medium">{formatDate(appt.appointment_date, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                        <p className="text-xs text-gray-400">{formatTime(appt.appointment_time)}</p>
                                    </div>
                                    <StatusBadge status={appt.status} size="sm" />
                                    <ChevronDown
                                        size={16}
                                        className={`text-gray-400 transition-transform ${expanded === appt.id ? 'rotate-180' : ''}`}
                                    />
                                </div>
                            </div>

                            {/* Expanded details */}
                            <motion.div
                                initial={false}
                                animate={{ height: expanded === appt.id ? 'auto' : 0 }}
                                className="overflow-hidden"
                            >
                                <div className="px-4 pb-4 border-t border-white/8 pt-4">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                                        <div className="bg-slate-900/60 rounded-xl p-3">
                                            <p className="text-xs text-gray-500 flex items-center gap-1 mb-1"><Calendar size={10} /> Date</p>
                                            <p className="text-sm text-white">{formatDate(appt.appointment_date, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                                        </div>
                                        <div className="bg-slate-900/60 rounded-xl p-3">
                                            <p className="text-xs text-gray-500 flex items-center gap-1 mb-1"><Clock size={10} /> Time</p>
                                            <p className="text-sm text-white">{formatTime(appt.appointment_time)}</p>
                                        </div>
                                        <div className="bg-slate-900/60 rounded-xl p-3">
                                            <p className="text-xs text-gray-500 mb-1">Bill</p>
                                            <p className={`text-sm font-bold ${appt.bill?.status === 'Paid' ? 'text-emerald-400' : 'text-yellow-400'}`}>
                                                {appt.bill ? formatCurrency(appt.bill.amount) : 'N/A'}
                                            </p>
                                        </div>
                                        <div className="bg-slate-900/60 rounded-xl p-3">
                                            <p className="text-xs text-gray-500 mb-1">Bill Status</p>
                                            {appt.bill ? <StatusBadge status={appt.bill.status} size="sm" /> : <span className="text-gray-600 text-sm">—</span>}
                                        </div>
                                    </div>

                                    {appt.prescription && (
                                        <div className="bg-teal-500/10 border border-teal-500/20 rounded-xl p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <FileText size={14} className="text-teal-400" />
                                                <p className="text-sm font-semibold text-teal-300">Prescription</p>
                                            </div>
                                            <p className="text-sm text-white font-medium mb-1">{appt.prescription.diagnosis}</p>
                                            <p className="text-xs text-gray-400 leading-relaxed">{appt.prescription.note}</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </motion.div>
                    ))}
                </div>
            )}
        </PageWrapper>
    );
}
