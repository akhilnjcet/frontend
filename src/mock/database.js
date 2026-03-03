// ═══════════════════════════════════════════════════════
// MOCK DATABASE - Hospital Management System
// Matches exact database schema with realistic data
// ═══════════════════════════════════════════════════════

// 1. DEPARTMENTS (5 departments)
export const departments = [
    { id: 1, name: 'Cardiology' },
    { id: 2, name: 'Neurology' },
    { id: 3, name: 'Orthopedics' },
    { id: 4, name: 'Pediatrics' },
    { id: 5, name: 'Oncology' },
];

// 2. USERS (admin + doctors + patients)
export const users = [
    // Admin
    { id: 1, name: 'Sarah Mitchell', email: 'admin@medicare.pro', password: 'admin123', role: 'admin', created_at: '2024-01-01T08:00:00Z' },
    // Doctors
    { id: 2, name: 'Dr. James Wilson', email: 'james.wilson@medicare.pro', password: 'doctor123', role: 'doctor', created_at: '2024-01-05T09:00:00Z' },
    { id: 3, name: 'Dr. Emily Chen', email: 'emily.chen@medicare.pro', password: 'doctor123', role: 'doctor', created_at: '2024-01-06T09:00:00Z' },
    { id: 4, name: 'Dr. Michael Torres', email: 'michael.torres@medicare.pro', password: 'doctor123', role: 'doctor', created_at: '2024-01-07T09:00:00Z' },
    { id: 5, name: 'Dr. Sophia Patel', email: 'sophia.patel@medicare.pro', password: 'doctor123', role: 'doctor', created_at: '2024-01-08T09:00:00Z' },
    { id: 6, name: 'Dr. Robert Kim', email: 'robert.kim@medicare.pro', password: 'doctor123', role: 'doctor', created_at: '2024-01-09T09:00:00Z' },
    { id: 7, name: 'Dr. Amanda Foster', email: 'amanda.foster@medicare.pro', password: 'doctor123', role: 'doctor', created_at: '2024-01-10T09:00:00Z' },
    { id: 8, name: 'Dr. David Nguyen', email: 'david.nguyen@medicare.pro', password: 'doctor123', role: 'doctor', created_at: '2024-01-11T09:00:00Z' },
    { id: 9, name: 'Dr. Lisa Johansson', email: 'lisa.johansson@medicare.pro', password: 'doctor123', role: 'doctor', created_at: '2024-01-12T09:00:00Z' },
    { id: 10, name: 'Dr. Kevin Brooks', email: 'kevin.brooks@medicare.pro', password: 'doctor123', role: 'doctor', created_at: '2024-01-13T09:00:00Z' },
    { id: 11, name: 'Dr. Rachel Greene', email: 'rachel.greene@medicare.pro', password: 'doctor123', role: 'doctor', created_at: '2024-01-14T09:00:00Z' },
    // Patients
    { id: 12, name: 'Alice Johnson', email: 'alice@example.com', password: 'patient123', role: 'patient', created_at: '2024-02-01T10:00:00Z' },
    { id: 13, name: 'Bob Martinez', email: 'bob@example.com', password: 'patient123', role: 'patient', created_at: '2024-02-02T10:00:00Z' },
    { id: 14, name: 'Carol Davis', email: 'carol@example.com', password: 'patient123', role: 'patient', created_at: '2024-02-03T10:00:00Z' },
    { id: 15, name: 'Daniel Lee', email: 'daniel@example.com', password: 'patient123', role: 'patient', created_at: '2024-02-04T10:00:00Z' },
    { id: 16, name: 'Emma White', email: 'emma@example.com', password: 'patient123', role: 'patient', created_at: '2024-02-05T10:00:00Z' },
    { id: 17, name: 'Frank Brown', email: 'frank@example.com', password: 'patient123', role: 'patient', created_at: '2024-02-06T10:00:00Z' },
    { id: 18, name: 'Grace Liu', email: 'grace@example.com', password: 'patient123', role: 'patient', created_at: '2024-02-07T10:00:00Z' },
    { id: 19, name: 'Henry Wilson', email: 'henry@example.com', password: 'patient123', role: 'patient', created_at: '2024-02-08T10:00:00Z' },
    { id: 20, name: 'Isabella Clark', email: 'isabella@example.com', password: 'patient123', role: 'patient', created_at: '2024-02-09T10:00:00Z' },
    { id: 21, name: 'Jack Thompson', email: 'jack@example.com', password: 'patient123', role: 'patient', created_at: '2024-02-10T10:00:00Z' },
    { id: 22, name: 'Karen Anderson', email: 'karen@example.com', password: 'patient123', role: 'patient', created_at: '2024-02-11T10:00:00Z' },
    { id: 23, name: 'Liam Jackson', email: 'liam@example.com', password: 'patient123', role: 'patient', created_at: '2024-02-12T10:00:00Z' },
    { id: 24, name: 'Mia Harris', email: 'mia@example.com', password: 'patient123', role: 'patient', created_at: '2024-02-13T10:00:00Z' },
    { id: 25, name: 'Noah Robinson', email: 'noah@example.com', password: 'patient123', role: 'patient', created_at: '2024-02-14T10:00:00Z' },
    { id: 26, name: 'Olivia Martin', email: 'olivia@example.com', password: 'patient123', role: 'patient', created_at: '2024-02-15T10:00:00Z' },
    { id: 27, name: 'Patrick Garcia', email: 'patrick@example.com', password: 'patient123', role: 'patient', created_at: '2024-02-16T10:00:00Z' },
    { id: 28, name: 'Quinn Taylor', email: 'quinn@example.com', password: 'patient123', role: 'patient', created_at: '2024-02-17T10:00:00Z' },
    { id: 29, name: 'Ryan Moore', email: 'ryan@example.com', password: 'patient123', role: 'patient', created_at: '2024-02-18T10:00:00Z' },
    { id: 30, name: 'Sophia Young', email: 'sophia.y@example.com', password: 'patient123', role: 'patient', created_at: '2024-02-19T10:00:00Z' },
    { id: 31, name: 'Tyler Hall', email: 'tyler@example.com', password: 'patient123', role: 'patient', created_at: '2024-02-20T10:00:00Z' },
    // Pharmacist
    { id: 32, name: 'John Doe', email: 'pharmacy@medicare.pro', password: 'pharmacy123', role: 'pharmacy', created_at: '2024-03-01T10:00:00Z' },
];

