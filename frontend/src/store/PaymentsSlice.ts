import { createSlice } from "@reduxjs/toolkit";

interface PaymentsState {
  isProcessingPayment: boolean;
  paymentStatus: string;
  order_id: string | null;
}

const initialState: PaymentsState = {
  isProcessingPayment: false,
  paymentStatus: "idle",
  order_id: null,
};

const paymentsSlice = createSlice({
  name: "payments",
  initialState,
  reducers: {
    setIsProcessingPayment: (state, action: { payload: boolean }) => {
      state.isProcessingPayment = action.payload;
    },
    setPaymentStatus: (state, action: { payload: string }) => {
      state.paymentStatus = action.payload;
    },
    setOrderId: (state, action) => {
      state.order_id = action.payload;
    },
  },
});

export const { setIsProcessingPayment, setPaymentStatus, setOrderId } =
  paymentsSlice.actions;
export default paymentsSlice.reducer;
