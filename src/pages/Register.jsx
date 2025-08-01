import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../API/RegisterApi';
import styles from './Register.module.css';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        empId: '',
        email: '',
        password: '',
        role: '',
        technology: '',
        resourceType: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        if (!formData.fullName || !formData.empId || !formData.email || !formData.password || !formData.role) {
            setError('All fields marked with * are required');
            return false;
        }

        if (formData.role === 'employee') {
            if (!formData.technology || !formData.resourceType) {
                setError('Technology and Resource Type are required for employee role');
                return false;
            }
            if (!['OM', 'TCT1', 'TCT2'].includes(formData.resourceType)) {
                setError('Resource Type must be OM, TCT1, or TCT2');
                return false;
            }
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            // Format role to match backend expectations
            let role;
            switch(formData.role) {
                case 'employee':
                    role = 'EMPLOYEE';
                    break;
                case 'sales-team':
                    role = 'SALES_TEAM';
                    break;
                case 'delivery_team':
                    role = 'DELIVERY_TEAM';
                    break;
                default:
                    setError('Invalid role selected');
                    setLoading(false);
                    return;
            }

            const payload = {
                fullName: formData.fullName.trim(),
                empId: formData.empId.trim(),
                email: formData.email.trim(),
                password: formData.password,
                role: role,
                technology: formData.role === 'employee' ? formData.technology : '',
                resourceType: formData.role === 'employee' ? formData.resourceType : ''
            };

            await registerUser(payload);
            
            // Show success message and redirect to login
            setError('Registration successful! Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 1500); // Redirect after 1.5 seconds
            
        } catch (err) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.formWrapper}>
                <h2 className={styles.heading}>AJA Interview Prep Join Us</h2>
                <form className={styles.form} onSubmit={handleSubmit}>
                    {error && (
                        <div className={styles.error} role="alert">
                            <span>{error}</span>
                        </div>
                    )}
                    <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        required
                        className={styles.input}
                        placeholder="Full Name *"
                        value={formData.fullName}
                        onChange={handleChange}
                    />
                    <input
                        id="empId"
                        name="empId"
                        type="text"
                        required
                        className={styles.input}
                        placeholder="Employee ID *"
                        value={formData.empId}
                        onChange={handleChange}
                    />
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        className={styles.input}
                        placeholder="Email address *"
                        value={formData.email}
                        onChange={handleChange}
                    />
                    <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        className={styles.input}
                        placeholder="Password *"
                        value={formData.password}
                        onChange={handleChange}
                    />
                    <select
                        id="role"
                        name="role"
                        required
                        className={styles.select}
                        value={formData.role}
                        onChange={handleChange}
                    >
                        <option value="">Select Role *</option>
                        <option value="employee">Employee</option>
                        <option value="sales-team">Sales Team</option>
                        <option value="delivery_team">Delivery Team</option>
                    </select>
                    {formData.role === 'employee' && (
                        <>
                            <select
                                id="technology"
                                name="technology"
                                required
                                className={styles.select}
                                value={formData.technology}
                                onChange={handleChange}
                            >
                                <option value="">Select Technology *</option>
                                <option value="Java">Java</option>
                                <option value="Python">Python</option>
                                <option value=".NET">.NET</option>
                                <option value="DevOps">DevOps</option>
                                <option value="SalesForce">SalesForce</option>
                                <option value="UI Development">UI Development</option>
                                <option value="Testing">Testing</option>
                            </select>
                            <select
                                id="resourceType"
                                name="resourceType"
                                required
                                className={styles.select}
                                value={formData.resourceType}
                                onChange={handleChange}
                            >
                                <option value="">Select Resource Type *</option>
                                <option value="OM">OM</option>
                                <option value="TCT1">TCT1</option>
                                <option value="TCT2">TCT2</option>
                            </select>
                        </>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        className={styles.button}
                    >
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Register;
