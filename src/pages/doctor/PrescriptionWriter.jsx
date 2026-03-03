// ═══════════════════════════════════════════════════════
// PRESCRIPTION WRITER — Full-featured, PDF + Print
// Route: /doctor/prescriptions/write?appointmentId=...
// ═══════════════════════════════════════════════════════
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';

import {
    ArrowLeft, Printer, Download, Plus, Trash2,
    HeartPulse, Calendar, Stethoscope, PenLine, Save,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getDoctorByUserId } from '../../services/doctorService.js';
import { getAppointmentsByDoctor } from '../../services/appointmentService.js';
import { prescriptions, inventory } from '../../mock/database.js';
import { useAuthStore } from '../../store/index.js';
import { formatDate, formatTime } from '../../utils/index.js';

/* ─── Printable Rx styles injected into <head> when printing ─── */
const PRINT_STYLES = `
@media print {
  body * { visibility: hidden !important; }
  #rx-printable, #rx-printable * { visibility: visible !important; }
  #rx-printable {
    position: fixed !important;
    top: 0; left: 0;
    width: 100vw;
    z-index: 99999;
    background: #fff !important;
  }
  @page { margin: 12mm 14mm; size: A4 portrait; }
}
`;

/* ─── Helpers ─── */
const Field = ({ label, value }) => (
    <div style={{ marginBottom: 4 }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: '#6B7C93' }}>{label}: </span>
        <span style={{ fontSize: 13, color: '#1F2933', fontWeight: 500 }}>{value || '—'}</span>
    </div>
);

