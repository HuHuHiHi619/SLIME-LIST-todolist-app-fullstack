import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserData } from '../../../redux/userSlice';

function Settings() {
    const dispatch = useDispatch();
    const { userData, loading, error } = useSelector((state) => state.user)

    useEffect(() => {
        if (userData.id) {
            dispatch(fetchUserData(userData.id))
        }
    }, [dispatch, userData.id])

    if (loading) return <div>กำลังโหลด...</div>;
    if (error) return <div>เกิดข้อผิดพลาด: {error}</div>;

    return (
        <div>
            <h1>การตั้งค่า</h1>
            <div>
                <h2>โปรไฟล์</h2>
                <p>ชื่อผู้ใช้: {userData.username}</p>
                <p>สตรีคปัจจุบัน: {userData.currentStreak}</p>
                <p>สตรีคสูงสุด: {userData.bestStreak}</p>
                <p>ตราปัจจุบัน: {userData.currentBadge}</p>
                <div>
                    <h3>รูปโปรไฟล์</h3>
                    <img 
                        src={userData.imageProfile || "https://via.placeholder.com/124x124"} 
                        alt="รูปโปรไฟล์" 
                        style={{width: '124px', height: '124px'}}
                    />
                </div>
            </div>
            <div>
                <h2>การตั้งค่าระบบ</h2>
                <p>ธีม: {userData.settings.theme}</p>
                <p>การแจ้งเตือน: {userData.settings.notification ? 'เปิด' : 'ปิด'}</p>
            </div>
            <div>
                <h2>ข้อมูลเพิ่มเติม</h2>
                <p>วันที่ทำภารกิจล่าสุด: {userData.lastCompleted ? new Date(userData.lastCompleted).toLocaleDateString() : 'ไม่มีข้อมูล'}</p>
            </div>
        </div>
    )
}

export default Settings