// ═══════════════════════════════════════════════════════
// APPOINTMENT SERVICE - Mock REST API
// ═══════════════════════════════════════════════════════
import { appointments } from '../mock/database.js';

const delay = (ms = 400) => new Promise(res => setTimeout(res, ms));


const API_URL = 'https://mongodbbackend-alpha.vercel.app/api';

const getAuthHeaders = () => {
    try {
        const stored = sessionStorage.getItem('medicare-auth');
        if (!stored) return {};
        const { state } = JSON.parse(stored);
        return state.token ? { 'Authorization': `Bearer ${state.token}` } : {};
    } catch { return {}; }
};

// GET /api/appointments
export const getAllAppointments = async () => {
    const res = await fetch(`${API_URL}/appointments`, {
        headers: getAuthHeaders()
    });
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

// GET /api/appointments/patient/:patientId
export const getAppointmentsByPatient = async (patientId) => {
    const all = await getAllAppointments();
    return all.filter(a => Number(a.patient_id) === Number(patientId));
};

// GET /api/appointments/doctor/:doctorId
export const getAppointmentsByDoctor = async (doctorId) => {
    const all = await getAllAppointments();
    return all.filter(a => Number(a.doctor_id) === Number(doctorId));
};

// POST /api/appointments
export const createAppointment = async (data) => {
    const res = await fetch(`${API_URL}/appointments`, {
        method: 'POST',
        headers: {
            ...getAuthHeaders(),
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
            ...getAuthHeaders(),
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
