import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Tag,
  MapPin,
  Calendar,
  Palette,
  ArrowRight,
  X,
  Upload,
} from 'lucide-react';
import { itemService } from '../../services/itemService';
import { ItemCategory } from '../../types/item';
import { CATEGORIES, CAMPUS_LOCATIONS, COMMON_COLORS } from '../../utils/constants';
import { validateDateNotFuture } from '../../utils/validators';
import { useToast } from '../../components/common/Toast';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Textarea } from '../../components/common/Textarea';
import { Button } from '../../components/common/Button';

export const ReportFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    item_name: '',
    category: 'DOCUMENTS' as ItemCategory,
    description: '',
    color: 'Black',
    location: 'Cafeteria / Canteen',
    item_date: todayStr,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.item_name.trim() || formData.item_name.trim().length < 2) {
      errs.item_name = 'Item name must be at least 2 characters long';
    }
    if (!formData.category) {
      errs.category = 'Please choose a category';
    }
    if (!formData.description.trim() || formData.description.trim().length < 5) {
      errs.description = 'Please describe the found item in at least 5 characters';
    }
    if (!formData.location.trim() || formData.location.trim().length < 2) {
      errs.location = 'Please state where you found this item';
    }
    if (!formData.item_date) {
      errs.item_date = 'Date found is required';
    } else if (!validateDateNotFuture(formData.item_date)) {
      errs.item_date = 'Date cannot be in the future';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      showError('Only JPEG and PNG formats are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showError('Image size cannot exceed 5MB');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleClearImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const createdItem = await itemService.createFoundItem({
        item_name: formData.item_name.trim(),
        category: formData.category,
        description: formData.description.trim(),
        color: formData.color || undefined,
        location: formData.location.trim(),
        item_date: formData.item_date,
      });

      // Upload image if selected
      if (imageFile) {
        try {
          await itemService.uploadImage(createdItem.id, imageFile);
        } catch (uploadErr) {
          console.error('Image upload failed:', uploadErr);
        }
      }

      showSuccess('Found item reported successfully! Thank you for helping your peers.');
      navigate(`/items/${createdItem.id}`, { replace: true });
    } catch (err: any) {
      showError(err.message || 'Failed to submit report. Please review your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-2 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Found Property Report</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Report a Found Item</h1>
        <p className="text-sm text-slate-500 mt-1">
          Found something around campus? Registering it here allows the rightful student or staff
          owner to locate and claim it safely.
        </p>
      </div>

      <Card className="p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Item Name"
            placeholder="e.g. Spiral Notebook with Lab Notes, Student ID Card"
            value={formData.item_name}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, item_name: e.target.value }));
              if (errors.item_name) setErrors((prev) => ({ ...prev, item_name: undefined! }));
            }}
            error={errors.item_name}
            helperText="Clear and descriptive names help owners identify their possessions"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Item Category"
              value={formData.category}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, category: e.target.value as ItemCategory }));
                if (errors.category) setErrors((prev) => ({ ...prev, category: undefined! }));
              }}
              options={CATEGORIES}
              error={errors.category}
              leftIcon={<Tag className="w-4 h-4" />}
              required
            />

            <Select
              label="Primary Color"
              value={formData.color}
              onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
              options={COMMON_COLORS.map((c) => ({ label: c, value: c }))}
              leftIcon={<Palette className="w-4 h-4" />}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Location Where Found"
              value={formData.location}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, location: e.target.value }));
                if (errors.location) setErrors((prev) => ({ ...prev, location: undefined! }));
              }}
              options={CAMPUS_LOCATIONS.map((loc) => ({ label: loc, value: loc }))}
              error={errors.location}
              leftIcon={<MapPin className="w-4 h-4" />}
              required
            />

            <Input
              label="Date Found"
              type="date"
              max={todayStr}
              value={formData.item_date}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, item_date: e.target.value }));
                if (errors.item_date) setErrors((prev) => ({ ...prev, item_date: undefined! }));
              }}
              error={errors.item_date}
              leftIcon={<Calendar className="w-4 h-4" />}
              required
            />
          </div>

          <Textarea
            label="Detailed Description"
            rows={4}
            placeholder="Describe the condition, where specifically it was picked up, and general characteristics."
            value={formData.description}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, description: e.target.value }));
              if (errors.description) setErrors((prev) => ({ ...prev, description: undefined! }));
            }}
            error={errors.description}
            helperText="Do not reveal confidential details like PINs, cash amounts, or secret marks to prevent fraudulent claims."
            required
          />

          {/* Optional Image Upload */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700">
              Attach Item Photo (Highly Recommended)
            </label>

            {imagePreview ? (
              <div className="relative inline-block border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-48 h-36 object-contain bg-white"
                />
                <button
                  type="button"
                  onClick={handleClearImage}
                  className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-900/70 text-white hover:bg-slate-900 transition"
                  aria-label="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 hover:border-emerald-400 rounded-xl cursor-pointer bg-slate-50/50 hover:bg-emerald-50/30 transition">
                <Upload className="w-6 h-6 text-slate-400 mb-1" />
                <span className="text-xs font-medium text-slate-700">
                  Click to attach a picture (Max 5MB)
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5">JPEG or PNG format</span>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-700/20"
              isLoading={isSubmitting}
              loadingText="Submitting..."
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Submit Found Report
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
