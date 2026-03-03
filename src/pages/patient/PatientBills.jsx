// ═══════════════════════════════════════════════════════
// PATIENT - BILLS PAGE
// ═══════════════════════════════════════════════════════
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Download, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import PageWrapper from '../../components/PageWrapper.jsx';
import StatCard from '../../components/StatCard.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import AnimatedButton from '../../components/AnimatedButton.jsx';
import { getPatientByUserId } from '../../services/patientService.js';
import { getBillsByPatient } from '../../services/billService.js';
import { useAuthStore } from '../../store/index.js';
import { formatDate, formatCurrency } from '../../utils/index.js';
import { exportTableToPDF } from '../../utils/pdfExport.js';

export default function PatientBills() {
    const { user } = useAuthStore();
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const patient = await getPatientByUserId(user.id);
            const b = await getBillsByPatient(patient.id);
            setBills(b.sort((a, b_) => new Date(b_.created_at) - new Date(a.created_at)));
            setLoading(false);
        };
        load();
    }, []);

    const paid = bills.filter(b => b.status === 'Paid');
    const pending = bills.filter(b => b.status === 'Pending');
    const totalPaid = paid.reduce((sum, b) => sum + b.amount, 0);
    const totalPending = pending.reduce((sum, b) => sum + b.amount, 0);

    const handleDownload = (bill) => {
        const columns = ['Bill ID', 'Date', 'Doctor', 'Specialization', 'Amount', 'Status'];
        const data = [[
            `B-${bill.id}`,
            formatDate(bill.created_at),
            bill.appointment?.doctor?.user?.name || 'N/A',
            bill.appointment?.doctor?.specialization || 'N/A',
            formatCurrency(bill.amount),
            bill.status
        ]];
        exportTableToPDF(`Receipt: Bill #B-${bill.id}`, columns, data, `Receipt_B${bill.id}`);
    };

    if (loading) {
        return (
            <PageWrapper title="My Bills">
                <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper title="Billing & Payments" subtitle="Your complete billing history">
            {/* Summary stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard title="Total Paid" value={totalPaid} icon={CheckCircle} color="green" prefix="$" delay={0} />
                <StatCard title="Pending Amount" value={totalPending} icon={Clock} color="orange" prefix="$" delay={1} />
                <StatCard title="Total Bills" value={bills.length} icon={CreditCard} color="blue" delay={2} />
            </div>

            {bills.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-gray-500">
                    <CreditCard size={48} className="mb-4 opacity-30" />
                    <p className="text-sm">No bills found</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {bills.map((bill, idx) => (
                        <motion.div
                            key={bill.id}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className={`flex items-center gap-4 p-4 rounded-2xl border transition-all hover:shadow-lg ${bill.status === 'Paid'
                                ? 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40'
                                : 'bg-yellow-500/5 border-yellow-500/20 hover:border-yellow-500/40'
                                }`}
                        >
                            {/* Icon */}
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${bill.status === 'Paid' ? 'bg-emerald-500/20' : 'bg-yellow-500/20'
                                }`}>
                                {bill.status === 'Paid' ? (
                                    <CheckCircle size={20} className="text-emerald-400" />
                                ) : (
                                    <Clock size={20} className="text-yellow-400" />
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-white text-sm">{bill.appointment?.doctor?.user?.name}</p>
                                <p className="text-xs text-gray-400">{bill.appointment?.doctor?.specialization}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{formatDate(bill.created_at, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                            </div>

                            {/* Amount */}
                            <div className="text-right flex-shrink-0">
                                <p className={`text-xl font-bold ${bill.status === 'Paid' ? 'text-emerald-400' : 'text-yellow-400'}`}>
                                    {formatCurrency(bill.amount)}
                                </p>
                                <StatusBadge status={bill.status} size="sm" showDot={false} />
                            </div>

                            {/* Download */}
                            <AnimatedButton
                                variant="ghost"
                                size="icon"
                                icon={Download}
                                onClick={() => handleDownload(bill)}
                                className="flex-shrink-0"
                                title="Download bill"
                            />
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Payment note */}
            {pending.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4"
                >
                    <p className="text-sm text-yellow-300 font-semibold mb-1">💳 Outstanding Balance</p>
                    <p className="text-xs text-yellow-300/70">
                        You have {pending.length} pending bill{pending.length > 1 ? 's' : ''} totaling <strong>{formatCurrency(totalPending)}</strong>.
                        Please contact the billing department to clear your balance.
                    </p>
                </motion.div>
            )}
        </PageWrapper>
    );
}
