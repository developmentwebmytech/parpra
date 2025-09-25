'use client'; // Optional: add this if using client-side features in Next.js 13+
import type React from "react"
import AuthPopup from '@/components/auth-popup';


const Userlogin = () => {
  return (
    <div>
     <AuthPopup onClose={() => {}}/>
    </div>
  );
};

export default Userlogin;
