// ═══════════════════════════════════════════════════════
// USER SERVICE - Connecting to local Backend 
// ═══════════════════════════════════════════════════════

const API_URL = 'http://localhost:5000/api';

// POST /api/auth/login
export const loginUser = async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Invalid credentials');
    return data;
};

// POST /api/auth/register
export const createUser = async (userData) => {
    const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create user');
    return data;
};

// GET /api/users
export const getAllUsers = async () => {
    // Implement standard backend fetches here when scaling!
    return [];
};

// GET /api/users/:id
export const getUserById = async (id) => {
    return null;
};

// PUT /api/users/:id
export const updateUser = async (id, data) => {
    return null;
};

// DELETE /api/users/:id
export const deleteUser = async (id) => {
    return { success: true };
};

