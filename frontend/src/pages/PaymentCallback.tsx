import { useAppSelector, useAppDispatch } from "../store/hooks";
import { useSearchParams } from "react-router";
import { useEffect } from "react";
import { setPaymentStatus } from "../store/PaymentsSlice.ts";

export const PaymentCallback = () => {
    const [searchParams] = useSearchParams()
    const dispatch = useAppDispatch()
    useEffect(() => {
        const serverMessage = searchParams.get("message")
        if (serverMessage) {
            dispatch(setPaymentStatus(serverMessage))
        }
    }, [])
    const { isProcessingPayment, paymentStatus } = useAppSelector(s => s.payments)
    return (<>
        <div>

        </div>
        {isProcessingPayment ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Processing your payment...</div>
                <div style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #3498db', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 2s linear infinite', margin: '0 auto' }}></div>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        ) : paymentStatus === 'success' ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#28a745' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>✅ Payment Successful!</div>
                <div style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Thank you for your purchase. Your order has been confirmed.</div>
                <button style={{ padding: '0.5rem 1rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }} onClick={() => window.location.href = '/'}>Return to Home</button>
            </div>
        ) : paymentStatus === 'failed' ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#dc3545' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>❌ Payment Failed</div>
                <div style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Unfortunately, your payment could not be processed. Please try again.</div>
                <button style={{ padding: '0.5rem 1rem', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '1rem' }} onClick={() => window.location.reload()}>Retry Payment</button>
                <button style={{ padding: '0.5rem 1rem', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }} onClick={() => window.location.href = '/'}>Go Back</button>
            </div>
        ) : (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ fontSize: '1.5rem' }}>Payment status unknown. Please contact support if you have any issues.</div>
            </div>
        )}
    </>)
}

export default PaymentCallback;