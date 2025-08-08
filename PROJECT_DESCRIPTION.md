# FCB Cleaner - Description du Projet

## 🎯 Vue d'ensemble

**FCB Cleaner** (Facebook Content Blocker) est un script utilisateur sophistiqué développé en JavaScript pour filtrer automatiquement le contenu indésirable sur Facebook. Principalement conçu pour bloquer les invitations de groupes spammy et autres contenus répétitifs, il offre une expérience Facebook plus propre et personnalisée.

## 🏗️ Architecture Technique

### Technologies Utilisées
- **JavaScript ES6+** - Language principal
- **DOM Manipulation** - Interaction avec la page Facebook
- **CSS Injection** - Masquage d'éléments
- **MutationObserver API** - Surveillance des changements DOM
- **Tampermonkey UserScript** - Plateforme d'exécution

### Composants Principaux

#### 1. **Moteur de Détection**
- Scanner multi-sélecteurs CSS
- Algorithme de remontée intelligente dans l'arbre DOM
- Cache des contenus déjà analysés
- Normalisation de texte avec gestion des accents

#### 2. **Système de Masquage**
- Masquage CSS multi-couches résistant
- Observateurs de mutations pour re-masquage
- Nettoyage des éléments orphelins
- Marquage persistant des éléments traités

#### 3. **Interface Utilisateur**
- Barre d'outils flottante non-intrusive
- Gestionnaire de phrases avec modal
- Détection automatique de titres de groupes/pages
- Compteur en temps réel

#### 4. **Système de Persistance**
- Stockage local des phrases personnalisées
- Sauvegarde automatique des préférences
- Restauration au rechargement de page

## 🔧 Fonctionnalités Avancées

### Détection Intelligente
- **Multi-niveaux** : Remonte jusqu'à 20 niveaux dans le DOM
- **Validation contextuelle** : Vérifie que le contenu cible est inclus
- **Filtrage structurel** : Analyse la taille et la structure des éléments
- **Résistance aux changements** : S'adapte aux modifications de Facebook

### Masquage Robuste
- **CSS Important** : Force le masquage même si Facebook modifie les styles
- **Observateurs** : Re-masque automatiquement si l'élément réapparaît
- **Nettoyage orphelins** : Supprime les fragments résiduels
- **Classes persistantes** : Marque les éléments pour éviter le retraitement

### Interface Intuitive
- **Détection automatique** : Extrait les noms de groupes/pages de la page courante
- **Gestion visuelle** : Interface modal pour voir/supprimer les phrases
- **Feedback temps réel** : Compteur de posts bloqués
- **Scanner manuel** : Bouton pour nettoyer immédiatement

## 📊 Performance et Optimisation

### Stratégies d'Optimisation
- **WeakSet** pour éviter les fuites mémoire
- **Cache de signatures** pour éviter les re-analyses
- **Délais échelonnés** pour répartir la charge
- **Scanner adaptatif** : Fréquent au début, puis espacé

### Surveillance Performance
- **Logs détaillés** pour le debugging
- **Métriques de performance** dans la console
- **Limitation des tentatives** pour éviter les boucles infinies
- **Timeouts configurables** selon la machine

## 🛡️ Sécurité et Vie Privée

### Politique de Données
- **Aucune collecte** : Le script ne transmet aucune donnée
- **Stockage local uniquement** : Les préférences restent sur l'appareil
- **Pas de tracking** : Aucun suivi ou analytique
- **Code ouvert** : Entièrement auditable

### Sécurité d'Exécution
- **Sandboxing Tampermonkey** : Exécution isolée
- **Pas de requêtes externes** : Fonctionne entièrement en local
- **Validation des inputs** : Vérification des données utilisateur
- **Gestion d'erreurs** : Try/catch pour éviter les plantages

## 🚀 Évolutions Futures

### Fonctionnalités Prévues
- **Filtres par mots-clés regex** : Expressions régulières avancées
- **Whitelist de groupes** : Autoriser certains groupes spécifiques
- **Export/Import des règles** : Partage de configurations
- **Mode silencieux** : Masquage sans interface

### Améliorations Techniques
- **Web Workers** : Traitement en arrière-plan
- **Service Worker** : Persistance améliorée
- **WebAssembly** : Traitement de texte ultra-rapide
- **IndexedDB** : Stockage plus robuste

## 📈 Métriques et Monitoring

### Données Collectées (Localement)
- Nombre de posts bloqués
- Phrases les plus efficaces
- Performance de détection
- Erreurs et échecs

### Debugging et Logs
- Console détaillée avec emojis
- Timestamps des opérations
- Stack traces des erreurs
- Métriques de performance DOM

## 🎨 Design Patterns Utilisés

### Observer Pattern
- MutationObserver pour changements DOM
- Event listeners pour interactions utilisateur
- Callbacks pour actions asynchrones

### Strategy Pattern
- Multiples méthodes de détection
- Sélecteurs CSS configurables
- Algorithmes de masquage adaptatifs

### Singleton Pattern
- Instance unique du scanner
- Cache global partagé
- Interface utilisateur unique

## 🧪 Tests et Validation

### Stratégie de Test
- **Tests manuels** sur différentes pages Facebook
- **Validation cross-browser** (Chrome, Firefox, Edge)
- **Tests de performance** avec profiling
- **Tests de régression** après mises à jour Facebook

### Critères de Qualité
- **Pas de faux positifs** : Ne bloque que le contenu ciblé
- **Performance fluide** : Moins de 100ms par scan
- **Stabilité** : Pas de plantage sur 1000+ posts
- **Compatibilité** : Fonctionne sur toutes versions Facebook

---

Ce projet représente une solution complète et robuste pour améliorer l'expérience utilisateur Facebook en filtrant intelligemment le contenu indésirable.
