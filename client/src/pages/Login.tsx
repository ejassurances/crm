import { getLoginUrl } from "@/const";
import { Shield, Lock, Users, FileText } from "lucide-react";

const LOGO_URL = "/manus-storage/Logo-EJPartnersAssurances_4826a8ff.png";

const FEATURES = [
  { icon: <Shield size={18} />, label: "Espace sécurisé et cloisonné par rôle" },
  { icon: <FileText size={18} />, label: "Gestion documentaire centralisée" },
  { icon: <Users size={18} />, label: "Multi-espaces : clients, prescripteurs, mandataires" },
  { icon: <Lock size={18} />, label: "Données strictement isolées" },
];

export default function Login() {
  return (
    <div
      className="min-h-screen flex"
      style={{ background: "var(--color-brand-navy)" }}
    >
      {/* Panneau gauche */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden">
        {/* Motif décoratif */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px),
              radial-gradient(circle at 80% 20%, white 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
        <div className="relative z-10">
          <img
            src={LOGO_URL}
            alt="EJ Partners Assurances"
            className="h-16 w-auto object-contain"
          />
        </div>
        <div className="relative z-10 space-y-6">
          <div>
            <h1 className="text-3xl font-bold font-serif text-white leading-tight">
              Plateforme de gestion<br />
              <span style={{ color: "var(--color-brand-gold)" }}>multi-espaces</span>
            </h1>
            <p className="text-white/60 mt-3 text-sm leading-relaxed">
              Accédez à votre espace personnel sécurisé pour gérer vos dossiers,
              documents et communications avec votre courtier.
            </p>
          </div>
          <div className="space-y-3">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(255,255,255,0.1)", color: "var(--color-brand-gold)" }}
                >
                  {f.icon}
                </div>
                <p className="text-white/70 text-sm">{f.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10">
          <p className="text-white/30 text-xs">
            © {new Date().getFullYear()} EJ Partners Assurances. Tous droits réservés.
          </p>
        </div>
      </div>

      {/* Panneau droit */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="lg:hidden flex justify-center mb-8">
            <img
              src={LOGO_URL}
              alt="EJ Partners Assurances"
              className="h-14 w-auto object-contain"
              style={{ filter: "invert(1)" }}
            />
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold font-serif text-foreground">Connexion</h2>
            <p className="text-muted-foreground text-sm mt-2">
              Accédez à votre espace personnel
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-border p-8 space-y-6">
            <div className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-xl border border-border">
                <p className="text-xs text-muted-foreground text-center leading-relaxed">
                  Votre espace est accessible via l'authentification sécurisée Manus.
                  Cliquez sur le bouton ci-dessous pour vous connecter.
                </p>
              </div>

              <a
                href={getLoginUrl()}
                className="flex items-center justify-center gap-3 w-full py-3.5 px-6 rounded-xl text-white font-semibold text-sm transition-all duration-200 hover:opacity-90 active:scale-[0.97]"
                style={{ background: "var(--color-brand-navy)" }}
              >
                <Lock size={17} />
                Se connecter à mon espace
              </a>
            </div>

            <div className="border-t border-border pt-4">
              <p className="text-xs text-muted-foreground text-center">
                Vous n'avez pas encore de compte ?{" "}
                <span className="font-medium text-foreground">
                  Contactez votre courtier EJ Partners Assurances
                </span>{" "}
                pour recevoir votre invitation.
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Plateforme sécurisée — Données chiffrées et isolées par compte
          </p>
        </div>
      </div>
    </div>
  );
}
