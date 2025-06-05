'use client';

import { Modal } from '@/components/ui';
import { tagService } from '@/lib/api-services';
import { CreateTagDto, Tag, UpdateTagDto } from '@/types/api';
import { useState } from 'react';
import { TagForm } from './TagForm';

interface CreateTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (tag: Tag) => void;
}

export function CreateTagModal({ isOpen, onClose, onSuccess }: CreateTagModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: CreateTagDto | UpdateTagDto) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // For create modal, we only handle CreateTagDto
      const newTag = await tagService.createTag(data as CreateTagDto);
      
      // Call success callback if provided
      onSuccess?.(newTag);
      
      // Close modal
      onClose();
    } catch (error) {
      console.error('Failed to create tag:', error);
      setError(error instanceof Error ? error.message : 'Failed to create tag');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (!isLoading) {
      setError(null);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title="Create New Tag"
      size="md"
      showCloseButton={!isLoading}
    >
      <div className="space-y-4">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="material-icons text-red-400 text-xl">error</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error creating tag
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tag Form */}
        <TagForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </div>
    </Modal>
  );
}

export default CreateTagModal; 