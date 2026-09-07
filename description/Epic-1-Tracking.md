# Epic 1 – Tracking (Suivi)

**Produit** : FleetIQ  
**Version document** : 1.0  
**Date** : 7 septembre 2026  
**Objectif** : Décrire l'ensemble des fonctionnalités du module Suivi / Tracking pour permettre à l'équipe de comprendre les user stories, les critères d'acceptation et de répartir le travail en tâches.

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Architecture et périmètre technique](#2-architecture-et-périmètre-technique)
3. [Glossaire](#3-glossaire)
4. [Features et User Stories](#4-features-et-user-stories)
   - [Feature 1 — Shell Suivi](#feature-1--shell-suivi-navigation-et-layout)
   - [Feature 2 — Filtres flotte](#feature-2--filtres-flotte)
   - [Feature 3 — Modes d'action](#feature-3--modes-daction-table)
   - [Feature 4 — Suivi général](#feature-4--suivi-général)
   - [Feature 5 — Alertes (vue Suivi)](#feature-5--alertes-vue-suivi)
   - [Feature 6 — Stop & Circulation](#feature-6--stop--circulation)
   - [Feature 7 — Trajectoire](#feature-7--trajectoire)
   - [Feature 8 — Commandes](#feature-8--commandes)
   - [Feature 9 — Personnalisation des colonnes](#feature-9--personnalisation-des-colonnes)
   - [Feature 10 — Carte live](#feature-10--carte-live)
   - [Feature 11 — Fiche véhicule carte](#feature-11--fiche-véhicule-carte)
   - [Feature 12 — Centre de monitoring](#feature-12--centre-de-monitoring)
   - [Feature 13 — Actions contextuelles véhicule](#feature-13--actions-contextuelles-véhicule)
   - [Feature 14 — Export PDF / Excel](#feature-14--export-pdf--excel)
   - [Feature 15 — Navigation cross-module](#feature-15--navigation-cross-module-vers-suivi)
   - [Feature 16 — Activation accès Suivi (compte)](#feature-16--activation-accès-suivi-compte)
5. [Matrice de dépendances](#5-matrice-de-dépendances)
6. [Dette technique et gaps identifiés](#6-dette-technique-et-gaps-identifiés)
7. [Répartition des tâches suggérée](#7-répartition-des-tâches-suggérée)

---

## 1. Vue d'ensemble

L'Epic 1 – Tracking permet aux gestionnaires et opérateurs de flotte de :

- **Surveiller la flotte en temps réel** sur une carte plein écran (positions, statut, sélection véhicule).
- **Consulter et filtrer les données télémétriques** via un panneau gauche multi-modes (Suivi général, Alertes, Stop & Circulation, Trajectoire, Commandes).
- **Inspecter un véhicule** via une fiche ancrée sur la carte.
- **Suivre des indicateurs de monitoring** (total, en mouvement, en stop, vitesse basse).
- **Enchaîner depuis d'autres modules** (Dashboard, Centre d'alertes) vers le Suivi avec centrage carte.

### Principe de rédaction

Les fonctionnalités **transverses** (filtres flotte, personnalisation colonnes, sélection carte) sont décrites **une seule fois** dans leur feature dédiée. Les autres features y font référence sans les répéter.

Les **opérations géographiques** (géopérages, polygones, itinéraires, emplacements, zones Tunisie) appartiennent à l'**[Epic 8 – Geofencing](Epic-8-Geofencing.md)** et ne sont pas redécrites ici. Elles partagent la même carte Suivi.

### Synthèse des features

| # | Feature | Zone applicative |
|---|---------|------------------|
| 1 | Shell Suivi (navigation et layout) | App / TopBar |
| 2 | Filtres flotte | Panneau gauche |
| 3 | Modes d'action (table) | Panneau gauche |
| 4 | Suivi général | Panneau gauche |
| 5 | Alertes (vue Suivi) | Panneau gauche |
| 6 | Stop & Circulation | Panneau gauche |
| 7 | Trajectoire | Panneau gauche |
| 8 | Commandes | Panneau gauche |
| 9 | Personnalisation des colonnes | Panneau gauche |
| 10 | Carte live | Carte Suivi |
| 11 | Fiche véhicule carte | Carte Suivi |
| 12 | Centre de monitoring | Overlay droit |
| 13 | Actions contextuelles véhicule | Panneau gauche |
| 14 | Export PDF / Excel | Panneau gauche |
| 15 | Navigation cross-module | Dashboard / Alertes → Suivi |
| 16 | Activation accès Suivi (compte) | Administration |

---

## 2. Architecture et périmètre technique

Le module Suivi est un **workspace cartographique** piloté par l'état React `activeSection === 'suivie'` (pas de React Router). C'est la section **par défaut** au démarrage de l'application.

```mermaid
flowchart TB
  subgraph shell [App shell]
    TB[TopBar Suivi]
    AS[activeSection suivie]
  end

  subgraph mapLayer [Carte plein écran]
    MV[MapView]
    MC[MapControls]
    Card[VehicleMapInfoCard]
    MV --> Card
    MC --> MV
  end

  subgraph leftPanel [Panneau gauche]
    VLP[VehicleListPanel]
    Cols[useColumnPreferences]
    Mock[features/suivie mock-data]
    VLP --> Cols
    VLP --> Mock
  end

  subgraph rightOverlay [Overlay droit]
    Mon[Sidebar monitoring]
  end

  TB --> AS
  AS --> mapLayer
  AS --> leftPanel
  AS --> rightOverlay
  VLP -->|"filteredVehicleIds"| MV
  VLP -->|"onSelectVehicle"| MV
  mapLayer -.->|"overlays geo"| Epic8[Epic 8 Geofencing]
```

| Couche | Persistance | Composants clés |
|--------|-------------|-----------------|
| **Shell / navigation** | État React (`activeSection`) | `App.tsx`, `TopBar.tsx` |
| **Panneau données** | Préférences colonnes → `localStorage` (`fleetiq.suivie.columns.{action}`) ; données → mock | `VehicleListPanel.tsx`, `column-defs.ts`, `mock-data.ts`, `useColumnPreferences.ts` |
| **Carte live** | État React (sélection, centre, clusters, overlays) | `MapView.tsx`, `MapControls.tsx`, `VehicleMapInfoCard.tsx` |
| **Monitoring** | Valeurs hardcodées | `Sidebar.tsx` (`mode="monitoring"`) |
| **Geofencing** | Voir Epic 8 | `MapControls`, `useMapOverlays` |

> **Important** : Les tables legacy (`SuivieFilterBar`, `SuivieGeneraleTable`, `TrajectoireTable`, `StopCirculationTable`) existent encore dans le repo mais **ne sont plus branchées**. Toute la logique filtres + tableaux est absorbée par `VehicleListPanel`.

---

## 3. Glossaire

| Terme | Définition |
|-------|------------|
| **Suivi / Tracking** | Workspace principal de surveillance live (carte + panneau données). Entrée TopBar « Suivi », `activeSection = 'suivie'`. |
| **Action (mode)** | Mode d'affichage du tableau : `suivie_generale`, `alertes`, `stop_circulation`, `trajectoire`, `commandes`. |
| **Suivi général** | Vue temps réel des véhicules (position, vitesse, chauffeur, département, télémétrie optionnelle). |
| **Horodatage** | Âge relatif de la dernière position (ex. `12 mn`, `3 h`, `2 j`). |
| **Stop / Circulation** | Segment d'immobilisation (`Stop`) ou de mouvement (`Circulation`) sur une période. |
| **Trajectoire** | Historique de segments de parcours d'un ou plusieurs véhicules sur une période. |
| **Commande** | Ordre distant envoyé à un équipement (demande position, AAD, photo, etc.). |
| **Filtres appliqués** | Ensemble validé via « Appliquer » (`AppliedSuivieFilters`) ; distinct des valeurs brouillon (`draft*`). |
| **Clustering** | Regroupement des marqueurs carte (véhicules ou emplacements) pour alléger l'affichage. |
| **Fiche véhicule** | Popup / carte d'info ancrée sur le marqueur sélectionné (`VehicleMapInfoCard`). |
| **Centre de monitoring** | Panneau flottant droit avec KPIs de statut flotte. |

---

## 4. Features et User Stories

---

### Feature 1 — Shell Suivi (navigation et layout)

**Description** : Accès au workspace Suivi et composition de l'écran (carte plein écran, panneau gauche, monitoring droit, toolbar carte).

**Composants** : `App.tsx`, `TopBar.tsx`, `VehicleListPanel.tsx`, `MapView.tsx`, `Sidebar.tsx`

---

#### US-1.1 — Accéder au Suivi depuis la navigation

**En tant que** gestionnaire de flotte,  
**je veux** ouvrir le module Suivi depuis la barre supérieure,  
**afin de** surveiller ma flotte immédiatement.

**Critères d'acceptation :**

- [ ] L'entrée TopBar « Suivi » (`id: 'suivie'`) bascule `activeSection` vers `'suivie'`.
- [ ] Au démarrage de l'application, la section active par défaut est `'suivie'`.
- [ ] Le workspace affiche la carte en fond plein écran.

---

#### US-1.2 — Composer le layout Suivi

**En tant que** opérateur,  
**je veux** voir carte + liste + monitoring dans un même écran,  
**afin d'** avoir une vue opérationnelle complète sans changer de page.

**Critères d'acceptation :**

- [ ] Carte Leaflet (`MapView`) occupe tout le viewport sous la TopBar.
- [ ] Panneau gauche `VehicleListPanel` superposé à la carte (collapsible).
- [ ] Centre de monitoring flottant à droite (`Sidebar` `position="floating-right"`).
- [ ] Toolbar carte (`MapControls`) accessible à droite.
- [ ] Sur mobile, un fond dimmé permet de fermer le panneau gauche.

---

#### US-1.3 — Réduire / agrandir le panneau véhicules

**En tant que** opérateur,  
**je veux** replier ou redimensionner le panneau gauche,  
**afin d'** maximiser la carte quand je n'ai pas besoin du tableau.

**Critères d'acceptation :**

- [ ] Bouton chevron collapse / expand du panneau.
- [ ] Sur desktop, poignée de resize : largeur entre **600 px** et **1200 px**.
- [ ] Panneau collapsed → largeur `0`, carte visible en priorité.

---

### Feature 2 — Filtres flotte

**Description** : Sélection brouillon puis application des filtres véhicules / départements / dates / types d'alerte, avec synchronisation des marqueurs carte.

**Composants** : `VehicleListPanel.tsx`, `mock-data.ts` (`applySuivieFilters`, `getFilteredVehicleIds`), `App.tsx` (`mapVehicles`)

**Référencée par** : Features 4–8, 10

---

#### US-2.1 — Filtrer par véhicules et départements

**En tant que** gestionnaire de flotte,  
**je veux** sélectionner des véhicules et/ou des départements,  
**afin de** restreindre le tableau et la carte à mon périmètre.

**Critères d'acceptation :**

- [ ] Sélecteur multi avec onglets **Véhicules** / **Départements**.
- [ ] Recherche texte sur la liste des véhicules.
- [ ] Checkboxes + « Tout sélectionner » / désélection.
- [ ] Libellé bouton résumé : ex. `3 véh., 1 dép.` ou « Sélectionner véhicules ».
- [ ] Départements disponibles (mock) : `DEmo2025`, `LATRACE`, `test`, `TUNAV`.
- [ ] Logique de filtre : union (véhicule **OU** département si les deux sont renseignés).

---

#### US-2.2 — Filtrer par plage de dates

**En tant que** gestionnaire de flotte,  
**je veux** définir une date de début et de fin,  
**afin d'** analyser l'historique sur une période.

**Critères d'acceptation :**

- [ ] Deux `DateTimePicker` (début / fin) visibles lorsque l'action ≠ `suivie_generale`.
- [ ] En mode Suivi général, la plage de dates n'est pas affichée / non appliquée.
- [ ] Le filtre date s'applique sur `filterDate` des lignes après « Appliquer ».

---

#### US-2.3 — Appliquer les filtres

**En tant que** opérateur,  
**je veux** valider explicitement mes filtres,  
**afin de** contrôler quand le tableau et la carte se mettent à jour.

**Critères d'acceptation :**

- [ ] Bouton « Appliquer » copie l'état draft vers `applied` (`applyFilters`).
- [ ] Tant qu'aucun filtre n'est appliqué, un message invite à sélectionner puis cliquer Appliquer.
- [ ] Après application, les lignes affichées passent par `applySuivieFilters`.
- [ ] Les IDs véhicules filtrés sont poussés via `onFilteredVehicleIdsChange` → `mapVehicles` dans `App.tsx`.
- [ ] Si aucun filtre véhicule/département : tous les véhicules restent sur la carte (`null`).

---

#### User Flow — Appliquer un filtre flotte

```mermaid
flowchart TD
  A[Ouvrir panneau Suivi] --> B[Sélectionner véhicules / départements]
  B --> C{Mode historique ?}
  C -- Oui --> D[Choisir dates début / fin]
  C -- Non --> E[Clic Appliquer]
  D --> E
  E --> F[Tableau filtré]
  E --> G[Marqueurs carte mis à jour]
```

---

### Feature 3 — Modes d'action (table)

**Description** : Bascule entre les cinq modes de données du panneau Suivi.

**Composants** : `VehicleListPanel.tsx`, `column-defs.ts` (`ACTIONS`, `SuivieAction`)

---

#### US-3.1 — Changer de mode d'action

**En tant que** opérateur,  
**je veux** basculer entre Suivi général, Alertes, Stop & Circulation, Trajectoire et Commandes,  
**afin d'** adapter le tableau à ma question opérationnelle.

**Critères d'acceptation :**

- [ ] Dropdown « Action » liste les 5 modes :

| Id | Label UI |
|----|----------|
| `suivie_generale` | Suivi général |
| `alertes` | Alertes |
| `stop_circulation` | Stop & Circulation |
| `trajectoire` | Trajectoire |
| `commandes` | Commandes |

- [ ] Le changement de mode met à jour **immédiatement** `applied.action` (sans attendre Appliquer).
- [ ] Les colonnes basculent selon `COLUMN_DEFS[action]`.
- [ ] Les lignes sont reconstruites via `buildRowsForAction(action, vehicles)`.
- [ ] Le mode Alertes affiche le filtre types d'alerte (Feature 5).
- [ ] Les modes historiques affichent les date pickers (Feature 2.2).

---

### Feature 4 — Suivi général

**Description** : Tableau temps réel des véhicules, groupé par département, avec colonnes télémétrie.

**Composants** : `VehicleListPanel.tsx`, `mock-data.ts` (`buildTrackingRows`), `column-defs.ts` (`trackingColumns`)

**Dépend de** : Feature 2, Feature 3, Feature 9

---

#### US-4.1 — Consulter la flotte en Suivi général

**En tant que** gestionnaire de flotte,  
**je veux** voir l'état courant de chaque véhicule,  
**afin de** savoir qui roule, où, et à quelle vitesse.

**Critères d'acceptation :**

- [ ] Colonnes visibles par défaut : Véhicule, Date / heure, Vitesse, Adresse, Chauffeur, Département.
- [ ] Colonnes optionnelles disponibles (télémétrie, sondes, essieux, e-lock, etc.) via Feature 9.
- [ ] Cellules vitesse / statut / horodatage stylées (`cellClassFor`, `renderCellContent`).
- [ ] Données actuelles : mock déterministe à partir de `Vehicle`.

---

#### US-4.2 — Grouper par département

**En tant que** gestionnaire de flotte,  
**je veux** voir les véhicules groupés par département,  
**afin de** parcourir la flotte par organisation.

**Critères d'acceptation :**

- [ ] En mode `suivie_generale`, les lignes sont regroupées (`rowsByDepartment`).
- [ ] Chaque groupe a un en-tête collapsible (`toggleDepartmentCollapse`).
- [ ] Collapse masque les lignes du département sans les retirer du filtre carte.

---

#### US-4.3 — Ouvrir le menu d'actions depuis une ligne

**En tant que** opérateur,  
**je veux** ouvrir un menu contextuel sur une ligne Suivi général,  
**afin d'** accéder rapidement aux actions véhicule (Feature 13).

**Critères d'acceptation :**

- [ ] Icône kebab (`MoreVertical`) visible uniquement en mode Suivi général.
- [ ] Clic sur la ligne (hors actions) ouvre/ferme le menu (`openMenuId`).
- [ ] Dans les autres modes, un clic sur la ligne sélectionne le véhicule sur la carte (`selectRowVehicle`).

---

### Feature 5 — Alertes (vue Suivi)

**Description** : Historique d'alertes filtré dans le panneau Suivi (distinct du module Centre d'alertes).

**Composants** : `VehicleListPanel.tsx`, `mock-data.ts` (`buildAlertRows`, `ALERT_TYPES`)

**Dépend de** : Feature 2, Feature 3, Feature 9

> **Note** : Cette vue est un **mode tableau** du Suivi. Le Centre d'alertes (feed, configuration, inspecteur) est un module séparé (`activeSection === 'alertes'`).

---

#### US-5.1 — Consulter les alertes dans le Suivi

**En tant que** opérateur,  
**je veux** lister les alertes véhicule dans le panneau Suivi,  
**afin de** corréler alertes et positions sur la carte.

**Critères d'acceptation :**

- [ ] Colonnes par défaut : Véhicule, Date, Type d'alerte, Adresse, Vitesse, Kilométrage.
- [ ] Colonnes optionnelles : N° châssis, Action.
- [ ] Clic sur une ligne → sélection véhicule + flyTo carte.

---

#### US-5.2 — Filtrer par type d'alerte

**En tant que** opérateur,  
**je veux** restreindre la liste à certains types d'alerte,  
**afin de** me concentrer sur les événements critiques.

**Critères d'acceptation :**

- [ ] Multi-sélection des types parmi `ALERT_TYPES`, incluant notamment :
  - Dépassement de vitesse, Tous les geofences, Sortie/entrée du pays
  - Entrée/Sortie de l'itinéraire, Remorquage, Batterie débranchée
  - SOS, Température, Carburant, Conduite agressive, Stop longue durée, etc.
- [ ] Option « Toutes les alertes » ; le filtre concret ignore cette valeur sentinelle.
- [ ] Filtre appliqué via « Appliquer » (Feature 2.3).

---

### Feature 6 — Stop & Circulation

**Description** : Segments d'arrêt et de circulation pour analyser l'activité sur une période.

**Composants** : `VehicleListPanel.tsx`, `mock-data.ts` (`buildRunStopRows`)

**Dépend de** : Feature 2, Feature 3, Feature 9

---

#### US-6.1 — Consulter Stop & Circulation

**En tant que** gestionnaire de flotte,  
**je veux** voir les périodes de stop et de circulation,  
**afin d'** évaluer l'utilisation des véhicules.

**Critères d'acceptation :**

- [ ] Colonnes par défaut : État, Matricule, Emplacement, Distance, Période, Date début.
- [ ] Colonnes optionnelles : Vitesse moy., Action.
- [ ] État affiché : `Stop` ou `Circulation`.
- [ ] Filtre dates disponible (Feature 2.2).
- [ ] Clic ligne → sélection véhicule sur la carte.

---

### Feature 7 — Trajectoire

**Description** : Historique de segments de parcours avec télémétrie avancée.

**Composants** : `VehicleListPanel.tsx`, `mock-data.ts` (`buildTrajectoryRows`)

**Dépend de** : Feature 2, Feature 3, Feature 9

---

#### US-7.1 — Consulter la trajectoire tabulaire

**En tant que** gestionnaire de flotte,  
**je veux** parcourir les segments de trajectoire d'un véhicule,  
**afin d'** analyser le détail d'un parcours (durée, distance, lieu, capteurs).

**Critères d'acceptation :**

- [ ] Colonnes par défaut : Stop/Circulation, Date début, Période, Vitesse, Distance, Emplacement.
- [ ] Colonnes optionnelles : alerte, carburant, batterie, contact, conso. L/100km, direction, RPM, lat/lng, sondes, essieux, etc.
- [ ] Filtre dates disponible.
- [ ] Clic ligne → sélection véhicule sur la carte.
- [ ] **État actuel** : données mock tabulaires ; pas encore de tracé polyligne trajectoire dédié sur la carte (hors Epic 8 routes).

---

### Feature 8 — Commandes

**Description** : Historique des commandes distantes envoyées aux équipements.

**Composants** : `VehicleListPanel.tsx`, `mock-data.ts` (`buildCommandRows`)

**Dépend de** : Feature 2, Feature 3, Feature 9

---

#### US-8.1 — Consulter l'historique des commandes

**En tant que** opérateur,  
**je veux** voir les commandes envoyées et leur état,  
**afin de** vérifier l'exécution des ordres distants.

**Critères d'acceptation :**

- [ ] Colonnes : Date d'envoi, Véhicule, Type de commande, État.
- [ ] Types de commande (mock) :
  - Demande position
  - Arrêt à distance
  - Activation contact
  - Demande photo
  - Réinitialisation GPS
- [ ] Statuts : `Exécutée`, `En attente`, `Échouée`, `Expirée`.
- [ ] Filtre dates disponible.
- [ ] Clic ligne → sélection véhicule sur la carte.

---

### Feature 9 — Personnalisation des colonnes

**Description** : Visibilité, ordre et reset des colonnes par mode d'action, persistés en localStorage.

**Composants** : `useColumnPreferences.ts`, `VehicleListPanel.tsx` (`SortableHeader`, `@dnd-kit`)

**Référencée par** : Features 4–8

---

#### US-9.1 — Afficher / masquer des colonnes

**En tant que** opérateur,  
**je veux** choisir les colonnes visibles pour le mode courant,  
**afin d'** afficher uniquement les champs utiles à ma tâche.

**Critères d'acceptation :**

- [ ] Panneau réglages colonnes listant toutes les colonnes du mode (`allColumns`).
- [ ] Toggle checkbox par colonne (`toggleVisible`).
- [ ] Impossible de masquer la **dernière** colonne visible.
- [ ] Préférences persistées sous `fleetiq.suivie.columns.{action}`.

---

#### US-9.2 — Réordonner les colonnes par glisser-déposer

**En tant que** opérateur,  
**je veux** réordonner les en-têtes de colonnes,  
**afin d'** adapter la lecture du tableau.

**Critères d'acceptation :**

- [ ] Drag-and-drop des headers visibles (`reorder` via `@dnd-kit`).
- [ ] L'ordre est persisté dans localStorage.
- [ ] Les colonnes masquées restent en fin d'ordre relatif.

---

#### US-9.3 — Réinitialiser les colonnes

**En tant que** opérateur,  
**je veux** restaurer colonnes et ordre par défaut,  
**afin de** repartir d'une configuration saine.

**Critères d'acceptation :**

- [ ] Action « reset » appelle `resetToDefault`.
- [ ] Visibilité et ordre reviennent aux `defaultVisible` / ordre de `COLUMN_DEFS`.

---

### Feature 10 — Carte live

**Description** : Affichage des positions véhicules, interactions de sélection, clustering, fonds de carte et légende. Les overlays geofencing renvoient à Epic 8.

**Composants** : `MapView.tsx`, `MapControls.tsx`, `MapLegend.tsx`, `App.tsx`

**Dépend de** : Feature 2 (filtre → marqueurs)

---

#### US-10.1 — Voir les véhicules sur la carte

**En tant que** opérateur,  
**je veux** voir les positions de ma flotte filtrée sur la carte,  
**afin d'** avoir une situation géographique immédiate.

**Critères d'acceptation :**

- [ ] Marqueurs véhicule (icônes 3D) pour chaque entrée de `mapVehicles`.
- [ ] Filtrage panneau synchronisé (Feature 2.3).
- [ ] Légende : En ligne / Hors ligne / Sélectionné (`MapLegend`).
- [ ] Carte centrée sur la Tunisie (données mock flotte).

---

#### US-10.2 — Sélectionner un véhicule sur la carte

**En tant que** opérateur,  
**je veux** cliquer un marqueur pour le sélectionner,  
**afin d'** inspecter le véhicule (Feature 11).

**Critères d'acceptation :**

- [ ] Clic marqueur → `onSelectVehicle(vehicle)`.
- [ ] La carte `flyTo` vers les coordonnées (zoom ~15).
- [ ] La sélection est bloquée pendant un mode dessin geofencing (`drawMode` — Epic 8).
- [ ] Fermeture de la fiche → `onDeselectVehicle`.

---

#### US-10.3 — Activer / désactiver le clustering

**En tant que** opérateur,  
**je veux** regrouper les marqueurs quand la flotte est dense,  
**afin de** garder la carte lisible.

**Critères d'acceptation :**

- [ ] Menu Visibilité (`MapControls`) : toggle clustering véhicules (défaut ON).
- [ ] Toggle clustering emplacements (défaut OFF) — lié aux waypoints Epic 8.
- [ ] Clusters Leaflet MarkerCluster avec icônes dimensionnées selon le count.

---

#### US-10.4 — Changer le fond de carte

**En tant que** opérateur,  
**je veux** choisir le fond de carte,  
**afin d'** adapter la lecture (plan, satellite, etc.).

**Critères d'acceptation :**

- [ ] 4 fonds via `BASEMAP_TILES` : **Plan**, **OSM**, **Satellite**, **TUNAV**.
- [ ] Application immédiate ; fond actif identifiable dans le menu.

> Les opérations « Opération Géographique » / gestion d'overlays sont documentées dans **Epic 8**.

---

#### User Flow — Sélection véhicule carte

```mermaid
sequenceDiagram
  participant U as Utilisateur
  participant MV as MapView
  participant App as AppShell
  participant Card as VehicleMapInfoCard

  U->>MV: Clic marqueur
  MV->>App: onSelectVehicle(vehicle)
  App->>MV: selectedVehicle + flyTo
  MV->>Card: Affiche fiche ancrée
  U->>Card: Fermer
  Card->>App: onDeselectVehicle
```

---

### Feature 11 — Fiche véhicule carte

**Description** : Carte d'information ancrée sur le marqueur sélectionné.

**Composants** : `VehicleMapInfoCard.tsx`, `MapView.tsx` (`SelectedVehiclePopupOverlay`)

**Dépend de** : Feature 10

---

#### US-11.1 — Consulter la fiche d'un véhicule sélectionné

**En tant que** opérateur,  
**je veux** voir les détails télémétriques du véhicule sélectionné,  
**afin de** décider sans quitter la carte.

**Critères d'acceptation :**

- [ ] Affichage cover + avatar 3D + identifiant équipement.
- [ ] Lignes d'info affichées :
  - Adresse, Date / heure, Kilométrage, Horodatage
  - Niveau du carburant, Heures moteur, Température moteur
  - Chauffeur, Vitesse, Longitude, Identifiant de carte
  - Volume, Temperature, Niveau de batterie
  - Etat de la sonde, Présence d'eau, Numéro de série, Numéro de puce
- [ ] Bandeau d'icônes statut (power / fuel / timer / flame).
- [ ] Données construites par `buildInfo(vehicle)` (seed / mock tant que l'API live n'est pas branchée).
- [ ] Bouton fermer désélectionne le véhicule.

---

### Feature 12 — Centre de monitoring

**Description** : Overlay droit de KPIs statut flotte.

**Composants** : `Sidebar.tsx` (`mode="monitoring"`, `position="floating-right"`), `App.tsx`

---

#### US-12.1 — Consulter les KPIs monitoring

**En tant que** opérateur,  
**je veux** voir d'un coup d'œil le résumé statut de la flotte,  
**afin de** repérer les anomalies (trop de stops, vitesse basse…).

**Critères d'acceptation :**

- [ ] Panneau flottant droit collapsible.
- [ ] KPIs affichés : **Total Véhicules**, **En Mouvement**, **En Stop**, **Vitesse Basse**.
- [ ] **État actuel** : valeurs mock hardcodées (`total: 55`, `enMouvement: 23`, `enStop: 18`, `vitesseBasse: 14`).
- [ ] Boutons / tuiles de statut sont **affichage seul** (pas de filtre carte branché).

---

#### US-12.2 — Réduire le centre de monitoring

**En tant que** opérateur,  
**je veux** replier le monitoring,  
**afin de** libérer de l'espace carte.

**Critères d'acceptation :**

- [ ] Toggle collapse via `handleToggleMonitoring` / `isMonitoringCollapsed`.
- [ ] À l'entrée onboarding module, le monitoring peut être auto-collapsed.

---

### Feature 13 — Actions contextuelles véhicule

**Description** : Menu kebab du Suivi général listant les actions rapides sur un véhicule.

**Composants** : `VehicleListPanel.tsx` (`menuItems`, `handleMenuAction`)

**Dépend de** : Feature 4

---

#### US-13.1 — Afficher un véhicule sur la carte depuis le menu

**En tant que** opérateur,  
**je veux** localiser un véhicule depuis le tableau,  
**afin de** le retrouver rapidement sur la carte.

**Critères d'acceptation :**

- [ ] Action « Afficher sur la carte » appelle `onSelectVehicle(vehicle)`.
- [ ] Déclenche flyTo + fiche véhicule (Features 10–11).
- [ ] **Seule action actuellement branchée** du menu.

---

#### US-13.2 — Accéder aux autres actions véhicule (cible produit)

**En tant que** opérateur,  
**je veux** lancer trajectoire, rapport, AAD ou paramétrage alertes depuis le menu,  
**afin d'** agir sans quitter le Suivi.

**Critères d'acceptation :**

- [ ] Entrées menu présentes dans l'UI :
  - Afficher trajectoire
  - Afficher Stop/Circulation
  - Afficher le rapport détaillé
  - Afficher les excès de vitesse
  - Demande position actuelle
  - Arrêt à distance (AAD)
  - Paramétrage des alertes
- [ ] **État actuel (stub)** : sélection d'une de ces entrées ferme le menu sans effet métier.
- [ ] **Cible future** :
  - [ ] Afficher trajectoire → bascule mode `trajectoire` + filtre véhicule + (idéal) tracé carte
  - [ ] Afficher Stop/Circulation → bascule mode `stop_circulation` + filtre véhicule
  - [ ] Rapport détaillé / excès de vitesse → navigation rapports ou panneau dédié
  - [ ] Demande position / AAD → création commande (Feature 8) via API
  - [ ] Paramétrage des alertes → Centre d'alertes / config scope véhicule

---

### Feature 14 — Export PDF / Excel

**Description** : Export du tableau Suivi filtré.

**Composants** : `VehicleListPanel.tsx` (boutons UI)

---

#### US-14.1 — Exporter le tableau courant

**En tant que** gestionnaire de flotte,  
**je veux** exporter les données affichées en PDF ou Excel,  
**afin de** les partager ou archiver.

**Critères d'acceptation :**

- [ ] Boutons **PDF** et **Excel** visibles dans la barre d'actions du panneau.
- [ ] **État actuel (stub)** : aucun handler branché.
- [ ] **Cible future** :
  - [ ] Export du jeu de lignes **filtré** et des colonnes **visibles**.
  - [ ] Nom de fichier contextualisé (mode + date).
  - [ ] Respect des droits d'accès compte (Feature 16).

---

### Feature 15 — Navigation cross-module vers Suivi

**Description** : Entrée dans le Suivi depuis Dashboard ou Centre d'alertes avec sélection et centrage d'un véhicule.

**Composants** : `App.tsx` (`handleNavigateToVehicle`), Dashboard, Alert Center

---

#### US-15.1 — Ouvrir un véhicule depuis le Dashboard ou les Alertes

**En tant que** opérateur,  
**je veux** cliquer un véhicule ailleurs dans l'app et arriver sur le Suivi centré dessus,  
**afin de** passer de l'alerte / KPI à la carte sans recherche manuelle.

**Critères d'acceptation :**

- [ ] `handleNavigateToVehicle(vehicleId, coordinates)` :
  - set `activeSection` / `activeTab` → `'suivie'`
  - set `selectedVehicleId`
  - set `mapCenter` aux coordonnées
- [ ] La carte centre / flyTo sur le véhicule.
- [ ] La fiche véhicule s'affiche (Feature 11).

---

### Feature 16 — Activation accès Suivi (compte)

**Description** : Droit d'accès page Suivi au niveau compte.

**Composants** : `AddAccountModal.tsx` (`ACCESS_PAGES`, `id: 'suivi'`)

---

#### US-16.1 — Activer l'accès Suivi pour un compte

**En tant que** super-administrateur,  
**je veux** activer ou désactiver l'accès à la page Suivi pour un compte,  
**afin de** contrôler qui peut surveiller la flotte.

**Critères d'acceptation :**

- [ ] Dans le formulaire compte, une page d'accès « Suivi » (`id: 'suivi'`) est disponible.
- [ ] L'état est persisté avec le compte (selon modèle admin existant).
- [ ] *(À brancher côté UI)* : si désactivé, l'entrée TopBar Suivi / workspace n'est pas accessible pour ce compte.

---

## 5. Matrice de dépendances

| Feature | Dépend de |
|---------|-----------|
| Feature 1 | — (autonome) |
| Feature 2 | Feature 1 |
| Feature 3 | Feature 1, Feature 2 |
| Feature 4 | Feature 2, Feature 3, Feature 9 |
| Feature 5 | Feature 2, Feature 3, Feature 9 |
| Feature 6 | Feature 2, Feature 3, Feature 9 |
| Feature 7 | Feature 2, Feature 3, Feature 9 |
| Feature 8 | Feature 2, Feature 3, Feature 9 |
| Feature 9 | Feature 3 |
| Feature 10 | Feature 1, Feature 2 |
| Feature 11 | Feature 10 |
| Feature 12 | Feature 1 |
| Feature 13 | Feature 4 (menu), Feature 10 (carte) |
| Feature 14 | Feature 2, Feature 3, Feature 9 |
| Feature 15 | Feature 1, Feature 10, Feature 11 |
| Feature 16 | — (autonome, admin) |

### Composants partagés

| Composant | Utilisé par |
|-----------|-------------|
| `VehicleListPanel` | Features 2–9, 13, 14 |
| `useColumnPreferences` | Feature 9 (consommée par 4–8) |
| `MapView` | Features 10, 11, 15 ; Epic 8 |
| `MapControls` | Feature 10 ; Epic 8 |
| `applySuivieFilters` | Features 2, 4–8 |

### Lien avec Epic 8

| Sujet | Document |
|-------|----------|
| Géopérages, polygones, routes, emplacements, zones TN | Epic 8 |
| Affectation zones / alertes geofence | Epic 8 |
| Toolbar « Opération Géographique » | Epic 8 (Feature 1) |
| Carte live, basemap, clustering véhicules | **Cet epic** (Feature 10) |

---

## 6. Dette technique et gaps identifiés

| # | Gap | Impact | Priorité suggérée |
|---|-----|--------|-------------------|
| G1 | **Pas de flux GPS live** — positions mock / seed | Suivi non temps réel en prod | Haute |
| G2 | **Export PDF/Excel stub** | Pas de reporting opérationnel depuis le panneau | Haute |
| G3 | **Menu contextuel quasi stub** (sauf « Afficher sur la carte ») | Parcours métier incomplets | Haute |
| G4 | **KPIs monitoring hardcodés** | Indicateurs non fiables | Moyenne |
| G5 | **Trajectoire tabulaire sans tracé carte dédié** | Analyse parcours limitée | Haute |
| G6 | **Tables legacy orphelines** (`SuivieFilterBar`, `*Table`) | Dette / confusion maintenance | Basse |
| G7 | **Feature flag compte Suivi** non branché sur l'accès UI | Droit d'accès inopérant | Moyenne |
| G8 | **Mode Alertes Suivi vs Centre d'alertes** non unifiés | Double source de vérité alertes | Moyenne |
| G9 | **Légende carte** compteurs statiques (En ligne 45 / Hors ligne 10) | Incohérence visuelle | Basse |
| G10 | **Onboarding module `tracking`** marqué `available: false` | Activation produit incomplète | Basse |

---

## 7. Répartition des tâches suggérée

### Équipe Frontend

| Tâche | Features | Détail |
|-------|----------|--------|
| Stabiliser UX panneau | 1–3, 9 | Collapse, resize, filtres draft/applied, a11y |
| Brancher actions menu | 13 | Bascule modes + filtres ; AAD / demande position → API commandes |
| Export PDF/Excel | 14 | Colonnes visibles + lignes filtrées |
| Trajectoire carte | 7, 10 | Polyligne historique + sync sélection segment |
| KPIs live | 12 | Brancher `vehicleStats` sur agrégats flotte filtrée |
| Feature flag Suivi | 16 | Masquer TopBar / workspace si accès off |
| Nettoyage legacy | — | Supprimer ou archiver `SuivieFilterBar` / tables orphelines |
| Tests | 2, 9 | `applySuivieFilters`, `useColumnPreferences` |

### Équipe Backend

| Tâche | Features | Détail |
|-------|----------|--------|
| API positions live | 4, 10, 11 | Stream / poll positions, statut, vitesse |
| API historique | 5–7 | Alertes, stop/run, trajectoire par véhicule + période |
| API commandes | 8, 13 | Envoi + statut Demande position / AAD / photo / reset GPS |
| API export | 14 | Génération PDF/Excel côté serveur si volumes élevés |
| Droits page Suivi | 16 | Enforcement accès `suivi` |

### Équipe Intégration / DevOps

| Tâche | Détail |
|-------|--------|
| Remplacer mocks `features/suivie` | Brancher MSW → API réelle |
| Unifier alertes Suivi ↔ Centre d'alertes | Même taxonomie / mêmes IDs événements |
| WebSocket / SSE positions | Latence tracking temps réel |

---

## Annexe — Types de données clés

### Vehicle (carte / sélection)

```
id, name, status: active|idle|offline, speed, location, coordinates [lat,lng],
lastUpdate, driver, batteryLevel, departmentId?, groupIds?, matricule?,
iconType?, heading?
```

### AppliedSuivieFilters

```
action: SuivieAction,
vehicleIds: Set<string>,
departments: Set<string>,
startDate: string,
endDate: string,
alertTypes: Set<string>
```

### Modes et colonnes par défaut

| Mode | Colonnes visibles par défaut |
|------|------------------------------|
| Suivi général | Véhicule, Date / heure, Vitesse, Adresse, Chauffeur, Département |
| Alertes | Véhicule, Date, Type d'alerte, Adresse, Vitesse, Kilométrage |
| Stop & Circulation | État, Matricule, Emplacement, Distance, Période, Date début |
| Trajectoire | Stop/Circulation, Date début, Période, Vitesse, Distance, Emplacement |
| Commandes | Date d'envoi, Véhicule, Type de commande, État |

### Préférences colonnes (localStorage)

```
key: fleetiq.suivie.columns.{action}
value: { order: string[], visible: Record<string, boolean> }
```

---

*Document généré à partir de l'analyse du code frontend FleetIQ — Epic 1 Tracking (module Suivi).*
