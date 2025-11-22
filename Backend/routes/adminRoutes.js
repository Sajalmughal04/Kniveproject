// backend/routes/adminRoutes.js - COMPLETE ADMIN ROUTES
import express from 'express';
import User from '../models/User.js';
import { protectAdmin } from '../Middleware/authMiddleware.js';

const router = express.Router();

// ✅ Admin profile endpoint - CRITICAL FOR FRONTEND VERIFICATION
router.get('/profile', protectAdmin, (req, res) => {
  console.log('📊 Admin profile request received');
  console.log('👤 Admin user:', req.user.email);
  console.log('👤 Admin role:', req.user.role);
  
  res.json({ 
    success: true, 
    data: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role  // ✅ CRITICAL: Must be 'admin'
    }
  });
});

// ✅ Get all users (Admin only)
router.get('/users', protectAdmin, async (req, res) => {
  try {
    console.log('👥 Fetching all users...');
    
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    console.log(`✅ Found ${users.length} users`);
    
    res.json({ 
      success: true, 
      count: users.length,
      users 
    });
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching users',
      error: error.message 
    });
  }
});

// ✅ Get user by ID (Admin only)
router.get('/users/:id', protectAdmin, async (req, res) => {
  try {
    console.log('🔍 Fetching user by ID:', req.params.id);
    
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    console.log('✅ User found:', user.email);
    
    res.json({ 
      success: true, 
      user 
    });
  } catch (error) {
    console.error('❌ Error fetching user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching user',
      error: error.message 
    });
  }
});

// ✅ Update user role (Admin only)
router.put('/users/:id/role', protectAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    
    console.log('🔄 Updating user role...');
    console.log('👤 User ID:', req.params.id);
    console.log('👤 New role:', role);
    
    // Validate role
    if (!['user', 'admin'].includes(role)) {
      console.log('❌ Invalid role provided');
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid role. Must be "user" or "admin"' 
      });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    console.log('✅ User role updated successfully');
    
    res.json({ 
      success: true, 
      message: 'User role updated successfully',
      user 
    });
  } catch (error) {
    console.error('❌ Error updating user role:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating user role',
      error: error.message 
    });
  }
});

// ✅ Delete user (Admin only)
router.delete('/users/:id', protectAdmin, async (req, res) => {
  try {
    console.log('🗑️ Deleting user...');
    console.log('👤 User ID:', req.params.id);
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // CRITICAL: Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      console.log('❌ Admin trying to delete own account - Blocked');
      return res.status(400).json({ 
        success: false, 
        message: 'You cannot delete your own account' 
      });
    }
    
    await User.findByIdAndDelete(req.params.id);
    
    console.log('✅ User deleted successfully');
    
    res.json({ 
      success: true, 
      message: 'User deleted successfully' 
    });
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting user',
      error: error.message 
    });
  }
});

// ✅ Admin dashboard stats (Admin only)
router.get('/stats', protectAdmin, async (req, res) => {
  try {
    console.log('📊 Fetching admin dashboard stats...');
    
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    
    console.log(`📊 Total Users: ${totalUsers}`);
    console.log(`📊 Total Admins: ${totalAdmins}`);
    
    res.json({ 
      success: true, 
      stats: {
        totalUsers,
        totalAdmins,
        totalAccounts: totalUsers + totalAdmins
      }
    });
  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching stats',
      error: error.message 
    });
  }
});

export default router;