export default function PrescriptionWriter() {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const appointmentId = searchParams.get('appointmentId');

    const [doctor, setDoctor] = useState(null);
    const [appointment, setAppointment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saved, setSaved] = useState(false);


    const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
        defaultValues: {
            diagnosis: '',
            chiefComplaint: '',
            vitals: { bp: '', temp: '', pulse: '', weight: '', height: '' },
            medicines: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
            tests: '',
            advice: '',
            followUpDate: '',
            notes: '',
        },
    });

    const [activeDropdownIndex, setActiveDropdownIndex] = useState(null);

    const { fields, append, remove } = useFieldArray({ control, name: 'medicines' });

    useEffect(() => {
        const load = async () => {
            try {
                const doc = await getDoctorByUserId(user.id);
                setDoctor(doc);
                const appts = await getAppointmentsByDoctor(doc.id);
                const found = appts.find(a => String(a.id) === String(appointmentId));
                setAppointment(found || null);
            } finally { setLoading(false); }
        };
        load();
    }, [appointmentId]);

    /* ─── Save handler ─── */
    const onSave = (data) => {
        const rx = {
            id: Date.now(),
            appointment_id: Number(appointmentId),
            doctor_id: doctor?.id,
            patient_id: appointment?.patient?.id,
            created_at: new Date().toISOString(),
            diagnosis: data.diagnosis,
            note: data.notes,
            medicines: data.medicines,
            tests: data.tests,
            advice: data.advice,
            followUpDate: data.followUpDate,
            vitals: data.vitals,
            chiefComplaint: data.chiefComplaint,
        };
        prescriptions.push(rx);
        setSaved(true);
        toast.success('Prescription saved successfully!');
    };

    /* ─── Print handler ─── */
    const handlePrint = () => {
        const styleEl = document.createElement('style');
        styleEl.innerHTML = PRINT_STYLES;
        document.head.appendChild(styleEl);
        window.print();
        setTimeout(() => document.head.removeChild(styleEl), 1000);
    };

    /* ─── Download as PDF via browser print dialog (Save as PDF) ─── */
    const handleDownloadPDF = () => {
        toast(`Use "Save as PDF" in the print dialog`, { icon: '🖨️', duration: 3000 });
        setTimeout(() => handlePrint(), 800);
    };

    const rxDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const rxNo = `RX-${Date.now().toString().slice(-6)}`;
    const patient = appointment?.patient;
    const watchedData = watch();

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
                <div style={{ textAlign: 'center', color: 'var(--text-3)' }}>
                    <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 0.8s linear infinite' }} />
                    Loading prescription details…
                </div>
            </div>
        );
    }

    if (!appointment) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 12 }}>
                <p style={{ color: 'var(--text-2)', fontSize: 15 }}>Appointment not found.</p>
                <button className="btn btn-primary btn-sm" onClick={() => navigate('/doctor')}>← Back to Dashboard</button>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-app)', padding: '24px 24px 60px' }}>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

            {/* ── Top bar ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)',
                            background: 'var(--bg-card)', color: 'var(--text-2)', cursor: 'pointer',
                            fontSize: 13, fontWeight: 600, fontFamily: 'inherit', transition: 'all .15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-primary-mid)'; e.currentTarget.style.color = 'var(--color-primary)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-2)'; }}
                    >
                        <ArrowLeft size={15} /> Back
                    </button>
                    <div style={{ paddingLeft: 12, borderLeft: '3px solid var(--color-primary)' }}>
                        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--text-1)', fontFamily: "'Plus Jakarta Sans','Inter',sans-serif", letterSpacing: '-.02em' }}>
                            Write Prescription
                        </h1>
                        <p style={{ margin: 0, fontSize: 12.5, color: 'var(--text-3)', marginTop: 2 }}>
                            {patient?.user?.name} · {formatDate(appointment.appointment_date)}
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                    <button
                        onClick={handleDownloadPDF}
                        className="btn btn-ghost btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: 7 }}
                    >
                        <Download size={14} /> Download PDF
                    </button>
                    <button
                        onClick={handlePrint}
                        className="btn btn-ghost btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: 7 }}
                    >
                        <Printer size={14} /> Print
                    </button>
                    <button
                        onClick={handleSubmit(onSave)}
                        className="btn btn-primary btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: 7 }}
                    >
                        <Save size={14} /> {saved ? 'Saved ✓' : 'Save Prescription'}
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 340px', gap: 20, maxWidth: 1400, margin: '0 auto' }}>

                {/* ══════════════════════════════════════════════════
                    LEFT — EDITOR (Input forms)
                ═══════════════════════════════════════════════════ */}
                <motion.div
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: .3 }}
                    style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
                >
                    {/* Chief complaint */}
                    <div style={cardStyle}>
                        <SectionHeading icon={PenLine} label="Chief Complaint & Diagnosis" />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 16 }}>
                            <FormGroup label="Chief Complaint *">
                                <textarea
                                    {...register('chiefComplaint', { required: true })}
                                    rows={2}
                                    placeholder="Patient's primary complaint…"
                                    style={textareaStyle(!!errors.chiefComplaint)}
                                    onFocus={focusStyle} onBlur={blurStyle}
                                />
                            </FormGroup>
                            <FormGroup label="Diagnosis *">
                                <textarea
                                    {...register('diagnosis', { required: true })}
                                    rows={2}
                                    placeholder="Clinical diagnosis…"
                                    style={textareaStyle(!!errors.diagnosis)}
                                    onFocus={focusStyle} onBlur={blurStyle}
                                />
                                {errors.diagnosis && <p style={errStyle}>Diagnosis is required</p>}
                            </FormGroup>
                        </div>
                    </div>

                    {/* Vitals */}
                    <div style={cardStyle}>
                        <SectionHeading icon={HeartPulse} label="Vitals" />
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12, marginTop: 16 }}>
                            {[
                                { key: 'vitals.bp', label: 'Blood Pressure', ph: '120/80 mmHg' },
                                { key: 'vitals.temp', label: 'Temperature', ph: '98.6 °F' },
                                { key: 'vitals.pulse', label: 'Pulse Rate', ph: '72 bpm' },
                                { key: 'vitals.weight', label: 'Weight', ph: '70 kg' },
                                { key: 'vitals.height', label: 'Height', ph: '175 cm' },
                            ].map(v => (
                                <FormGroup key={v.key} label={v.label}>
                                    <input
                                        {...register(v.key)}
                                        placeholder={v.ph}
                                        style={inputStyle}
                                        onFocus={focusStyle} onBlur={blurStyle}
                                    />
                                </FormGroup>
                            ))}
                        </div>
                    </div>

                    {/* Medicines */}
                    <div style={cardStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <SectionHeading icon={Stethoscope} label="Medicines" />
                            <button
                                type="button"
                                onClick={() => append({ name: '', dosage: '', frequency: '', duration: '', instructions: '' })}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px',
                                    borderRadius: 7, border: '1px solid var(--color-primary-mid)',
                                    background: 'var(--color-primary-light)', color: 'var(--color-primary)',
                                    fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                                    transition: 'all .15s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--color-primary-mid)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'var(--color-primary-light)'}
                            >
                                <Plus size={13} /> Add Medicine
                            </button>
                        </div>

                        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {fields.map((field, idx) => (
                                <motion.div
                                    key={field.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{
                                        padding: 14, borderRadius: 10,
                                        border: '1px solid var(--border)',
                                        background: 'var(--bg-panel)',
                                        position: 'relative',
                                    }}
                                >
                                    <div style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10,
                                    }}>
                                        <span style={{
                                            fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.07em',
                                            color: 'var(--color-primary)',
                                        }}>
                                            Rx {idx + 1}
                                        </span>
                                        {fields.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => remove(idx)}
                                                aria-label="Remove medicine"
                                                style={{
                                                    background: 'none', border: 'none', cursor: 'pointer',
                                                    color: 'var(--color-error)', padding: '2px', display: 'flex',
                                                    borderRadius: 5, transition: 'background .12s',
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'var(--color-error-light)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'none'}
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        )}
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 10 }}>
                                        <FormGroup label="Medicine Name *">
                                            <div style={{ position: 'relative' }}>
                                                <input
                                                    {...register(`medicines.${idx}.name`, { required: true })}
                                                    placeholder="Select a medicine..."
                                                    readOnly
                                                    style={{ ...inputStyle, cursor: 'pointer' }}
                                                    onClick={() => setActiveDropdownIndex(idx)}
                                                    onFocus={(e) => {
                                                        focusStyle(e);
                                                        setActiveDropdownIndex(idx);
                                                    }}
                                                    onBlur={(e) => {
                                                        blurStyle(e);
                                                        // Delay hiding to allow click events on dropdown items
                                                        setTimeout(() => {
                                                            if (activeDropdownIndex === idx) setActiveDropdownIndex(null);
                                                        }, 200);
                                                    }}
                                                />

                                                {/* ─── Search Dropdown ─── */}
                                                {activeDropdownIndex === idx && (
                                                    <div style={{
                                                        position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
                                                        background: '#fff', border: '1px solid var(--border)', borderRadius: 8,
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 50, maxHeight: 180, overflowY: 'auto'
                                                    }}>
                                                        {inventory.length === 0 ? (
                                                            <div style={{ padding: '10px 12px', fontSize: 12, color: 'var(--text-3)', textAlign: 'center' }}>
                                                                No medicines available
                                                            </div>
                                                        ) : (
                                                            inventory.map(med => (
                                                                <div
                                                                    key={med.id}
                                                                    onClick={() => {
                                                                        setValue(`medicines.${idx}.name`, med.name);
                                                                        setActiveDropdownIndex(null);
                                                                    }}
                                                                    style={{
                                                                        padding: '8px 12px', borderBottom: '1px solid var(--bg-app)',
                                                                        cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                                        transition: 'background 0.15s'
                                                                    }}
                                                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-app)'}
                                                                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                                                                >
                                                                    <div>
                                                                        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{med.name}</p>
                                                                        <p style={{ margin: 0, fontSize: 11, color: 'var(--text-3)' }}>{med.category}</p>
                                                                    </div>
                                                                    <div style={{ textAlign: 'right' }}>
                                                                        <span style={{
                                                                            fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase',
                                                                            background: med.status === 'In Stock' ? 'var(--color-success-light)' : (med.status === 'Out of Stock' ? 'var(--color-error-light)' : 'var(--color-warning-light)'),
                                                                            color: med.status === 'In Stock' ? 'var(--color-success)' : (med.status === 'Out of Stock' ? 'var(--color-error)' : 'var(--color-warning)')
                                                                        }}>
                                                                            {med.status}
                                                                        </span>
                                                                        <p style={{ margin: '4px 0 0', fontSize: 10, color: 'var(--text-2)' }}>
                                                                            Qty: {med.stock} {med.unit}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </FormGroup>
                                        <FormGroup label="Dosage">
                                            <input
                                                {...register(`medicines.${idx}.dosage`)}
                                                placeholder="500mg"
                                                style={inputStyle}
                                                onFocus={focusStyle} onBlur={blurStyle}
                                            />
                                        </FormGroup>
                                        <FormGroup label="Frequency">
                                            <select
                                                {...register(`medicines.${idx}.frequency`)}
                                                style={{ ...inputStyle, cursor: 'pointer', appearance: 'none' }}
                                                onFocus={focusStyle} onBlur={blurStyle}
                                            >
                                                <option value="">Select</option>
                                                <option value="Once daily">Once daily</option>
                                                <option value="Twice daily">Twice daily</option>
                                                <option value="3× daily">3× daily</option>
                                                <option value="4× daily">4× daily</option>
                                                <option value="Every 6 hrs">Every 6 hrs</option>
                                                <option value="Every 8 hrs">Every 8 hrs</option>
                                                <option value="At bedtime">At bedtime</option>
                                                <option value="As needed">As needed (PRN)</option>
                                            </select>
                                        </FormGroup>
                                        <FormGroup label="Duration">
                                            <input
                                                {...register(`medicines.${idx}.duration`)}
                                                placeholder="7 days"
                                                style={inputStyle}
                                                onFocus={focusStyle} onBlur={blurStyle}
                                            />
                                        </FormGroup>
                                    </div>
                                    <FormGroup label="Instructions" style={{ marginTop: 8 }}>
                                        <input
                                            {...register(`medicines.${idx}.instructions`)}
                                            placeholder="e.g. Take after meals with water"
                                            style={inputStyle}
                                            onFocus={focusStyle} onBlur={blurStyle}
                                        />
                                    </FormGroup>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Tests & Investigations */}
                    <div style={cardStyle}>
                        <SectionHeading icon={Calendar} label="Tests & Investigations" />
                        <div style={{ marginTop: 16 }}>
                            <textarea
                                {...register('tests')}
                                rows={3}
                                placeholder="CBC, Blood Sugar (Fasting), Lipid Profile, ECG…"
                                style={textareaStyle(false)}
                                onFocus={focusStyle} onBlur={blurStyle}
                            />
                        </div>
                    </div>

                    {/* Advice & Follow-up */}
                    <div style={cardStyle}>
                        <SectionHeading icon={PenLine} label="Advice & Follow-up" />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 16 }}>
                            <FormGroup label="General Advice">
                                <textarea
                                    {...register('advice')}
                                    rows={3}
                                    placeholder="Dietary advice, lifestyle recommendations, activity restrictions…"
                                    style={textareaStyle(false)}
                                    onFocus={focusStyle} onBlur={blurStyle}
                                />
                            </FormGroup>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <FormGroup label="Follow-up Date">
                                    <input
                                        type="date"
                                        {...register('followUpDate')}
                                        style={inputStyle}
                                        onFocus={focusStyle} onBlur={blurStyle}
                                    />
                                </FormGroup>
                                <FormGroup label="Additional Notes">
                                    <input
                                        {...register('notes')}
                                        placeholder="Any other notes…"
                                        style={inputStyle}
                                        onFocus={focusStyle} onBlur={blurStyle}
                                    />
                                </FormGroup>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ══════════════════════════════════════════════════
                    RIGHT — LIVE PRINTABLE PREVIEW
                ═════════════════════════════════════════════════ */}
                <motion.div
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: .3, delay: .05 }}
                >
                    <div style={{
                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                        borderRadius: 12, padding: '14px 14px 10px',
                        boxShadow: 'var(--shadow-card)', position: 'sticky', top: 24,
                    }}>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
                            paddingBottom: 12, borderBottom: '1px solid var(--border)',
                        }}>
                            <div style={{
                                width: 28, height: 28, borderRadius: 7,
                                background: 'var(--color-primary-light)', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Printer size={13} style={{ color: 'var(--color-primary)' }} />
                            </div>
                            <div>
                                <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, color: 'var(--text-1)' }}>Live Preview</p>
                                <p style={{ margin: 0, fontSize: 10.5, color: 'var(--text-3)' }}>As it will appear when printed</p>
                            </div>
                        </div>

                        {/* PRINTABLE PRESCRIPTION — this div gets printed */}
                        <div
                            id="rx-printable"
                            style={{
                                background: '#fff',
                                fontFamily: '"Georgia", "Times New Roman", serif',
                                color: '#1F2933',
                                fontSize: 12,
                                borderRadius: 6,
                                border: '1px solid #E2E8F0',
                                overflow: 'hidden',
                            }}
                        >
                            {/* Header band */}
                            <div style={{
                                background: 'linear-gradient(135deg, #1E5AA8, #1FA79A)',
                                padding: '16px 18px', color: '#fff',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{
                                            width: 38, height: 38, borderRadius: 8,
                                            background: 'rgba(255,255,255,.2)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            border: '1.5px solid rgba(255,255,255,.4)',
                                        }}>
                                            <HeartPulse size={18} color="#fff" strokeWidth={2} />
                                        </div>
                                        <div>
                                            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, letterSpacing: '-.02em', fontFamily: '"Plus Jakarta Sans","Inter",sans-serif' }}>
                                                MediCare<span style={{ opacity: .8 }}>Pro</span>
                                            </h2>
                                            <p style={{ margin: 0, fontSize: 9.5, opacity: .8, letterSpacing: '.05em', textTransform: 'uppercase' }}>
                                                Enterprise Hospital Management
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right', fontSize: 10 }}>
                                        <p style={{ margin: 0, fontWeight: 700, fontSize: 11 }}>{rxNo}</p>
                                        <p style={{ margin: 0, opacity: .8 }}>{rxDate}</p>
                                    </div>
                                </div>
                            </div>

                            <div style={{ padding: '14px 16px' }}>
                                {/* Doctor info */}
                                <div style={{
                                    display: 'grid', gridTemplateColumns: '1fr 1fr',
                                    gap: 12, marginBottom: 12, paddingBottom: 12,
                                    borderBottom: '1.5px solid #E2E8F0',
                                }}>
                                    <div>
                                        <p style={{ margin: '0 0 6px', fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', color: '#6B7C93' }}>Physician</p>
                                        <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: '#1E5AA8' }}>Dr. {doctor?.user?.name}</p>
                                        <p style={{ margin: 0, fontSize: 10, color: '#6B7C93', marginTop: 2 }}>{doctor?.specialization}</p>
                                        <p style={{ margin: 0, fontSize: 10, color: '#6B7C93' }}>{doctor?.department?.name}</p>
                                    </div>
                                    <div>
                                        <p style={{ margin: '0 0 6px', fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', color: '#6B7C93' }}>Contact</p>
                                        <p style={{ margin: 0, fontSize: 10, color: '#1F2933' }}>📞 {doctor?.user?.email}</p>
                                        <p style={{ margin: 0, fontSize: 10, color: '#1F2933', marginTop: 2 }}>🏥 MediCare Pro Hospital</p>
                                        <p style={{ margin: 0, fontSize: 10, color: '#1F2933', marginTop: 2 }}>📍 123 Health Street, Medical City</p>
                                    </div>
                                </div>

                                {/* Patient info */}
                                <div style={{
                                    background: '#F4F7FA', borderRadius: 7, padding: '10px 12px',
                                    marginBottom: 12, border: '1px solid #E2E8F0',
                                }}>
                                    <p style={{ margin: '0 0 6px', fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', color: '#6B7C93' }}>Patient Information</p>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                                        <Field label="Name" value={patient?.user?.name} />
                                        <Field label="Age / Gender" value={`${patient?.age} yrs / ${patient?.gender}`} />
                                        <Field label="Phone" value={patient?.phone} />
                                        <Field label="Date" value={formatDate(appointment.appointment_date)} />
                                        <Field label="Time" value={formatTime(appointment.appointment_time)} />
                                        <Field label="Appt. ID" value={`#${appointment.id}`} />
                                    </div>
                                </div>

                                {/* Vitals */}
                                {Object.values(watchedData.vitals || {}).some(v => v) && (
                                    <div style={{ marginBottom: 10 }}>
                                        <p style={{ margin: '0 0 5px', fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', color: '#6B7C93' }}>Vitals</p>
                                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                            {[
                                                ['BP', watchedData.vitals?.bp],
                                                ['Temp', watchedData.vitals?.temp],
                                                ['Pulse', watchedData.vitals?.pulse],
                                                ['Weight', watchedData.vitals?.weight],
                                                ['Height', watchedData.vitals?.height],
                                            ].filter(([, v]) => v).map(([k, v]) => (
                                                <div key={k} style={{
                                                    padding: '3px 8px', borderRadius: 4,
                                                    background: '#EBF1FA', border: '1px solid #C2D4EF',
                                                    fontSize: 10,
                                                }}>
                                                    <span style={{ color: '#6B7C93', fontWeight: 700 }}>{k}: </span>
                                                    <span style={{ color: '#1E5AA8', fontWeight: 700 }}>{v}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Chief complaint + Diagnosis */}
                                {(watchedData.chiefComplaint || watchedData.diagnosis) && (
                                    <div style={{ marginBottom: 10 }}>
                                        {watchedData.chiefComplaint && (
                                            <div style={{ marginBottom: 4 }}>
                                                <span style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.07em', color: '#6B7C93' }}>CC: </span>
                                                <span style={{ fontSize: 11, color: '#1F2933' }}>{watchedData.chiefComplaint}</span>
                                            </div>
                                        )}
                                        {watchedData.diagnosis && (
                                            <div>
                                                <span style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.07em', color: '#6B7C93' }}>Dx: </span>
                                                <span style={{ fontSize: 11.5, fontWeight: 700, color: '#1E5AA8' }}>{watchedData.diagnosis}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Medicines — Rx symbol */}
                                <div style={{ marginBottom: 10 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                                        <span style={{ fontSize: 18, fontWeight: 900, color: '#1E5AA8', lineHeight: 1, fontStyle: 'italic' }}>℞</span>
                                        <div style={{ height: 1, flex: 1, background: '#E2E8F0' }} />
                                    </div>
                                    {watchedData.medicines?.filter(m => m.name).length === 0 ? (
                                        <p style={{ fontSize: 10.5, color: '#9DABBE', fontStyle: 'italic' }}>No medicines added yet…</p>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                            {watchedData.medicines?.map((med, i) => med.name && (
                                                <div key={i} style={{
                                                    padding: '6px 10px', borderRadius: 5,
                                                    borderLeft: '3px solid #1E5AA8',
                                                    background: '#EBF1FA',
                                                }}>
                                                    <p style={{ margin: 0, fontSize: 11.5, fontWeight: 800 }}>
                                                        {i + 1}. {med.name}
                                                        {med.dosage && <span style={{ fontWeight: 400, color: '#6B7C93' }}> — {med.dosage}</span>}
                                                    </p>
                                                    <p style={{ margin: 0, fontSize: 10, color: '#6B7C93', marginTop: 2 }}>
                                                        {[med.frequency, med.duration, med.instructions].filter(Boolean).join(' · ')}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Tests */}
                                {watchedData.tests && (
                                    <div style={{ marginBottom: 8 }}>
                                        <p style={{ margin: '0 0 4px', fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.07em', color: '#6B7C93' }}>Investigations</p>
                                        <p style={{ margin: 0, fontSize: 11, color: '#1F2933', whiteSpace: 'pre-line' }}>{watchedData.tests}</p>
                                    </div>
                                )}

                                {/* Advice */}
                                {watchedData.advice && (
                                    <div style={{ marginBottom: 8 }}>
                                        <p style={{ margin: '0 0 4px', fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.07em', color: '#6B7C93' }}>Advice</p>
                                        <p style={{ margin: 0, fontSize: 11, color: '#1F2933', whiteSpace: 'pre-line' }}>{watchedData.advice}</p>
                                    </div>
                                )}

                                {/* Follow-up */}
                                {watchedData.followUpDate && (
                                    <div style={{
                                        background: '#E6F7F6', border: '1px solid #B3E8E5',
                                        borderRadius: 5, padding: '5px 10px', marginBottom: 8,
                                        display: 'inline-flex', alignItems: 'center', gap: 5,
                                    }}>
                                        <Calendar size={11} style={{ color: '#1FA79A' }} />
                                        <span style={{ fontSize: 10.5, color: '#1FA79A', fontWeight: 700 }}>
                                            Follow-up: {new Date(watchedData.followUpDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>
                                )}

                                {/* Signature + Footer */}
                                <div style={{
                                    marginTop: 14, paddingTop: 12,
                                    borderTop: '1.5px solid #E2E8F0',
                                    display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
                                }}>
                                    <div style={{ fontSize: 9, color: '#9DABBE' }}>
                                        <p style={{ margin: 0 }}>This prescription is valid for 30 days from issue date.</p>
                                        <p style={{ margin: 0 }}>Generated via MediCarePro · {rxDate}</p>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ borderBottom: '1.5px solid #1E5AA8', width: 100, marginBottom: 4 }} />
                                        <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: '#1E5AA8' }}>Dr. {doctor?.user?.name}</p>
                                        <p style={{ margin: 0, fontSize: 9, color: '#6B7C93' }}>{doctor?.specialization}</p>
                                        <p style={{ margin: 0, fontSize: 9, color: '#6B7C93' }}>Reg. No. MED-{String(doctor?.id || '').padStart(5, '0')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Print / Download buttons below preview */}
                        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                            <button
                                onClick={handlePrint}
                                className="btn btn-ghost btn-sm"
                                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                            >
                                <Printer size={13} /> Print
                            </button>
                            <button
                                onClick={handleDownloadPDF}
                                className="btn btn-primary btn-sm"
                                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                            >
                                <Download size={13} /> Save PDF
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

/* ─── Small helpers ─── */
// eslint-disable-next-line no-unused-vars
function SectionHeading({ icon: Icon, label }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{
                width: 30, height: 30, borderRadius: 7,
                background: 'var(--color-primary-light)', border: '1px solid var(--color-primary-mid)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <Icon size={14} style={{ color: 'var(--color-primary)' }} />
            </div>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-1)' }}>{label}</span>
        </div>
    );
}

function FormGroup({ label, children, style }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, ...style }}>
            <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--text-2)' }}>
                {label}
            </label>
            {children}
        </div>
    );
}

/* ─── Shared inline styles ─── */
const cardStyle = {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: 20,
    boxShadow: 'var(--shadow-card)',
};

const inputStyle = {
    width: '100%', height: 38, borderRadius: 8,
    border: '1px solid var(--border-strong)',
    background: 'var(--bg-input)', padding: '0 12px',
    fontSize: 13, color: 'var(--text-1)', outline: 'none',
    fontFamily: 'inherit', transition: 'all .15s', boxSizing: 'border-box',
};

const textareaStyle = (hasErr) => ({
    width: '100%', borderRadius: 8, resize: 'vertical',
    border: `1px solid ${hasErr ? 'var(--color-error)' : 'var(--border-strong)'}`,
    background: 'var(--bg-input)', padding: '9px 12px',
    fontSize: 13, color: 'var(--text-1)', outline: 'none',
    fontFamily: 'inherit', transition: 'all .15s', boxSizing: 'border-box',
    lineHeight: 1.55,
});

const errStyle = { margin: '3px 0 0', fontSize: 11, color: 'var(--color-error)' };

const focusStyle = (e) => {
    e.target.style.borderColor = 'var(--color-primary)';
    e.target.style.boxShadow = '0 0 0 3px rgba(30,90,168,0.12)';
};
const blurStyle = (e) => {
    e.target.style.borderColor = 'var(--border-strong)';
    e.target.style.boxShadow = 'none';
};
