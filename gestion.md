## Rôle

Agis comme un Technologue Créatif Senior de classe mondiale et Lead Ingénieur Frontend. Tu construis des landing pages haute-fidélité, cinématographiques, "1:1 Pixel Perfect". Chaque site que tu produis doit ressembler à un instrument digital - chaque scroll est intentionnel, chaque animation est pondérée et professionnelle. Éradique tous les patterns génériques d'IA.

# Plan complet — SaaS gestion des inscriptions, mensualités et paiements pour écoles

## 0. Principe directeur : simplicité façon Wave

Cette application s'adresse à des écoles et des parents, pas à des gens qui ont envie de configurer un logiciel. Le modèle à suivre est Wave : un écran = une seule question, une réponse par défaut déjà en place, zéro jargon, confirmation visuelle immédiate.

Règle appliquée partout dans ce plan : **l'école ne configure jamais un système, elle utilise un outil qui a déjà fait les bons choix pour elle**. Tout ce qui est "avancé" reste accessible, mais toujours en option discrète, jamais imposé au premier écran.

---

## 1. Vision produit

Une école crée une classe en 3 informations. Les parents paient directement sur le compte Wave de l'école. Chaque parent peut suivre en un coup d'œil l'état de son année (payé, à venir, en retard) — sans jamais avoir à appeler l'école.

---

## 2. Ce que l'école remplit à la création d'une classe

Seulement 3 champs obligatoires pour démarrer :

| Champ | Exemple |
|---|---|
| Nom de la classe | 6ème A |
| Mensualité | 15 000 FCFA |
| Nombre de mois | 10 |

Tout le reste est **pré-rempli automatiquement** avec des valeurs par défaut sensées, modifiables plus tard si l'école le souhaite, mais jamais demandées dès le départ :

| Réglage | Valeur par défaut |
|---|---|
| Frais d'inscription | 0 (l'école l'active seulement si elle en a un) |
| Date de démarrage | Aujourd'hui |
| Jour d'échéance mensuel | Le 5 de chaque mois |
| Rappels | 3 jours avant + le jour même + 3 jours après si impayé (déjà activé) |
| Canal de rappel | SMS |

Un lien "Personnaliser ces réglages" reste disponible pour l'école qui veut aller plus loin, mais 90% des écoles n'auront jamais besoin d'y toucher.

Dès validation, le système **génère automatiquement l'échéancier complet** de la classe.

---

## 3. Fonctionnement complet

### Étape 1 — Création des classes
Une école ou un administrateur de cours en ligne peut créer **autant de classes que nécessaire** (6ème, 5ème, Terminale, ou pour un cours en ligne : Anglais débutant, Maths avancé, etc.). Chaque classe reste simple à créer : 3 champs obligatoires (nom, mensualité, nombre de mois), le reste pré-rempli par défaut, comme décrit en section 2.

### Étape 2 — Accès au formulaire par le parent
Deux chemins possibles, aussi simples l'un que l'autre :

**A. Lien direct** — l'école partage son lien (`tonapp.com/ecole-amina/6eme`), le parent clique et arrive directement sur le bon formulaire, déjà classé.

**B. Recherche sur la plateforme** — si le parent n'a pas de lien, il va sur la page d'accueil de la plateforme, tape le nom de l'école (ou filtre par ville/type de cours), sélectionne la classe qui l'intéresse, puis arrive sur le même formulaire. L'écran de recherche reste minimal : une barre de recherche, quelques filtres simples, des résultats en cartes — pas un tableau compliqué à éplucher.

### Étape 3 — Le parent remplit le formulaire
Nom de l'élève, nom du parent, téléphone. Le dossier est envoyé.

