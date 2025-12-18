import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { apiClient } from '@/api/client';

export default function PaymentVNPayCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Get all query parameters from VNPay
        const params: Record<string, string> = {};
        searchParams.forEach((value, key) => {
          params[key] = value;
        });

        // Call backend to process the VNPay return
        const response = await apiClient.get('/payments/vnpay/return', {
          params: params,
        });

        const data = response.data;

        if (data.ok) {
          // Check if payment was successful
          const vnpResponseCode = params.vnp_ResponseCode;

          if (vnpResponseCode === '00') {
            // Navigate to review page
            setTimeout(() => {
              navigate('/review', { replace: true });
            }, 500);
          } else {
            setTimeout(() => {
              navigate('/staff', { replace: true });
            }, 1500);
          }
        } else {
          throw new Error('Failed to process payment callback');
        }
      } catch (error: any) {
        setTimeout(() => {
          navigate('/staff', { replace: true });
        }, 1500);
      } finally {
        setProcessing(false);
      }
    };

    processCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        {processing ? (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Đang xử lý kết quả thanh toán...</p>
          </>
        ) : (
          <p className="text-lg text-gray-600">Đang chuyển hướng...</p>
        )}
      </div>
    </div>
  );
}
