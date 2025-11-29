import React, { useState, useEffect } from 'react';
import { RefreshCw, Plus, Edit2, Trash2, Tag, Calendar, TrendingUp, ToggleLeft, ToggleRight } from 'lucide-react';
import axios from 'axios';

export default function PromoCodesPage({ API_URL }) {
    const [promoCodes, setPromoCodes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingPromo, setEditingPromo] = useState(null);
    const [promoForm, setPromoForm] = useState({
        code: '',
        discountType: 'percentage',
        discountValue: '',
        expirationDate: '',
        usageLimit: '',
        isActive: true
    });

    const getAuthHeaders = () => {
        const token = localStorage.getItem('adminToken');
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    };

    const fetchPromoCodes = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/promocodes`, {
                headers: getAuthHeaders()
            });

            if (response.data.success) {
                setPromoCodes(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching promo codes:', error);
            alert('Failed to fetch promo codes');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchPromoCodes();
    }, []);

    const generateRandomCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setPromoForm({ ...promoForm, code });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const promoData = {
                code: promoForm.code.toUpperCase(),
                discountType: promoForm.discountType,
                discountValue: Number(promoForm.discountValue),
                expirationDate: promoForm.expirationDate,
                usageLimit: promoForm.usageLimit ? Number(promoForm.usageLimit) : null,
                isActive: promoForm.isActive
            };

            if (editingPromo) {
                await axios.put(
                    `${API_URL}/promocodes/${editingPromo._id}`,
                    promoData,
                    { headers: getAuthHeaders() }
                );
                alert('Promo code updated successfully!');
            } else {
                await axios.post(
                    `${API_URL}/promocodes/create`,
                    promoData,
                    { headers: getAuthHeaders() }
                );
                alert('Promo code created successfully!');
            }

            fetchPromoCodes();
            handleCloseModal();
        } catch (error) {
            console.error('Error saving promo code:', error);
            alert(error.response?.data?.message || 'Failed to save promo code');
        }
        setLoading(false);
    };

    const handleEdit = (promo) => {
        setEditingPromo(promo);
        setPromoForm({
            code: promo.code,
            discountType: promo.discountType,
            discountValue: promo.discountValue,
            expirationDate: new Date(promo.expirationDate).toISOString().split('T')[0],
            usageLimit: promo.usageLimit || '',
            isActive: promo.isActive
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this promo code?')) return;

        setLoading(true);
        try {
            await axios.delete(`${API_URL}/promocodes/${id}`, {
                headers: getAuthHeaders()
            });
            alert('Promo code deleted successfully!');
            fetchPromoCodes();
        } catch (error) {
            console.error('Error deleting promo code:', error);
            alert('Failed to delete promo code');
        }
        setLoading(false);
    };

    const toggleActive = async (promo) => {
        setLoading(true);
        try {
            await axios.put(
                `${API_URL}/promocodes/${promo._id}`,
                { ...promo, isActive: !promo.isActive },
                { headers: getAuthHeaders() }
            );
            fetchPromoCodes();
        } catch (error) {
            console.error('Error toggling promo code:', error);
            alert('Failed to update promo code status');
        }
        setLoading(false);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingPromo(null);
        setPromoForm({
            code: '',
            discountType: 'percentage',
            discountValue: '',
            expirationDate: '',
            usageLimit: '',
            isActive: true
        });
    };

    const isExpired = (date) => new Date(date) < new Date();

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
                <div className="mb-4 md:mb-0">
                    <h2 className="text-3xl font-bold text-gray-800">Promo Codes</h2>
                    <p className="text-gray-600 mt-1">Manage discount codes for customers</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={fetchPromoCodes}
                        disabled={loading}
                        className="flex items-center bg-white text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition border border-gray-300 shadow-sm">
                        <RefreshCw size={16} className="mr-2" />
                        Refresh
                    </button>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition shadow-sm">
                        <Plus size={20} className="mr-2" />
                        Create Promo Code
                    </button>
                </div>
            </div>

            {/* Promo Codes Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Code</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Discount</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Expiration</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Usage</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {promoCodes.map((promo) => (
                                <tr key={promo._id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <Tag size={18} className="text-gray-400 mr-2" />
                                            <span className="font-mono font-bold text-gray-900">{promo.code}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-semibold text-gray-900">
                                            {promo.discountType === 'percentage'
                                                ? `${promo.discountValue}%`
                                                : `Rs. ${promo.discountValue}`
                                            }
                                        </span>
                                        <span className="text-xs text-gray-500 ml-2">
                                            {promo.discountType === 'percentage' ? 'off' : 'discount'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <Calendar size={16} className="text-gray-400 mr-2" />
                                            <span className={`text-sm ${isExpired(promo.expirationDate) ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                                                {new Date(promo.expirationDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                        {isExpired(promo.expirationDate) && (
                                            <span className="text-xs text-red-600">Expired</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <TrendingUp size={16} className="text-gray-400 mr-2" />
                                            <span className="text-sm text-gray-600">
                                                {promo.usedCount} / {promo.usageLimit || '∞'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => toggleActive(promo)}
                                            className="flex items-center gap-2"
                                        >
                                            {promo.isActive ? (
                                                <>
                                                    <ToggleRight size={24} className="text-green-600" />
                                                    <span className="text-sm font-medium text-green-700">Active</span>
                                                </>
                                            ) : (
                                                <>
                                                    <ToggleLeft size={24} className="text-gray-400" />
                                                    <span className="text-sm font-medium text-gray-500">Inactive</span>
                                                </>
                                            )}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handleEdit(promo)}
                                                className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition border border-gray-300"
                                                title="Edit">
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(promo._id)}
                                                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition border border-red-300"
                                                title="Delete">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {promoCodes.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <Tag size={48} className="mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-semibold">No promo codes found</p>
                        <p className="text-sm">Create your first promo code to get started</p>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6">
                        <h3 className="text-2xl font-bold mb-4">
                            {editingPromo ? 'Edit Promo Code' : 'Create Promo Code'}
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Code */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Promo Code *
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={promoForm.code}
                                        onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400"
                                        placeholder="SUMMER2024"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={generateRandomCode}
                                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm">
                                        Generate
                                    </button>
                                </div>
                            </div>

                            {/* Discount Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Discount Type *
                                </label>
                                <select
                                    value={promoForm.discountType}
                                    onChange={(e) => setPromoForm({ ...promoForm, discountType: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400">
                                    <option value="percentage">Percentage (%)</option>
                                </select>
                            </div>

                            {/* Discount Value */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Discount Value *
                                </label>
                                <input
                                    type="number"
                                    value={promoForm.discountValue}
                                    onChange={(e) => setPromoForm({ ...promoForm, discountValue: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400"
                                    placeholder="10"
                                    required
                                />
                            </div>

                            {/* Expiration Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Expiration Date *
                                </label>
                                <input
                                    type="date"
                                    value={promoForm.expirationDate}
                                    onChange={(e) => setPromoForm({ ...promoForm, expirationDate: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400"
                                    required
                                />
                            </div>

                            {/* Usage Limit */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Usage Limit (Optional)
                                </label>
                                <input
                                    type="number"
                                    value={promoForm.usageLimit}
                                    onChange={(e) => setPromoForm({ ...promoForm, usageLimit: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400"
                                    placeholder="Leave empty for unlimited"
                                />
                            </div>

                            {/* Active Status */}
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={promoForm.isActive}
                                    onChange={(e) => setPromoForm({ ...promoForm, isActive: e.target.checked })}
                                    className="w-4 h-4 text-gray-800 border-gray-300 rounded focus:ring-gray-400"
                                />
                                <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700">
                                    Active
                                </label>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition disabled:opacity-50">
                                    {editingPromo ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