// 3. DOCTORS (10 doctors)
export const doctors = [
    { id: 1, user_id: 2, department_id: 1, specialization: 'Interventional Cardiologist', fee: 250, avatar: null },
    { id: 2, user_id: 3, department_id: 2, specialization: 'Neurologist & Epileptologist', fee: 280, avatar: null },
    { id: 3, user_id: 4, department_id: 3, specialization: 'Orthopedic Surgeon', fee: 300, avatar: null },
    { id: 4, user_id: 5, department_id: 4, specialization: 'Pediatric Specialist', fee: 200, avatar: null },
    { id: 5, user_id: 6, department_id: 5, specialization: 'Medical Oncologist', fee: 350, avatar: null },
    { id: 6, user_id: 7, department_id: 1, specialization: 'Cardiac Electrophysiologist', fee: 270, avatar: null },
    { id: 7, user_id: 8, department_id: 2, specialization: 'Neuro-Ophthalmologist', fee: 260, avatar: null },
    { id: 8, user_id: 9, department_id: 3, specialization: 'Sports Medicine Specialist', fee: 220, avatar: null },
    { id: 9, user_id: 10, department_id: 4, specialization: 'Neonatologist', fee: 240, avatar: null },
    { id: 10, user_id: 11, department_id: 5, specialization: 'Radiation Oncologist', fee: 320, avatar: null },
];

