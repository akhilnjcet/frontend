// ═══════════════════════════════════════════════════════
// PATIENT SERVICE - Mock + API fallback
// ═══════════════════════════════════════════════════════
import { patients as mockPatients, users as mockUsers } from '../mock/database.js';

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

const enrichPatient = (patient) => {
    const user = mockUsers.find(u => u.id === patient.user_id);
    return { ...patient, user };
};

// GET /api/patients
export const getAllPatients = async () => {
    try {
        const res = await fetch(`${API_URL}/patients`, {
            headers: getAuthHeaders()
        });
        if (!res.ok) throw new Error('API failed');
        const rawData = await res.json();
        
        if (rawData && rawData.length > 0) {
            return rawData.map(patient => ({
                ...patient,
                user: { name: patient.name, email: patient.email }
            }));
        }
    } catch (err) {
        console.warn("API Patients Fetch Failed, falling back to Mock:", err.message);
    }
    
    // Fallback to Mock
    await delay(200);
    return mockPatients.map(enrichPatient);
};

// GET /api/patients/:id
export const getPatientById = async (id) => {
    const all = await getAllPatients();
    const patient = all.find(p => Number(p.id) === Number(id));
    if (!patient) throw new Error('Patient not found');
    return patient;
};

// GET /api/patients/user/:userId
export const getPatientByUserId = async (userId) => {
    const all = await getAllPatients();
    const patient = all.find(p => Number(p.user_id) === Number(userId));
    if (!patient) throw new Error('Patient record not found');
    return patient;
};

export const createPatient = async (data) => {
    await delay();
    const newPatient = {
        id: Math.max(...mockPatients.map(p => p.id)) + 1,
        ...data
    };
    mockPatients.push(newPatient);
    return enrichPatient(newPatient);
};

export const updatePatient = async (id, data) => {
    await delay();
    const idx = mockPatients.findIndex(p => p.id === Number(id));
    if (idx === -1) throw new Error('Patient not found');
    mockPatients[idx] = { ...mockPatients[idx], ...data };
    return enrichPatient(mockPatients[idx]);
};

export const deletePatient = async (id) => {
    await delay();
    const idx = mockPatients.findIndex(p => p.id === Number(id));
    if (idx === -1) throw new Error('Patient not found');
    mockPatients.splice(idx, 1);
    return { success: true };
};
