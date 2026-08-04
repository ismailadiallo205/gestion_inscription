"use client";

import { Wallet, MessageSquare } from "lucide-react";

export default function ParametresPage() {
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
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-600 mb-2">
              Nom public
            </label>
            <input
              type="text"
              className="glass-input"
              placeholder="Nom affiché aux parents"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink-600 mb-2">
                Ville
              </label>
              <input type="text" className="glass-input" placeholder="Dakar" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-600 mb-2">
                Type
              </label>
              <select className="glass-select">
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
          <button className="btn-primary">Enregistrer</button>
        </div>
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
