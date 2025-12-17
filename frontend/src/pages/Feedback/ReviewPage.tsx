import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export default function ReviewPage() {
  const navigate = useNavigate();

  // Auto-redirect after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/guest-display');
    }, 10000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 dark:from-gray-900 dark:via-amber-950 dark:to-orange-950 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top Right Blob */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-orange-300/30 dark:bg-orange-600/20 rounded-full blur-3xl animate-pulse"
             style={{ animationDuration: '4s' }} />

        {/* Bottom Left Blob */}
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-amber-300/30 dark:bg-amber-600/20 rounded-full blur-3xl animate-pulse"
             style={{ animationDuration: '6s', animationDelay: '1s' }} />

        {/* Center Accent */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-orange-200/20 to-transparent dark:from-orange-500/10 blur-2xl" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12 gap-2">
        {/* Header with Icon */}
        <div className="text-center mb-8 animate-fadeIn">
      
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-3 tracking-tight"
              style={{ fontFamily: "'Be Vietnam Pro', 'Quicksand', sans-serif" }}>
            Mời bạn Quét QR để đánh giá
          </h1>

          <p className="text-2xl text-center sm:text-lg text-gray-600 dark:text-gray-400 gap-3"
             style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
            Cảm ơn bạn đã ghé thăm. Ý kiến của bạn rất quan trọng với chúng tôi!
          </p>
        </div>

        {/* QR Code Card */}
        <div className="w-full max-w-md animate-scaleIn gap-10" style={{ animationDelay: '0.2s' }}>
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl shadow-orange-500/20 dark:shadow-orange-600/30 p-8 sm:p-12 relative overflow-hidden">
            {/* Card Decorative Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-100/50 via-transparent to-amber-100/50 dark:from-orange-900/20 dark:via-transparent dark:to-amber-900/20 pointer-events-none" />

            {/* QR Code Container */}
            <div className="relative">
              <div className="bg-gradient-to-br from-orange-100 to-amber-100 dark:from-gray-700 dark:to-gray-600 rounded-2xl p-6 sm:p-8 shadow-inner">
                {/* QR Code with Glow Effect */}
                <div className="relative">
                  {/* Glow Background */}
                  <div className="absolute inset-0 bg-orange-400/30 dark:bg-orange-500/40 blur-2xl rounded-2xl animate-pulse"
                       style={{ animationDuration: '3s' }} />

                  {/* QR Code Image */}
                  <div className="relative bg-white dark:bg-gray-100 rounded-xl p-4 shadow-lg">
                    <img
                      src="/src/assets/images/qr-code.png"
                      alt="QR Code for Review"
                      className="w-full h-auto rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="mt-6 text-center">
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 font-medium"
                   style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
                  Sử dụng camera điện thoại để quét mã QR
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center animate-fadeIn" style={{ animationDelay: '0.4s' }}>
          <p className="text-medium text-gray-500 dark:text-gray-500 flex items-center justify-center gap-2"
             style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
            <span className="inline-block w-2 h-2 bg-orange-400 rounded-full animate-ping" />
            Đánh giá của bạn giúp chúng tôi phục vụ tốt hơn
          </p>
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out forwards;
        }

        .animate-scaleIn {
          animation: scaleIn 0.8s ease-out forwards;
          opacity: 0;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-fadeIn,
          .animate-scaleIn,
          .animate-pulse,
          .animate-ping {
            animation: none;
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
    </div>
  );
}
