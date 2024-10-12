import React, { useState } from 'react';
import { userLogin } from '../../../functions/authen'; // นำเข้าฟังก์ชัน login
import { useNavigate } from 'react-router-dom'; // นำเข้า useNavigate

function Login() {
    const [user, setUser] = useState({
        username: '',
        password: ''
    });

    const [error, setError] = useState('');
    const navigate = useNavigate(); // สร้าง instance ของ useNavigate

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser((prevForm) => ({
            ...prevForm,
            [name]: value 
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user.username || !user.password) {
            setError('Username and password are required.');
            return;
        }
    
        setError(''); // เคลียร์ข้อความแสดงข้อผิดพลาด
        try {
            console.log('Login Data:', user);
            const response = await userLogin(user); // ส่งข้อมูลสำหรับ login
            console.log('Login Response:', response);
            
            // ไม่มีการเก็บ token ใน localStorage
            // เนื่องจากคุณใช้ cookie ที่ถูกตั้งค่าใน backend
    
            navigate('/'); // เปลี่ยนเส้นทางไปยังหน้า home หรือหน้าที่คุณต้องการ
        } catch (err) {
            console.error('Cannot log in', err);
            setError('Login failed. Please try again.');
        }
    };

    return (
        <div>
            <h1>Login</h1>
            {error && <p className="error">{error}</p>} {/* แสดงข้อความแสดงข้อผิดพลาด */}
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
                <button type="submit">Log in</button>
            </form>
        </div>
    );
}

export default Login;
