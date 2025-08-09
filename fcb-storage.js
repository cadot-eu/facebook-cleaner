// ==UserScript==
// @name         FCB Storage - Data Management
// @namespace    https://github.com/cadot-eu/facebook-cleaner
// @version      2.0
// @description  Storage management module for Facebook Cleaner
// @author       FCB Cleaner Project
// @match        https://www.facebook.com/*
// @match        https://facebook.com/*
// @grant        none
// @run-at       document-start
// @require      fcb-config.js
// ==/UserScript==

window.FCB = window.FCB || {};

window.FCB.Storage = {
    
    // Charger les phrases bloquées
    loadBlockedPhrases: function() {
        try {
            const saved = localStorage.getItem(window.FCB.Config.STORAGE_KEYS.PHRASES);
            const customPhrases = saved ? JSON.parse(saved) : [];
            return [...window.FCB.Config.DEFAULT_BLOCKED_PHRASES, ...customPhrases];
        } catch (e) {
            return [...window.FCB.Config.DEFAULT_BLOCKED_PHRASES];
        }
    },
    
    // Sauvegarder les phrases personnalisées
    saveCustomPhrases: function(allPhrases) {
        try {
            // Ne sauvegarder que les phrases ajoutées (pas celles par défaut)
            const customPhrases = allPhrases.slice(window.FCB.Config.DEFAULT_BLOCKED_PHRASES.length);
            localStorage.setItem(window.FCB.Config.STORAGE_KEYS.PHRASES, JSON.stringify(customPhrases));
        } catch (e) {
            console.error('[FCB] Erreur sauvegarde phrases:', e);
        }
    },
    
    // Charger les options
    loadOptions: function() {
        try {
            const options = {};
            const keys = window.FCB.Config.STORAGE_KEYS.OPTIONS;
            
            options.masquerColonneDroite = localStorage.getItem(keys.COLONNE_DROITE) === 'true';
            options.masquerReels = localStorage.getItem(keys.REELS) === 'true';
            options.masquerSuggestions = localStorage.getItem(keys.SUGGESTIONS) === 'true';
            
            return options;
        } catch (e) {
            return { ...window.FCB.Config.DEFAULT_OPTIONS };
        }
    },
    
    // Sauvegarder les options
    saveOptions: function(options) {
        try {
            const keys = window.FCB.Config.STORAGE_KEYS.OPTIONS;
            
            localStorage.setItem(keys.COLONNE_DROITE, options.masquerColonneDroite ? 'true' : 'false');
            localStorage.setItem(keys.REELS, options.masquerReels ? 'true' : 'false');
            localStorage.setItem(keys.SUGGESTIONS, options.masquerSuggestions ? 'true' : 'false');
        } catch (e) {
            console.error('[FCB] Erreur sauvegarde options:', e);
        }
    },
    
    // Charger l'état d'activation du script
    loadScriptState: function() {
        try {
            return localStorage.getItem(window.FCB.Config.STORAGE_KEYS.SCRIPT_ACTIVE) !== 'false';
        } catch (e) {
            return true; // Actif par défaut
        }
    },
    
    // Sauvegarder l'état d'activation du script
    saveScriptState: function(isActive) {
        try {
            localStorage.setItem(window.FCB.Config.STORAGE_KEYS.SCRIPT_ACTIVE, isActive ? 'true' : 'false');
        } catch (e) {
            console.error('[FCB] Erreur sauvegarde état script:', e);
        }
    },
    
    // Exporter toutes les données
    exportData: function() {
        return {
            phrases: this.loadBlockedPhrases(),
            options: this.loadOptions(),
            scriptActive: this.loadScriptState(),
            version: window.FCB.Config.VERSION,
            exportDate: new Date().toISOString()
        };
    },
    
    // Importer des données
    importData: function(data) {
        try {
            if (data.phrases) {
                // Garder seulement les phrases personnalisées
                const customPhrases = data.phrases.filter(phrase => 
                    !window.FCB.Config.DEFAULT_BLOCKED_PHRASES.includes(phrase)
                );
                localStorage.setItem(window.FCB.Config.STORAGE_KEYS.PHRASES, JSON.stringify(customPhrases));
            }
            
            if (data.options) {
                this.saveOptions(data.options);
            }
            
            if (typeof data.scriptActive === 'boolean') {
                this.saveScriptState(data.scriptActive);
            }
            
            return true;
        } catch (e) {
            console.error('[FCB] Erreur import données:', e);
            return false;
        }
    },
    
    // Réinitialiser toutes les données
    resetData: function() {
        try {
            const keys = window.FCB.Config.STORAGE_KEYS;
            localStorage.removeItem(keys.PHRASES);
            localStorage.removeItem(keys.OPTIONS.COLONNE_DROITE);
            localStorage.removeItem(keys.OPTIONS.REELS);
            localStorage.removeItem(keys.OPTIONS.SUGGESTIONS);
            localStorage.removeItem(keys.SCRIPT_ACTIVE);
            return true;
        } catch (e) {
            console.error('[FCB] Erreur reset données:', e);
            return false;
        }
    },
    
    // Obtenir des statistiques de stockage
    getStorageStats: function() {
        const phrases = this.loadBlockedPhrases();
        const customPhrases = phrases.slice(window.FCB.Config.DEFAULT_BLOCKED_PHRASES.length);
        
        return {
            totalPhrases: phrases.length,
            defaultPhrases: window.FCB.Config.DEFAULT_BLOCKED_PHRASES.length,
            customPhrases: customPhrases.length,
            options: this.loadOptions(),
            scriptActive: this.loadScriptState()
        };
    }
};
