const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'database.sqlite');

async function seed() {
    const db = await open({ filename: DB_PATH, driver: sqlite3.Database });
    console.log("Connected to local SQLite database...");

    try {
        // Clear existing tables
        await db.run('DELETE FROM prescriptions');
        await db.run('DELETE FROM appointments');
        await db.run('DELETE FROM doctors');
        await db.run('DELETE FROM patients');
        await db.run('DELETE FROM users WHERE role != "admin"');

        console.log("Old data wiped. Seeding initial test data...");

        // USERS for Doctors
        await db.run('INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)', [2, 'Dr. James Wilson', 'james.wilson@medicare.pro', 'doctor123', 'doctor']);
        await db.run('INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)', [3, 'Dr. Emily Chen', 'emily.chen@medicare.pro', 'doctor123', 'doctor']);

        // DOCTORS 
        await db.run('INSERT INTO doctors (id, user_id, department_id, specialization, fee) VALUES (?, ?, ?, ?, ?)', [1, 2, 1, 'Interventional Cardiologist', 250]);
        await db.run('INSERT INTO doctors (id, user_id, department_id, specialization, fee) VALUES (?, ?, ?, ?, ?)', [2, 3, 2, 'Neurologist & Epileptologist', 280]);

        // USERS for Patients
        await db.run('INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)', [12, 'Alice Johnson', 'alice@example.com', 'patient123', 'patient']);
        await db.run('INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)', [13, 'Bob Martinez', 'bob@example.com', 'patient123', 'patient']);

        // PATIENTS
        await db.run('INSERT INTO patients (id, user_id, age, gender, phone, address) VALUES (?, ?, ?, ?, ?, ?)', [1, 12, 45, 'Female', '+1-555-0101', '123 Oak Street']);
        await db.run('INSERT INTO patients (id, user_id, age, gender, phone, address) VALUES (?, ?, ?, ?, ?, ?)', [2, 13, 62, 'Male', '+1-555-0102', '456 Maple Ave']);

        // APPOINTMENTS
        await db.run('INSERT INTO appointments (id, patient_id, doctor_id, appointment_date, appointment_time, status) VALUES (?, ?, ?, ?, ?, ?)', [1, 1, 1, '2025-02-10', '09:00', 'Completed']);
        await db.run('INSERT INTO appointments (id, patient_id, doctor_id, appointment_date, appointment_time, status) VALUES (?, ?, ?, ?, ?, ?)', [2, 2, 2, '2025-02-11', '10:00', 'Scheduled']);

        // PRESCRIPTIONS
        await db.run('INSERT INTO prescriptions (id, appointment_id, diagnosis, note) VALUES (?, ?, ?, ?)', [1, 1, 'Hypertensive Heart Disease', 'Take Amlodipine 5mg once daily. Reduce sodium intake.']);

        console.log("✅ Seed successfully injected!");
    } catch (e) {
        console.error("❌ Error during DB Seeding:", e);
    } finally {
        await db.close();
    }
}

seed();
