// ==UserScript==
// @name         FCB Config - Configuration
// @namespace    https://github.com/cadot-eu/facebook-cleaner
// @version      2.0
// @description  Configuration module for Facebook Cleaner
// @author       FCB Cleaner Project
// @match        https://www.facebook.com/*
// @match        https://facebook.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

window.FCB = window.FCB || {};

window.FCB.Config = {
    // Version du script
    VERSION: "2.0",
    
    // Liste des phrases à bloquer par défaut
    DEFAULT_BLOCKED_PHRASES: [
        "vous invite",
        "vous a invité",
        "vous a invité.e",
        "invite à rejoindre",
        "a rejoint le groupe",
        "invited you to join",
        "rejoindre ce groupe",
        "rejoindre le groupe",
        "Suggested for you",
        "People you may know",
        "Personnes que vous pourriez connaître",
        "healthy body"
    ],
    
    // Phrases pour détecter les suggestions "People you may know"
    SUGGESTION_PHRASES: [
        "People you may know",
        "Personnes que vous pourriez connaître",
        "Suggested for you",
        "Suggéré pour vous",
        "Suggestions d'amis",
        "Friend suggestions",
        "People You May Know",
        "Personne que vous pourriez connaître"
    ],
    
    // Phrases pour détecter les "Reels"
    REELS_PHRASES: [
        "Reels",
        "Watch Reels",
        "Voir les Reels",
        "Bobines",
        "Court métrage"
    ],
    
    // Sélecteurs CSS pour les posts
    POST_SELECTORS: [
        'div[role="article"]',
        'div[data-pagelet*="FeedUnit"]',
        '.x1yztbdb',
        'div[data-ad-rendering-role]',
        '.x1n2onr6'
    ],
    
    // Sélecteurs pour les éléments de titre
    TITLE_SELECTORS: [
        'div[data-ad-rendering-role="profile_name"] strong',
        'div[data-ad-rendering-role="profile_name"] b',
        'div[data-ad-rendering-role="profile_name"] a strong',
        'div[data-ad-rendering-role="profile_name"] a b',
        'h4 span span span a strong',
        'h4 span span span a b',
        'h4 a[role="link"] strong',
        'h4 a[role="link"] b',
        'span[class*="x1vvkbs"] a[role="link"] strong',
        'span[class*="x1vvkbs"] a[role="link"] b',
        'h4 span a[role="link"]',
        'strong a[role="link"]'
    ],
    
    // Options par défaut
    DEFAULT_OPTIONS: {
        masquerColonneDroite: false,
        masquerReels: false,
        masquerSuggestions: false
    },
    
    // Clés de stockage localStorage
    STORAGE_KEYS: {
        PHRASES: 'fcb-phrases-personnalisees',
        OPTIONS: {
            COLONNE_DROITE: 'fcb-option-colonne-droite',
            REELS: 'fcb-option-masquer-reels',
            SUGGESTIONS: 'fcb-option-masquer-suggestions'
        },
        SCRIPT_ACTIVE: 'fcb-script-actif'
    },
    
    // Styles CSS
    STYLES: {
        BLOCKED_POST: {
            display: 'none',
            visibility: 'hidden',
            height: '0px',
            overflow: 'hidden',
            opacity: '0'
        },
        
        ADD_BUTTON: {
            background: 'rgba(220, 38, 38, 0.9)',
            color: 'white',
            border: 'none',
            padding: '2px 6px',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold',
            opacity: '0.8',
            transition: 'all 0.2s',
            zIndex: '10',
            marginLeft: '8px',
            verticalAlign: 'middle',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '18px',
            height: '18px'
        },
        
        FLOATING_MENU: {
            position: 'fixed',
            top: '10px',
            right: '10px',
            background: 'rgba(255, 255, 255, 0.95)',
            border: '2px solid #4285f4',
            borderRadius: '12px',
            padding: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: '10000',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '14px',
            minWidth: '200px',
            backdropFilter: 'blur(10px)'
        }
    },
    
    // Délais et timeouts
    TIMINGS: {
        MUTATION_DELAY: 300,
        SCAN_INTERVAL: 2000,
        BUTTON_REMOVE_DELAY: 1000,
        FOCUS_DELAY: 100
    }
};
