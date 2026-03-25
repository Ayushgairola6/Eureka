import { createSlice } from "@reduxjs/toolkit";

interface PaymentsState {
  isProcessingPayment: boolean;
  paymentStatus: string;
}

const initialState: PaymentsState = {
  isProcessingPayment: false,
  paymentStatus: "idle",
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
  },
});

export const { setIsProcessingPayment, setPaymentStatus } =
  paymentsSlice.actions;
export default paymentsSlice.reducer;
