import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, User, Mail, Phone, Lock, Building2, ArrowRight, Hash } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../components/common/Toast';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import {
  validateEmail,
  validatePhone,
  validatePassword,
  validateStudentId,
} from '../../utils/validators';

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

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    student_id: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    department: 'Computer Science & Engineering',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!validateStudentId(formData.student_id)) {
      errs.student_id = 'Please enter a valid Student ID (e.g. CS2024001)';
    }
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errs.name = 'Full name must be at least 2 characters';
    }
    if (!validateEmail(formData.email)) {
      errs.email = 'Please enter a valid email address';
    }
    if (!validatePhone(formData.phone)) {
      errs.phone = 'Phone number must be exactly 10 digits';
    }
    if (!validatePassword(formData.password)) {
      errs.password = 'Password must be at least 8 characters long';
    }
    if (!formData.department) {
      errs.department = 'Please select your department';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined! }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await register({
        student_id: formData.student_id.trim().toUpperCase(),
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password,
        department: formData.department,
      });

      showSuccess('Registration successful! Please sign in with your credentials.');
      navigate('/login');
    } catch (err: any) {
      showError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Create Student Account</h2>
        <p className="text-sm text-slate-500 mt-1">
          Join your campus lost & found network with your verified student identity.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            label="Student ID"
            placeholder="CS2024099"
            value={formData.student_id}
            onChange={(e) => handleChange('student_id', e.target.value)}
            error={errors.student_id}
            leftIcon={<Hash className="w-4 h-4" />}
            required
          />

          <Input
            label="Full Name"
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={errors.name}
            leftIcon={<User className="w-4 h-4" />}
            required
          />
        </div>

        <Input
          label="College Email"
          type="email"
          placeholder="student@college.edu"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          error={errors.email}
          leftIcon={<Mail className="w-4 h-4" />}
          autoComplete="email"
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            label="Phone (10 digits)"
            type="tel"
            placeholder="9876543210"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            error={errors.phone}
            leftIcon={<Phone className="w-4 h-4" />}
            required
          />

          <Input
            label="Password (min 8 chars)"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            error={errors.password}
            leftIcon={<Lock className="w-4 h-4" />}
            autoComplete="new-password"
            required
          />
        </div>

        <Select
          label="Academic Department"
          value={formData.department}
          onChange={(e) => handleChange('department', e.target.value)}
          options={DEPARTMENTS}
          error={errors.department}
          leftIcon={<Building2 className="w-4 h-4" />}
          required
        />

        <div className="pt-2">
          <Button
            type="submit"
            className="w-full"
            size="lg"
            isLoading={isSubmitting}
            loadingText="Creating account..."
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            Create Student Account
          </Button>
        </div>
      </form>

      <div className="mt-6 text-center text-sm text-slate-600">
        Already registered?{' '}
        <Link
          to="/login"
          className="font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
        >
          Sign in here
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