// 4. PATIENTS (20 patients)
export const patients = [
    { id: 1, user_id: 12, age: 45, gender: 'Female', phone: '+1-555-0101', address: '123 Oak Street, Springfield, IL 62701' },
    { id: 2, user_id: 13, age: 62, gender: 'Male', phone: '+1-555-0102', address: '456 Maple Ave, Denver, CO 80202' },
    { id: 3, user_id: 14, age: 38, gender: 'Female', phone: '+1-555-0103', address: '789 Pine Road, Seattle, WA 98101' },
    { id: 4, user_id: 15, age: 55, gender: 'Male', phone: '+1-555-0104', address: '321 Elm Drive, Austin, TX 78701' },
    { id: 5, user_id: 16, age: 29, gender: 'Female', phone: '+1-555-0105', address: '654 Cedar Lane, Miami, FL 33101' },
    { id: 6, user_id: 17, age: 71, gender: 'Male', phone: '+1-555-0106', address: '987 Birch Blvd, Portland, OR 97201' },
    { id: 7, user_id: 18, age: 33, gender: 'Female', phone: '+1-555-0107', address: '246 Willow Way, Chicago, IL 60601' },
    { id: 8, user_id: 19, age: 48, gender: 'Male', phone: '+1-555-0108', address: '135 Aspen Court, Phoenix, AZ 85001' },
    { id: 9, user_id: 20, age: 26, gender: 'Female', phone: '+1-555-0109', address: '579 Hickory Hill, Atlanta, GA 30301' },
    { id: 10, user_id: 21, age: 53, gender: 'Male', phone: '+1-555-0110', address: '864 Sycamore St, Boston, MA 02101' },
    { id: 11, user_id: 22, age: 41, gender: 'Female', phone: '+1-555-0111', address: '753 Poplar Place, Nashville, TN 37201' },
    { id: 12, user_id: 23, age: 67, gender: 'Male', phone: '+1-555-0112', address: '159 Dogwood Dr, Charlotte, NC 28201' },
    { id: 13, user_id: 24, age: 31, gender: 'Female', phone: '+1-555-0113', address: '357 Magnolia Blvd, Las Vegas, NV 89101' },
    { id: 14, user_id: 25, age: 44, gender: 'Male', phone: '+1-555-0114', address: '246 Cypress Ave, San Diego, CA 92101' },
    { id: 15, user_id: 26, age: 58, gender: 'Female', phone: '+1-555-0115', address: '468 Redwood Rd, Minneapolis, MN 55401' },
    { id: 16, user_id: 27, age: 36, gender: 'Male', phone: '+1-555-0116', address: '579 Juniper Ln, Detroit, MI 48201' },
    { id: 17, user_id: 28, age: 22, gender: 'Female', phone: '+1-555-0117', address: '681 Spruce St, Memphis, TN 38101' },
    { id: 18, user_id: 29, age: 49, gender: 'Male', phone: '+1-555-0118', address: '792 Walnut Ave, Denver, CO 80203' },
    { id: 19, user_id: 30, age: 64, gender: 'Female', phone: '+1-555-0119', address: '813 Chestnut Ct, Philadelphia, PA 19101' },
    { id: 20, user_id: 31, age: 37, gender: 'Male', phone: '+1-555-0120', address: '924 Pecan Dr, Houston, TX 77001' },
];

