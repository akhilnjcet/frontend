// ═══════════════════════════════════════════════════════
// PATIENT - BOOK APPOINTMENT PAGE
// ═══════════════════════════════════════════════════════
import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Search, Calendar, Check, ChevronRight, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import PageWrapper from '../../components/PageWrapper.jsx';
import AnimatedCard from '../../components/AnimatedCard.jsx';
import AnimatedButton from '../../components/AnimatedButton.jsx';
import { getAllDepartments } from '../../services/departmentService.js';
import { getDoctorsByDepartment } from '../../services/doctorService.js';
import { getPatientByUserId } from '../../services/patientService.js';
import { createAppointment } from '../../services/appointmentService.js';
import { useAuthStore } from '../../store/index.js';
import { getInitials, getAvatarGradient, formatCurrency, formatDate } from '../../utils/index.js';

const TIME_SLOTS = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30',
];

const STEP_LABELS = ['Choose Department', 'Select Doctor', 'Pick Date & Time', 'Confirm'];

export default function BookAppointment() {
    const { user } = useAuthStore();
    const [step, setStep] = useState(0);
    const [departments, setDepartments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [selectedDept, setSelectedDept] = useState(null);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [search, setSearch] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const deptColors = ['#3b82f6', '#8b5cf6', '#14b8a6', '#f59e0b', '#ef4444'];
    const deptIcons = ['❤️', '🧠', '🦴', '👶', '🔬'];

    useEffect(() => {
        getAllDepartments().then(setDepartments);
    }, []);

    const handleDeptSelect = async (dept, idx) => {
        setSelectedDept({ ...dept, color: deptColors[idx % deptColors.length] });
        const docs = await getDoctorsByDepartment(dept.id);
        setDoctors(docs);
        setStep(1);
    };

    const handleDoctorSelect = (doc) => {
        setSelectedDoctor(doc);
        setStep(2);
    };

    const handleConfirm = async () => {
        if (!selectedDate || !selectedTime) {
            toast.error('Please select date and time');
            return;
        }
        setSubmitting(true);
        try {
            const patient = await getPatientByUserId(user.id);
            // Use local date string (YYYY-MM-DD) to avoid UTC day-flip issues
            const dateStr = selectedDate.getFullYear() + '-' + 
                           String(selectedDate.getMonth() + 1).padStart(2, '0') + '-' + 
                           String(selectedDate.getDate()).padStart(2, '0');
            
            await createAppointment({
                patient_id: patient.id,
                doctor_id: selectedDoctor.id,
                appointment_date: dateStr,
                appointment_time: selectedTime,
            });
            setSuccess(true);
            setStep(4);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const reset = () => {
        setStep(0); setSelectedDept(null); setSelectedDoctor(null);
        setSelectedDate(null); setSelectedTime(null); setSuccess(false);
    };

    const filteredDoctors = doctors.filter(d =>
        d.user?.name.toLowerCase().includes(search.toLowerCase()) ||
        d.specialization.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <PageWrapper title="Book Appointment" subtitle="Find and schedule with the right specialist">
            {/* Stepper */}
            {!success && (
                <div className="flex items-center gap-2 mb-2">
                    {STEP_LABELS.map((label, idx) => (
                        <div key={label} className="flex items-center gap-2 flex-1">
                            <div className={`flex items-center gap-2 ${idx <= step ? 'opacity-100' : 'opacity-40'}`}>
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                  ${idx < step ? 'bg-blue-500 text-white' : idx === step ? 'bg-blue-600 text-white ring-2 ring-blue-400/40' : 'bg-slate-700 text-gray-400'}`}>
                                    {idx < step ? <Check size={12} /> : idx + 1}
                                </div>
                                <span className="hidden sm:block text-xs text-gray-400 whitespace-nowrap">{label}</span>
                            </div>
                            {idx < STEP_LABELS.length - 1 && (
                                <div className={`flex-1 h-px transition-all ${idx < step ? 'bg-blue-500' : 'bg-slate-700'}`} />
                            )}
                        </div>
                    ))}
                </div>
            )}

            <AnimatePresence mode="wait">
                {/* STEP 0: Choose Department */}
                {step === 0 && (
                    <motion.div key="dept" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                        <AnimatedCard hover={false} padding="p-0">
                            <div className="p-5 border-b border-white/8">
                                <h3 className="font-semibold text-white">Select Department</h3>
                                <p className="text-xs text-gray-500 mt-1">Choose a medical specialty</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-5">
                                {departments.map((dept, idx) => (
                                    <motion.button
                                        key={dept.id}
                                        whileHover={{ scale: 1.03, y: -2 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => handleDeptSelect(dept, idx)}
                                        className="flex items-center gap-4 p-4 rounded-xl border text-left transition-all hover:shadow-lg"
                                        style={{ background: `${deptColors[idx % deptColors.length]}08`, borderColor: `${deptColors[idx % deptColors.length]}25` }}
                                    >
                                        <span className="text-3xl">{deptIcons[idx % deptIcons.length]}</span>
                                        <div>
                                            <p className="font-semibold text-white text-sm">{dept.name}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">{dept.doctorCount} specialists</p>
                                        </div>
                                        <ChevronRight size={16} className="ml-auto text-gray-500" />
                                    </motion.button>
                                ))}
                            </div>
                        </AnimatedCard>
                    </motion.div>
                )}

                {/* STEP 1: Select Doctor */}
                {step === 1 && (
                    <motion.div key="doctor" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                        <AnimatedCard hover={false} padding="p-0">
                            <div className="p-5 border-b border-white/8 flex items-center gap-3">
                                <button onClick={() => setStep(0)} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors text-sm">← Back</button>
                                <div>
                                    <h3 className="font-semibold text-white">{selectedDept?.name} Specialists</h3>
                                    <p className="text-xs text-gray-500">{filteredDoctors.length} doctors available</p>
                                </div>
                            </div>
                            <div className="p-5">
                                <div className="relative mb-4">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                                    <input
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        placeholder="Search doctor or specialization..."
                                        className="w-full pl-9 pr-4 py-2.5 bg-slate-800/80 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 outline-none focus:border-blue-500 transition-all"
                                    />
                                </div>
                                <div className="space-y-3">
                                    {filteredDoctors.map(doc => (
                                        <motion.button
                                            key={doc.id}
                                            whileHover={{ x: 4 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleDoctorSelect(doc)}
                                            className="w-full flex items-center gap-4 p-4 rounded-xl border border-white/8 hover:border-blue-500/30 bg-slate-800/40 hover:bg-slate-800/60 text-left transition-all"
                                        >
                                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold flex-shrink-0"
                                                style={{ background: getAvatarGradient(doc.user?.name) }}>
                                                {getInitials(doc.user?.name)}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-white">{doc.user?.name}</p>
                                                <p className="text-sm text-gray-400">{doc.specialization}</p>
                                                <div className="flex items-center gap-1 mt-1">
                                                    {[...Array(5)].map((_, i) => <Star key={i} size={10} className="text-yellow-400 fill-yellow-400" />)}
                                                    <span className="text-xs text-gray-500 ml-1">4.9</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-emerald-400">{formatCurrency(doc.fee)}</p>
                                                <p className="text-xs text-gray-500">per visit</p>
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        </AnimatedCard>
                    </motion.div>
                )}

                {/* STEP 2: Date & Time */}
                {step === 2 && (
                    <motion.div key="datetime" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <AnimatedCard hover={false} padding="p-0">
                                <div className="p-5 border-b border-white/8">
                                    <h3 className="font-semibold text-white">Pick a Date</h3>
                                </div>
                                <div className="p-5 flex justify-center">
                                    <DatePicker
                                        selected={selectedDate}
                                        onChange={date => setSelectedDate(date)}
                                        minDate={new Date()}
                                        inline
                                    />
                                </div>
                            </AnimatedCard>
                            <AnimatedCard hover={false} padding="p-0">
                                <div className="p-5 border-b border-white/8">
                                    <h3 className="font-semibold text-white">Select Time Slot</h3>
                                    <p className="text-xs text-gray-500 mt-1">{selectedDate ? formatDate(selectedDate, { weekday: 'long', month: 'long', day: 'numeric' }) : 'Select a date first'}</p>
                                </div>
                                <div className="p-5 grid grid-cols-3 sm:grid-cols-4 gap-2">
                                    {TIME_SLOTS.map(t => {
                                        const [h, m] = t.split(':').map(Number);
                                        const ampm = h >= 12 ? 'PM' : 'AM';
                                        const display = `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${ampm}`;
                                        return (
                                            <motion.button
                                                key={t}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setSelectedTime(t)}
                                                disabled={!selectedDate}
                                                className={`p-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed
                          ${selectedTime === t
                                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                                        : 'bg-slate-700/60 text-gray-300 hover:bg-blue-500/20 hover:text-blue-300'}`}
                                            >
                                                {display}
                                            </motion.button>
                                        );
                                    })}
                                </div>
                                <div className="px-5 pb-5 flex gap-2">
                                    <AnimatedButton variant="ghost" onClick={() => setStep(1)} fullWidth>Back</AnimatedButton>
                                    <AnimatedButton
                                        onClick={() => { if (selectedDate && selectedTime) setStep(3); else toast.error('Select date & time'); }}
                                        fullWidth icon={ChevronRight} iconRight
                                    >
                                        Continue
                                    </AnimatedButton>
                                </div>
                            </AnimatedCard>
                        </div>
                    </motion.div>
                )}

                {/* STEP 3: Confirm */}
                {step === 3 && (
                    <motion.div key="confirm" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                        <AnimatedCard hover={false}>
                            <h3 className="font-semibold text-white mb-5">Confirm Your Appointment</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                                {[
                                    { label: 'Doctor', value: selectedDoctor?.user?.name },
                                    { label: 'Specialization', value: selectedDoctor?.specialization },
                                    { label: 'Department', value: selectedDept?.name },
                                    { label: 'Consultation Fee', value: formatCurrency(selectedDoctor?.fee) },
                                    { label: 'Date', value: formatDate(selectedDate, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) },
                                    { label: 'Time', value: (() => { const [h, m] = selectedTime.split(':').map(Number); const ampm = h >= 12 ? 'PM' : 'AM'; return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${ampm}`; })() },
                                ].map(({ label, value }) => (
                                    <div key={label} className="bg-slate-800/60 rounded-xl p-4">
                                        <p className="text-xs text-gray-500 mb-1">{label}</p>
                                        <p className="text-sm font-semibold text-white">{value}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-5">
                                <p className="text-xs text-blue-300">⚠️ By confirming, a bill of <strong>{formatCurrency(selectedDoctor?.fee)}</strong> will be generated. Please arrive 10 minutes early.</p>
                            </div>
                            <div className="flex gap-3">
                                <AnimatedButton variant="ghost" onClick={() => setStep(2)} fullWidth>Back</AnimatedButton>
                                <AnimatedButton loading={submitting} onClick={handleConfirm} fullWidth icon={Check}>Confirm Booking</AnimatedButton>
                            </div>
                        </AnimatedCard>
                    </motion.div>
                )}

                {/* STEP 4: Success */}
                {step === 4 && success && (
                    <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 mb-6"
                        >
                            <Check size={36} className="text-emerald-400" />
                        </motion.div>
                        <h2 className="text-2xl font-bold text-white mb-2">Appointment Booked!</h2>
                        <p className="text-gray-400 mb-1">with {selectedDoctor?.user?.name}</p>
                        <p className="text-gray-400 mb-6 text-sm">{formatDate(selectedDate, { weekday: 'long', month: 'long', day: 'numeric' })} at {selectedTime}</p>
                        <div className="flex justify-center gap-3">
                            <AnimatedButton variant="outline" onClick={reset}>Book Another</AnimatedButton>
                            <AnimatedButton onClick={() => window.location.href = '/patient/appointments'} icon={Calendar}>View Appointments</AnimatedButton>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </PageWrapper>
    );
}
