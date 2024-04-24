import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
    const [user, setUser] = useState(null);
    const [passwords, setPasswords] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3001/api/profile', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
                fetchPasswords(token);
            } else {
                console.error('Failed to fetch user data');
            }
            setLoading(false);
        };

        fetchUser();
    }, []);

    const fetchPasswords = async (token) => {
        const response = await fetch('http://localhost:3001/api/passwords', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const passwordsData = await response.json();
            setPasswords(passwordsData.map(password => ({
                ...password,
                isVisible: false 
            })));
        } else {
            console.error('Failed to fetch passwords');
        }
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const filteredPasswords = passwords.filter(password =>
        password.service_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddPasswordClick = () => {
        navigate('/add-password');
    };

    const handleGeneratePasswordClick = () => {
      navigate('/password-generator');
  };

    const toggleVisibility = (id) => {
        setPasswords(passwords.map(password =>
            password.id === id ? { ...password, isVisible: !password.isVisible } : password
        ));
    };

    const handleDelete = async (id) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3001/api/passwords/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            setPasswords(passwords.filter(password => password.id !== id));
        } else {
            console.error('Failed to delete password');
        }
    };

    const startEdit = (password) => {
        setEditingId(password.id);
        setNewPassword(password.password); 
    };

    const handleUpdate = async (id) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3001/api/passwords/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ service_name: passwords.find(p => p.id === id).service_name, username: passwords.find(p => p.id === id).username, newPassword })
        });

        if (response.ok) {
            const updatedPasswords = passwords.map(password => 
                password.id === id ? { ...password, password: newPassword, isVisible: false } : password
            );
            setPasswords(updatedPasswords);
            setEditingId(null);
        } else {
            console.error('Failed to update password:', await response.text());
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login'); 
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="dashboard-container">
            <h1>GuardianPass Home</h1>
            {user ? (
                <div>
                    <h2>Welcome, {user.username}!</h2>
                    <p>Email: {user.email}</p>
                    <input
                        type="text"
                        placeholder="Search by service name..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    <h3>Your Stored Passwords</h3>
                    <div className="passwords-list">
                        {filteredPasswords.map((password) => (
                            <div key={password.id} className="password-entry">
                                <p>Service: {password.service_name}</p>
                                <p>Username: {password.username}</p>
                                <button onClick={() => toggleVisibility(password.id)}>
                                    {password.isVisible ? 'Hide' : 'Show'} Password
                                </button>
                                {password.isVisible && (editingId === password.id ? (
                                    <div>
                                        <input type="text" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                                        <button onClick={() => handleUpdate(password.id)}>Save Changes</button>
                                    </div>
                                ) : (
                                    <div>
                                        <p>Password: {password.password}</p>
                                        <button onClick={() => startEdit(password)}>Edit</button>
                                    </div>
                                ))}
                                <button onClick={() => handleDelete(password.id)}>Delete</button>
                            </div>
                        ))}
                    </div>
                    <button onClick={handleAddPasswordClick} style={{ fontWeight: 'bold' }}>Add Password</button>
                    <button onClick={handleGeneratePasswordClick} style={{ fontWeight: 'bold' }}>Generate Password/Test Strength</button>
                    <button onClick={handleLogout} style={{ fontWeight: 'bold' }}>Log Out</button>
                </div>
            ) : (
                <p>Please log in to view your information.</p>
            )}
        </div>
    );
}

export default Dashboard;