// 5. APPOINTMENTS (30 appointments)
export const appointments = [
    { id: 1, patient_id: 1, doctor_id: 1, appointment_date: '2025-02-10', appointment_time: '09:00', status: 'Completed' },
    { id: 2, patient_id: 2, doctor_id: 2, appointment_date: '2025-02-11', appointment_time: '10:00', status: 'Completed' },
    { id: 3, patient_id: 3, doctor_id: 3, appointment_date: '2025-02-12', appointment_time: '11:00', status: 'Completed' },
    { id: 4, patient_id: 4, doctor_id: 1, appointment_date: '2025-02-13', appointment_time: '09:30', status: 'Completed' },
    { id: 5, patient_id: 5, doctor_id: 4, appointment_date: '2025-02-14', appointment_time: '14:00', status: 'Completed' },
    { id: 6, patient_id: 6, doctor_id: 5, appointment_date: '2025-02-15', appointment_time: '15:00', status: 'Cancelled' },
    { id: 7, patient_id: 7, doctor_id: 6, appointment_date: '2025-02-17', appointment_time: '08:30', status: 'Completed' },
    { id: 8, patient_id: 8, doctor_id: 7, appointment_date: '2025-02-18', appointment_time: '11:30', status: 'Scheduled' },
    { id: 9, patient_id: 9, doctor_id: 8, appointment_date: '2025-02-19', appointment_time: '13:00', status: 'Scheduled' },
    { id: 10, patient_id: 10, doctor_id: 9, appointment_date: '2025-02-20', appointment_time: '16:00', status: 'Completed' },
    { id: 11, patient_id: 11, doctor_id: 10, appointment_date: '2025-02-21', appointment_time: '09:00', status: 'Cancelled' },
    { id: 12, patient_id: 12, doctor_id: 1, appointment_date: '2025-02-22', appointment_time: '10:30', status: 'Scheduled' },
    { id: 13, patient_id: 13, doctor_id: 2, appointment_date: '2025-02-23', appointment_time: '14:30', status: 'Completed' },
    { id: 14, patient_id: 14, doctor_id: 3, appointment_date: '2025-02-24', appointment_time: '15:30', status: 'Scheduled' },
    { id: 15, patient_id: 15, doctor_id: 4, appointment_date: '2025-02-25', appointment_time: '08:00', status: 'Scheduled' },
    { id: 16, patient_id: 16, doctor_id: 5, appointment_date: '2025-02-26', appointment_time: '10:00', status: 'Completed' },
    { id: 17, patient_id: 17, doctor_id: 6, appointment_date: '2025-02-27', appointment_time: '11:00', status: 'Scheduled' },
    { id: 18, patient_id: 18, doctor_id: 7, appointment_date: '2025-02-28', appointment_time: '13:30', status: 'Scheduled' },
    { id: 19, patient_id: 19, doctor_id: 8, appointment_date: '2025-03-01', appointment_time: '09:00', status: 'Scheduled' },
    { id: 20, patient_id: 20, doctor_id: 9, appointment_date: '2025-03-02', appointment_time: '14:00', status: 'Scheduled' },
    { id: 21, patient_id: 1, doctor_id: 2, appointment_date: '2025-03-03', appointment_time: '10:00', status: 'Scheduled' },
    { id: 22, patient_id: 2, doctor_id: 1, appointment_date: '2025-03-04', appointment_time: '11:30', status: 'Scheduled' },
    { id: 23, patient_id: 3, doctor_id: 4, appointment_date: '2025-03-05', appointment_time: '14:00', status: 'Scheduled' },
    { id: 24, patient_id: 4, doctor_id: 5, appointment_date: '2025-03-06', appointment_time: '09:00', status: 'Scheduled' },
    { id: 25, patient_id: 5, doctor_id: 6, appointment_date: '2025-03-07', appointment_time: '15:00', status: 'Scheduled' },
    { id: 26, patient_id: 6, doctor_id: 7, appointment_date: '2025-03-08', appointment_time: '08:30', status: 'Cancelled' },
    { id: 27, patient_id: 7, doctor_id: 8, appointment_date: '2025-03-09', appointment_time: '10:30', status: 'Scheduled' },
    { id: 28, patient_id: 8, doctor_id: 9, appointment_date: '2025-03-10', appointment_time: '13:00', status: 'Scheduled' },
    { id: 29, patient_id: 9, doctor_id: 10, appointment_date: '2025-03-11', appointment_time: '16:00', status: 'Scheduled' },
    { id: 30, patient_id: 10, doctor_id: 1, appointment_date: '2025-03-12', appointment_time: '09:30', status: 'Scheduled' },
    // ── TODAY's appointments (2026-02-28) for Dr. Wilson (doctor_id=1) ──
    { id: 31, patient_id: 1, doctor_id: 1, appointment_date: '2026-02-28', appointment_time: '09:00', status: 'Scheduled' },
    { id: 32, patient_id: 2, doctor_id: 1, appointment_date: '2026-02-28', appointment_time: '10:00', status: 'Scheduled' },
    { id: 33, patient_id: 3, doctor_id: 1, appointment_date: '2026-02-28', appointment_time: '11:00', status: 'Scheduled' },
    { id: 34, patient_id: 4, doctor_id: 1, appointment_date: '2026-02-28', appointment_time: '14:00', status: 'Scheduled' },
    { id: 35, patient_id: 5, doctor_id: 1, appointment_date: '2026-02-28', appointment_time: '15:30', status: 'Scheduled' },
];

// 6. PRESCRIPTIONS (10 prescriptions)
export const prescriptions = [
    { id: 1, appointment_id: 1, diagnosis: 'Hypertensive Heart Disease', note: 'Take Amlodipine 5mg once daily. Reduce sodium intake. Follow up in 4 weeks. Monitor BP daily.' },
    { id: 2, appointment_id: 2, diagnosis: 'Migraine with Aura', note: 'Prescribed Sumatriptan 50mg as needed. Avoid known triggers. Keep headache diary. MRI scheduled.' },
    { id: 3, appointment_id: 3, diagnosis: 'Lumbar Disc Herniation', note: 'Physical therapy 3x/week. Ibuprofen 400mg post-meal. Avoid heavy lifting. Consider surgery if no improvement.' },
    { id: 4, appointment_id: 4, diagnosis: 'Angina Pectoris', note: 'Nitroglycerine spray as needed. Continue Aspirin 100mg. Stress test scheduled. Dietary changes advised.' },
    { id: 5, appointment_id: 5, diagnosis: 'Childhood Asthma', note: 'Salbutamol inhaler 2 puffs every 4-6 hours. Avoid allergens. Peak flow monitoring daily. Pulmonologist referral.' },
    { id: 6, appointment_id: 7, diagnosis: 'Atrial Fibrillation', note: 'Warfarin 5mg anticoagulation therapy. INR monitoring weekly. Avoid alcohol. Cardioversion evaluation pending.' },
    { id: 7, appointment_id: 10, diagnosis: 'Gestational Diabetes', note: 'Insulin Glargine 10 units at bedtime. Diet modification. Blood glucose monitoring 4x/day. Weekly check-ups.' },
    { id: 8, appointment_id: 13, diagnosis: 'Tension Headache', note: 'Paracetamol 500mg as needed. Relaxation techniques. Reduce screen time. Ergonomic assessment.' },
    { id: 9, appointment_id: 16, diagnosis: 'Stage II Breast Cancer', note: 'Chemotherapy cycle initiated. Anti-emetics prescribed. Nutritional support. Monthly imaging follow-up.' },
    { id: 10, appointment_id: 2, diagnosis: 'Follow-up: Migraine Management', note: 'Prophylactic Topiramate 25mg daily. Continue diary. Lifestyle modification counseling. Next review in 6 weeks.' },
];

