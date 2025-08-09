// ==UserScript==
// @name         Facebook Cleaner - Block Group Invites & Spam (Modular)
// @namespace    https://github.com/cadot-eu/facebook-cleaner
// @version      2.0-modular
// @description  Powerful modular Tampermonkey script to automatically hide Facebook group invitations, spam, and unwanted posts. Customizable, robust, and privacy-friendly.
// @author       FCB Cleaner Project
// @match        https://www.facebook.com/*
// @match        https://facebook.com/*
// @grant        none
// @run-at       document-end
// @require      https://raw.githubusercontent.com/cadot-eu/facebook-cleaner/main/modules/fcb-config.js
// @require      https://raw.githubusercontent.com/cadot-eu/facebook-cleaner/main/modules/fcb-storage.js
// @require      https://raw.githubusercontent.com/cadot-eu/facebook-cleaner/main/modules/fcb-detection.js
// @require      https://raw.githubusercontent.com/cadot-eu/facebook-cleaner/main/modules/fcb-blocking.js
// @require      https://raw.githubusercontent.com/cadot-eu/facebook-cleaner/main/modules/fcb-ui.js
// @require      https://raw.githubusercontent.com/cadot-eu/facebook-cleaner/main/modules/fcb-main.js

// @homepageURL  https://github.com/cadot-eu/facebook-cleaner
// @supportURL   https://github.com/cadot-eu/facebook-cleaner/issues
// @downloadURL  https://raw.githubusercontent.com/cadot-eu/facebook-cleaner/main/fcb-modular.js
// @updateURL    https://raw.githubusercontent.com/cadot-eu/facebook-cleaner/main/fcb-modular.js
// @icon         https://raw.githubusercontent.com/cadot-eu/facebook-cleaner/main/icon.png
// @installURL   https://greasyfork.org/fr/scripts/545074-facebook-cleaner-block-group-invites-spam
//
// ==/UserScript==

/*
*  FCB Cleaner (Facebook Content Blocker) - Version Modulaire
*  - Architecture modulaire pour une meilleure maintenabilité
*  - Découpage en modules spécialisés (Config, Storage, UI, Detection, Blocking)
*  - Même fonctionnalités que la version monolithique
*  - Facilite les mises à jour et corrections de bugs
*
*  Modules inclus :
*  • fcb-config.js    - Configuration et constantes
*  • fcb-storage.js   - Gestion du localStorage
*  • fcb-detection.js - Détection et extraction des titres
*  • fcb-blocking.js  - Logique de masquage des posts
*  • fcb-ui.js        - Interface utilisateur
*  • fcb-main.js      - Script principal
*
*  ➡️  Installation automatique via GreasyFork :
*  https://greasyfork.org/fr/scripts/545074-facebook-cleaner-block-group-invites-spam
*
*  📦  GitHub & Documentation :
*  https://github.com/cadot-eu/facebook-cleaner
*/

(function () {
    'use strict';
    
    // Vérifier que tous les modules sont chargés
    const requiredModules = ['Config', 'Storage', 'Detection', 'Blocking', 'UI', 'Main'];
    const missingModules = requiredModules.filter(module => !window.FCB || !window.FCB[module]);
    
    if (missingModules.length > 0) {
        console.error('[FCB] Modules manquants:', missingModules);
        console.error('[FCB] Impossible de démarrer Facebook Cleaner');
        return;
    }
    
    console.log('[FCB] Tous les modules sont chargés');
    console.log('[FCB] Version modulaire:', window.FCB.Config.VERSION);
    
    // Le script principal se lance automatiquement via fcb-main.js
    
})();
