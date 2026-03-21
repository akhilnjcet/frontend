import { useAuthStore } from '../store/index.js';

const API_URL = 'https://mongodbbackend-alpha.vercel.app/api';

const getHeaders = () => {
    const token = useAuthStore.getState().token;
    return {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${token}\`
    };
};

export const createPrescription = async (data) => {
    const res = await fetch(\`\${API_URL}/prescriptions\`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create prescription');
    return res.json();
};

export const sendPrescriptionToPharmacy = async (id) => {
    const res = await fetch(\`\${API_URL}/prescriptions/send/\${id}\`, {
        method: 'PUT',
        headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to send prescription');
    return res.json();
};

export const getPharmacyPrescriptions = async () => {
    const res = await fetch(\`\${API_URL}/prescriptions/pharmacy\`, {
        headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch pharmacy prescriptions');
    return res.json();
};

export const dispensePrescription = async (id) => {
    const res = await fetch(\`\${API_URL}/prescriptions/dispense/\${id}\`, {
        method: 'PUT',
        headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to dispense prescription');
    return res.json();
};

export const getMyPrescriptions = async () => {
    const res = await fetch(\`\${API_URL}/prescriptions/my\`, {
        headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch my prescriptions');
    return res.json();
};

// Admin endpoints
export const getAdminStats = async () => {
    const res = await fetch(\`\${API_URL}/admin/stats\`, {
        headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
};

export const getAdminUsers = async () => {
    const res = await fetch(\`\${API_URL}/admin/users\`, {
        headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
};

export const deleteAdminUser = async (id) => {
    const res = await fetch(\`\${API_URL}/admin/user/\${id}\`, {
        method: 'DELETE',
        headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete user');
    return res.json();
};

export const updateAdminUserStatus = async (id, status) => {
    const res = await fetch(\`\${API_URL}/admin/user/\${id}/block\`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update user status');
    return res.json();
};
