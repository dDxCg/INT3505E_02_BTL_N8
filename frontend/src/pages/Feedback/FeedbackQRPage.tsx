import React from 'react';
import { ScanLine } from 'lucide-react';
// Import ảnh QR từ assets của bạn
import qrCodeImg from '../../assets/images/qr-code.png';

const FeedbackQRPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FDFDF9] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* 1. Background Glow Effect (Đã tinh chỉnh cho mềm hơn) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FFFBEB] rounded-full blur-[100px] -z-10 pointer-events-none opacity-80" />

      {/* 2. Header Text */}
      <div className="text-center mb-10 z-10 relative">
        <h1 className="text-3xl md:text-[40px] font-extrabold text-[#1a1a1a] leading-[1.2] mb-3 tracking-tight font-serif">
          Bạn thấy dịch vụ của <br />
          chúng tôi thế nào?
        </h1>
        <p className="text-[#666666] text-sm font-medium">
          Mời bạn quét mã QR để gửi đánh giá nhé!
        </p>
      </div>

      {/* 3. Main Card */}
      <div className="bg-white p-5 rounded-[32px] shadow-[0_20px_40px_-10px_rgba(234,179,8,0.15)] w-full max-w-[360px] z-10 relative">
        
        {/* Teal Container */}
        <div className="relative aspect-square w-full bg-[#247c72] rounded-2xl flex items-center justify-center mb-6 overflow-hidden">
          
          {/* Ambient Light inside Teal Box (Tạo chiều sâu cho hộp xanh) */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10 pointer-events-none" />

          {/* 3D Standee Wrapper */}
          <div className="relative transform perspective-[800px] translate-y-2">
            
            {/* The Paper Stand */}
            <div className="relative bg-white px-4 py-6 rounded-[2px] shadow-2xl w-40 transform rotate-x-[8deg] origin-bottom z-20">
                {/* QR Code */}
                <div className="border-[3px] border-black/80 p-1 mb-3">
                    <img 
                      src={qrCodeImg} 
                      alt="Scan for Feedback" 
                      className="w-full aspect-square object-contain block mix-blend-multiply"
                    />
                </div>
                
                {/* Text inside standee */}
                <div className="text-center">
                    <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-900 mb-1">Scan For</p>
                    <p className="text-[7px] text-gray-500 font-medium">To Review Us</p>
                </div>
            </div>

            {/* The "Ledge" / Shelf (Cái kệ đỡ tờ giấy - Hiệu ứng quan trọng) */}
            <div className="absolute -bottom-1 left-[-10%] right-[-10%] h-2 bg-white/20 rounded-full blur-[1px] z-10"></div>
            
            {/* Drop Shadow on the floor (Bóng đổ dưới chân kệ) */}
            <div className="absolute -bottom-6 left-0 right-0 h-8 bg-black/40 blur-xl rounded-[100%] z-0 scale-x-125"></div>
          </div>
        </div>

        {/* Scan Instruction Pill */}
        <div className="flex items-center justify-center gap-2 bg-[#F5F5F2] py-2.5 px-5 rounded-full w-max mx-auto mb-2">
          <ScanLine className="w-4 h-4 text-gray-500" strokeWidth={2.5} />
          <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wide">Sử dụng camera để quét</span>
        </div>
      </div>

      {/* 4. Footer Badge */}
      <div className="mt-14 z-10">
        <div className="bg-white px-8 py-3 rounded-full shadow-[0_8px_20px_-5px_rgba(0,0,0,0.05)] border border-gray-100 flex items-center gap-2 cursor-default hover:-translate-y-1 transition-transform duration-300">
          <span className="text-sm font-bold text-gray-900">Thank you!</span>
          <span className="text-yellow-400 text-lg drop-shadow-sm">💛</span>
        </div>
      </div>
    </div>
  );
};

export default FeedbackQRPage;