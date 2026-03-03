// ═══════════════════════════════════════════════════════
// ADMIN — PATIENTS MANAGEMENT PAGE (theme-aware)
// ═══════════════════════════════════════════════════════
import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, UserRound } from 'lucide-react';
import toast from 'react-hot-toast';
import PageWrapper from '../../components/PageWrapper.jsx';
import AnimatedCard from '../../components/AnimatedCard.jsx';
import AnimatedButton from '../../components/AnimatedButton.jsx';
import DataTable from '../../components/DataTable.jsx';
import Modal from '../../components/Modal.jsx';
import FormInput from '../../components/FormInput.jsx';
import { getAllPatients, deletePatient, createPatient } from '../../services/patientService.js';
import { createUser } from '../../services/userService.js';
import { getInitials, getAvatarGradient } from '../../utils/index.js';
import { exportTableToPDF } from '../../utils/pdfExport.js';
import { useForm } from 'react-hook-form';
import { Download } from 'lucide-react';

const selectStyle = (hasError) => ({
    width: '100%', borderRadius: 8, height: 40,
    border: `1px solid ${hasError ? 'var(--color-error)' : 'var(--border-strong)'}`,
    background: 'var(--bg-input)', padding: '0 14px',
    fontSize: 13.5, color: 'var(--text-1)', outline: 'none',
    fontFamily: 'inherit', transition: 'all .15s', appearance: 'none', cursor: 'pointer',
});

const textareaStyle = {
    width: '100%', borderRadius: 8, border: '1px solid var(--border-strong)',
    background: 'var(--bg-input)', padding: '10px 14px',
    fontSize: 13.5, color: 'var(--text-1)', outline: 'none',
    fontFamily: 'inherit', resize: 'none', transition: 'all .15s',
};

