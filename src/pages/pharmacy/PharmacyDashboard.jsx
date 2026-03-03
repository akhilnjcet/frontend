// ═══════════════════════════════════════════════════════
// PHARMACY DASHBOARD — Dedicated Role View
// ═══════════════════════════════════════════════════════
import { useState } from 'react';
import { Search, Info, CheckCircle, Package, Receipt, Boxes, TrendingUp, AlertTriangle, Truck, Plus, X } from 'lucide-react';
import PageWrapper from '../../components/PageWrapper.jsx';
import Modal from '../../components/Modal.jsx';
import AnimatedCard from '../../components/AnimatedCard.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import AnimatedButton from '../../components/AnimatedButton.jsx';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { exportTableToPDF } from '../../utils/pdfExport.js';
import { Download } from 'lucide-react';

// Dummy JSON Data Simulation for Pharmacy Queue
const INITIAL_ORDERS = [
    { id: 'RX-1029', patient: 'Alice Johnson', doctor: 'Dr. Arjun Kumar', medicines: ['Lisinopril 10mg', 'Aspirin 75mg'], status: 'Pending', date: '2023-10-24' },
    { id: 'RX-1030', patient: 'Bob Smith', doctor: 'Dr. Arjun Kumar', medicines: ['Metformin 500mg'], status: 'Dispensed', date: '2023-10-24' },
    { id: 'RX-1031', patient: 'Charlie Davis', doctor: 'Dr. Arjun Kumar', medicines: ['Albuterol Inhaler'], status: 'Pending', date: '2023-10-23' },
    { id: 'RX-1035', patient: 'Diana Prince', doctor: 'Dr. Sarah Lee', medicines: ['Ibuprofen 400mg', 'Amoxicillin 500mg'], status: 'Pending', date: '2023-10-25' },
    { id: 'RX-1040', patient: 'Ethan Hunt', doctor: 'Dr. Arjun Kumar', medicines: ['Paracetamol 500mg'], status: 'Pending', date: '2023-10-26' },
];

const INITIAL_SALES = [
    { id: 'INV-2041', date: '2023-10-24', patient: 'Alice Johnson', items: 2, total: '$45.00', status: 'Paid' },
    { id: 'INV-2042', date: '2023-10-24', patient: 'Bob Smith', items: 1, total: '$12.50', status: 'Paid' },
    { id: 'INV-2043', date: '2023-10-23', patient: 'Walk-in Customer', items: 3, total: '$28.00', status: 'Paid' },
    { id: 'INV-2044', date: '2023-10-23', patient: 'Charlie Davis', items: 1, total: '$85.00', status: 'Pending' },
    { id: 'INV-2045', date: '2023-10-22', patient: 'Diana Prince', items: 2, total: '$32.00', status: 'Paid' },
];

import { inventory } from '../../mock/database.js';

const INITIAL_SUPPLIER_ORDERS = [
    { id: 'PO-3001', supplier: 'PharmaCorp Global', items: 'Amoxicillin, Lisinopril', orderDate: '2023-10-22', expectedDelivery: '2023-10-28', amount: '$4,250.00', status: 'In Transit' },
    { id: 'PO-3002', supplier: 'HealthPlus Logistics', items: 'Paracetamol', orderDate: '2023-10-25', expectedDelivery: '2023-10-29', amount: '$850.00', status: 'Processing' },
    { id: 'PO-3003', supplier: 'MedEquip Pro', items: 'Albuterol Inhalers', orderDate: '2023-10-20', expectedDelivery: '2023-10-24', amount: '$1,200.00', status: 'Delivered' },
];

