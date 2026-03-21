// ═══════════════════════════════════════════════════════
// APPOINTMENT SERVICE - Mock REST API
// ═══════════════════════════════════════════════════════
import { appointments, patients, doctors, users, prescriptions, bills } from '../mock/database.js';

const delay = (ms = 400) => new Promise(res => setTimeout(res, ms));

const enrichAppointment = (appt) => {
    const patient = patients.find(p => p.id === appt.patient_id);
    const doctor = doctors.find(d => d.id === appt.doctor_id);
    const patientUser = patient ? users.find(u => u.id === patient.user_id) : null;
    const doctorUser = doctor ? users.find(u => u.id === doctor.user_id) : null;
    const prescription = prescriptions.find(p => p.appointment_id === appt.id);
    const bill = bills.find(b => b.appointment_id === appt.id);
    return {
        ...appt,
        patient: patient ? { ...patient, user: patientUser } : null,
        doctor: doctor ? { ...doctor, user: doctorUser } : null,
        prescription: prescription || null,
        bill: bill || null,
    };
};

const API_URL = 'https://mongodbbackend-alpha.vercel.app/api';

// GET /api/appointments
export const getAllAppointments = async () => {
    const res = await fetch(`${API_URL}/appointments`);
    if (!res.ok) throw new Error('Failed to fetch appointments');
    const rawData = await res.json();

    // Map backend SQL results to frontend expected struct
    return rawData.map(appt => ({
        ...appt,
        patient: appt.patient_name ? { name: appt.patient_name, user: { name: appt.patient_name } } : null,
        doctor: appt.doctor_name ? { specialization: appt.doctor_specialization, user: { name: appt.doctor_name } } : null,
        prescription: null,
        bill: null
    }));
};

// GET /api/appointments/:id
export const getAppointmentById = async (id) => {
    await delay(200);
    const appt = appointments.find(a => a.id === Number(id));
    if (!appt) throw new Error('Appointment not found');
    return enrichAppointment(appt);
};

// GET /api/appointments/patient/:patientId
export const getAppointmentsByPatient = async (patientId) => {
    await delay();
    return appointments
        .filter(a => a.patient_id === Number(patientId))
        .map(enrichAppointment);
};

// GET /api/appointments/doctor/:doctorId
export const getAppointmentsByDoctor = async (doctorId) => {
    await delay();
    return appointments
        .filter(a => a.doctor_id === Number(doctorId))
        .map(enrichAppointment);
};

// POST /api/appointments
export const createAppointment = async (data) => {
    const res = await fetch(`${API_URL}/appointments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to fetch to appointments creation');
    const result = await res.json();
    return { id: result.id, ...data };
};

// PUT /api/appointments/:id/status
export const updateAppointmentStatus = async (id, status) => {
    const res = await fetch(`${API_URL}/appointments/${id}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update appointments');
    return { id, status };
};

// DELETE /api/appointments/:id
export const deleteAppointment = async (id) => {
    await delay();
    const idx = appointments.findIndex(a => a.id === Number(id));
    if (idx === -1) throw new Error('Appointment not found');
    appointments.splice(idx, 1);
    return { success: true };
};
