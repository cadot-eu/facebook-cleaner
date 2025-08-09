// ==UserScript==
// @name         FCB Detection - Title and Content Detection
// @namespace    https://github.com/cadot-eu/facebook-cleaner
// @version      2.0
// @description  Detection module for Facebook Cleaner
// @author       FCB Cleaner Project
// @match        https://www.facebook.com/*
// @match        https://facebook.com/*
// @grant        none
// @run-at       document-start
// @require      fcb-config.js
// ==/UserScript==

window.FCB = window.FCB || {};

window.FCB.Detection = {
    
    // Extraire le titre propre d'un post
    extractPostTitle: function(postElement) {
        const selectors = window.FCB.Config.TITLE_SELECTORS;
        
        for (const selector of selectors) {
            const elements = postElement.querySelectorAll(selector);
            for (const element of elements) {
                let text = element.textContent || element.innerText || '';
                text = text.trim();

                // Nettoyer AVANT la validation - ordre important !
                text = text.replace(/\s*·.*$/g, ''); // Supprimer tout après le premier ·
                text = text.replace(/\s*Compte vérifié\s*/gi, ''); // Supprimer "Compte vérifié"
                text = text.replace(/\s*Verified\s*/gi, ''); // Supprimer "Verified"
                text = text.replace(/\s*Suivre\s*$/gi, ''); // Supprimer "Suivre" à la fin
                text = text.replace(/\s*Follow\s*$/gi, ''); // Supprimer "Follow" à la fin
                text = text.replace(/\s*\.\s*Suivre\s*$/gi, ''); // Supprimer ". Suivre"
                text = text.replace(/\s*\.\s*Follow\s*$/gi, ''); // Supprimer ". Follow"
                // Supprimer les badges de vérification avec différentes variantes
                text = text.replace(/Compte vérifié/gi, '');
                text = text.replace(/Verified/gi, '');
                // Nettoyer les espaces multiples
                text = text.replace(/\s+/g, ' ').trim();

                // Valider que c'est un titre valide après nettoyage
                if (text &&
                    text.length > 2 &&
                    text.length < 80 &&
                    !text.includes('ago') &&
                    !text.includes('il y a') &&
                    !text.includes('min') &&
                    !text.includes('h ') &&
                    !text.includes('Suivre') &&
                    !text.includes('Follow') &&
                    !text.includes('Compte vérifié') &&
                    !text.includes('Verified') &&
                    !text.match(/^\d+$/) &&
                    !text.match(/^[.,:;!?·]+$/)) {

                    // Double nettoyage pour s'assurer que tout est propre
                    text = text.replace(/Compte vérifié/gi, '');
                    text = text.replace(/Verified/gi, '');
                    text = text.replace(/\s+/g, ' ').trim();
                    
                    // Échapper les caractères spéciaux qui pourraient causer des erreurs JS
                    text = text.replace(/['"\\]/g, ' ').replace(/\s+/g, ' ').trim();
                    
                    if (text.length > 2) {
                        return text;
                    }
                }
            }
        }
        
        return null;
    },
    
    // Vérifier si un post contient des phrases bloquées
    containsBlockedPhrase: function(element, blockedPhrases) {
        const textContent = element.textContent || element.innerText || '';
        return blockedPhrases.some(phrase =>
            textContent.toLowerCase().includes(phrase.toLowerCase())
        );
    },
    
    // Détecter si c'est un post de suggestions "People you may know"
    isSuggestionPost: function(element) {
        const textContent = element.textContent || element.innerText || '';
        return window.FCB.Config.SUGGESTION_PHRASES.some(phrase => 
            textContent.toLowerCase().includes(phrase.toLowerCase())
        );
    },
    
    // Détecter si c'est un post Reels
    isReelsPost: function(element) {
        const textContent = element.textContent || element.innerText || '';
        return window.FCB.Config.REELS_PHRASES.some(phrase => 
            textContent.toLowerCase().includes(phrase.toLowerCase())
        );
    },
    
    // Trouver le conteneur de post le plus approprié
    findPostContainer: function(element) {
        let current = element;
        let levels = 0;
        const maxLevels = 10;
        
        while (current && levels < maxLevels) {
            // Vérifier si c'est un conteneur de post
            if (current.matches && (
                current.matches('div[role="article"]') ||
                current.matches('div[data-pagelet*="FeedUnit"]') ||
                current.matches('.x1yztbdb') ||
                current.matches('div[data-ad-rendering-role]')
            )) {
                return current;
            }
            
            // Vérifier si c'est un conteneur de section avec taille raisonnable
            if (current.offsetHeight > 100 && current.offsetWidth > 200 &&
                current.children.length >= 2) {
                return current;
            }
            
            current = current.parentElement;
            levels++;
        }
        
        return element;
    },
    
    // Détecter si un élément est déjà marqué comme traité
    isAlreadyProcessed: function(element) {
        return element.hasAttribute('data-blocked-by-script') ||
               element.classList.contains('script-blocked-post');
    },
    
    // Extraire tous les titres possibles d'une page (pour suggestions)
    extractPageTitles: function() {
        const titles = new Set();
        const selectors = [
            // Titres de groupes dans les posts
            'span[class*="x1vvkbs"]:not([data-blocked-by-script="true"])',
            'h4 span:not([data-blocked-by-script="true"])',
            'a[role="link"] span:not([data-blocked-by-script="true"])',
            // Titres de pages dans les posts
            'div[data-ad-rendering-role="profile_name"] span:not([data-blocked-by-script="true"])',
            'h4[class*="x14z9mp"] span:not([data-blocked-by-script="true"])',
            // Liens vers des groupes/pages
            'a[href*="/groups/"] span:not([data-blocked-by-script="true"])',
            'a[href*="/pages/"] span:not([data-blocked-by-script="true"])',
            // Sélecteurs génériques pour les noms d'entités
            '[aria-label]:not([data-blocked-by-script="true"])'
        ];

        selectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    let text = '';

                    // Extraire le texte selon le type d'élément
                    if (element.hasAttribute('aria-label')) {
                        text = element.getAttribute('aria-label');
                    } else {
                        text = element.textContent || element.innerText || '';
                    }

                    // Nettoyer et valider le texte
                    text = text.trim();
                    if (text &&
                        text.length > 3 &&
                        text.length < 100 &&
                        !text.includes('·') &&
                        !text.includes('ago') &&
                        !text.includes('il y a') &&
                        !text.includes('Posted') &&
                        !text.includes('Publié') &&
                        !text.match(/^\d+$/) && // Pas juste des chiffres
                        !text.match(/^[.,:;!?]+$/) // Pas juste de la ponctuation
                    ) {
                        // Vérifier si c'est probablement un nom de groupe/page
                        const isProbablyTitle = (
                            text.includes(' ') || // Au moins deux mots
                            text.match(/^[A-Z]/) || // Commence par une majuscule
                            text.length > 15 // Assez long pour être descriptif
                        );

                        if (isProbablyTitle) {
                            titles.add(text);
                        }
                    }
                });
            } catch (e) {
                // Erreur silencieuse
            }
        });

        return Array.from(titles).slice(0, 10); // Limiter à 10 résultats
    },
    
    // Vérifier si un élément doit être observé pour les mutations
    shouldObserveElement: function(element) {
        return element.offsetHeight > 80 && 
               element.offsetHeight < 800 &&
               element.offsetWidth > 200;
    },
    
    // Trouver le conteneur parent approprié pour les mutations
    findMutationContainer: function(element) {
        const parent = element.parentElement;
        if (parent && 
            parent !== document.body && 
            parent !== document.documentElement &&
            parent.offsetHeight > 50) {
            return parent;
        }
        return null;
    }
};
