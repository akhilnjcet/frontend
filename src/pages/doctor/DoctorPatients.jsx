import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Eye, UserRound, Download } from 'lucide-react';
import PageWrapper from '../../components/PageWrapper.jsx';
import AnimatedCard from '../../components/AnimatedCard.jsx';
import AnimatedButton from '../../components/AnimatedButton.jsx';
import { exportTableToPDF } from '../../utils/pdfExport.js';

// Dummy JSON Data
const PATIENTS_DATA = [
    { id: 'PT-1001', name: 'Alice Johnson', age: 34, gender: 'Female', phone: '+1 234-567-8901', lastVisit: '2023-10-15' },
    { id: 'PT-1002', name: 'Bob Smith', age: 45, gender: 'Male', phone: '+1 234-567-8902', lastVisit: '2023-09-22' },
    { id: 'PT-1003', name: 'Charlie Davis', age: 28, gender: 'Male', phone: '+1 234-567-8903', lastVisit: '2023-10-01' },
    { id: 'PT-1004', name: 'Diana Prince', age: 52, gender: 'Female', phone: '+1 234-567-8904', lastVisit: '2023-08-14' },
    { id: 'PT-1005', name: 'Evan Wright', age: 61, gender: 'Male', phone: '+1 234-567-8905', lastVisit: '2023-10-20' },
    { id: 'PT-1006', name: 'Fiona Gallagher', age: 22, gender: 'Female', phone: '+1 234-567-8906', lastVisit: '2023-07-30' },
];

export default function DoctorPatients() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [genderFilter, setGenderFilter] = useState('All');
    const [ageFilter, setAgeFilter] = useState('All'); // 'All', '<30', '30-50', '>50'

    const filteredPatients = useMemo(() => {
        return PATIENTS_DATA.filter((pt) => {
            // Search Match
            const matchesSearch = pt.name.toLowerCase().includes(search.toLowerCase()) || pt.id.toLowerCase().includes(search.toLowerCase());

            // Gender Match
            const matchesGender = genderFilter === 'All' || pt.gender === genderFilter;

            // Age Match
            let matchesAge = true;
            if (ageFilter === '<30') matchesAge = pt.age < 30;
            else if (ageFilter === '30-50') matchesAge = pt.age >= 30 && pt.age <= 50;
            else if (ageFilter === '>50') matchesAge = pt.age > 50;

            return matchesSearch && matchesGender && matchesAge;
        });
    }, [search, genderFilter, ageFilter]);

    const handleExport = () => {
        const columns = ['Patient ID', 'Name', 'Age', 'Gender', 'Phone', 'Last Visit'];
        const data = filteredPatients.map(pt => [
            pt.id, pt.name, pt.age, pt.gender, pt.phone, pt.lastVisit
        ]);
        exportTableToPDF('My Patient Roster', columns, data, 'Doctor_Patient_Roster');
    };

    return (
        <PageWrapper title="My Patients" subtitle="Manage and view your patient records">

            <AnimatedCard hover={false}>
                {/* Top Controls: Search and Filters */}
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24, alignItems: 'center' }}>

                    {/* Search Bar */}
                    <div style={{ flex: 1, minWidth: 250, position: 'relative' }}>
                        <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} size={16} />
                        <input
                            type="text"
                            placeholder="Search by Name or ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{
                                width: '100%', padding: '10px 14px 10px 40px', borderRadius: 8,
                                border: '1px solid var(--border-strong)', background: 'var(--bg-input)',
                                fontSize: 13.5, color: 'var(--text-1)', outline: 'none'
                            }}
                            onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                            onBlur={e => e.target.style.borderColor = 'var(--border-strong)'}
                        />
                    </div>

                    {/* Filter: Gender */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Filter size={14} color="var(--text-2)" />
                        <select
                            value={genderFilter}
                            onChange={(e) => setGenderFilter(e.target.value)}
                            style={{
                                padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border-strong)',
                                background: 'var(--bg-input)', fontSize: 13.5, color: 'var(--text-1)', outline: 'none'
                            }}
                        >
                            <option value="All">All Genders</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    </div>

                    {/* Filter: Age */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <select
                            value={ageFilter}
                            onChange={(e) => setAgeFilter(e.target.value)}
                            style={{
                                padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border-strong)',
                                background: 'var(--bg-input)', fontSize: 13.5, color: 'var(--text-1)', outline: 'none'
                            }}
                        >
                            <option value="All">All Ages</option>
                            <option value="<30">Under 30</option>
                            <option value="30-50">30 - 50</option>
                            <option value=">50">Over 50</option>
                        </select>
                    </div>

                    {/* Export Button */}
                    <button
                        onClick={handleExport}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px',
                            background: 'var(--color-primary)', color: '#fff', border: 'none',
                            borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                            marginLeft: 'auto'
                        }}
                    >
                        <Download size={14} /> Export Table
                    </button>

                </div>

                {/* Table */}
                <div style={{ overflowX: 'auto' }}>
                    <table className="tbl">
                        <thead>
                            <tr>
                                <th>Patient ID</th>
                                <th>Name</th>
                                <th>Age</th>
                                <th>Gender</th>
                                <th>Phone</th>
                                <th>Last Visit</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPatients.length > 0 ? filteredPatients.map((pt) => (
                                <tr key={pt.id}>
                                    <td style={{ fontWeight: 600, color: 'var(--text-1)' }}>{pt.id}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{
                                                width: 32, height: 32, borderRadius: '50%', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                <UserRound size={16} />
                                            </div>
                                            <span style={{ fontWeight: 500, color: 'var(--text-1)' }}>{pt.name}</span>
                                        </div>
                                    </td>
                                    <td>{pt.age}</td>
                                    <td>{pt.gender}</td>
                                    <td>{pt.phone}</td>
                                    <td>{pt.lastVisit}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <AnimatedButton
                                            size="sm"
                                            variant="ghost"
                                            icon={Eye}
                                            onClick={() => navigate(`/doctor/patients/${pt.id}`)}
                                            style={{ color: 'var(--color-primary)', borderColor: 'var(--color-primary)' }}
                                        >
                                            View
                                        </AnimatedButton>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-3)' }}>
                                        No patients found matching the criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

            </AnimatedCard>
        </PageWrapper>
    );
}
