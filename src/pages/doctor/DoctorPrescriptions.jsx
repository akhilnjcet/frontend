// ═══════════════════════════════════════════════════════
// DOCTOR - PRESCRIPTIONS PAGE
// ═══════════════════════════════════════════════════════
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download } from 'lucide-react';
import PageWrapper from '../../components/PageWrapper.jsx';
import AnimatedCard from '../../components/AnimatedCard.jsx';
import { getDoctorByUserId } from '../../services/doctorService.js';
import { getAppointmentsByDoctor } from '../../services/appointmentService.js';
import { useAuthStore } from '../../store/index.js';
import { formatDate, getInitials, getAvatarGradient } from '../../utils/index.js';
import { exportTableToPDF } from '../../utils/pdfExport.js';
import AnimatedButton from '../../components/AnimatedButton.jsx';

export default function DoctorPrescriptions() {
    const { user } = useAuthStore();
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const doc = await getDoctorByUserId(user.id);
            const appts = await getAppointmentsByDoctor(doc.id);
            const rxs = appts.filter(a => a.prescription).map(a => ({
                ...a.prescription,
                patient: a.patient,
                date: a.appointment_date,
            }));
            setPrescriptions(rxs);
            setLoading(false);
        };
        load();
    }, []);

    if (loading) return <PageWrapper title="Prescriptions"><div className="skeleton h-48 rounded-2xl" /></PageWrapper>;

    const handleExport = () => {
        const columns = ['Rx ID', 'Patient', 'Date', 'Diagnosis', 'Notes'];
        const data = prescriptions.map(rx => [
            rx.id,
            rx.patient?.user?.name || 'N/A',
            formatDate(rx.date),
            rx.diagnosis,
            rx.note
        ]);
        exportTableToPDF('Recent Prescriptions History', columns, data, 'Doctor_Prescriptions');
    };

    return (
        <PageWrapper
            title="Prescriptions"
            subtitle={`${prescriptions.length} prescriptions written`}
            actions={
                <AnimatedButton icon={Download} size="sm" onClick={handleExport}>
                    Export History
                </AnimatedButton>
            }
        >
            {prescriptions.length === 0 ? (
                <div className="flex flex-col items-center py-20 text-gray-500">
                    <FileText size={48} className="mb-4 opacity-30" />
                    <p>No prescriptions yet</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {prescriptions.map((rx, idx) => (
                        <motion.div
                            key={rx.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-slate-800/60 border border-white/8 rounded-2xl p-5 hover:border-teal-500/30 transition-all"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                    style={{ background: getAvatarGradient(rx.patient?.user?.name) }}>
                                    {getInitials(rx.patient?.user?.name)}
                                </div>
                                <div>
                                    <p className="font-semibold text-white">{rx.patient?.user?.name}</p>
                                    <p className="text-xs text-gray-500">{formatDate(rx.date, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                </div>
                                <span className="ml-auto text-xs px-2 py-1 bg-teal-500/15 text-teal-300 rounded-full border border-teal-500/20">
                                    #{rx.id}
                                </span>
                            </div>
                            <div className="space-y-2">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Diagnosis</p>
                                    <p className="text-sm font-semibold text-white">{rx.diagnosis}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Notes</p>
                                    <p className="text-xs text-gray-400 leading-relaxed">{rx.note}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </PageWrapper>
    );
}
