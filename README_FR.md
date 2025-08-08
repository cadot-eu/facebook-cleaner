# 🚫 Facebook Post Blocker - FCB Cleaner

**🇫🇷 Version Française** | **[🇺🇸 English Version](README.md)**

Un script utilisateur (UserScript) puissant pour **Tampermonkey** qui bloque automatiquement les posts indésirables sur Facebook, particulièrement les invitations de groupes et autres contenus spammy.

## 📋 Description du Projet

**FCB Cleaner** est un script JavaScript avancé qui s'exécute directement dans votre navigateur via Tampermonkey. Il surveille en temps réel le feed Facebook et masque automatiquement les posts contenant des phrases spécifiques que vous ne voulez pas voir.

### 🎯 Fonctionnalités Principales

- **Blocage automatique** des posts d'invitations de groupes
- **Interface utilisateur intuitive** avec boutons de contrôle
- **Phrases personnalisables** - ajoutez vos propres filtres
- **Détection automatique** des titres de groupes/pages pour blocage rapide
- **Nettoyage complet** - supprime les posts entiers, pas seulement des parties
- **Résistant aux modifications** de Facebook (re-masquage automatique)
- **Scanner manuel** pour nettoyer immédiatement
- **Gestion des phrases** avec interface graphique

### 🔧 Phrases Bloquées par Défaut

Le script bloque automatiquement les posts contenant :

- "vous invite"
- "vous a invité"
- "invite à rejoindre"
- "a rejoint le groupe"
- "invited you to join"
- "rejoindre ce groupe"
- "join this group"
- "has joined the group"
- "healthy body"

## 🚀 Installation

### Prérequis

1. **Navigateur compatible** : Chrome, Firefox, Edge, Safari
2. **Extension Tampermonkey** installée ([Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) | [Firefox](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/))

### Installation du Script

1. Copiez le contenu du fichier `fcb.js`
2. Ouvrez Tampermonkey dans votre navigateur
3. Cliquez sur "Créer un nouveau script"
4. Collez le code et sauvegardez (Ctrl+S)
5. Le script s'activera automatiquement sur Facebook

## 🎮 Utilisation

### Interface de Contrôle

Une barre d'outils apparaît en bas à gauche de Facebook avec :

- **➕** Ajouter une phrase personnalisée
- **⚡** Détecter et ajouter automatiquement les titres de groupes/pages
- **👁️** Voir et gérer toutes les phrases bloquées
- **🔍** Scanner manuellement la page
- **[N]** Compteur de posts bloqués

### Ajouter des Phrases Personnalisées

1. Cliquez sur le bouton **➕**
2. Tapez la phrase à bloquer
3. Le script commencera immédiatement à bloquer les posts contenant cette phrase

### Blocage Automatique de Groupes

1. Visitez un post d'un groupe que vous voulez bloquer
2. Cliquez sur **⚡** pour détecter automatiquement le nom du groupe
3. Sélectionnez le groupe à bloquer dans la liste

### Gestion des Phrases

1. Cliquez sur **👁️** pour ouvrir la fenêtre de gestion
2. Consultez les phrases par défaut et personnalisées
3. Supprimez les phrases personnalisées si nécessaire

## ⚙️ Fonctionnement Technique

### Architecture du Script

- **Scanner intelligent** : détecte les posts via multiples sélecteurs CSS
- **Algorithme de remontée** : trouve le conteneur parent correct du post
- **Masquage résistant** : applique plusieurs techniques de masquage CSS
- **Observer de mutations** : surveille les changements DOM en temps réel
- **Nettoyage des orphelins** : supprime les fragments résiduels

### Méthodes de Détection

1. **Sélecteurs Facebook** : `role="article"`, `data-testid`, `data-pagelet`
2. **Analyse structurelle** : taille, nombre d'enfants, contenu
3. **Remontée intelligente** : jusqu'à 20 niveaux dans l'arbre DOM
4. **Vérification contextuelle** : s'assure que le contenu cible est inclus

### Techniques de Masquage

- `display: none !important`
- `visibility: hidden !important`
- `height: 0px !important`
- `opacity: 0 !important`
- Classes CSS personnalisées
- Observers pour re-masquage automatique

## 🛠️ Personnalisation

### Modifier les Phrases par Défaut

Éditez le tableau `phrasesABloquer` dans le code :

```javascript
let phrasesABloquer = [
    "votre phrase ici",
    "autre phrase",
    // ... ajoutez vos phrases
];
```

### Ajuster les Sélecteurs

Modifiez le tableau `selecteurs` dans la fonction `scannerPosts()` pour cibler d'autres éléments.

### Configurer les Délais

Ajustez les timeouts dans la fonction `initialiser()` selon les performances de votre machine.

## 🐛 Dépannage

### Le Script ne Fonctionne Pas

1. Vérifiez que Tampermonkey est activé
2. Actualisez la page Facebook
3. Consultez la console développeur (F12) pour les logs

### Posts non Bloqués

1. Utilisez le scanner manuel (🔍)
2. Ajoutez des phrases plus spécifiques
3. Vérifiez les logs de détection dans la console

### Performance Lente

1. Réduisez la fréquence de scan dans `setInterval`
2. Diminuez le nombre de `maxTentatives` dans `trouverPostParent`

## 📝 Logs et Debug

Le script génère des logs détaillés dans la console du navigateur :

- 🔍 Détection de texte à bloquer
- ✅ Posts masqués avec succès
- ❌ Échecs de masquage
- 🧹 Nettoyage d'éléments orphelins

## 🔄 Mises à Jour

Pour mettre à jour le script :

1. Remplacez le code dans Tampermonkey
2. Actualisez Facebook
3. Les nouvelles fonctionnalités seront actives immédiatement

## ⚠️ Avertissements

- Ce script modifie l'affichage de Facebook mais **ne collecte aucune donnée**
- Il fonctionne **uniquement côté client** dans votre navigateur
- Les phrases personnalisées sont stockées **localement**
- Facebook peut modifier sa structure et affecter l'efficacité du script

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Forkez le projet
2. Créez une branche pour votre fonctionnalité
3. Commitez vos changements
4. Poussez vers la branche
5. Ouvrez une Pull Request

Veuillez lire notre [Code de Conduite](CODE_OF_CONDUCT_FR.md) avant de contribuer.

## 📄 Licence

Ce projet est distribué sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 📞 Support

Si vous rencontrez des problèmes :

1. Consultez la section **Dépannage** ci-dessus
2. Vérifiez les issues existantes
3. Ouvrez une nouvelle issue avec des détails complets

---

**Note** : Ce script est un outil personnel d'amélioration de l'expérience utilisateur sur Facebook. Il respecte les conditions d'utilisation en ne modifiant que l'affichage local.
