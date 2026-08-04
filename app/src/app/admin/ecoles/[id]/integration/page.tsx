'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function IntegrationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [waveBusinessApiKey, setWaveBusinessApiKey] = useState('');
  const [waveActivationStatut, setWaveActivationStatut] = useState('DESACTIVE');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch(`/api/admin/ecoles/${id}/integration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          waveBusinessApiKey,
          waveActivationStatut,
        }),
      });

      if (res.ok) {
        setMessage('Intégration mise à jour avec succès.');
        router.refresh();
      } else {
        const data = await res.json();
        setMessage(`Erreur: ${data.error}`);
      }
    } catch (error) {
      setMessage('Erreur de connexion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Configuration de l'Intégration Wave</h1>
      
      <div className="bg-white p-6 rounded-2xl shadow-sm max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Wave Business API Key
            </label>
            <input
              type="text"
              value={waveBusinessApiKey}
              onChange={(e) => setWaveBusinessApiKey(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Ex: wave_api_key_..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut de l'activation
            </label>
            <select
              value={waveActivationStatut}
              onChange={(e) => setWaveActivationStatut(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="DESACTIVE">Désactivé</option>
              <option value="ACTIVE">Activé</option>
              <option value="EN_ATTENTE">En attente</option>
            </select>
          </div>

          {message && (
            <div className={`p-4 rounded-xl ${message.includes('Erreur') ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
              {message}
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-emerald-600 text-ink-900 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Enregistrement...' : 'Enregistrer la configuration'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Retour
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
