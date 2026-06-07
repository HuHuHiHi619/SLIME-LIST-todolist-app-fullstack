import React, { useState, useEffect } from 'react';

const AppleUserNotification = () => {
  const [isAppleDevice, setIsAppleDevice] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // ตรวจสอบว่าเป็นอุปกรณ์ Apple หรือไม่
    const userAgent = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    
    if (isIOS) {
      setIsAppleDevice(true);
      
      // ตรวจสอบว่าเคยแสดงแล้วหรือไม่
      const hasSeenNotice = sessionStorage.getItem('apple-modal-shown');
      if (hasSeenNotice !== 'true') {
        setIsOpen(true);
      }
    }
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem('apple-modal-shown', 'true');
    setIsOpen(false);
  };

  if (!isAppleDevice || !isOpen) return null;

  return (
    <div className="popup-overlay">
      <div className="bg-purpleMain rounded-lg max-w-md w-full p-6">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-amber-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-white">ขออภัยในความไม่สะดวกสำหรับผู้ใช้อุปกรณ์ Apple</h3>
          <p className="mt-2 text-sm text-gray-300">
            เราพบปัญหาการทำงานของคุกกี้ระหว่าง domain บนเบราว์เซอร์ Safari ซึ่งอาจส่งผลให้:
          </p>
          <ul className="mt-2 text-sm text-left text-gray-300 pl-5 list-disc">
            <li>การล็อกอินไม่เสถียร หรือต้องล็อกอินบ่อยครั้ง</li>
            <li>การเปลี่ยนสถานะกลับเป็น guest โดยไม่ได้ตั้งใจ</li>
            <li>ข้อมูลบางส่วนอาจไม่ถูกบันทึก</li>
          </ul>
          <div className="mt-4 text-sm text-gray-200">
            <strong>คำแนะนำ:</strong> ใช้ Chrome บน iOS หรือใช้งานบนเครื่องคอมพิวเตอร์เพื่อประสบการณ์ที่ดีที่สุด
          </div>
          <div className="mt-4">
            <button 
              type="button" 
              onClick={handleDismiss}
              className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-amber-600 text-base font-medium text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 sm:text-sm"
            >
              รับทราบและดำเนินการต่อ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppleUserNotification;