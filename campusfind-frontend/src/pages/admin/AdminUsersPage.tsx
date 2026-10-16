import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  Shield,
  UserCheck,
  UserX,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { User } from '../../types/user';
import { useToast } from '../../components/common/Toast';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Pagination } from '../../components/common/Pagination';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { formatDate } from '../../utils/formatters';

export const AdminUsersPage: React.FC = () => {
  const { showSuccess, showError } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [userToToggle, setUserToToggle] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await adminService.getAllUsers(currentPage, 10);
      setUsers(response.data || response.items || []);
      setTotalPages(response.pages || response.total_pages || 1);
      setTotalUsers(response.total);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user directory');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  const handleToggleStatus = async () => {
    if (!userToToggle) return;
    setIsProcessing(true);
    try {
      const newStatus = !userToToggle.is_active;
      await adminService.updateUserStatus(userToToggle.id, { is_active: newStatus });
      showSuccess(
        `User ${userToToggle.name} is now ${newStatus ? 'Activated' : 'Deactivated'}.`
      );
      setUserToToggle(null);
      await fetchUsers();
    } catch (err: any) {
      showError(err.message || 'Could not update user status');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setIsProcessing(true);
    try {
      await adminService.deleteUser(userToDelete.id);
      showSuccess(`User ${userToDelete.name} has been deleted.`);
      setUserToDelete(null);
      await fetchUsers();
    } catch (err: any) {
      showError(err.message || 'Could not delete user');
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredUsers = searchQuery.trim()
    ? users.filter(
        (u) =>
          u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.student_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.department.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : users;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Campus User Directory
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage student registrations, roles, account activations, and permissions
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchUsers}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
        >
          Refresh Users
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name, roll number, email, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <span className="text-xs text-slate-500 shrink-0 font-medium">
            Total Users: <strong>{totalUsers}</strong>
          </span>
        </div>
      </Card>

      {/* Table / List */}
      <Card className="overflow-hidden border border-slate-200/80 shadow-xs">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <LoadingSpinner size="lg" />
            <p className="text-sm text-slate-500">Loading student directory...</p>
          </div>
        ) : error ? (
          <div className="p-8">
            <ErrorState message={error} onRetry={fetchUsers} />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={<Users className="w-12 h-12 text-slate-300" />}
              title="No users found"
              description="No user records matched your current search filters."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Student ID</th>
                  <th className="py-3.5 px-4">Name</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Joined</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                      {user.student_id}
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      {user.name}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">{user.email}</td>

                    <td className="py-3.5 px-4 text-slate-600">{user.department}</td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                          user.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {user.role === 'ADMIN' && <Shield className="w-3 h-3" />}
                        {user.role}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge variant={user.is_active ? 'active' : 'closed'}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500">{formatDate(user.created_at)}</td>

                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => setUserToToggle(user)}
                        className={`p-1.5 rounded-lg border text-xs transition ${
                          user.is_active
                            ? 'text-amber-600 hover:bg-amber-50 border-amber-200'
                            : 'text-emerald-600 hover:bg-emerald-50 border-emerald-200'
                        }`}
                        title={user.is_active ? 'Deactivate account' : 'Activate account'}
                      >
                        {user.is_active ? (
                          <UserX className="w-3.5 h-3.5" />
                        ) : (
                          <UserCheck className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        onClick={() => setUserToDelete(user)}
                        className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs transition"
                        title="Delete user"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(p) => setCurrentPage(p)}
            />
          </div>
        )}
      </Card>

      {/* Confirmation for Toggle Status */}
      <ConfirmDialog
        isOpen={!!userToToggle}
        title={userToToggle?.is_active ? 'Deactivate User Account' : 'Activate User Account'}
        message={`Are you sure you want to ${
          userToToggle?.is_active ? 'deactivate' : 'activate'
        } ${userToToggle?.name} (${userToToggle?.student_id})?`}
        confirmText={userToToggle?.is_active ? 'Deactivate' : 'Activate'}
        confirmVariant={userToToggle?.is_active ? 'warning' : 'primary'}
        isLoading={isProcessing}
        onConfirm={handleToggleStatus}
        onCancel={() => setUserToToggle(null)}
      />

      {/* Confirmation for Delete User */}
      <ConfirmDialog
        isOpen={!!userToDelete}
        title="Delete User Record"
        message={`Are you sure you want to permanently delete user "${userToDelete?.name}"? All associated reports will be affected.`}
        confirmText="Delete Account"
        confirmVariant="danger"
        isLoading={isProcessing}
        onConfirm={handleDeleteUser}
        onCancel={() => setUserToDelete(null)}
      />
    </div>
  );
};
