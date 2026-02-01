// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import { X, Search } from 'lucide-react';
import { updateRolePermissions, fetchRolePermissions } from '@/api/apiClient';

interface Permission {
  id: number;
  code: string;
  description: string;
}

interface Role {
  id: number;
  name: string;
  description: string;
}

interface EditRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  role: Role | null;
  allPermissions: Permission[];
}

const EditRoleModal: React.FC<EditRoleModalProps> = ({ isOpen, onClose, onSuccess, role, allPermissions }) => {
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'selected'>('all');
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && role) {
      loadRolePermissions(role.id);
      setSearchQuery('');
      setActiveTab('all');
    }
  }, [isOpen, role]);

  const loadRolePermissions = async (roleId: number) => {
    setLoadingPermissions(true);
    try {
      const perms = await fetchRolePermissions(roleId);
      const permsList = Array.isArray(perms) ? perms : (perms?.data || []);
      setSelectedPermissionIds(permsList.map((p: any) => p.id));
    } catch (err) {
      console.error("Failed to load permissions", err);
    } finally {
      setLoadingPermissions(false);
    }
  };

  const formatCode = (code: string) => {
    const parts = code.split('.');
    if (parts.length !== 2) return code;
    const [resource, action] = parts;
    return `Can ${action} ${resource}`;
  };

  const displayPermissions = useMemo(() => {
    let baseList = allPermissions;
    
    // Filter by tab
    if (activeTab === 'selected') {
      baseList = allPermissions.filter(p => selectedPermissionIds.includes(p.id));
    }

    // Filter by search
    return baseList.filter(perm => {
      const humanLabel = formatCode(perm.code).toLowerCase();
      const technicalCode = perm.code.toLowerCase();
      const query = searchQuery.toLowerCase();
      return humanLabel.includes(query) || technicalCode.includes(query);
    });
  }, [allPermissions, searchQuery, activeTab, selectedPermissionIds]);

  if (!isOpen || !role) return null;

  const handleTogglePermission = (permId: number) => {
    setSelectedPermissionIds(prev =>
      prev.includes(permId) ? prev.filter(id => id !== permId) : [...prev, permId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await updateRolePermissions(role.id, selectedPermissionIds);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update permissions');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm text-gray-900">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Manage Permissions</h2>
            <p className="text-xs text-gray-500">Edit <span className='font-bold italic text-slate-700'>{role.name}</span> permissions</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          {/* Tabs */}
          <div className="flex p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                activeTab === 'all' ? 'bg-blue-500 shadow-sm text-white' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              All Permissions
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('selected')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeTab === 'selected' ? 'bg-blue-500 shadow-sm text-white' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Allowed Permissions
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                activeTab === 'selected' ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-600'
              }`}>
                {selectedPermissionIds.length}
              </span>
            </button>
          </div>

          <div className="space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text"
                placeholder={`Search ${activeTab === 'selected' ? 'selected' : 'all'} permissions...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-400
                 rounded outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            
            <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/50 p-2 space-y-2">
              {loadingPermissions ? (
                <div className="py-12 text-center text-sm text-blue-600 animate-pulse font-bold">
                  Loading system permissions...
                </div>
              ) : displayPermissions.length > 0 ? (
                displayPermissions.map((perm) => (
                  <label 
                    key={perm.id} 
                    className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${
                      selectedPermissionIds.includes(perm.id) 
                      ? 'bg-blue-50/30 border-blue-100 shadow-sm' 
                      : 'bg-white border-gray-100 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex flex-col pr-4">
                      <span className="text-sm font-bold capitalize text-slate-800">
                        {formatCode(perm.code)}
                      </span>
                      <span className="text-[11px] text-slate-500 leading-tight mt-1">
                        {perm.description}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedPermissionIds.includes(perm.id)}
                      onChange={() => handleTogglePermission(perm.id)}
                      className="h-5 w-5 rounded-lg border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors"
                    />
                  </label>
                ))
              ) : (
                <div className="py-12 text-center">
                  <p className="text-sm text-slate-400 italic">
                    {searchQuery ? 'No matching permissions found.' : 'No permissions selected yet.'}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="submit"
              disabled={saving || loadingPermissions}
              className="flex-1 bg-blue-600 text-white py-3.5 rounded font-bold hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-100"
            >
              {saving ? 'Updating...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 bg-slate-100 text-slate-700 py-3.5 rounded-2xl font-bold hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRoleModal;