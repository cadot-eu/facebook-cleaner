// ==UserScript==
// @name         Facebook Cleaner - Local Development
// @namespace    https://github.com/cadot-eu/facebook-cleaner
// @version      2.0-dev
// @description  Version de développement local de Facebook Cleaner (modules locaux)
// @author       FCB Cleaner Project
// @match        https://www.facebook.com/*
// @match        https://facebook.com/*
// @grant        none
// @run-at       document-end
// @require      file:///home/michael/git/fcb_cleaner/fcb-config.js
// @require      file:///home/michael/git/fcb_cleaner/fcb-storage.js
// @require      file:///home/michael/git/fcb_cleaner/fcb-detection.js
// @require      file:///home/michael/git/fcb_cleaner/fcb-blocking.js
// @require      file:///home/michael/git/fcb_cleaner/fcb-ui.js
// @require      file:///home/michael/git/fcb_cleaner/fcb-main.js
//
// ==/UserScript==

/*
*  FCB Cleaner - Version de développement local
*  Utilise les fichiers locaux pour le développement et les tests
*/

(function () {
    'use strict';
    
    // Vérifier que tous les modules sont chargés
    const requiredModules = ['Config', 'Storage', 'Detection', 'Blocking', 'UI', 'Main'];
    const missingModules = requiredModules.filter(module => !window.FCB || !window.FCB[module]);
    
    if (missingModules.length > 0) {
        console.error('[FCB-DEV] Modules manquants:', missingModules);
        console.error('[FCB-DEV] Vérifiez que tous les fichiers sont présents');
        return;
    }
    
    console.log('[FCB-DEV] Mode développement actif');
    console.log('[FCB-DEV] Tous les modules locaux chargés');
    
})();
