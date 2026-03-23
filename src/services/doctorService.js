// ═══════════════════════════════════════════════════════
// DOCTOR SERVICE - Mock REST API
// ═══════════════════════════════════════════════════════
import { doctors, users, departments } from '../mock/database.js';

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

const enrichDoctor = (doctor) => {
    const user = users.find(u => u.id === doctor.user_id);
    const dept = departments.find(d => d.id === doctor.department_id);
    return { ...doctor, user, department: dept };
};

// GET /api/doctors
export const getAllDoctors = async () => {
    const res = await fetch(`${API_URL}/doctors`, {
        headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch doctors');
    const rawData = await res.json();
    return rawData.map(doc => ({
        ...doc,
        user: doc.user_id && typeof doc.user_id === 'object' ? doc.user_id : { name: doc.name || 'Doctor', email: doc.email }
    }));
};

// GET /api/doctors/:id
export const getDoctorById = async (id) => {
    await delay(200);
    const doctor = doctors.find(d => d.id === Number(id));
    if (!doctor) throw new Error('Doctor not found');
    return enrichDoctor(doctor);
};

// GET /api/doctors/user/:userId
export const getDoctorByUserId = async (userId) => {
    const all = await getAllDoctors();
    const doctor = all.find(d => {
        const uid = d.user_id && typeof d.user_id === 'object' ? d.user_id.id : d.user_id;
        return Number(uid) === Number(userId);
    });
    if (!doctor) throw new Error('Doctor record not found');
    return doctor;
};

// GET /api/doctors/department/:deptId
export const getDoctorsByDepartment = async (deptId) => {
    const all = await getAllDoctors();
    return all.filter(d => Number(d.department_id) === Number(deptId));
};

// POST /api/doctors
export const createDoctor = async (data) => {
    await delay();
    const newDoctor = {
        id: Math.max(...doctors.map(d => d.id)) + 1,
        ...data
    };
    doctors.push(newDoctor);
    return enrichDoctor(newDoctor);
};

// PUT /api/doctors/:id
export const updateDoctor = async (id, data) => {
    await delay();
    const idx = doctors.findIndex(d => d.id === Number(id));
    if (idx === -1) throw new Error('Doctor not found');
    doctors[idx] = { ...doctors[idx], ...data };
    return enrichDoctor(doctors[idx]);
};

// DELETE /api/doctors/:id
export const deleteDoctor = async (id) => {
    await delay();
    const idx = doctors.findIndex(d => d.id === Number(id));
    if (idx === -1) throw new Error('Doctor not found');
    doctors.splice(idx, 1);
    return { success: true };
};
