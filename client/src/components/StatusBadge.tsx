import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUT_CONFIG: Record<string, { label: string; className: string }> = {
  prospect: { label: "Prospect", className: "bg-blue-100 text-blue-800 border-blue-200" },
  en_cours: { label: "En cours", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  devis_envoye: { label: "Devis envoyé", className: "bg-purple-100 text-purple-800 border-purple-200" },
  en_attente_documents: { label: "Docs attendus", className: "bg-orange-100 text-orange-800 border-orange-200" },
  contrat_signe: { label: "Contrat signé", className: "bg-green-100 text-green-800 border-green-200" },
  actif: { label: "Actif", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  resilie: { label: "Résilié", className: "bg-red-100 text-red-800 border-red-200" },
  archive: { label: "Archivé", className: "bg-gray-100 text-gray-600 border-gray-200" },
};

const TYPE_CONFIG: Record<string, { label: string }> = {
  assurance_vie: { label: "Assurance Vie" },
  assurance_habitation: { label: "Habitation" },
  assurance_auto: { label: "Auto" },
  assurance_sante: { label: "Santé" },
  prevoyance: { label: "Prévoyance" },
  retraite: { label: "Retraite" },
  autre: { label: "Autre" },
};

const ROLE_CONFIG: Record<string, { label: string; className: string }> = {
  admin: { label: "Admin Courtier", className: "bg-amber-100 text-amber-800 border-amber-200" },
  client: { label: "Client", className: "bg-blue-100 text-blue-800 border-blue-200" },
  prospect: { label: "Prospect", className: "bg-purple-100 text-purple-800 border-purple-200" },
  prescripteur: { label: "Prescripteur", className: "bg-green-100 text-green-800 border-green-200" },
  mandataire: { label: "Mandataire", className: "bg-orange-100 text-orange-800 border-orange-200" },
};

const APPORT_CONFIG: Record<string, { label: string; className: string }> = {
  en_attente: { label: "En attente", className: "bg-gray-100 text-gray-700 border-gray-200" },
  contacte: { label: "Contacté", className: "bg-blue-100 text-blue-800 border-blue-200" },
  en_cours: { label: "En cours", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  converti: { label: "Converti", className: "bg-green-100 text-green-800 border-green-200" },
  perdu: { label: "Perdu", className: "bg-red-100 text-red-800 border-red-200" },
};

interface StatusBadgeProps {
  value: string;
  variant?: "statut" | "type" | "role" | "apport";
  className?: string;
}

export default function StatusBadge({ value, variant = "statut", className }: StatusBadgeProps) {
  const config =
    variant === "type"
      ? TYPE_CONFIG[value]
      : variant === "role"
      ? ROLE_CONFIG[value]
      : variant === "apport"
      ? APPORT_CONFIG[value]
      : STATUT_CONFIG[value];

  if (!config) return <Badge variant="outline" className={className}>{value}</Badge>;

  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs font-medium border",
        "className" in config ? (config as any).className : "bg-gray-100 text-gray-700",
        className
      )}
    >
      {config.label}
    </Badge>
  );
}
