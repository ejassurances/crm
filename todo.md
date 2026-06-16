# EJ Partners Assurances — TODO

## Phase 1 : Schéma BDD & Rôles
- [x] Étendre le schéma users avec les rôles : admin, client, prospect, prescripteur, mandataire
- [x] Table dossiers (cases) : id, userId, type, statut, titre, description, createdAt
- [x] Table documents : id, dossierId, uploaderId, nom, s3Key, s3Url, type, createdAt
- [x] Table messages : id, senderId, receiverId, contenu, lu, createdAt
- [x] Table apports (prescripteurs) : id, prescripteurId, clientId, dossierId, statut, commission
- [x] Table invitations : email, role, token, expiresAt, utilisee
- [x] Table notifications : userId, titre, contenu, type, lu
- [x] Migration pnpm db:push (7 tables)

## Phase 2 : Charte graphique & Layout
- [x] Upload logo EJ Partners Assurances sur S3 webdev
- [x] Configurer index.css avec palette bleu marine (#0f1f3d), blanc cassé
- [x] Ajouter police Google Fonts (Playfair Display + Inter)
- [x] Créer EJLayout personnalisé avec sidebar EJ Partners bleu marine
- [x] Page de connexion / landing page institutionnelle
- [x] Routing multi-rôles dans App.tsx

## Phase 3 : Routeurs tRPC
- [x] Router dossiers : CRUD, filtrage par rôle, notifications automatiques
- [x] Router documents : upload S3, liste par dossier, suppression, contrôle accès
- [x] Router messagerie : envoi, conversation, marquer lu, unreadCount
- [x] Router notifications : créer, lister, marquer lu, markAllRead, unreadCount
- [x] Router admin : liste utilisateurs, invitations, stats KPIs, recentActivity
- [x] Router prescripteur : mesApports, stats, soumettrApport
- [x] Router mandataire : mesDossiers, portefeuille, stats

## Phase 4 : Espace Admin Courtier
- [x] Dashboard KPIs (8 métriques : dossiers actifs, prospects, contrats, clients, prescripteurs, mandataires, apports, taux conversion)
- [x] Liste et gestion des dossiers (recherche, filtre statut, création, détail)
- [x] Gestion des comptes (onglets Tous/Clients/Prospects/Prescripteurs/Mandataires, invitation)
- [x] Vue messagerie globale (toutes conversations avec badge non-lu)
- [x] Alertes email automatiques via notifyOwner (nouveaux docs, messages)

## Phase 5 : Espace Client/Prospect
- [x] Dashboard personnel (état dossier, documents, messagerie)
- [x] Consultation devis et contrats
- [x] Upload de documents justificatifs
- [x] Messagerie avec le courtier
- [x] Notifications non lues

## Phase 6 : Espace Prescripteur
- [x] Dashboard apports d'affaires avec stats (total, convertis, taux, commissions)
- [x] Liste des recommandations et statuts
- [x] Formulaire de soumission d'un nouvel apport
- [x] Messagerie avec le courtier

## Phase 7 : Espace Mandataire
- [x] Dashboard activité (stats : dossiers, actifs, contrats, clients)
- [x] Portefeuille clients avec leurs dossiers
- [x] Suivi des dossiers assignés avec upload documents
- [x] Messagerie avec le courtier

## Phase 8 : Tests & Livraison
- [x] Tests vitest pour les routeurs principaux (21 tests passés)
- [x] Vérification isolation des données par rôle (FORBIDDEN sur toutes les procédures protégées)
- [ ] Checkpoint final
- [ ] Publication via bouton Publish
