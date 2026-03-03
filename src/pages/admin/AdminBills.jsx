// ═══════════════════════════════════════════════════════
// ADMIN - BILLS MANAGEMENT
// ═══════════════════════════════════════════════════════
import { useEffect, useState } from 'react';
import { CheckCircle, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import PageWrapper from '../../components/PageWrapper.jsx';
import AnimatedCard from '../../components/AnimatedCard.jsx';
import StatCard from '../../components/StatCard.jsx';
import DataTable from '../../components/DataTable.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import AnimatedButton from '../../components/AnimatedButton.jsx';
import { getAllBills, updateBillStatus, getTotalRevenue } from '../../services/billService.js';
import { formatCurrency, formatDate } from '../../utils/index.js';
import { exportTableToPDF } from '../../utils/pdfExport.js';
import { Download } from 'lucide-react';

export default function AdminBills() {
    const [bills, setBills] = useState([]);
    const [revenue, setRevenue] = useState({ totalPaid: 0, totalPending: 0 });
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        const [b, r] = await Promise.all([getAllBills(), getTotalRevenue()]);
        setBills(b); setRevenue(r);
        setLoading(false);
    };
    useEffect(() => { load(); }, []);

    const markPaid = async (id) => {
        await updateBillStatus(id, 'Paid');
        toast.success('Bill marked as paid!');
        load();
    };

    const handleExport = () => {
        const columns = ['ID', 'Patient', 'Doctor', 'Amount', 'Status', 'Date'];
        const data = bills.map(row => [
            row.id,
            row.appointment?.patient?.user?.name || 'N/A',
            row.appointment?.doctor?.user?.name || 'N/A',
            formatCurrency(row.amount),
            row.status,
            formatDate(row.created_at)
        ]);
        exportTableToPDF('Admin Financial Report', columns, data, 'Admin_Financial_Report');
    };

    const columns = [
        { key: 'id', label: '#', render: (id) => <span className="text-gray-500 text-xs">#{id}</span> },
        { key: 'appointment', label: 'Patient', render: (_, row) => <span className="text-white font-medium">{row.appointment?.patient?.user?.name}</span> },
        { key: 'appointment', label: 'Doctor', render: (_, row) => <span className="text-gray-300">{row.appointment?.doctor?.user?.name}</span> },
        {
            key: 'amount',
            label: 'Amount',
            sortable: true,
            render: (amount) => <span className="text-white font-bold">{formatCurrency(amount)}</span>
        },
        { key: 'status', label: 'Status', render: (s) => <StatusBadge status={s} /> },
        { key: 'created_at', label: 'Date', render: (d) => <span className="text-gray-400 text-sm">{formatDate(d, { month: 'short', day: 'numeric' })}</span> },
        {
            key: 'id',
            label: 'Actions',
            render: (_, row) => row.status === 'Pending' ? (
                <AnimatedButton size="xs" variant="success" icon={CheckCircle} onClick={() => markPaid(row.id)}>
                    Mark Paid
                </AnimatedButton>
            ) : <span className="text-xs text-emerald-400">✓ Paid</span>
        },
    ];

    return (
        <PageWrapper title="Bills & Payments" subtitle="Track all hospital billing">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard title="Total Revenue" value={revenue.totalPaid} icon={DollarSign} color="green" prefix="$" delay={0} />
                <StatCard title="Pending Payments" value={revenue.totalPending} icon={DollarSign} color="orange" prefix="$" delay={1} />
                <StatCard title="Total Bills" value={bills.length} icon={CheckCircle} color="purple" delay={2} />
            </div>
            <AnimatedCard hover={false}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-white">All Bills</h2>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-sm font-medium text-gray-300 hover:bg-slate-700 hover:text-white transition-colors"
                    >
                        <Download size={14} /> Export PDF
                    </button>
                </div>
                <DataTable
                    columns={columns}
                    data={bills}
                    loading={loading}
                    searchable
                    searchKeys={['appointment.patient.user.name', 'status']}
                    emptyMessage="No bills found"
                />
            </AnimatedCard>
        </PageWrapper>
    );
}
