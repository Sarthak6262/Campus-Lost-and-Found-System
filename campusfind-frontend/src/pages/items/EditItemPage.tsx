import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tag, MapPin, Calendar, Palette, ArrowLeft, Save, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { itemService } from '../../services/itemService';
import { ItemCategory, ItemUpdateRequest } from '../../types/item';
import { CATEGORIES, CAMPUS_LOCATIONS, COMMON_COLORS } from '../../utils/constants';
import { validateDateNotFuture } from '../../utils/validators';
import { useToast } from '../../components/common/Toast';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Textarea } from '../../components/common/Textarea';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const EditItemPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    item_name: '',
    category: 'ELECTRONICS' as ItemCategory,
    description: '',
    color: '',
    location: '',
    item_date: '',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const item = await itemService.getItemById(Number(id));

        // Authorization check: only owner or admin can edit
        if (user && item.reported_by !== user.id && !isAdmin) {
          setUnauthorized(true);
          return;
        }

        setFormData({
          item_name: item.item_name,
          category: item.category,
          description: item.description,
          color: item.color || '',
          location: item.location,
          item_date: item.item_date,
        });
      } catch (err: any) {
        showError(err.message || 'Failed to load item for editing');
        navigate('/items');
      } finally {
        setIsLoading(false);
      }
    };

    fetchItem();
  }, [id, user, isAdmin]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.item_name.trim() || formData.item_name.trim().length < 2) {
      errs.item_name = 'Item name must be at least 2 characters long';
    }
    if (!formData.description.trim() || formData.description.trim().length < 5) {
      errs.description = 'Please describe the item in at least 5 characters';
    }
    if (!formData.location.trim() || formData.location.trim().length < 2) {
      errs.location = 'Location is required';
    }
    if (!formData.item_date) {
      errs.item_date = 'Date is required';
    } else if (!validateDateNotFuture(formData.item_date)) {
      errs.item_date = 'Date cannot be in the future';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !validate()) return;

    setIsSubmitting(true);
    try {
      const updatePayload: ItemUpdateRequest = {
        item_name: formData.item_name.trim(),
        category: formData.category,
        description: formData.description.trim(),
        color: formData.color || undefined,
        location: formData.location.trim(),
        item_date: formData.item_date,
      };

      await itemService.updateItem(Number(id), updatePayload);
      showSuccess('Item updated successfully!');
      navigate(`/items/${id}`, { replace: true });
    } catch (err: any) {
      showError(err.message || 'Failed to update item details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-slate-500">Loading item data...</p>
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="max-w-md mx-auto my-12 text-center p-6 bg-white border border-rose-200 rounded-2xl">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">Access Restricted</h2>
        <p className="text-sm text-slate-600 mt-1">
          You do not have permission to edit this item report. Only the original reporter or campus
          administrators can make modifications.
        </p>
        <Button className="mt-4" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel and Go Back</span>
          </button>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Edit Item Report</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Update information for report Ref #{id}
          </p>
        </div>
      </div>

      <Card className="p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Item Name"
            value={formData.item_name}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, item_name: e.target.value }));
              if (errors.item_name) setErrors((prev) => ({ ...prev, item_name: undefined! }));
            }}
            error={errors.item_name}
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
              label="Campus Location"
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
              label="Date"
              type="date"
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
            label="Description"
            rows={4}
            value={formData.description}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, description: e.target.value }));
              if (errors.description) setErrors((prev) => ({ ...prev, description: undefined! }));
            }}
            error={errors.description}
            required
          />

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
              isLoading={isSubmitting}
              loadingText="Saving..."
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
