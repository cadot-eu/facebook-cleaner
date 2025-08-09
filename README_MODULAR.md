# Facebook Cleaner - Architecture Modulaire

Le script Facebook Cleaner a été découpé en plusieurs modules pour une meilleure organisation et maintenabilité.

## 📁 Structure des fichiers

### Scripts modulaires
- `fcb-config.js` - Configuration et constantes globales
- `fcb-storage.js` - Gestion du localStorage et persistance des données
- `fcb-detection.js` - Détection et extraction des titres de posts
- `fcb-blocking.js` - Logique de masquage et blocage des posts
- `fcb-ui.js` - Interface utilisateur (menus, dialogues, boutons)
- `fcb-main.js` - Script principal qui orchestre tous les modules

### Scripts d'entrée
- `fcb-modular.js` - Script principal pour Tampermonkey (utilise les modules distants)
- `fcb-dev.js` - Version de développement (utilise les fichiers locaux)
- `fcb.js` - Version monolithique originale (pour compatibilité)

## 🚀 Utilisation

### Pour l'utilisateur final
Installez `fcb-modular.js` dans Tampermonkey. Il chargera automatiquement tous les modules depuis GitHub.

### Pour le développement
1. Utilisez `fcb-dev.js` pour tester avec les fichiers locaux
2. Modifiez les modules individuels selon les besoins
3. Testez les changements
4. Publiez les modules mis à jour sur GitHub

## 🔧 Avantages de l'architecture modulaire

### ✅ Maintenabilité
- Code organisé par fonctionnalité
- Modules indépendants et réutilisables
- Easier debugging et tests unitaires

### ✅ Flexibilité
- Possibilité de mettre à jour un seul module
- Ajout facile de nouvelles fonctionnalités
- Configuration centralisée

### ✅ Performance
- Chargement optimisé des modules
- Cache des configurations
- Gestion efficace de la mémoire

## 📦 Description des modules

### `fcb-config.js`
Contient toutes les configurations globales :
- Phrases bloquées par défaut
- Sélecteurs CSS
- Styles d'interface
- Constantes et timeouts

### `fcb-storage.js`
Gère la persistance des données :
- Chargement/sauvegarde des phrases personnalisées
- Gestion des options utilisateur
- Import/export des configurations
- Statistiques de stockage

### `fcb-detection.js`
Logique de détection du contenu :
- Extraction des titres de posts
- Détection des suggestions "People you may know"
- Détection des Reels
- Identification des conteneurs de posts

### `fcb-blocking.js`
Moteur de blocage :
- Masquage des posts indésirables
- Application des filtres
- Gestion des observers de mutations
- Nettoyage des éléments orphelins

### `fcb-ui.js`
Interface utilisateur :
- Menu flottant principal
- Dialogues de configuration
- Boutons d'ajout de titres
- Gestion des interactions

### `fcb-main.js`
Orchestrateur principal :
- Initialisation du script
- Coordination des modules
- Gestion des événements
- Scanning périodique

## 🔄 Migration depuis la version monolithique

Les utilisateurs existants peuvent :
1. Garder `fcb.js` (toujours maintenu)
2. Migrer vers `fcb-modular.js` (recommandé)

Toutes les données et configurations sont conservées lors de la migration.

## 🛠️ Développement

### Ajouter une nouvelle fonctionnalité
1. Identifiez le module approprié (ou créez-en un nouveau)
2. Ajoutez la fonctionnalité au module
3. Exposez l'API via `window.FCB.ModuleName`
4. Mettez à jour `fcb-main.js` si nécessaire
5. Testez avec `fcb-dev.js`

### Modifier une configuration
1. Éditez `fcb-config.js`
2. Testez localement
3. Publiez sur GitHub

### Déboguer un problème
1. Identifiez le module concerné
2. Utilisez `fcb-dev.js` pour les tests locaux
3. Ajoutez des logs de débogage
4. Isolez le problème dans le module spécifique

## 📱 Compatibilité

- ✅ Tampermonkey
- ✅ Greasemonkey
- ✅ Violentmonkey
- ✅ Chrome, Firefox, Edge, Safari

## 🔗 Liens utiles

- [Repository GitHub](https://github.com/cadot-eu/facebook-cleaner)
- [Page GreasyFork](https://greasyfork.org/fr/scripts/545074-facebook-cleaner-block-group-invites-spam)
- [Issues et Support](https://github.com/cadot-eu/facebook-cleaner/issues)
