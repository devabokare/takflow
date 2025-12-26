import { useState, useRef, useEffect } from 'react';
import { Upload, X, FileText, Video, Image, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export interface Attachment {
  id: string;
  task_id: string;
  file_name: string;
  file_type: string;
  file_url: string;
  file_size: number | null;
  created_at: string;
}

interface FileUploadProps {
  taskId: string;
  attachments: Attachment[];
  onUpload: (attachment: Attachment) => void;
  onDelete: (attachmentId: string) => void;
}

const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'video/mp4', 'video/webm', 'video/quicktime',
  'application/pdf', 'text/plain', 'text/markdown'
];

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

// Generate signed URLs for file access (1 hour expiry)
const getSignedUrl = async (filePath: string): Promise<string | null> => {
  const { data, error } = await supabase.storage
    .from('task-attachments')
    .createSignedUrl(filePath, 3600); // 1 hour expiry
  
  if (error) {
    console.error('Error getting signed URL:', error);
    return null;
  }
  return data.signedUrl;
};

export function FileUpload({ taskId, attachments, onUpload, onDelete }: FileUploadProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('File type not supported');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error('File size must be under 20MB');
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${taskId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('task-attachments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Store the file path (not signed URL) - we'll generate signed URLs on demand
      const { data: attachment, error: dbError } = await supabase
        .from('attachments')
        .insert({
          task_id: taskId,
          user_id: user.id,
          file_name: file.name,
          file_type: file.type,
          file_url: filePath, // Store the path, not the URL
          file_size: file.size,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      onUpload(attachment);
      toast.success('File uploaded');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (attachment: Attachment) => {
    try {
      const { error } = await supabase
        .from('attachments')
        .delete()
        .eq('id', attachment.id);

      if (error) throw error;

      onDelete(attachment.id);
      toast.success('File deleted');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete file');
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (type.startsWith('video/')) return <Video className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const formatSize = (bytes: number | null) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Fetch signed URLs for all attachments when attachments change
  useEffect(() => {
    const fetchSignedUrls = async () => {
      const urls: Record<string, string> = {};
      for (const attachment of attachments) {
        const signedUrl = await getSignedUrl(attachment.file_url);
        if (signedUrl) {
          urls[attachment.id] = signedUrl;
        }
      }
      setSignedUrls(urls);
    };
    
    if (attachments.length > 0) {
      fetchSignedUrls();
    }
  }, [attachments]);

  return (
    <div className="space-y-3">
      {/* Upload button */}
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_TYPES.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="text-xs"
        >
          {uploading ? (
            <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
          ) : (
            <Upload className="w-3 h-3 mr-1.5" />
          )}
          {uploading ? 'Uploading...' : 'Add File'}
        </Button>
      </div>

      {/* Attachments list */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map(attachment => (
            <div
              key={attachment.id}
              className="flex items-center gap-2 p-2 bg-secondary/50 rounded-lg group"
            >
              <span className="text-muted-foreground">
                {getFileIcon(attachment.file_type)}
              </span>
              
              <a
                href={signedUrls[attachment.id] || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-xs text-foreground hover:text-primary truncate"
              >
                {attachment.file_name}
              </a>
              
              <span className="text-xs text-muted-foreground">
                {formatSize(attachment.file_size)}
              </span>
              
              <button
                onClick={() => handleDelete(attachment)}
                className="p-1 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Preview for images/videos */}
      {attachments.filter(a => a.file_type.startsWith('image/') || a.file_type.startsWith('video/')).length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {attachments.filter(a => a.file_type.startsWith('image/')).map(img => (
            <a key={img.id} href={signedUrls[img.id] || '#'} target="_blank" rel="noopener noreferrer">
              <img
                src={signedUrls[img.id] || ''}
                alt={img.file_name}
                className="w-16 h-16 object-cover rounded-lg border border-border hover:border-primary transition-colors"
              />
            </a>
          ))}
          {attachments.filter(a => a.file_type.startsWith('video/')).map(vid => (
            <video
              key={vid.id}
              src={signedUrls[vid.id] || ''}
              className="w-24 h-16 object-cover rounded-lg border border-border"
              controls
            />
          ))}
        </div>
      )}
    </div>
  );
}