### Étape 4 — Le dossier apparaît dans le tableau de bord de l'école, en attente
Dès l'envoi, le dossier apparaît immédiatement dans le tableau de bord de l'école (ou de l'administrateur du cours en ligne), avec le statut **"En attente de confirmation"**. Le parent reçoit un SMS de confirmation de réception — mais **pas encore de lien de paiement à ce stade**.

### Étape 5 — L'école confirme (ou refuse) le dossier
L'école ouvre le dossier, vérifie ce qu'il faut vérifier, puis clique **Confirmer** ou **Refuser**. C'est seulement à ce moment que :
- L'échéancier de paiement de l'élève est généré automatiquement
- Un **identifiant court** (ex: `EA-4821`) et un **lien de suivi direct** sont générés en même temps
- Le premier lien de paiement (frais d'inscription si applicable, sinon première mensualité) est créé
- Un seul SMS regroupe tout : confirmation, lien de suivi, identifiant, et lien de paiement

Si le dossier est refusé, le parent reçoit une notification et rien d'autre ne se déclenche.

### Étape 6 — Paiement
1. Le parent reçoit son lien de paiement Wave lié au compte de l'école
2. Il paie → l'argent va directement à l'école
3. Wave confirme automatiquement (webhook) → statut **Payé**, sans action manuelle

### Étape 7 — Rappels automatiques
Réglages par défaut (modifiables si besoin) : 3 jours avant l'échéance, le jour même, 3 jours après si impayé. Au-delà, l'élève apparaît dans "Élèves à relancer" sur le tableau de bord de l'école.

### Étape 8 — Suivi transparent côté parent
Lien unique reçu par SMS, sans compte à créer, associé au numéro de téléphone du parent (pas seulement à un élève). Si le parent a plusieurs enfants inscrits (même école ou écoles différentes), la page affiche d'abord un petit sélecteur d'enfant, puis la frise de l'année pour l'enfant choisi. Frise : vert (payé), rouge (en retard), gris (à venir). Un bouton pour payer quand il y a quelque chose à payer. Aucune connexion, aucun réglage — une page de lecture avec une seule action possible.

---

## 4. Classement des élèves par classe (multi-classes, multi-écoles)

Chaque classe possède un lien unique généré automatiquement à sa création. Que le parent arrive par ce lien direct ou par la recherche sur la plateforme, la classe est déjà déterminée **avant** que le formulaire ne s'affiche — jamais un champ à remplir soi-même par le parent. Le dossier atterrit directement, déjà classé, dans le tableau de bord de l'école ou de l'administrateur du cours en ligne concerné.

La recherche reste volontairement sommaire pour ne pas complexifier l'expérience : nom de l'école/du cours, ville (si présentiel), type (présentiel/en ligne) — pas plus.

---

## 5. Schéma de données

**Table `ecoles`**
```
id, nom, wave_business_api_key (chiffrée), wave_activation_statut (en_attente | actif)
```

**Table `classes`**
```
id, ecole_id, nom, niveau_standard (CI, CP, CE1, CE2, CM1, CM2, 6e, 5e, 4e, 3e, 2nde, 1ere, Tle, Autre),
montant_mensualite, nb_mois, frais_inscription (0 par défaut),
date_debut (aujourd'hui par défaut), jour_echeance_mensuel (5 par défaut),
regles_rappel (json, valeurs par défaut pré-remplies),
slug_inscription (unique, généré automatiquement), statut
```

**Table `inscriptions`**
```
id, classe_id, nom_eleve, nom_parent, telephone_parent,
date_inscription, statut (en_attente_confirmation | confirme | refuse), lien_suivi_unique
```
L'échéancier (table `echeances`) n'est généré qu'au passage du statut à `confirme` — pas à la création du dossier. `lien_suivi_unique` est généré par `telephone_parent`, pas par inscription : si un même numéro a plusieurs inscriptions, un seul lien donne accès à toutes, avec un sélecteur d'enfant sur la page de suivi.

**Table `ecoles`** — ajout pour la recherche
```
nom_public, ville, type (presentiel | en_ligne), visible_recherche (bool, actif par défaut)
```

**Table `echeances`**
```
id, inscription_id, type (inscription | mensualite), numero_mois,
montant, date_limite, statut (a_venir | du | payé | en_retard),
lien_paiement, wave_event_id, date_paiement
```

**Table `rappels_log`**
```
id, echeance_id, date_envoi, canal, contenu, statut_envoi
```

---

## 6. Stack technique

| Couche | Choix |
|---|---|
| Frontend | Next.js + Tailwind |
| Backend | Next.js API routes |
| Base de données | PostgreSQL (Supabase) |
| ORM | Prisma |
| Paiement | Wave Business API (par école, webhook signé) |
| SMS | Africa's Talking ou Orange SMS API |
| Tâches planifiées | Cron job (Vercel Cron) |
| Hébergement | Vercel + Supabase |

---

## 7. Plan de développement — sprints

### Sprint 0 — Setup (2-3 jours)
Init projet, base de données, déploiement.

### Sprint 1 — Auth école + création de classe simplifiée (1 semaine)
- Inscription/connexion école
- Formulaire de création de classe en 3 champs, valeurs par défaut pour le reste
- Génération automatique de l'échéancier

### Sprint 2 — Inscriptions élèves + recherche (1-2 semaines)
- Formulaire court côté parent, classification automatique par le lien
- Écran de recherche/filtre simple pour les parents sans lien direct (nom, ville, type)
- Dossier créé avec statut "En attente de confirmation", visible dans le tableau de bord école
- Écran Confirmer/Refuser côté école — c'est ce qui déclenche la génération de l'échéancier

### Sprint 3 — Intégration Wave Business (1-2 semaines)
- Connexion du compte Wave par école
- Génération du lien de paiement uniquement après confirmation du dossier
- Réception et vérification des webhooks
- Mise à jour automatique du statut

### Sprint 4 — Rappels SMS (1 semaine)
- Intégration API SMS
- Tâche planifiée quotidienne avec les règles par défaut
- Log des envois

### Sprint 5 — Portail de suivi parent (1 semaine)
- Page publique par lien unique, frise de l'année, bouton de paiement

### Sprint 6 — Tableau de bord école + polish (1 semaine)
- Vue d'ensemble, élèves à relancer, dossiers en attente, export CSV
- Tests de bout en bout

---

## 8. Priorités si le temps est serré

| Prioritaire | Peut attendre |
|---|---|
| Création de classe simplifiée + échéancier auto | Personnalisation fine des réglages |
| Paiement Wave (Niveau 1 manuel possible au début) | Webhook automatique |
| Rappels SMS par défaut | Canal email en option |
| Portail de suivi parent | Tout le reste |

---

## 9. Risques à anticiper

| Risque | Mitigation |
|---|---|
| Activation Wave Business lente (5-10 jours) | Démarrer en statut manuel, basculer en automatique dès validation |
| SMS non délivré | Statut loggé + retry automatique + alerte à l'école si échec répété |
| Double comptage d'un paiement | Vérification de wave_event_id avant mise à jour de statut |
| Parent perd son lien de suivi | Renvoi automatique sur demande par SMS |

---

## 10. Estimation de durée totale

**6 à 8 semaines** pour un développeur seul à temps plein, délai d'activation Wave Business non inclus (géré en parallèle via le mode manuel de secours).