// 7. INVENTORY / STOCKS (6 items initially)
export const inventory = [
    { id: 'MED-101', name: 'Paracetamol 500mg', category: 'Analgesics', stock: 1200, unit: 'Tablets', status: 'In Stock' },
    { id: 'MED-102', name: 'Amoxicillin 500mg', category: 'Antibiotics', stock: 45, unit: 'Capsules', status: 'Low Stock' },
    { id: 'MED-103', name: 'Ibuprofen 400mg', category: 'NSAIDs', stock: 850, unit: 'Tablets', status: 'In Stock' },
    { id: 'MED-104', name: 'Lisinopril 10mg', category: 'Antihypertensives', stock: 0, unit: 'Tablets', status: 'Out of Stock' },
    { id: 'MED-105', name: 'Metformin 500mg', category: 'Antidiabetics', stock: 320, unit: 'Tablets', status: 'In Stock' },
    { id: 'MED-106', name: 'Albuterol Inhaler', category: 'Bronchodilators', stock: 12, unit: 'Inhalers', status: 'Low Stock' },
];

// 8. BILLS (10 bills)
export const bills = [
    { id: 1, appointment_id: 1, amount: 250, status: 'Paid', created_at: '2025-02-10T10:00:00Z' },
    { id: 2, appointment_id: 2, amount: 280, status: 'Paid', created_at: '2025-02-11T11:00:00Z' },
    { id: 3, appointment_id: 3, amount: 300, status: 'Paid', created_at: '2025-02-12T12:00:00Z' },
    { id: 4, appointment_id: 4, amount: 250, status: 'Paid', created_at: '2025-02-13T10:30:00Z' },
    { id: 5, appointment_id: 5, amount: 200, status: 'Paid', created_at: '2025-02-14T15:00:00Z' },
    { id: 6, appointment_id: 6, amount: 350, status: 'Pending', created_at: '2025-02-15T16:00:00Z' },
    { id: 7, appointment_id: 7, amount: 270, status: 'Paid', created_at: '2025-02-17T09:30:00Z' },
    { id: 8, appointment_id: 10, amount: 240, status: 'Paid', created_at: '2025-02-20T17:00:00Z' },
    { id: 9, appointment_id: 13, amount: 280, status: 'Pending', created_at: '2025-02-23T15:30:00Z' },
    { id: 10, appointment_id: 16, amount: 320, status: 'Paid', created_at: '2025-02-26T11:00:00Z' },
];

// ── ANALYTICS DATA ──────────────────────────────────────
export const appointmentsPerMonth = [
    { month: 'Aug', appointments: 42, revenue: 10800 },
    { month: 'Sep', appointments: 58, revenue: 14500 },
    { month: 'Oct', appointments: 51, revenue: 12900 },
    { month: 'Nov', appointments: 67, revenue: 17100 },
    { month: 'Dec', appointments: 49, revenue: 12500 },
    { month: 'Jan', appointments: 73, revenue: 18600 },
    { month: 'Feb', appointments: 65, revenue: 16400 },
];

export const departmentDistribution = [
    { name: 'Cardiology', value: 32, color: '#3b82f6' },
    { name: 'Neurology', value: 24, color: '#8b5cf6' },
    { name: 'Orthopedics', value: 18, color: '#0d9488' },
    { name: 'Pediatrics', value: 15, color: '#f59e0b' },
    { name: 'Oncology', value: 11, color: '#ef4444' },
];

export const doctorPerformance = [
    { name: 'Dr. Wilson', appointments: 28, rating: 4.9 },
    { name: 'Dr. Chen', appointments: 22, rating: 4.8 },
    { name: 'Dr. Torres', appointments: 19, rating: 4.7 },
    { name: 'Dr. Patel', appointments: 25, rating: 4.9 },
    { name: 'Dr. Kim', appointments: 16, rating: 4.6 },
];
