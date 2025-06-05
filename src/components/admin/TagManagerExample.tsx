'use client';

import { Button } from '@/components/ui';
import { Tag } from '@/types/api';
import { useState } from 'react';
import { CreateTagModal } from './CreateTagModal';

export function TagManagerExample() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);

  const handleCreateSuccess = (newTag: Tag) => {
    setTags(prev => [...prev, newTag]);
    console.log('New tag created:', newTag);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Tag Management</h2>
        <Button
          onClick={() => setShowCreateModal(true)}
          variant="primary"
          icon={<span className="material-icons text-lg">add</span>}
        >
          Create Tag
        </Button>
      </div>

      {/* Tags List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Tags</h3>
          {tags.length === 0 ? (
            <p className="text-gray-500">No tags created yet.</p>
          ) : (
            <div className="space-y-2">
              {tags.map(tag => (
                <div key={tag.tagId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium text-gray-900">{tag.tagName}</span>
                    {tag.note && (
                      <p className="text-sm text-gray-600 mt-1">{tag.note}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Tag Modal */}
      <CreateTagModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}

export default TagManagerExample; 