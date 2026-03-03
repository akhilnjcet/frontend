import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserRound, Clock, AlertCircle, FileText, Plus, Trash2, CheckCircle } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import toast from 'react-hot-toast';
import PageWrapper from '../../components/PageWrapper.jsx';
import AnimatedCard from '../../components/AnimatedCard.jsx';
import AnimatedButton from '../../components/AnimatedButton.jsx';
import Modal from '../../components/Modal.jsx';

// Dummy Patient Data
const PATIENT_DETAILS = {
    id: 'PT-1001',
    name: 'Alice Johnson',
    age: 34,
    gender: 'Female',
    phone: '+1 234-567-8901',
    address: '123 Meadow Lane, NY',
    bloodGroup: 'O+',
    allergies: ['Penicillin', 'Peanuts'],
    history: [
        { date: '2023-10-15', condition: 'General Checkup', doctor: 'Dr. Arjun Kumar' },
        { date: '2023-05-10', condition: 'Mild Fever', doctor: 'Dr. Sarah Lee' },
    ],
    prescriptions: [
        { id: 'RX-1029', date: '2023-10-15', diagnosis: 'Hypertension', medicines: 'Lisinopril 10mg' }
    ],
    notes: 'Patient reports occasional headaches. Advised to drink more water and monitor BP.'
};

