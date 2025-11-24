// Redux/slice/authSlice.js - COMPLETE FIXED VERSION
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  role: JSON.parse(localStorage.getItem('user'))?.role || null,
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
      state.role = action.payload.user.role;
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
    
    // ✅ FIXED LOGOUT - Clears everything including admin data
    logout: (state) => {
      console.log('🚪 ========================================');
      console.log('🚪 LOGOUT INITIATED');
      console.log('🚪 Current User:', state.user?.name);
      console.log('🚪 Current Role:', state.role);
      console.log('🚪 ========================================');
      
      // 1️⃣ Reset Redux state
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.role = null;
      state.loading = false;
      state.error = null;
      
      // 2️⃣ Clear ALL localStorage items (regular + admin)
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      localStorage.removeItem('authorizedAdminTab');
      
      console.log('✅ localStorage cleared');
      
      // 3️⃣ Clear sessionStorage
      sessionStorage.removeItem('currentTabId');
      
      console.log('✅ sessionStorage cleared');
      console.log('✅ Redux state reset');
      console.log('🚪 LOGOUT COMPLETE');
      console.log('🚪 ========================================');
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
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(state.user));
      
      // If admin, update admin data too
      if (state.role === 'admin') {
        localStorage.setItem('adminData', JSON.stringify(state.user));
      }
      
      console.log('✅ User data updated');
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
        console.log('👤 User:', user.name);
        console.log('🎭 Role:', user.role);
      } else {
        console.log('❌ No saved auth found');
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