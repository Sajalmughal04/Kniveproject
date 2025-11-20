import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slice/authSlice.js';
import cartReducer from './slice/cartSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,

  },
});

export default store;