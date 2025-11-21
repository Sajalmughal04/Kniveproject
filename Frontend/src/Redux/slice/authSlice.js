// Redux/slice/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  role: JSON.parse(localStorage.getItem('user'))?.role || null, // ✅ Load role from localStorage
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.role = action.payload.user.role; // ✅ Store role
      state.error = null;
      
      // ✅ Save to localStorage
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      localStorage.setItem('token', action.payload.token);
      
      console.log('✅ Redux Auth: User logged in');
      console.log('👤 User:', action.payload.user.name);
      console.log('🎭 Role:', action.payload.user.role);
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.role = null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.role = null;
      state.loading = false;
      state.error = null;
      
      // ✅ Clear localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      
      console.log('✅ Redux Auth: User logged out');
    },
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      // ✅ Update role if changed
      if (action.payload.role) {
        state.role = action.payload.role;
      }
      localStorage.setItem('user', JSON.stringify(state.user));
    },
    // ✅ Initialize auth from localStorage on page refresh
    initializeAuth: (state) => {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');
      
      if (user && token) {
        state.user = user;
        state.token = token;
        state.role = user.role;
        state.isAuthenticated = true;
        console.log('✅ Auth initialized from localStorage');
      }
    },
  },
});

export const { 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  logout, 
  clearError,
  updateUser,
  initializeAuth
} = authSlice.actions;

export default authSlice.reducer;