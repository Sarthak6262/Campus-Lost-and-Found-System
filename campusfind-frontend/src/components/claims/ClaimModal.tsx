import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Textarea } from '../common/Textarea';
import { useToast } from '../common/Toast';
import { claimService } from '../../services/claimService';
import { getErrorMessage } from '../../services/api';
import { Item } from '../../types/item';
import { Claim } from '../../types/claim';

interface ClaimModalProps {
  item: Item;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (claim: Claim) => void;
}

export const ClaimModal: React.FC<ClaimModalProps> = ({
  item,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [reason, setReason] = useState('');
  const [identificationDetails, setIdentificationDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ reason?: string; identification_details?: string }>({});

  const validate = () => {
    const newErrors: { reason?: string; identification_details?: string } = {};
    if (!reason.trim()) {
      newErrors.reason = 'Please explain why this item belongs to you.';
    }
    if (!identificationDetails.trim()) {
      newErrors.identification_details =
        'Please provide distinguishing marks, contents, lock screen photo, or receipt to verify ownership.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const claim = await claimService.submitClaim({
        item_id: item.id,
        reason: reason.trim(),
        identification_details: identificationDetails.trim(),
      });
      toast.success('Your claim has been submitted for admin verification!');
      setReason('');
      setIdentificationDetails('');
      onSuccess(claim);
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Claim "${item.item_name}"`}
      description="Provide verifiable proof of ownership. Campus administrators review all claims."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          label="Reason for Claim"
          required
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. I lost this wallet in the Library 2nd floor on Monday morning."
          error={errors.reason}
        />

        <Textarea
          label="Identification Details / Proof"
          required
          rows={4}
          value={identificationDetails}
          onChange={(e) => setIdentificationDetails(e.target.value)}
          placeholder="e.g. ID card number inside is 2024-BCA-102, has a blue keychain, cracked bottom right corner."
          error={errors.identification_details}
          helperText="Include unique marks, internal contents, serial numbers, or stickers that only the owner would know."
        />

        <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
          <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            isLoading={isSubmitting}
            loadingText="Submitting Claim..."
          >
            Submit Claim
          </Button>
        </div>
      </form>
    </Modal>
  );
};
