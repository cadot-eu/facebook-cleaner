// ==UserScript==
// @name         FCB Main - Core Logic
// @namespace    https://github.com/cadot-eu/facebook-cleaner
// @version      2.0
// @description  Main module for Facebook Cleaner
// @author       FCB Cleaner Project
// @match        https://www.facebook.com/*
// @match        https://facebook.com/*
// @grant        none
// @run-at       document-end
// @require      fcb-config.js
// @require      fcb-storage.js
// @require      fcb-detection.js
// @require      fcb-blocking.js
// @require      fcb-ui.js
// ==/UserScript==

window.FCB = window.FCB || {};

window.FCB.Main = {
    
    // Variables d'état
    blockedPhrases: [],
    options: {},
    scriptActive: true,
    observers: [],
    
    // Initialisation
    init: function() {
        // Charger les données
        this.loadData();
        
        // Créer l'interface
        this.createUI();
        
        // Démarrer le scanning
        this.startScanning();
        
        // Configurer les observers
        this.setupObservers();
        
        console.log('[FCB] Facebook Cleaner initialisé');
    },
    
    // Charger les données depuis le stockage
    loadData: function() {
        this.blockedPhrases = window.FCB.Storage.loadBlockedPhrases();
        this.options = window.FCB.Storage.loadOptions();
        this.scriptActive = window.FCB.Storage.loadScriptState();
        
        // Appliquer les options CSS
        window.FCB.Blocking.applyOptionsCSS(this.options);
    },
    
    // Créer l'interface utilisateur
    createUI: function() {
        const stats = this.getStats();
        
        window.FCB.UI.createFloatingMenu(
            stats,
            () => this.toggleScript(),
            () => this.openAddPhraseDialog(),
            () => this.openPhrasesDialog(),
            () => this.openOptionsDialog()
        );
    },
    
    // Démarrer le scanning périodique
    startScanning: function() {
        // Scanning initial
        this.scanPosts();
        
        // Scanning périodique
        setInterval(() => {
            if (this.scriptActive) {
                this.scanPosts();
            }
        }, window.FCB.Config.TIMINGS.SCAN_INTERVAL);
    },
    
    // Scanner et traiter les posts
    scanPosts: function() {
        if (!this.scriptActive) return;
        
        // Scanner les posts
        const results = window.FCB.Blocking.scanAndProcess(this.blockedPhrases, this.options);
        
        // Ajouter les boutons d'ajout de titre
        this.addTitleButtons();
        
        return results;
    },
    
    // Ajouter les boutons d'ajout de titre aux posts
    addTitleButtons: function() {
        const posts = document.querySelectorAll(window.FCB.Config.POST_SELECTORS.join(', '));
        
        posts.forEach(post => {
            // Ne pas traiter les posts masqués
            if (window.FCB.Detection.isAlreadyProcessed(post)) return;
            
            // Ne pas ajouter si bouton déjà présent
            if (post.querySelector('.fcb-add-title-btn')) return;
            
            const title = window.FCB.Detection.extractPostTitle(post);
            if (title && !this.blockedPhrases.includes(title)) {
                window.FCB.UI.addButtonToPost(post, title, (detectedTitle, button) => {
                    this.handleAddTitle(detectedTitle, button);
                });
            }
        });
    },
    
    // Configurer les observers de mutations
    setupObservers: function() {
        // Observer le body pour les nouveaux posts
        const bodyObserver = new MutationObserver((mutations) => {
            if (!this.scriptActive) return;
            
            let hasNewContent = false;
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        hasNewContent = true;
                    }
                });
            });
            
            if (hasNewContent) {
                setTimeout(() => this.scanPosts(), window.FCB.Config.TIMINGS.MUTATION_DELAY);
            }
        });
        
        bodyObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        this.observers.push(bodyObserver);
    },
    
    // Basculer l'état du script
    toggleScript: function() {
        this.scriptActive = !this.scriptActive;
        window.FCB.Storage.saveScriptState(this.scriptActive);
        
        // Recréer l'UI pour mettre à jour l'état
        this.createUI();
        
        if (this.scriptActive) {
            // Redémarrer le scanning
            setTimeout(() => this.scanPosts(), 100);
        }
    },
    
    // Ouvrir le dialogue d'ajout de phrase
    openAddPhraseDialog: function() {
        window.FCB.UI.createAddPhraseDialog(
            (phrase) => this.addPhrase(phrase),
            () => {} // onCancel
        );
    },
    
    // Ouvrir le dialogue des phrases
    openPhrasesDialog: function() {
        window.FCB.UI.createPhrasesDialog(
            this.blockedPhrases,
            (index) => this.deletePhrase(index),
            () => {} // onClose
        );
    },
    
    // Ouvrir le dialogue des options
    openOptionsDialog: function() {
        window.FCB.UI.createOptionsDialog(
            this.options,
            (newOptions) => this.saveOptions(newOptions),
            () => {} // onCancel
        );
    },
    
    // Gérer l'ajout d'un titre depuis un bouton
    handleAddTitle: function(detectedTitle, button) {
        window.FCB.UI.createEditTitleDialog(
            detectedTitle,
            (finalTitle) => {
                if (this.addPhrase(finalTitle)) {
                    // Feedback visuel
                    button.innerHTML = '✅';
                    button.style.background = 'rgba(16, 185, 129, 1)';
                    button.title = `Ajouté : "${finalTitle}"`;
                    
                    // Message de confirmation
                    alert(`"${finalTitle}" a été ajouté aux phrases bloquées !`);
                    
                    // Supprimer le bouton et re-scanner
                    setTimeout(() => {
                        button.remove();
                        setTimeout(() => this.scanPosts(), 100);
                    }, window.FCB.Config.TIMINGS.BUTTON_REMOVE_DELAY);
                }
            },
            () => {} // onCancel
        );
    },
    
    // Ajouter une phrase
    addPhrase: function(phrase) {
        if (!phrase || !phrase.trim()) {
            alert('La phrase ne peut pas être vide');
            return false;
        }
        
        const cleanPhrase = phrase.trim();
        
        if (this.blockedPhrases.includes(cleanPhrase)) {
            alert(`"${cleanPhrase}" est déjà dans la liste des phrases bloquées !`);
            return false;
        }
        
        this.blockedPhrases.push(cleanPhrase);
        window.FCB.Storage.saveCustomPhrases(this.blockedPhrases);
        
        // Re-scanner pour appliquer la nouvelle phrase
        setTimeout(() => this.scanPosts(), 100);
        
        return true;
    },
    
    // Supprimer une phrase
    deletePhrase: function(index) {
        if (index >= 0 && index < this.blockedPhrases.length) {
            this.blockedPhrases.splice(index, 1);
            window.FCB.Storage.saveCustomPhrases(this.blockedPhrases);
            return true;
        }
        return false;
    },
    
    // Sauvegarder les options
    saveOptions: function(newOptions) {
        this.options = { ...newOptions };
        window.FCB.Storage.saveOptions(this.options);
        window.FCB.Blocking.applyOptionsCSS(this.options);
        
        // Re-scanner pour appliquer les nouvelles options
        setTimeout(() => this.scanPosts(), 100);
    },
    
    // Obtenir les statistiques
    getStats: function() {
        return {
            scriptActive: this.scriptActive,
            processedPosts: window.FCB.Blocking.processedPosts.size,
            blockedPhrasesCount: this.blockedPhrases.length,
            ...window.FCB.Blocking.getBlockingStats()
        };
    },
    
    // Lancement rapide pour masquage immédiat
    earlyLaunch: function() {
        // Charger rapidement les données essentielles
        const phrases = window.FCB.Storage.loadBlockedPhrases();
        const options = window.FCB.Storage.loadOptions();
        const scriptActive = window.FCB.Storage.loadScriptState();
        
        if (scriptActive) {
            // Appliquer immédiatement les options CSS
            window.FCB.Blocking.applyOptionsCSS(options);
            
            // Scanner immédiatement
            window.FCB.Blocking.scanAndProcess(phrases, options);
        }
    },
    
    // Nettoyage
    cleanup: function() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers = [];
        window.FCB.Blocking.resetStats();
    }
};

// Auto-initialisation
if (document.readyState !== 'loading') {
    // DOM déjà prêt
    window.FCB.Main.earlyLaunch();
    setTimeout(() => window.FCB.Main.init(), 100);
} else {
    // DOM en cours de chargement
    document.addEventListener('DOMContentLoaded', () => {
        window.FCB.Main.earlyLaunch();
        setTimeout(() => window.FCB.Main.init(), 100);
    });
}

// Lancement IMMÉDIAT pour un masquage ultra-rapide
setTimeout(() => window.FCB.Main.earlyLaunch(), 0);