export default function AdminPatients() {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const load = async () => {
        setLoading(true);
        const data = await getAllPatients();
        setPatients(data);
        setLoading(false);
    };
    useEffect(() => { load(); }, []);

    const onSubmit = async (data) => {
        setSubmitting(true);
        try {
            const user = await createUser({ name: data.name, email: data.email, password: data.password, role: 'patient' });
            await createPatient({ user_id: user.id, age: Number(data.age), gender: data.gender, phone: data.phone, address: data.address });
            toast.success('Patient added!');
            setShowModal(false); reset(); load();
        } catch (err) { toast.error(err.message); }
        finally { setSubmitting(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Remove this patient?')) return;
        await deletePatient(id);
        toast.success('Patient removed');
        load();
    };

    const handleExport = () => {
        const columns = ['ID', 'Name', 'Email', 'Age', 'Gender', 'Phone', 'Address'];
        const data = patients.map(row => [
            row.id,
            row.user?.name || 'N/A',
            row.user?.email || 'N/A',
            row.age,
            row.gender,
            row.phone,
            row.address
        ]);
        exportTableToPDF('Registered Patients List', columns, data, 'Patients_List');
    };

    const actionBtnStyle = (color) => ({
        padding: '6px', borderRadius: 7, border: '1px solid transparent',
        background: 'transparent', cursor: 'pointer', display: 'flex',
        transition: 'all .15s', color,
    });

    const columns = [
        {
            key: 'user',
            label: 'Patient',
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
        {
            key: 'age', label: 'Age', sortable: true,
            render: (age) => <span style={{ color: 'var(--text-2)', fontSize: 13.5 }}>{age} yrs</span>
        },
        {
            key: 'gender', label: 'Gender',
            render: (gender) => (
                <span style={{
                    padding: '3px 10px', borderRadius: 99, fontSize: 11.5, fontWeight: 600,
                    background: gender === 'Male' ? 'var(--color-primary-light)' : 'rgba(236,72,153,.1)',
                    color: gender === 'Male' ? 'var(--color-primary)' : '#BE185D',
                    border: `1px solid ${gender === 'Male' ? 'var(--color-primary-mid)' : 'rgba(236,72,153,.2)'}`,
                }}>
                    {gender}
                </span>
            )
        },
        { key: 'phone', label: 'Phone' },
        {
            key: 'address', label: 'Address',
            render: (a) => (
                <span style={{
                    color: 'var(--text-3)', fontSize: 12.5,
                    maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap', display: 'block',
                }}>{a}</span>
            )
        },
        {
            key: 'id', label: 'Actions',
            render: (_, row) => (
                <div style={{ display: 'flex', gap: 4 }}>
                    <button
                        aria-label={`Edit ${row.user?.name}`}
                        style={actionBtnStyle('var(--color-primary)')}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-primary-light)'; e.currentTarget.style.borderColor = 'var(--color-primary-mid)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
                    >
                        <Edit2 size={14} />
                    </button>
                    <button
                        aria-label={`Delete ${row.user?.name}`}
                        onClick={() => handleDelete(row.id)}
                        style={actionBtnStyle('var(--color-error)')}
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
            title="Patients"
            subtitle={`${patients.length} registered patients`}
            actions={<AnimatedButton icon={Plus} size="sm" onClick={() => setShowModal(true)}>Add Patient</AnimatedButton>}
        >
            <AnimatedCard hover={false} padding="p-0">
                <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
                    <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-1)' }}>Patient Registry</h2>
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
                    data={patients}
                    loading={loading}
                    searchable
                    searchKeys={['user.name', 'phone', 'gender']}
                    emptyMessage="No patients found"
                />
            </AnimatedCard>

            <Modal
                isOpen={showModal}
                onClose={() => { setShowModal(false); reset(); }}
                title="Register New Patient"
                footer={
                    <>
                        <AnimatedButton variant="ghost" onClick={() => setShowModal(false)}>Cancel</AnimatedButton>
                        <AnimatedButton loading={submitting} onClick={handleSubmit(onSubmit)} icon={UserRound}>Register</AnimatedButton>
                    </>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <FormInput label="Full Name" placeholder="Alice Johnson" error={errors.name?.message} required
                        {...register('name', { required: 'Required' })} />
                    <FormInput label="Email" type="email" placeholder="patient@email.com" error={errors.email?.message} required
                        {...register('email', { required: 'Required' })} />
                    <FormInput label="Password" type="password" placeholder="Min 6 characters" error={errors.password?.message} required
                        {...register('password', { required: 'Required', minLength: { value: 6, message: 'Min 6 chars' } })} />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <FormInput label="Age" type="number" placeholder="30" error={errors.age?.message} required
                            {...register('age', { required: 'Required' })} />
                        <div>
                            <label style={{
                                display: 'block', fontSize: 11.5, fontWeight: 600, textTransform: 'uppercase',
                                letterSpacing: '.05em', color: 'var(--text-2)', marginBottom: 6,
                            }}>Gender <span style={{ color: 'var(--color-error)' }} aria-hidden="true">*</span></label>
                            <select
                                {...register('gender', { required: 'Required' })}
                                style={selectStyle(!!errors.gender)}
                                onFocus={e => { e.target.style.borderColor = 'var(--color-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(30,90,168,0.12)'; }}
                                onBlur={e => { e.target.style.borderColor = 'var(--border-strong)'; e.target.style.boxShadow = 'none'; }}
                            >
                                <option value="">Select gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                            {errors.gender && <p style={{ margin: 0, marginTop: 4, fontSize: 11.5, color: 'var(--color-error)' }}>{errors.gender.message}</p>}
                        </div>
                    </div>

                    <FormInput label="Phone" placeholder="+1-555-0100" error={errors.phone?.message} required
                        {...register('phone', { required: 'Required' })} />

                    <div>
                        <label style={{
                            display: 'block', fontSize: 11.5, fontWeight: 600, textTransform: 'uppercase',
                            letterSpacing: '.05em', color: 'var(--text-2)', marginBottom: 6,
                        }}>Address</label>
                        <textarea
                            {...register('address')}
                            rows={2}
                            placeholder="123 Main St, City, State"
                            style={textareaStyle}
                            onFocus={e => { e.target.style.borderColor = 'var(--color-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(30,90,168,0.12)'; }}
                            onBlur={e => { e.target.style.borderColor = 'var(--border-strong)'; e.target.style.boxShadow = 'none'; }}
                        />
                    </div>
                </div>
            </Modal>
        </PageWrapper>
    );
}
