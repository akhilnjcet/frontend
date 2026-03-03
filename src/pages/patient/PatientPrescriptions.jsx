// ═══════════════════════════════════════════════════════
// PATIENT - PRESCRIPTIONS PAGE
// ═══════════════════════════════════════════════════════
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Pill, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import PageWrapper from '../../components/PageWrapper.jsx';
import AnimatedButton from '../../components/AnimatedButton.jsx';
import { getPatientByUserId } from '../../services/patientService.js';
import { getAppointmentsByPatient } from '../../services/appointmentService.js';
import { useAuthStore } from '../../store/index.js';
import { formatDate, getInitials, getAvatarGradient } from '../../utils/index.js';
import { exportTableToPDF } from '../../utils/pdfExport.js';

export default function PatientPrescriptions() {
    const { user } = useAuthStore();
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const patient = await getPatientByUserId(user.id);
            const appts = await getAppointmentsByPatient(patient.id);
            const rxs = appts
                .filter(a => a.prescription)
                .map(a => ({
                    ...a.prescription,
                    doctor: a.doctor,
                    date: a.appointment_date,
                }))
                .sort((a, b) => new Date(b.date) - new Date(a.date));
            setPrescriptions(rxs);
            setLoading(false);
        };
        load();
    }, []);

    const handleDownload = (rx) => {
        const columns = ['Record ID', 'Patient', 'Doctor', 'Date', 'Diagnosis', 'Notes'];
        const data = [[
            `RX-${rx.id}`,
            user.name || 'N/A', // user contains patient name
            rx.doctor?.user?.name || 'N/A',
            formatDate(rx.date),
            rx.diagnosis,
            rx.note
        ]];
        exportTableToPDF(`Prescription: #RX-${rx.id}`, columns, data, `Prescription_RX${rx.id}`);
    };

    if (loading) {
        return (
            <PageWrapper title="My Prescriptions">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-48 rounded-2xl" />)}
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper title="My Prescriptions" subtitle={`${prescriptions.length} prescriptions from your doctors`}>
            {prescriptions.length === 0 ? (
                <div className="flex flex-col items-center py-20 text-gray-500">
                    <Pill size={48} className="mb-4 opacity-30" />
                    <p className="text-sm">No prescriptions yet</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {prescriptions.map((rx, idx) => (
                        <motion.div
                            key={rx.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.06 }}
                            className="bg-slate-800/60 border border-white/8 rounded-2xl overflow-hidden hover:border-teal-500/30 transition-all group"
                        >
                            {/* Header strip */}
                            <div className="h-1.5 w-full bg-gradient-to-r from-teal-600 to-blue-600" />
                            <div className="p-5">
                                {/* Doctor info */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold"
                                            style={{ background: getAvatarGradient(rx.doctor?.user?.name) }}>
                                            {getInitials(rx.doctor?.user?.name)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-white">{rx.doctor?.user?.name}</p>
                                            <p className="text-xs text-gray-500">{rx.doctor?.specialization}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-500">{formatDate(rx.date, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                </div>

                                {/* Diagnosis */}
                                <div className="bg-teal-500/10 border border-teal-500/20 rounded-xl p-3 mb-3">
                                    <p className="text-xs text-teal-400 font-semibold uppercase tracking-wider mb-1">Diagnosis</p>
                                    <p className="text-sm text-white font-medium">{rx.diagnosis}</p>
                                </div>

                                {/* Notes */}
                                <div className="mb-4">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                        <Pill size={10} /> Instructions
                                    </p>
                                    <p className="text-xs text-gray-400 leading-relaxed">{rx.note}</p>
                                </div>

                                {/* Download button */}
                                <AnimatedButton
                                    variant="secondary"
                                    size="sm"
                                    fullWidth
                                    icon={Download}
                                    onClick={() => handleDownload(rx)}
                                    className="opacity-70 group-hover:opacity-100 transition-opacity"
                                >
                                    Download Prescription
                                </AnimatedButton>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </PageWrapper>
    );
}
