// ==UserScript==
// @name         FCB Blocking - Post Blocking Logic
// @namespace    https://github.com/cadot-eu/facebook-cleaner
// @version      2.0
// @description  Blocking module for Facebook Cleaner
// @author       FCB Cleaner Project
// @match        https://www.facebook.com/*
// @match        https://facebook.com/*
// @grant        none
// @run-at       document-start
// @require      fcb-config.js
// @require      fcb-detection.js
// ==/UserScript==

window.FCB = window.FCB || {};

window.FCB.Blocking = {
    
    // Sets pour éviter de retraiter les mêmes éléments
    processedPosts: new Set(),
    markedElements: new WeakSet(),
    blockedTextsCache: new Set(),
    
    // Masquer un post
    hidePost: function(element) {
        if (!element || this.markedElements.has(element)) return false;
        
        // Sécurité : ne jamais masquer <body> ou <html>
        if (element === document.body || element === document.documentElement) {
            return false;
        }
        
        // Marquage permanent
        element.setAttribute('data-blocked-by-script', 'true');
        element.classList.add('script-blocked-post');
        this.markedElements.add(element);
        
        // Application des styles de masquage
        const styles = window.FCB.Config.STYLES.BLOCKED_POST;
        Object.keys(styles).forEach(property => {
            element.style.setProperty(property, styles[property], 'important');
        });
        
        this.processedPosts.add(element);
        return true;
    },
    
    // Masquer les posts contenant des phrases bloquées
    hideBlockedPosts: function(blockedPhrases) {
        const selectors = window.FCB.Config.POST_SELECTORS;
        let hiddenCount = 0;
        
        selectors.forEach(selector => {
            try {
                const posts = document.querySelectorAll(selector);
                posts.forEach(post => {
                    if (!window.FCB.Detection.isAlreadyProcessed(post)) {
                        if (window.FCB.Detection.containsBlockedPhrase(post, blockedPhrases)) {
                            const container = window.FCB.Detection.findPostContainer(post);
                            if (this.hidePost(container)) {
                                hiddenCount++;
                            }
                        }
                    }
                });
            } catch (e) {
                // Erreur silencieuse
            }
        });
        
        return hiddenCount;
    },
    
    // Masquer les suggestions "People you may know"
    hideSuggestions: function() {
        const selectors = window.FCB.Config.POST_SELECTORS;
        let hiddenCount = 0;
        
        selectors.forEach(selector => {
            const posts = document.querySelectorAll(selector);
            posts.forEach(post => {
                if (!window.FCB.Detection.isAlreadyProcessed(post)) {
                    if (window.FCB.Detection.isSuggestionPost(post)) {
                        const container = window.FCB.Detection.findPostContainer(post);
                        if (this.hidePost(container)) {
                            hiddenCount++;
                        }
                    }
                }
            });
        });
        
        return hiddenCount;
    },
    
    // Masquer les Reels
    hideReels: function() {
        const selectors = window.FCB.Config.POST_SELECTORS;
        let hiddenCount = 0;
        
        selectors.forEach(selector => {
            const posts = document.querySelectorAll(selector);
            posts.forEach(post => {
                if (!window.FCB.Detection.isAlreadyProcessed(post)) {
                    if (window.FCB.Detection.isReelsPost(post)) {
                        const container = window.FCB.Detection.findPostContainer(post);
                        if (this.hidePost(container)) {
                            hiddenCount++;
                        }
                    }
                }
            });
        });
        
        return hiddenCount;
    },
    
    // Masquer la colonne de droite
    hideRightColumn: function() {
        const rightColumnSelectors = [
            'div[data-pagelet="RightRail"]',
            'div[role="complementary"]',
            'div[data-testid="right_rail"]',
            '.right_rail'
        ];
        
        rightColumnSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                if (!element.hasAttribute('data-fcb-hidden')) {
                    element.style.setProperty('display', 'none', 'important');
                    element.style.setProperty('visibility', 'hidden', 'important');
                    element.setAttribute('data-fcb-hidden', 'true');
                }
            });
        });
    },
    
    // Nettoyer les éléments marqués orphelins
    cleanupMarkedElements: function() {
        document.querySelectorAll('[data-blocked-by-script="true"]').forEach(element => {
            if (!document.body.contains(element)) {
                this.processedPosts.delete(element);
            }
        });
    },
    
    // Scanner et traiter tous les posts
    scanAndProcess: function(blockedPhrases, options) {
        let totalHidden = 0;
        
        // Masquer les posts avec phrases bloquées
        totalHidden += this.hideBlockedPosts(blockedPhrases);
        
        // Masquer les suggestions si activé
        if (options.masquerSuggestions) {
            totalHidden += this.hideSuggestions();
        }
        
        // Masquer les reels si activé
        if (options.masquerReels) {
            totalHidden += this.hideReels();
        }
        
        // Masquer la colonne droite si activé
        if (options.masquerColonneDroite) {
            this.hideRightColumn();
        }
        
        // Nettoyage périodique
        if (Math.random() < 0.1) { // 10% de chance
            this.cleanupMarkedElements();
        }
        
        return {
            hiddenPosts: totalHidden,
            processedTotal: this.processedPosts.size
        };
    },
    
    // Observer un élément pour les mutations
    observeElement: function(element, callback) {
        if (!window.FCB.Detection.shouldObserveElement(element)) return null;
        
        const observer = new MutationObserver(callback);
        observer.observe(element, {
            childList: true,
            subtree: true,
            attributes: false
        });
        
        return observer;
    },
    
    // Appliquer les options CSS
    applyOptionsCSS: function(options) {
        let existingStyle = document.getElementById('fcb-options-style');
        if (existingStyle) {
            existingStyle.remove();
        }

        const style = document.createElement('style');
        style.id = 'fcb-options-style';
        
        let css = '';
        
        if (options.masquerColonneDroite) {
            css += `
                div[data-pagelet="RightRail"],
                div[role="complementary"],
                div[data-testid="right_rail"],
                .right_rail {
                    display: none !important;
                    visibility: hidden !important;
                }
            `;
        }
        
        if (options.masquerReels) {
            css += `
                div[aria-label*="Reels"],
                div[aria-label*="Watch Reels"],
                a[href*="/reel/"] {
                    display: none !important;
                    visibility: hidden !important;
                }
            `;
        }
        
        style.textContent = css;
        document.head.appendChild(style);
    },
    
    // Obtenir des statistiques de blocage
    getBlockingStats: function() {
        return {
            processedPosts: this.processedPosts.size,
            markedElementsCount: document.querySelectorAll('[data-blocked-by-script="true"]').length,
            cacheSize: this.blockedTextsCache.size
        };
    },
    
    // Réinitialiser le cache et les compteurs
    resetStats: function() {
        this.processedPosts.clear();
        this.blockedTextsCache.clear();
        // Note: markedElements est un WeakSet et ne peut pas être vidé
    }
};
