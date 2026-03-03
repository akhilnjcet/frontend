// ═══════════════════════════════════════════════════════
// PATIENT SERVICE - Mock REST API
// ═══════════════════════════════════════════════════════
import { patients, users } from '../mock/database.js';

const delay = (ms = 400) => new Promise(res => setTimeout(res, ms));

const enrichPatient = (patient) => {
    const user = users.find(u => u.id === patient.user_id);
    return { ...patient, user };
};

const API_URL = 'http://localhost:5000/api';

export const getAllPatients = async () => {
    const res = await fetch(`${API_URL}/patients`);
    if (!res.ok) throw new Error('Failed to fetch patients');
    const rawData = await res.json();

    return rawData.map(patient => ({
        ...patient,
        user: { name: patient.name, email: patient.email }
    }));
};

export const getPatientById = async (id) => {
    await delay(200);
    const patient = patients.find(p => p.id === Number(id));
    if (!patient) throw new Error('Patient not found');
    return enrichPatient(patient);
};

export const getPatientByUserId = async (userId) => {
    await delay(200);
    const patient = patients.find(p => p.user_id === Number(userId));
    if (!patient) throw new Error('Patient not found');
    return enrichPatient(patient);
};

export const createPatient = async (data) => {
    await delay();
    const newPatient = {
        id: Math.max(...patients.map(p => p.id)) + 1,
        ...data
    };
    patients.push(newPatient);
    return enrichPatient(newPatient);
};

export const updatePatient = async (id, data) => {
    await delay();
    const idx = patients.findIndex(p => p.id === Number(id));
    if (idx === -1) throw new Error('Patient not found');
    patients[idx] = { ...patients[idx], ...data };
    return enrichPatient(patients[idx]);
};

export const deletePatient = async (id) => {
    await delay();
    const idx = patients.findIndex(p => p.id === Number(id));
    if (idx === -1) throw new Error('Patient not found');
    patients.splice(idx, 1);
    return { success: true };
};
