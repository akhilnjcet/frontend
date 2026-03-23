// ═══════════════════════════════════════════════════════
// DOCTOR SERVICE - Mock REST API
// ═══════════════════════════════════════════════════════
import { doctors, users, departments } from '../mock/database.js';

const delay = (ms = 400) => new Promise(res => setTimeout(res, ms));

const enrichDoctor = (doctor) => {
    const user = users.find(u => u.id === doctor.user_id);
    const dept = departments.find(d => d.id === doctor.department_id);
    return { ...doctor, user, department: dept };
};

// GET /api/doctors
export const getAllDoctors = async () => {
    await delay();
    return doctors.map(enrichDoctor);
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
    const doctor = all.find(d => Number(d.user_id) === Number(userId));
    if (!doctor) throw new Error('Doctor record not found');
    return doctor;
};

// GET /api/doctors/department/:deptId
export const getDoctorsByDepartment = async (deptId) => {
    await delay();
    return doctors.filter(d => d.department_id === Number(deptId)).map(enrichDoctor);
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