export default function PharmacyDashboard() {
    const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'sales', 'stocks', 'supplier_orders'

    const [orders, setOrders] = useState(INITIAL_ORDERS);
    const [supplierOrders, setSupplierOrders] = useState(INITIAL_SUPPLIER_ORDERS);
    const [stocks, setStocks] = useState(inventory);
    const [sales] = useState(INITIAL_SALES);

    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    // Modal States
    const [isStockModalOpen, setIsStockModalOpen] = useState(false);
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

    // Form States
    const [newStock, setNewStock] = useState({ name: '', category: 'Analgesics', stock: '', unit: 'Tablets' });
    const [newOrder, setNewOrder] = useState({ supplier: '', items: '', amount: '' });

    const markDispensed = (id) => {
        setOrders(prev => prev.map(order =>
            order.id === id ? { ...order, status: 'Dispensed' } : order
        ));
        toast.success(`Order ${id} marked as Dispensed!`);
    };

    const filteredOrders = orders.filter(
        order => {
            const matchesSearch = order.patient.toLowerCase().includes(search.toLowerCase()) ||
                order.id.toLowerCase().includes(search.toLowerCase());
            const matchesStatus = filterStatus === 'All' || order.status === filterStatus;
            return matchesSearch && matchesStatus;
        }
    );

    const filteredSales = sales.filter(
        sale => sale.patient.toLowerCase().includes(search.toLowerCase()) ||
            sale.id.toLowerCase().includes(search.toLowerCase())
    );

    const filteredStocks = stocks.filter(
        stock => stock.name.toLowerCase().includes(search.toLowerCase()) ||
            stock.id.toLowerCase().includes(search.toLowerCase())
    );

    const filteredSupplierOrders = supplierOrders.filter(
        order => order.supplier.toLowerCase().includes(search.toLowerCase()) ||
            order.id.toLowerCase().includes(search.toLowerCase())
    );

    // Handlers
    const handleAddStock = (e) => {
        e.preventDefault();
        if (!newStock.name || !newStock.stock) return toast.error('Please fill required fields');

        const qty = parseInt(newStock.stock);
        const status = qty === 0 ? 'Out of Stock' : (qty < 50 ? 'Low Stock' : 'In Stock');

        const stockItem = {
            id: `MED-${Math.floor(100 + Math.random() * 900)}`,
            ...newStock,
            stock: qty,
            status
        };

        setStocks([stockItem, ...stocks]);
        setIsStockModalOpen(false);
        setNewStock({ name: '', category: 'Analgesics', stock: '', unit: 'Tablets' });
        toast.success(`Successfully added ${stockItem.name} to inventory!`);
    };

    const handlePlaceOrder = (e) => {
        e.preventDefault();
        if (!newOrder.supplier || !newOrder.items) return toast.error('Please fill required fields');

        const orderItem = {
            id: `PO-${Math.floor(3000 + Math.random() * 900)}`,
            ...newOrder,
            orderDate: new Date().toISOString().split('T')[0],
            expectedDelivery: 'Pending',
            amount: newOrder.amount ? `$${newOrder.amount}` : '$0.00',
            status: 'Processing'
        };

        setSupplierOrders([orderItem, ...supplierOrders]);
        setIsOrderModalOpen(false);
        setNewOrder({ supplier: '', items: '', amount: '' });
        toast.success(`Order placed with ${orderItem.supplier}!`);
    };

    const handleExportSalesPDF = () => {
        if (filteredSales.length === 0) {
            return toast.error("No sales records available to export.");
        }

        const doc = new jsPDF();

        // Adding Title
        doc.setFontSize(18);
        doc.text("Pharmacy Sales Report", 14, 22);

        // Subtitle
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

        // Table Setup
        const tableColumn = ["Invoice ID", "Date", "Patient Name", "Items Count", "Total Amount", "Status"];
        const tableRows = [];

        filteredSales.forEach(sale => {
            const saleData = [
                sale.id,
                sale.date,
                sale.patient,
                sale.items,
                sale.total,
                sale.status,
            ];
            tableRows.push(saleData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 40,
            theme: 'grid',
            headStyles: { fillColor: [59, 130, 246] }
        });

        doc.save("Pharmacy_Sales_Report.pdf");
        toast.success("Sales report downloaded successfully.");
    };

    const handleExportStocksPDF = () => {
        if (filteredStocks.length === 0) return toast.error("No inventory records to export.");
        const columns = ['Item ID', 'Medicine Name', 'Category', 'Stock Level', 'Status'];
        const data = filteredStocks.map(s => [
            s.id,
            s.name,
            s.category,
            `${s.stock} ${s.unit}`,
            s.status
        ]);
        exportTableToPDF('Pharmacy Inventory Report', columns, data, 'Pharmacy_Inventory');
    };

    const handleExportOrdersPDF = () => {
        if (filteredSupplierOrders.length === 0) return toast.error("No supplier orders to export.");
        const columns = ['Order ID', 'Supplier', 'Items Ordered', 'Order Date', 'Expected Delivery', 'Amount', 'Status'];
        const data = filteredSupplierOrders.map(o => [
            o.id,
            o.supplier,
            o.items,
            o.orderDate,
            o.expectedDelivery,
            o.amount,
            o.status
        ]);
        exportTableToPDF('Supplier Orders Report', columns, data, 'Pharmacy_Supplier_Orders');
    };

    return (
        <PageWrapper title="Pharmacy Portal" subtitle="Manage prescriptions, track sales, and monitor inventory.">

            {/* Tabs Navigation */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24, borderBottom: '1px solid var(--border)' }}>
                <button
                    onClick={() => setActiveTab('orders')}
                    style={{
                        padding: '12px 20px', background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8,
                        color: activeTab === 'orders' ? 'var(--color-primary)' : 'var(--text-3)',
                        borderBottom: activeTab === 'orders' ? '2px solid var(--color-primary)' : '2px solid transparent',
                        transition: 'all 0.2s', marginBottom: -1
                    }}
                >
                    <Package size={16} /> Prescription Orders
                </button>
                <button
                    onClick={() => setActiveTab('sales')}
                    style={{
                        padding: '12px 20px', background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8,
                        color: activeTab === 'sales' ? 'var(--color-primary)' : 'var(--text-3)',
                        borderBottom: activeTab === 'sales' ? '2px solid var(--color-primary)' : '2px solid transparent',
                        transition: 'all 0.2s', marginBottom: -1
                    }}
                >
                    <Receipt size={16} /> Sales & Invoices
                </button>
                <button
                    onClick={() => setActiveTab('stocks')}
                    style={{
                        padding: '12px 20px', background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8,
                        color: activeTab === 'stocks' ? 'var(--color-primary)' : 'var(--text-3)',
                        borderBottom: activeTab === 'stocks' ? '2px solid var(--color-primary)' : '2px solid transparent',
                        transition: 'all 0.2s', marginBottom: -1
                    }}
                >
                    <Boxes size={16} /> Inventory / Stocks
                </button>
                <button
                    onClick={() => setActiveTab('supplier_orders')}
                    style={{
                        padding: '12px 20px', background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8,
                        color: activeTab === 'supplier_orders' ? 'var(--color-primary)' : 'var(--text-3)',
                        borderBottom: activeTab === 'supplier_orders' ? '2px solid var(--color-primary)' : '2px solid transparent',
                        transition: 'all 0.2s', marginBottom: -1
                    }}
                >
                    <Truck size={16} /> Supplier Orders
                </button>
            </div>

            {/* Content Area */}
            {activeTab === 'orders' && (
                <AnimatedCard hover={false} key="tab-orders">
                    {/* Info Banner */}
                    <div className="alert alert-info" style={{ marginBottom: 24 }}>
                        <div className="alert-icon alert-icon-info"><Info size={18} /></div>
                        <div>
                            <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: 'var(--color-info)' }}>Active Pharmacy Queue</p>
                            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-1)', marginTop: 2 }}>
                                Review prescriptions sent directly by doctors and dispense the medications below.
                            </p>
                        </div>
                    </div>

                    {/* Search & Filters */}
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
                        <div style={{ flex: 1, position: 'relative', minWidth: 250 }}>
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
                            />
                        </div>

                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            style={{
                                padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border-strong)',
                                background: 'var(--bg-input)', fontSize: 13.5, color: 'var(--text-1)', outline: 'none'
                            }}
                        >
                            <option value="All">All Statuses</option>
                            <option value="Pending">Pending Only</option>
                            <option value="Dispensed">Dispensed Only</option>
                        </select>
                    </div>

                    {/* Orders Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                        {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                            <div key={order.id} style={{
                                display: 'flex', flexDirection: 'column', gap: 16, padding: '20px',
                                background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 12,
                                position: 'relative', overflow: 'hidden'
                            }}>
                                {/* Color Accent line */}
                                <div style={{
                                    position: 'absolute', top: 0, left: 0, bottom: 0, width: 4,
                                    background: order.status === 'Pending' ? 'var(--color-warning)' : 'var(--color-success)'
                                }} />

                                {/* Header Info */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-1)' }}>{order.patient}</h3>
                                            <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 600 }}>{order.id}</span>
                                        </div>
                                        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-2)' }}>Prescribed by {order.doctor} on {order.date}</p>
                                    </div>
                                    <StatusBadge status={order.status === 'Pending' ? 'Scheduled' : 'Completed'} label={order.status} size="sm" />
                                </div>

                                {/* Medicines List */}
                                <div style={{ background: 'var(--bg-card)', padding: '12px 16px', borderRadius: 8, border: '1px dashed var(--border-strong)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, color: 'var(--text-2)', fontSize: 13, fontWeight: 600 }}>
                                        <Package size={14} /> Medicines to Dispense:
                                    </div>
                                    <ul style={{ margin: 0, paddingLeft: 24, fontSize: 13.5, color: 'var(--text-1)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                                        {order.medicines.map((med, i) => (
                                            <li key={i}>{med}</li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 'auto' }}>
                                    {order.status === 'Pending' ? (
                                        <AnimatedButton
                                            icon={CheckCircle}
                                            onClick={() => markDispensed(order.id)}
                                            style={{ background: 'var(--color-success)', color: '#fff', width: '100%', justifyContent: 'center' }}
                                        >
                                            Mark as Dispensed
                                        </AnimatedButton>
                                    ) : (
                                        <div style={{
                                            width: '100%', padding: '10px', textAlign: 'center', borderRadius: 8,
                                            background: 'var(--color-success-light)', color: 'var(--color-success)',
                                            fontSize: 13, fontWeight: 600, border: '1px solid rgba(16,185,129,0.2)'
                                        }}>
                                            Completed
                                        </div>
                                    )}
                                </div>
                            </div>
                        )) : (
                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 20px', color: 'var(--text-3)', background: 'var(--bg-panel)', borderRadius: 12 }}>
                                No pharmacy orders found matching your search.
                            </div>
                        )}
                    </div>
                </AnimatedCard>
            )}

            {activeTab === 'sales' && (
                <AnimatedCard hover={false} key="tab-sales">
                    <div style={{ display: 'flex', gap: 16, marginBottom: 24, alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ flex: 1, position: 'relative', maxWidth: 400 }}>
                            <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} size={16} />
                            <input
                                type="text"
                                placeholder="Search by Invoice ID or Patient Name..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{
                                    width: '100%', padding: '10px 14px 10px 40px', borderRadius: 8,
                                    border: '1px solid var(--border-strong)', background: 'var(--bg-input)',
                                    fontSize: 13.5, color: 'var(--text-1)', outline: 'none'
                                }}
                            />
                        </div>
                        <AnimatedButton
                            icon={TrendingUp}
                            variant="primary"
                            onClick={handleExportSalesPDF}
                        >
                            Export Sales Report
                        </AnimatedButton>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table className="tbl">
                            <thead>
                                <tr>
                                    <th>Invoice ID</th>
                                    <th>Date</th>
                                    <th>Patient / Customer</th>
                                    <th>Items Count</th>
                                    <th>Total Amount</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSales.map((sale) => (
                                    <tr key={sale.id}>
                                        <td style={{ fontWeight: 600, color: 'var(--text-1)' }}>{sale.id}</td>
                                        <td>{sale.date}</td>
                                        <td>{sale.patient}</td>
                                        <td>{sale.items} items</td>
                                        <td style={{ fontWeight: 700 }}>{sale.total}</td>
                                        <td><StatusBadge status={sale.status === 'Paid' ? 'Completed' : 'Cancelled'} label={sale.status} size="sm" /></td>
                                    </tr>
                                ))}
                                {filteredSales.length === 0 && (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-3)' }}>
                                            No sales records found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </AnimatedCard>
            )}

            {activeTab === 'stocks' && (
                <AnimatedCard hover={false} key="tab-stocks">
                    <div style={{ display: 'flex', gap: 16, marginBottom: 24, alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ flex: 1, position: 'relative', maxWidth: 400 }}>
                            <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} size={16} />
                            <input
                                type="text"
                                placeholder="Search by Medicine Name or ID..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{
                                    width: '100%', padding: '10px 14px 10px 40px', borderRadius: 8,
                                    border: '1px solid var(--border-strong)', background: 'var(--bg-input)',
                                    fontSize: 13.5, color: 'var(--text-1)', outline: 'none'
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <AnimatedButton
                                icon={Download}
                                variant="secondary"
                                onClick={handleExportStocksPDF}
                            >
                                Export Inventory
                            </AnimatedButton>
                            <AnimatedButton
                                icon={Package}
                                variant="primary"
                                onClick={() => setIsStockModalOpen(true)}
                            >
                                Add New Stock
                            </AnimatedButton>
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table className="tbl">
                            <thead>
                                <tr>
                                    <th>Item ID</th>
                                    <th>Medicine Name</th>
                                    <th>Category</th>
                                    <th>Stock Level</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStocks.map((stock) => (
                                    <tr key={stock.id}>
                                        <td style={{ fontWeight: 600, color: 'var(--text-1)' }}>{stock.id}</td>
                                        <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{stock.name}</td>
                                        <td>{stock.category}</td>
                                        <td>
                                            <span style={{
                                                fontWeight: 700,
                                                color: stock.stock === 0 ? 'var(--color-error)' : (stock.stock < 50 ? 'var(--color-warning)' : 'var(--text-1)')
                                            }}>
                                                {stock.stock} {stock.unit}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{
                                                padding: '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em',
                                                background: stock.status === 'In Stock' ? 'var(--color-success-light)' : (stock.status === 'Out of Stock' ? 'var(--color-error-light)' : 'var(--color-warning-light)'),
                                                color: stock.status === 'In Stock' ? 'var(--color-success)' : (stock.status === 'Out of Stock' ? 'var(--color-error)' : 'var(--color-warning)'),
                                                border: `1px solid ${stock.status === 'In Stock' ? 'rgba(16,185,129,0.2)' : (stock.status === 'Out of Stock' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)')}`
                                            }}>
                                                {stock.status === 'Out of Stock' && <AlertTriangle size={10} style={{ display: 'inline', marginRight: 4, transform: 'translateY(-1px)' }} />}
                                                {stock.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {filteredStocks.length === 0 && (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-3)' }}>
                                            No inventory records found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </AnimatedCard>
            )}

            {activeTab === 'supplier_orders' && (
                <AnimatedCard hover={false} key="tab-supplier">
                    <div style={{ display: 'flex', gap: 16, marginBottom: 24, alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ flex: 1, position: 'relative', maxWidth: 400 }}>
                            <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} size={16} />
                            <input
                                type="text"
                                placeholder="Search by Order ID or Supplier Name..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{
                                    width: '100%', padding: '10px 14px 10px 40px', borderRadius: 8,
                                    border: '1px solid var(--border-strong)', background: 'var(--bg-input)',
                                    fontSize: 13.5, color: 'var(--text-1)', outline: 'none'
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <AnimatedButton
                                icon={Download}
                                variant="secondary"
                                onClick={handleExportOrdersPDF}
                            >
                                Export Orders
                            </AnimatedButton>
                            <AnimatedButton
                                icon={Truck}
                                variant="primary"
                                onClick={() => setIsOrderModalOpen(true)}
                            >
                                Place New Order
                            </AnimatedButton>
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table className="tbl">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Supplier</th>
                                    <th>Items Ordered</th>
                                    <th>Order Date</th>
                                    <th>Expected Delivery</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSupplierOrders.map((order) => (
                                    <tr key={order.id}>
                                        <td style={{ fontWeight: 600, color: 'var(--text-1)' }}>{order.id}</td>
                                        <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{order.supplier}</td>
                                        <td>
                                            <span style={{ fontSize: 13, background: 'var(--bg-input)', padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border)' }}>
                                                {order.items}
                                            </span>
                                        </td>
                                        <td>{order.orderDate}</td>
                                        <td>{order.expectedDelivery}</td>
                                        <td style={{ fontWeight: 700 }}>{order.amount}</td>
                                        <td>
                                            <span style={{
                                                padding: '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em',
                                                background: order.status === 'Delivered' ? 'var(--color-success-light)' : (order.status === 'Processing' ? 'var(--color-warning-light)' : 'var(--color-info-light)'),
                                                color: order.status === 'Delivered' ? 'var(--color-success)' : (order.status === 'Processing' ? 'var(--color-warning)' : 'var(--color-info)'),
                                                border: `1px solid ${order.status === 'Delivered' ? 'rgba(16,185,129,0.2)' : (order.status === 'Processing' ? 'rgba(245,158,11,0.2)' : 'rgba(59,130,246,0.2)')}`
                                            }}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {filteredSupplierOrders.length === 0 && (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-3)' }}>
                                            No supplier orders found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </AnimatedCard>
            )}

            {/* Modals */}
            <Modal isOpen={isStockModalOpen} onClose={() => setIsStockModalOpen(false)} title="Add New Stock">
                <form onSubmit={handleAddStock} style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
                    <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>Medicine Name</label>
                        <input type="text" className="input" placeholder="e.g. Paracetamol 500mg" required
                            value={newStock.name} onChange={e => setNewStock({ ...newStock, name: e.target.value })} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>Category</label>
                            <select className="input" value={newStock.category} onChange={e => setNewStock({ ...newStock, category: e.target.value })}>
                                <option>Analgesics</option>
                                <option>Antibiotics</option>
                                <option>NSAIDs</option>
                                <option>Vitamins</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>Unit</label>
                            <select className="input" value={newStock.unit} onChange={e => setNewStock({ ...newStock, unit: e.target.value })}>
                                <option>Tablets</option>
                                <option>Capsules</option>
                                <option>Syrup (Bottles)</option>
                                <option>Inhalers</option>
                                <option>Tubes</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>Quantity Available</label>
                        <input type="number" className="input" placeholder="0" min="0" required
                            value={newStock.stock} onChange={e => setNewStock({ ...newStock, stock: e.target.value })} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
                        <AnimatedButton variant="ghost" onClick={() => setIsStockModalOpen(false)} type="button">Cancel</AnimatedButton>
                        <AnimatedButton variant="primary" icon={Plus} type="submit">Add Stock</AnimatedButton>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isOrderModalOpen} onClose={() => setIsOrderModalOpen(false)} title="Place Supplier Order">
                <form onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
                    <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>Supplier Name</label>
                        <input type="text" className="input" placeholder="e.g. PharmaCorp Global" required
                            value={newOrder.supplier} onChange={e => setNewOrder({ ...newOrder, supplier: e.target.value })} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>Items to Order (Comma separated)</label>
                        <input type="text" className="input" placeholder="e.g. Amoxicillin, Paracetamol..." required
                            value={newOrder.items} onChange={e => setNewOrder({ ...newOrder, items: e.target.value })} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>Estimated Amount (Optional)</label>
                        <input type="number" className="input" placeholder="e.g. 500" min="0"
                            value={newOrder.amount} onChange={e => setNewOrder({ ...newOrder, amount: e.target.value })} />
                    </div>

                    <div className="alert alert-warning" style={{ marginTop: 8 }}>
                        <div className="alert-icon alert-icon-warning"><Info size={16} /></div>
                        <p style={{ margin: 0, fontSize: 13, color: 'var(--color-warning)' }}>
                            Orders will automatically be logged as "Processing".
                        </p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
                        <AnimatedButton variant="ghost" onClick={() => setIsOrderModalOpen(false)} type="button">Cancel</AnimatedButton>
                        <AnimatedButton variant="primary" icon={Truck} type="submit">Submit Order</AnimatedButton>
                    </div>
                </form>
            </Modal>

        </PageWrapper>
    );
}