export default function PatientDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isRxModalOpen, setIsRxModalOpen] = useState(false);

    // Form setup for Prescription
    const { register, control, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: {
            diagnosis: '',
            medicines: [{ name: '', dosage: '', duration: '', timing: 'Before Food', instructions: '' }]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'medicines'
    });

    const onSubmitRx = (data) => {
        console.log('Sending Prescription Data:', data);
        // Simulation for successful prescription submission
        toast.success(`Prescription saved for ${PATIENT_DETAILS.name}!`);
        setIsRxModalOpen(false);
        reset();
    };

    return (
        <PageWrapper title="Patient Details" subtitle={`Viewing records for ${PATIENT_DETAILS.name}`}>

            {/* Back Button */}
            <button
                onClick={() => navigate('/doctor/patients')}
                style={{
                    display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20,
                    background: 'none', border: 'none', color: 'var(--text-2)', cursor: 'pointer',
                    fontSize: 13.5, fontWeight: 500, transition: 'color .15s'
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-1)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-2)'}
            >
                <ArrowLeft size={16} /> Back to Patients
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 2fr)', gap: 16 }}>

                {/* LEFT COLUMN: Profile & Basic Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                    <AnimatedCard hover={false} style={{ textAlign: 'center', padding: '32px 20px' }}>
                        <div style={{
                            width: 80, height: 80, borderRadius: '50%', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
                        }}>
                            <UserRound size={32} />
                        </div>
                        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--text-1)' }}>{PATIENT_DETAILS.name}</h2>
                        <p style={{ margin: 0, fontSize: 13.5, color: 'var(--text-3)', marginTop: 4 }}>ID: {PATIENT_DETAILS.id}</p>

                        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 16 }}>
                            <span className="badge badge-info">{PATIENT_DETAILS.gender}</span>
                            <span className="badge badge-info">{PATIENT_DETAILS.age} Years</span>
                            <span className="badge badge-error" style={{ background: 'var(--color-error-light)', color: 'var(--color-error)', border: '1px solid rgba(214,69,69,.2)' }}>Blood: {PATIENT_DETAILS.bloodGroup}</span>
                        </div>

                        <div style={{ background: 'var(--bg-panel)', borderRadius: 10, padding: '16px', marginTop: 24, textAlign: 'left' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div><p className="label">Phone</p><p style={{ margin: 0, fontSize: 13.5, color: 'var(--text-1)' }}>{PATIENT_DETAILS.phone}</p></div>
                                <div><p className="label">Address</p><p style={{ margin: 0, fontSize: 13.5, color: 'var(--text-1)' }}>{PATIENT_DETAILS.address}</p></div>
                            </div>
                        </div>
                    </AnimatedCard>

                    {/* Allergies - Highlights in Red */}
                    <AnimatedCard hover={false}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: 'var(--color-error)' }}>
                            <AlertCircle size={18} />
                            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Allergies</h3>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {PATIENT_DETAILS.allergies.map(alg => (
                                <span key={alg} style={{
                                    padding: '4px 10px', borderRadius: 99, fontSize: 12, fontWeight: 600,
                                    background: 'var(--color-error-light)', color: 'var(--color-error)', border: '1px solid rgba(214,69,69,.2)'
                                }}>{alg}</span>
                            ))}
                        </div>
                    </AnimatedCard>

                </div>

                {/* RIGHT COLUMN: History, Previous Rx & Action */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                    {/* Action Header */}
                    <AnimatedCard hover={false} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-1)' }}>Medical Records</h3>
                            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>Review history and write new prescriptions.</p>
                        </div>
                        <AnimatedButton icon={Plus} onClick={() => setIsRxModalOpen(true)}>
                            Write Prescription
                        </AnimatedButton>
                    </AnimatedCard>

                    {/* Medical History Timeline */}
                    <AnimatedCard hover={false}>
                        <h3 className="section-title">Visit History</h3>
                        <div style={{ marginLeft: 8, borderLeft: '2px solid var(--border)', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 20, marginTop: 16 }}>
                            {PATIENT_DETAILS.history.map((hist, i) => (
                                <div key={i} style={{ position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: -27, top: 4, width: 12, height: 12, borderRadius: '50%', background: 'var(--color-primary)', border: '3px solid var(--bg-card)' }} />
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-3)', marginBottom: 4 }}>
                                        <Clock size={12} /> {hist.date}
                                    </div>
                                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>{hist.condition}</p>
                                    <p style={{ margin: 0, fontSize: 13, color: 'var(--text-2)' }}>Consulted by: {hist.doctor}</p>
                                </div>
                            ))}
                        </div>
                    </AnimatedCard>

                    {/* Previous Prescriptions & Notes */}
                    <AnimatedCard hover={false}>
                        <h3 className="section-title">Previous Prescriptions</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
                            {PATIENT_DETAILS.prescriptions.map(rx => (
                                <div key={rx.id} style={{
                                    border: '1px solid var(--border)', borderRadius: 10, padding: 16, background: 'var(--bg-panel)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>{rx.id}</span>
                                        <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{rx.date}</span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--color-primary)' }}>{rx.diagnosis}</p>
                                    <p style={{ margin: 0, fontSize: 13, color: 'var(--text-2)', marginTop: 4 }}><FileText size={12} style={{ display: 'inline', marginRight: 4 }} />{rx.medicines}</p>
                                </div>
                            ))}
                        </div>
                    </AnimatedCard>

                    <AnimatedCard hover={false}>
                        <h3 className="section-title">Doctor Notes</h3>
                        <p style={{ margin: 0, fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.6, background: 'var(--color-warning-light)', padding: 16, borderRadius: 10, border: '1px solid var(--color-warning-mid)' }}>
                            {PATIENT_DETAILS.notes}
                        </p>
                    </AnimatedCard>

                </div>
            </div>

            {/* Modal: Write Prescription */}
            <Modal
                isOpen={isRxModalOpen}
                onClose={() => { setIsRxModalOpen(false); reset(); }}
                title={`Write Prescription for ${PATIENT_DETAILS.name}`}
                size="lg"
                footer={
                    <>
                        <AnimatedButton variant="ghost" onClick={() => { setIsRxModalOpen(false); reset(); }}>Cancel</AnimatedButton>
                        <AnimatedButton icon={CheckCircle} onClick={handleSubmit(onSubmitRx)}>Save Prescription</AnimatedButton>
                    </>
                }
            >
                {/* Allergy Warning Alert */}
                {PATIENT_DETAILS.allergies.length > 0 && (
                    <div className="alert alert-error" style={{ marginBottom: 20 }}>
                        <div className="alert-icon alert-icon-error"><AlertCircle size={18} /></div>
                        <div>
                            <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: 'var(--color-error)' }}>Allergy Warning</p>
                            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-1)', marginTop: 2 }}>
                                Patient is allergic to: <strong>{PATIENT_DETAILS.allergies.join(', ')}</strong>. Do not prescribe interactions.
                            </p>
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Diagnosis */}
                    <div>
                        <label className="form-label">Diagnosis</label>
                        <input
                            {...register('diagnosis', { required: 'Diagnosis is required' })}
                            className={`form-input ${errors.diagnosis ? 'form-input-error' : ''}`}
                            placeholder="e.g. Viral Fever"
                        />
                        {errors.diagnosis && <p style={{ margin: 0, fontSize: 11.5, color: 'var(--color-error)', marginTop: 4 }}>{errors.diagnosis.message}</p>}
                    </div>

                    <hr style={{ border: 0, borderTop: '1px solid var(--border)' }} />

                    {/* Dynamic Medicines Form */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                            <label className="form-label" style={{ margin: 0 }}>Medicines List</label>
                            <button
                                type="button"
                                onClick={() => append({ name: '', dosage: '', duration: '', timing: 'Before Food', instructions: '' })}
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 4, background: 'none', border: 'none',
                                    color: 'var(--color-primary)', fontSize: 12, fontWeight: 600, cursor: 'pointer'
                                }}
                            >
                                <Plus size={14} /> Add Medicine
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {fields.map((field, index) => (
                                <div key={field.id} style={{
                                    background: 'var(--bg-panel)', border: '1px solid var(--border-strong)', borderRadius: 10, padding: 16, position: 'relative'
                                }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                                        <div>
                                            <input {...register(`medicines.${index}.name`, { required: true })} className="form-input" placeholder="Medicine Name (Searchable UI...)" />
                                        </div>
                                        <div>
                                            <input {...register(`medicines.${index}.dosage`, { required: true })} className="form-input" placeholder="Dosage (e.g. 1-0-1)" />
                                        </div>
                                        <div>
                                            <input {...register(`medicines.${index}.duration`, { required: true })} className="form-input" placeholder="Duration (e.g. 5 days)" />
                                        </div>
                                        <div>
                                            <select {...register(`medicines.${index}.timing`)} className="form-input">
                                                <option value="Before Food">Before Food</option>
                                                <option value="After Food">After Food</option>
                                                <option value="Empty Stomach">Empty Stomach</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <input {...register(`medicines.${index}.instructions`)} className="form-input" placeholder="Special Instructions (Optional)" />
                                    </div>

                                    {/* Remove Button if more than 1 medicine */}
                                    {fields.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => remove(index)}
                                            style={{
                                                position: 'absolute', top: -10, right: -10, width: 24, height: 24, borderRadius: '50%',
                                                background: 'var(--color-error)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(214,69,69,0.3)'
                                            }}
                                            title="Remove Medicine"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </Modal>
        </PageWrapper>
    );
}
