import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { FileText, Loader2, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import StatusBadge from "./StatusBadge";

const DOC_TYPES = [
  { value: "piece_identite", label: "Pièce d'identité" },
  { value: "contrat", label: "Contrat" },
  { value: "devis", label: "Devis" },
  { value: "justificatif_domicile", label: "Justificatif de domicile" },
  { value: "rib", label: "RIB" },
  { value: "bulletin_salaire", label: "Bulletin de salaire" },
  { value: "autre", label: "Autre" },
] as const;

interface DocumentUploadProps {
  dossierId: number;
  canUpload?: boolean;
}

export default function DocumentUpload({ dossierId, canUpload = true }: DocumentUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [docType, setDocType] = useState<string>("autre");
  const [dragging, setDragging] = useState(false);
  const utils = trpc.useUtils();

  const { data: documents = [], isLoading } = trpc.documents.byDossier.useQuery({ dossierId });

  const uploadMutation = trpc.documents.upload.useMutation({
    onSuccess: () => {
      toast.success("Document uploadé avec succès");
      utils.documents.byDossier.invalidate({ dossierId });
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.documents.delete.useMutation({
    onSuccess: () => {
      toast.success("Document supprimé");
      utils.documents.byDossier.invalidate({ dossierId });
    },
    onError: (err) => toast.error(err.message),
  });

  const processFile = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Fichier trop volumineux (max 10 Mo)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      uploadMutation.mutate({
        dossierId,
        nom: file.name,
        type: docType as any,
        mimeType: file.type,
        taille: file.size,
        base64,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  return (
    <div className="space-y-4">
      {/* Zone d'upload */}
      {canUpload && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Select value={docType} onValueChange={setDocType}>
              <SelectTrigger className="w-52">
                <SelectValue placeholder="Type de document" />
              </SelectTrigger>
              <SelectContent>
                {DOC_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => inputRef.current?.click()}
              disabled={uploadMutation.isPending}
              className="gap-2"
            >
              {uploadMutation.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Upload size={16} />
              )}
              Choisir un fichier
            </Button>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
              dragging
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-muted/30"
            )}
          >
            <Upload size={24} className="mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Glissez-déposez un fichier ici ou cliquez pour parcourir
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">PDF, JPG, PNG, DOCX — max 10 Mo</p>
          </div>

          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.docx,.doc,.xlsx,.xls"
            onChange={handleFileChange}
          />
        </div>
      )}

      {/* Liste des documents */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-foreground">
          Documents ({documents.length})
        </h4>
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
            <Loader2 size={16} className="animate-spin" />
            Chargement...
          </div>
        ) : documents.length === 0 ? (
          <div className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-lg">
            Aucun document déposé
          </div>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <FileText size={18} className="text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{doc.nom}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <StatusBadge value={doc.type} variant="type" />
                    <span className="text-xs text-muted-foreground">
                      {new Date(doc.createdAt).toLocaleDateString("fr-FR")}
                    </span>
                    {doc.taille && (
                      <span className="text-xs text-muted-foreground">
                        {(doc.taille / 1024).toFixed(0)} Ko
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <a
                    href={doc.s3Url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    title="Télécharger"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  </a>
                  {canUpload && (
                    <button
                      onClick={() => deleteMutation.mutate({ id: doc.id })}
                      disabled={deleteMutation.isPending}
                      className="p-1.5 rounded-md hover:bg-red-50 transition-colors text-muted-foreground hover:text-red-600"
                      title="Supprimer"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
