"use client";

import { useState, useEffect, useRef } from "react";
import { Wallet, MessageSquare, Upload, Check, Lock } from "lucide-react";

interface ProfilEcole {
  nom: string;
  nomPublic: string | null;
  logoUrl: string | null;
  ville: string | null;
  type: string;
}

export default function ParametresPage() {
  const [profil, setProfil] = useState<ProfilEcole | null>(null);
  const [nomPublic, setNomPublic] = useState("");
  const [ville, setVille] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Changement de mot de passe
  const [motDePasseActuel, setMotDePasseActuel] = useState("");
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState("");
  const [confirmationMotDePasse, setConfirmationMotDePasse] = useState("");
  const [erreurMotDePasse, setErreurMotDePasse] = useState("");
  const [savingMotDePasse, setSavingMotDePasse] = useState(false);
  const [motDePasseChange, setMotDePasseChange] = useState(false);

  const handleChangerMotDePasse = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreurMotDePasse("");
    setMotDePasseChange(false);

    if (nouveauMotDePasse !== confirmationMotDePasse) {
      setErreurMotDePasse("Les deux mots de passe ne correspondent pas");
      return;
    }

    setSavingMotDePasse(true);
    try {
      const res = await fetch("/api/ecoles/moi/mot-de-passe", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motDePasseActuel, nouveauMotDePasse }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErreurMotDePasse(data.error || "Erreur lors du changement de mot de passe");
        return;
      }
      setMotDePasseActuel("");
      setNouveauMotDePasse("");
      setConfirmationMotDePasse("");
      setMotDePasseChange(true);
      setTimeout(() => setMotDePasseChange(false), 3000);
    } catch {
      setErreurMotDePasse("Une erreur est survenue");
    } finally {
      setSavingMotDePasse(false);
    }
  };

  useEffect(() => {
    fetch("/api/ecoles/moi")
      .then((res) => res.json())
      .then((data) => {
        setProfil(data);
        setNomPublic(data.nomPublic || "");
        setVille(data.ville || "");
        setLogoUrl(data.logoUrl || null);
      })
      .catch(() => {});
  }, []);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("dossier", "logos");

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Erreur lors de l'upload du logo");
        return;
      }

      setLogoUrl(data.url);
    } catch {
      alert("Erreur lors de l'upload du logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/ecoles/moi", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nomPublic, ville, logoUrl }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink-900">Paramètres</h1>
        <p className="text-ink-400 text-sm mt-1">
          Gérez les paramètres de votre école
        </p>
      </div>

      {/* Infos école */}
      <div className="glass-card-static p-8 mb-6">
        <h2 className="text-lg font-semibold text-ink-900 mb-6">
          Informations de l&apos;école
        </h2>

        {/* Logo */}
        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-20 h-20 rounded-2xl bg-surface-soft border border-border flex items-center justify-center overflow-hidden shrink-0"
          >
            {logoUrl ? (
              <img src={logoUrl} alt="Logo de l'école" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-ink-400">
                {profil?.nom?.charAt(0) || "?"}
              </span>
            )}
          </div>
          <div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingLogo}
              className="btn-secondary btn-sm inline-flex items-center gap-1.5"
              id="btn-upload-logo"
            >
              {uploadingLogo ? (
                <span className="spinner-dark" style={{ width: 14, height: 14 }} />
              ) : (
                <Upload size={14} strokeWidth={2} />
              )}
              {logoUrl ? "Changer le logo" : "Ajouter un logo"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg"
              onChange={handleLogoChange}
              className="hidden"
            />
            <p className="text-xs text-ink-400 mt-2">
              PNG ou JPEG, 5 Mo maximum. Affiché sur la page publique de vos classes.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-600 mb-2">
              Nom public
            </label>
            <input
              type="text"
              className="glass-input"
              placeholder="Nom affiché aux parents"
              value={nomPublic}
              onChange={(e) => setNomPublic(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink-600 mb-2">
                Ville
              </label>
              <input
                type="text"
                className="glass-input"
                placeholder="Dakar"
                value={ville}
                onChange={(e) => setVille(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-600 mb-2">
                Type
              </label>
              <select className="glass-select" defaultValue={profil?.type || "presentiel"}>
                <option value="presentiel">Présentiel</option>
                <option value="en_ligne">En ligne</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
            <input
              type="checkbox"
              id="visible-recherche"
              defaultChecked
              className="accent-blue-500"
            />
            <label
              htmlFor="visible-recherche"
              className="text-sm text-ink-600"
            >
              Visible dans la recherche publique
            </label>
          </div>
          <button onClick={handleSave} disabled={saving} className="btn-primary inline-flex items-center gap-2">
            {saving ? (
              <span className="spinner" />
            ) : saved ? (
              <><Check size={16} strokeWidth={2} /> Enregistré</>
            ) : (
              "Enregistrer"
            )}
          </button>
        </div>
      </div>

      {/* Sécurité — mot de passe */}
      <div className="glass-card-static p-8 mb-6">
        <h2 className="text-lg font-semibold text-ink-900 mb-2 flex items-center gap-2">
          <Lock size={18} strokeWidth={2} /> Sécurité
        </h2>
        <p className="text-sm text-ink-400 mb-6">
          Changez le mot de passe de connexion à votre espace école
        </p>

        <form onSubmit={handleChangerMotDePasse} className="space-y-4 max-w-md">
          {erreurMotDePasse && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {erreurMotDePasse}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-ink-600 mb-2">
              Mot de passe actuel
            </label>
            <input
              type="password"
              required
              className="glass-input"
              value={motDePasseActuel}
              onChange={(e) => setMotDePasseActuel(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-600 mb-2">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              required
              minLength={6}
              className="glass-input"
              value={nouveauMotDePasse}
              onChange={(e) => setNouveauMotDePasse(e.target.value)}
            />
            <p className="text-xs text-ink-400 mt-1.5">Au moins 6 caractères</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-600 mb-2">
              Confirmer le nouveau mot de passe
            </label>
            <input
              type="password"
              required
              className="glass-input"
              value={confirmationMotDePasse}
              onChange={(e) => setConfirmationMotDePasse(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={savingMotDePasse}
            className="btn-primary inline-flex items-center gap-2 disabled:opacity-50"
          >
            {savingMotDePasse ? (
              <span className="spinner" />
            ) : motDePasseChange ? (
              <><Check size={16} strokeWidth={2} /> Mot de passe modifié</>
            ) : (
              "Changer le mot de passe"
            )}
          </button>
        </form>
      </div>

      {/* Wave */}
      <div className="glass-card-static p-8 mb-6">
        <h2 className="text-lg font-semibold text-ink-900 mb-2 flex items-center gap-2">
          <Wallet size={18} strokeWidth={2} /> Intégration Wave Business
        </h2>
        <p className="text-sm text-ink-400 mb-6">
          Connectez votre compte Wave Business pour recevoir les paiements
          directement
        </p>

        <div className="p-4 rounded-xl bg-blue-50 border border-blue-500/20 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-sm text-blue-600 font-medium">
              Statut : En attente de configuration
            </span>
          </div>
          <p className="text-xs text-ink-400 mt-2 ml-6">
            Les paiements fonctionnent en mode manuel tant que Wave Business
            n&apos;est pas activé.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink-600 mb-2">
            Clé API Wave Business
          </label>
          <input
            type="password"
            className="glass-input"
            placeholder="wave_sk_..."
          />
          <p className="text-xs text-ink-400 mt-2">
            Obtenez votre clé sur{" "}
            <a
              href="https://business.wave.com"
              target="_blank"
              rel="noopener"
              className="text-blue-600 hover:underline"
            >
              business.wave.com
            </a>
          </p>
        </div>
        <button className="btn-primary mt-4">Connecter Wave</button>
      </div>

      {/* SMS */}
      <div className="glass-card-static p-8">
        <h2 className="text-lg font-semibold text-ink-900 mb-2 flex items-center gap-2">
          <MessageSquare size={18} strokeWidth={2} /> Notifications SMS
        </h2>
        <p className="text-sm text-ink-400 mb-6">
          Configuration des rappels automatiques
        </p>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-surface-soft/50">
            <span className="text-sm text-ink-600">
              Rappel 3 jours avant l&apos;échéance
            </span>
            <div className="w-10 h-6 bg-emerald-500/30 rounded-full relative cursor-pointer">
              <div className="w-5 h-5 bg-emerald-400 rounded-full absolute top-0.5 right-0.5 shadow-lg" />
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-surface-soft/50">
            <span className="text-sm text-ink-600">
              Rappel le jour de l&apos;échéance
            </span>
            <div className="w-10 h-6 bg-emerald-500/30 rounded-full relative cursor-pointer">
              <div className="w-5 h-5 bg-emerald-400 rounded-full absolute top-0.5 right-0.5 shadow-lg" />
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-surface-soft/50">
            <span className="text-sm text-ink-600">
              Rappel 3 jours après si impayé
            </span>
            <div className="w-10 h-6 bg-emerald-500/30 rounded-full relative cursor-pointer">
              <div className="w-5 h-5 bg-emerald-400 rounded-full absolute top-0.5 right-0.5 shadow-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
