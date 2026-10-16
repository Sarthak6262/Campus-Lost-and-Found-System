import React, { useState } from 'react';
import { User as UserIcon, Mail, Phone, Building2, Shield, Hash, Save } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { userService } from '../../services/userService';
import { useToast } from '../../components/common/Toast';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Badge } from '../../components/common/Badge';
import { validatePhone } from '../../utils/validators';

const DEPARTMENTS = [
  { value: 'Computer Science & Engineering', label: 'Computer Science & Engineering' },
  { value: 'Information Technology', label: 'Information Technology' },
  { value: 'Electronics & Communication', label: 'Electronics & Communication' },
  { value: 'Mechanical Engineering', label: 'Mechanical Engineering' },
  { value: 'Civil Engineering', label: 'Civil Engineering' },
  { value: 'Electrical Engineering', label: 'Electrical Engineering' },
  { value: 'Business Administration', label: 'Business Administration' },
  { value: 'Applied Sciences', label: 'Applied Sciences' },
  { value: 'Architecture & Design', label: 'Architecture & Design' },
  { value: 'Other', label: 'Other Department' },
];

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [department, setDepartment] = useState(user?.department || 'Computer Science & Engineering');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters long';
    }
    if (!validatePhone(phone)) {
      errs.phone = 'Phone number must be exactly 10 digits';
    }
    if (!department) {
      errs.department = 'Please choose a department';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    try {
      const updated = await userService.updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        department,
      });
      updateUser(updated);
      showSuccess('Profile updated successfully.');
      setIsEditing(false);
    } catch (err: any) {
      showError(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setName(user?.name || '');
    setPhone(user?.phone || '');
    setDepartment(user?.department || 'Computer Science & Engineering');
    setErrors({});
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Account Profile</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your personal details and campus identification
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Summary Card */}
        <Card className="p-6 text-center md:col-span-1 flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-slate-900 text-white flex items-center justify-center text-3xl font-extrabold shadow-lg shadow-blue-500/10 mb-4">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'CF'}
          </div>

          <h2 className="text-lg font-bold text-slate-900">{user?.name}</h2>
          <p className="text-xs font-mono text-slate-500 mt-0.5">{user?.student_id}</p>

          <div className="mt-3 flex items-center justify-center gap-2">
            <Badge variant={user?.role === 'ADMIN' ? 'claimed' : 'active'}>
              {user?.role}
            </Badge>
            <Badge variant="active" className="bg-emerald-50 text-emerald-700 border-emerald-200">
              Active Member
            </Badge>
          </div>

          <div className="mt-6 w-full pt-6 border-t border-slate-100 text-left space-y-3 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{user?.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{user?.department}</span>
            </div>
          </div>
        </Card>

        {/* Profile Details & Form */}
        <Card className="p-6 md:col-span-2">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Personal Information</h3>
              <p className="text-xs text-slate-500">Official student profile details</p>
            </div>
            {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </Button>
            )}
          </div>

          <form onSubmit={handleSave} className="mt-5 space-y-4">
            {/* Non-editable system identifiers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Student ID (Immutable)"
                value={user?.student_id || ''}
                readOnly
                disabled
                leftIcon={<Hash className="w-4 h-4" />}
                helperText="Assigned by institution registry"
              />

              <Input
                label="Official Email (Immutable)"
                value={user?.email || ''}
                readOnly
                disabled
                leftIcon={<Mail className="w-4 h-4" />}
                helperText="Primary campus notification address"
              />
            </div>

            {/* Editable Fields */}
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined! }));
              }}
              readOnly={!isEditing}
              disabled={!isEditing}
              error={errors.name}
              leftIcon={<UserIcon className="w-4 h-4" />}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Contact Phone"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined! }));
                }}
                readOnly={!isEditing}
                disabled={!isEditing}
                error={errors.phone}
                leftIcon={<Phone className="w-4 h-4" />}
                helperText="10-digit mobile number"
                required
              />

              <Select
                label="Department"
                value={department}
                onChange={(e) => {
                  setDepartment(e.target.value);
                  if (errors.department) setErrors((prev) => ({ ...prev, department: undefined! }));
                }}
                options={DEPARTMENTS}
                disabled={!isEditing}
                error={errors.department}
                leftIcon={<Building2 className="w-4 h-4" />}
                required
              />
            </div>

            {isEditing && (
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSaving}
                  loadingText="Saving..."
                  leftIcon={<Save className="w-4 h-4" />}
                >
                  Save Changes
                </Button>
              </div>
            )}
          </form>

          {/* Security & Access Notice */}
          <div className="mt-8 p-4 rounded-xl bg-slate-50 border border-slate-200/60 flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600">
              <span className="font-semibold text-slate-800">Campus Verification & Privacy</span>
              <p className="mt-0.5 leading-relaxed">
                Your phone number is only shared with verified claimants after claim approval by campus administration. Password hashes and credentials remain strictly guarded.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
