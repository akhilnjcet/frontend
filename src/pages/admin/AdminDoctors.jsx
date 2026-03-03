// ═══════════════════════════════════════════════════════
// ADMIN — DOCTORS MANAGEMENT PAGE (theme-aware)
// ═══════════════════════════════════════════════════════
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Stethoscope, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import PageWrapper from '../../components/PageWrapper.jsx';
import AnimatedCard from '../../components/AnimatedCard.jsx';
import AnimatedButton from '../../components/AnimatedButton.jsx';
import DataTable from '../../components/DataTable.jsx';
import Modal from '../../components/Modal.jsx';
import FormInput from '../../components/FormInput.jsx';
import { getAllDoctors, createDoctor, deleteDoctor } from '../../services/doctorService.js';
import { getAllDepartments } from '../../services/departmentService.js';
import { createUser } from '../../services/userService.js';
import { getInitials, getAvatarGradient, formatCurrency } from '../../utils/index.js';
import { exportTableToPDF } from '../../utils/pdfExport.js';
import { useForm } from 'react-hook-form';
import { Download } from 'lucide-react';

export default function AdminDoctors() {
    const [doctors, setDoctors] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const load = async () => {
        setLoading(true);
        const [docs, depts] = await Promise.all([getAllDoctors(), getAllDepartments()]);
        setDoctors(docs);
        setDepartments(depts);
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const onSubmit = async (data) => {
        setSubmitting(true);
        try {
            const user = await createUser({ name: data.name, email: data.email, password: data.password, role: 'doctor' });
            await createDoctor({ user_id: user.id, department_id: Number(data.department_id), specialization: data.specialization, fee: Number(data.fee) });
            toast.success('Doctor added successfully!');
            setShowModal(false);
            reset();
            load();
        } catch (err) { toast.error(err.message); }
        finally { setSubmitting(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Remove this doctor?')) return;
        await deleteDoctor(id);
        toast.success('Doctor removed');
        load();
    };

    const handleExport = () => {
        const columns = ['ID', 'Name', 'Email', 'Department', 'Specialization', 'Fee'];
        const data = doctors.map(row => [
            row.id,
            row.user?.name || 'N/A',
            row.user?.email || 'N/A',
            row.department?.name || 'N/A',
            row.specialization,
            formatCurrency(row.fee)
        ]);
        exportTableToPDF('Active Doctors Registry', columns, data, 'Doctors_Registry');
    };

    const columns = [
        {
            key: 'user',
            label: 'Doctor',
            render: (_, row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 9,
                        background: getAvatarGradient(row.user?.name),
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: 12, fontWeight: 700, flexShrink: 0,
                    }}>
                        {getInitials(row.user?.name)}
                    </div>
                    <div>
                        <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: 'var(--text-1)' }}>{row.user?.name}</p>
                        <p style={{ margin: 0, fontSize: 11.5, color: 'var(--text-3)', marginTop: 1 }}>{row.user?.email}</p>
                    </div>
                </div>
            )
        },
        { key: 'specialization', label: 'Specialization', sortable: true },
        {
            key: 'department',
            label: 'Department',
            render: (_, row) => (
                <span style={{
                    padding: '3px 10px', borderRadius: 99, fontSize: 11.5, fontWeight: 600,
                    background: 'var(--color-primary-light)', color: 'var(--color-primary)',
                    border: '1px solid var(--color-primary-mid)',
                }}>
                    {row.department?.name}
                </span>
            )
        },
        {
            key: 'fee',
            label: 'Consultation Fee',
            render: (fee) => (
                <span style={{ color: 'var(--color-success)', fontWeight: 700, fontSize: 13.5 }}>
                    {formatCurrency(fee)}
                </span>
            )
        },
        {
            key: 'id',
            label: 'Actions',
            render: (_, row) => (
                <div style={{ display: 'flex', gap: 4 }}>
                    <button
                        aria-label={`Edit ${row.user?.name}`}
                        style={{
                            padding: '6px', borderRadius: 7, border: '1px solid transparent',
                            background: 'transparent', color: 'var(--color-primary)',
                            cursor: 'pointer', display: 'flex', transition: 'all .15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-primary-light)'; e.currentTarget.style.borderColor = 'var(--color-primary-mid)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
                    >
                        <Edit2 size={14} />
                    </button>
                    <button
                        aria-label={`Delete ${row.user?.name}`}
                        onClick={() => handleDelete(row.id)}
                        style={{
                            padding: '6px', borderRadius: 7, border: '1px solid transparent',
                            background: 'transparent', color: 'var(--color-error)',
                            cursor: 'pointer', display: 'flex', transition: 'all .15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-error-light)'; e.currentTarget.style.borderColor = 'rgba(214,69,69,.2)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            )
        },
    ];

    return (
        <PageWrapper
            title="Doctors"
            subtitle={`${doctors.length} registered doctors`}
            actions={
                <AnimatedButton icon={Plus} size="sm" onClick={() => setShowModal(true)}>Add Doctor</AnimatedButton>
            }
        >
            {/* Department stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
                {departments.map((dept, idx) => (
                    <motion.div
                        key={dept.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.04 }}
                        style={{
                            background: 'var(--bg-card)', border: '1px solid var(--border)',
                            borderRadius: 10, padding: '16px', textAlign: 'center',
                            boxShadow: 'var(--shadow-card)', transition: 'all .2s',
                            cursor: 'default',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-primary-mid)'; e.currentTarget.style.background = 'var(--color-primary-light)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-card)'; }}
                    >
                        <p style={{ margin: 0, fontSize: 24, fontWeight: 800, color: 'var(--color-primary)', fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
                            {dept.doctorCount}
                        </p>
                        <p style={{ margin: 0, fontSize: 11.5, color: 'var(--text-3)', marginTop: 6 }}>{dept.name}</p>
                    </motion.div>
                ))}
            </div>

            <AnimatedCard hover={false} padding="p-0">
                <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
                    <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-1)' }}>Doctor Registry</h2>
                    <button
                        onClick={handleExport}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
                            background: 'var(--bg-panel)', border: '1px solid var(--border-strong)',
                            borderRadius: 8, fontSize: 12.5, fontWeight: 600, color: 'var(--text-2)',
                            cursor: 'pointer', transition: 'all .15s'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-1)'; e.currentTarget.style.background = 'var(--bg-hover)'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.background = 'var(--bg-panel)'; }}
                    >
                        <Download size={14} /> Export PDF
                    </button>
                </div>
                <DataTable
                    columns={columns}
                    data={doctors}
                    loading={loading}
                    searchable
                    searchKeys={['user.name', 'specialization', 'department.name']}
                    emptyMessage="No doctors found"
                />
            </AnimatedCard>

            {/* Add Doctor Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => { setShowModal(false); reset(); }}
                title="Add New Doctor"
                size="md"
                footer={
                    <>
                        <AnimatedButton variant="ghost" onClick={() => setShowModal(false)}>Cancel</AnimatedButton>
                        <AnimatedButton loading={submitting} onClick={handleSubmit(onSubmit)} icon={Stethoscope}>Add Doctor</AnimatedButton>
                    </>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <FormInput label="Full Name" placeholder="Dr. John Smith" error={errors.name?.message} required
                        {...register('name', { required: 'Name is required' })} />
                    <FormInput label="Email" type="email" placeholder="doctor@medicare.pro" error={errors.email?.message} required
                        {...register('email', { required: 'Email is required' })} />
                    <FormInput label="Password" type="password" placeholder="Min 6 characters" error={errors.password?.message} required
                        {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })} />
                    <FormInput label="Specialization" placeholder="e.g. Cardiologist" error={errors.specialization?.message} required
                        {...register('specialization', { required: 'Required' })} />

                    <div>
                        <label style={{
                            display: 'block', fontSize: 11.5, fontWeight: 600, textTransform: 'uppercase',
                            letterSpacing: '.05em', color: 'var(--text-2)', marginBottom: 6,
                        }}>
                            Department <span style={{ color: 'var(--color-error)' }} aria-hidden="true">*</span>
                        </label>
                        <select
                            {...register('department_id', { required: 'Required' })}
                            style={{
                                width: '100%', borderRadius: 8, border: `1px solid ${errors.department_id ? 'var(--color-error)' : 'var(--border-strong)'}`,
                                background: 'var(--bg-input)', padding: '0 14px', height: 40,
                                fontSize: 13.5, color: 'var(--text-1)', outline: 'none', fontFamily: 'inherit',
                                transition: 'all .15s', appearance: 'none',
                                cursor: 'pointer',
                            }}
                            onFocus={e => { e.target.style.borderColor = 'var(--color-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(30,90,168,0.12)'; }}
                            onBlur={e => { e.target.style.borderColor = errors.department_id ? 'var(--color-error)' : 'var(--border-strong)'; e.target.style.boxShadow = 'none'; }}
                        >
                            <option value="">Select Department</option>
                            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                        {errors.department_id && (
                            <p style={{ fontSize: 11.5, color: 'var(--color-error)', marginTop: 4 }}>{errors.department_id.message}</p>
                        )}
                    </div>

                    <FormInput label="Consultation Fee ($)" type="number" placeholder="250" error={errors.fee?.message} required
                        {...register('fee', { required: 'Required', min: { value: 1, message: 'Must be > 0' } })} />
                </div>
            </Modal>
        </PageWrapper>
    );
}
