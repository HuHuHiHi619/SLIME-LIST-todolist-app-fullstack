import React, { useState } from 'react';
import { register } from '../../../functions/authen';
import { useNavigate } from 'react-router-dom';

function Register() {
    const navigate = useNavigate();
    const [user, setUser] = useState({
        username: '',
        password: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser((prevForm) => ({
            ...prevForm,
            [name]: value 
        }));
    };
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            console.log('User Data:', user); // Log user data before submitting
            const response = await register(user); // Send the actual user state data
            console.log('Response:', response);
            navigate('/login')
        } catch (err) {
            console.error('Cannot sign up', err);
        }
    };

    return (
        <div>
            <h1>Register</h1>
            <form onSubmit={handleSubmit}>
                <input 
                    type="text" 
                    name="username" 
                    value={user.username} 
                    onChange={handleChange} 
                    placeholder="Username"
                />
                <input 
                    type="password" 
                    name="password" 
                    value={user.password} 
                    onChange={handleChange} 
                    placeholder="Password"
                />
                <button type="submit">Sign up</button>
            </form>
        </div>
    );
}

export default Register;
