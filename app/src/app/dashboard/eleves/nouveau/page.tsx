'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NouveauManuelPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    matricule: '',
    telephone: '',
    email: '',
    classeId: '',
  });

  useEffect(() => {
    // Fetch school's classes
    fetch('/api/classes')
      .then(res => res.json())
      .then(data => {
        setClasses(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, classeId: data[0].id }));
        }
      })
      .catch(() => setMessage('Erreur lors du chargement des classes'))
      .finally(() => setFetching(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/eleves/manuel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        setMessage(`Élève ajouté avec succès. Code de suivi généré: ${data.token}`);
        setTimeout(() => router.push('/dashboard/eleves'), 2000);
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

  if (fetching) return <div className="p-6">Chargement...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Ajouter un élève (Inscription Directe)</h1>
      
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
              <input
                required
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
              <input
                required
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Matricule</label>
              <input
                type="text"
                name="matricule"
                value={formData.matricule}
                onChange={handleChange}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Classe *</label>
              <select
                required
                name="classeId"
                value={formData.classeId}
                onChange={handleChange}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>{cls.nom} (Scolarité: {cls.scolarite} FCFA)</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone (Parent) - pour SMS</label>
              <input
                type="tel"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                placeholder="+221..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email (Optionnel)</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {message && (
            <div className={`p-4 rounded-xl ${message.includes('Erreur') ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
              {message}
            </div>
          )}

          <div className="flex gap-4 pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={loading || classes.length === 0}
              className="px-6 py-3 bg-emerald-600 text-ink-900 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Enregistrement...' : 'Enregistrer l\'élève et créer l\'échéancier'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
