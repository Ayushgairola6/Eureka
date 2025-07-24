import { configureStore } from '@reduxjs/toolkit';
import AuthReducer from './AuthSlice.ts';

export const store = configureStore({
  reducer: {
    auth: AuthReducer,
    
  },

  
  // Optional: Add middleware like this
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: false, // Disable if using non-serializable values
    }),
});

// Infer RootState and AppDispatch types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;