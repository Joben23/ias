import { useRef, useState } from 'react';
import { Upload, FileText, Download } from 'lucide-react';
import { useOnboardingDocuments, useUploadDocument } from '@/hooks/useOnboarding';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';

const docTypes = ['Government ID', 'Medical Clearance', 'Signed Contract', 'Professional License', 'Other'];

interface Props {
  employeeId: string;
}

export function OnboardingDocumentUpload({ employeeId }: Props) {
  const { data: documents = [] } = useOnboardingDocuments(employeeId);
  const uploadDoc = useUploadDocument();
  const fileRef = useRef<HTMLInputElement>(null);
  const [docType, setDocType] = useState('Government ID');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadDoc.mutate({ employeeId, file, documentType: docType });
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleDownload = async (filePath: string, fileName: string) => {
    const { data } = await supabase.storage.from('onboarding-documents').createSignedUrl(filePath, 60);
    if (data?.signedUrl) {
      window.open(data.signedUrl, '_blank');
    }
  };

  return (
    <div>
      <h4 className="font-display font-semibold text-foreground text-sm mb-3">Document Uploads</h4>

      {/* Upload area */}
      <div className="flex items-center gap-2 mb-3">
        <Select value={docType} onValueChange={setDocType}>
          <SelectTrigger className="w-[180px] h-9 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {docTypes.map(t => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input ref={fileRef} type="file" onChange={handleUpload} className="hidden" />
        <Button
          size="sm"
          variant="outline"
          onClick={() => fileRef.current?.click()}
          disabled={uploadDoc.isPending}
          className="gap-1.5 text-xs"
        >
          <Upload className="w-3.5 h-3.5" />
          {uploadDoc.isPending ? 'Uploading...' : 'Upload'}
        </Button>
      </div>

      {/* Uploaded docs */}
      {documents.length > 0 && (
        <div className="space-y-1.5">
          {documents.map((doc, i) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 text-sm"
            >
              <FileText className="w-4 h-4 text-primary shrink-0" />
              <span className="flex-1 truncate text-foreground">{doc.document_name}</span>
              <span className="text-[10px] text-muted-foreground shrink-0">{doc.document_type}</span>
              <button
                onClick={() => handleDownload(doc.file_path, doc.document_name)}
                className="text-primary hover:text-primary/80"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {documents.length === 0 && (
        <p className="text-xs text-muted-foreground">No documents uploaded yet.</p>
      )}
    </div>
  );
}
