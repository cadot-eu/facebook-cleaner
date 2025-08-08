
// ==UserScript==
// @name         Facebook Cleaner - Block Group Invites & Spam
// @namespace    https://github.com/cadot-eu/facebook-cleaner
// @version      2.0
// @description  Powerful Tampermonkey script to automatically hide Facebook group invitations, spam, and unwanted posts. Customizable, robust, and privacy-friendly. 
// @author       FCB Cleaner Project
// @match        https://www.facebook.com/*
// @match        https://facebook.com/*
// @grant        none
// @run-at       document-end

// @homepageURL  https://github.com/cadot-eu/facebook-cleaner
// @supportURL   https://github.com/cadot-eu/facebook-cleaner/issues
// @downloadURL  https://raw.githubusercontent.com/cadot-eu/facebook-cleaner/main/fcb.js
// @updateURL    https://raw.githubusercontent.com/cadot-eu/facebook-cleaner/main/fcb.js
// @icon         https://raw.githubusercontent.com/cadot-eu/facebook-cleaner/main/icon.png
// @installURL   https://greasyfork.org/fr/scripts/545074-facebook-cleaner-block-group-invites-spam
//
// ==/UserScript==

/*
 *  FCB Cleaner (Facebook Content Blocker)
 *  - Instantly blocks Facebook group invites, spam, and unwanted posts.
 *  - Customizable: add your own phrases or group/page names to block.
 *  - Robust: adapts to Facebook layout changes, cleans up all post fragments.
 *  - Privacy-friendly: runs only in your browser, stores nothing online.
 *
 *  ➡️  To install or update, use the official GreasyFork page:
 *  https://greasyfork.org/fr/scripts/545074-facebook-cleaner-block-group-invites-spam
 *
 *  (Or for manual install: https://github.com/cadot-eu/facebook-cleaner/raw/main/fcb.js)
 *
 *  📦  GitHub & Documentation:
 *  https://github.com/cadot-eu/facebook-cleaner
 */

(function () {
    'use strict';

    // Liste des phrases à bloquer (plus large et flexible)
    let phrasesABloquer = [
        "vous invite",
        "vous a invité",
        "vous a invité.e",
        "invite à rejoindre",
        "a rejoint le groupe",
        "invited you to join",
        "rejoindre ce groupe",
        "rejoindre le groupe",
        "join this group",
        "has joined the group",
        "healthy body"
    ];

    // Récupérer les phrases personnalisées du stockage de session si disponible
    try {
        const phrasesPersonnalisees = window.scriptBlockerPhrases || [];
        phrasesABloquer = phrasesABloquer.concat(phrasesPersonnalisees);
        console.log('Phrases chargées:', phrasesABloquer);
    } catch (e) {
        console.log('Première utilisation du script');
    }

    // Fonction pour sauvegarder les phrases personnalisées
    function sauvegarderPhrases() {
        try {
            window.scriptBlockerPhrases = phrasesABloquer.slice(11); // Garder seulement les phrases ajoutées (healthy body inclus dans les 11 par défaut)
            console.log('Phrases sauvegardées:', window.scriptBlockerPhrases);
        } catch (e) {
            console.log('Erreur sauvegarde:', e);
        }
    }

    let postsTraites = new Set();
    let elementsMarques = new WeakSet(); // Pour éviter de retraiter les mêmes éléments
    let textesBloquesCache = new Set(); // Cache des textes déjà identifiés comme à bloquer

    // État d'activation du script
    let scriptActif = localStorage.getItem('fcb-script-actif') !== 'false'; // Actif par défaut

    // Options du script avec localStorage
    let options = {
        supprimerColonneDroite: localStorage.getItem('fcb-option-colonne-droite') === 'true',
        // Ici on pourra ajouter d'autres options facilement
    };

    // Fonction pour sauvegarder les options
    function sauvegarderOptions() {
        localStorage.setItem('fcb-option-colonne-droite', options.supprimerColonneDroite);
        console.log('Options sauvegardées:', options);
    }

    // Fonction pour appliquer les modifications CSS selon les options
    function appliquerOptionsCSS() {
        // Supprimer les styles précédents
        const ancienStyle = document.getElementById('fcb-options-styles');
        if (ancienStyle) ancienStyle.remove();

        // Créer un nouveau style
        const style = document.createElement('style');
        style.id = 'fcb-options-styles';
        let css = '';

        if (options.supprimerColonneDroite) {
            css += `
                /* Masquer la colonne de droite */
                div[role="complementary"] {
                    display: none !important;
                }
                
                /* Agrandir la zone principale pour occuper l'espace libéré */
                div[role="main"] {
                    max-width: none !important;
                    width: calc(100% - 360px) !important;
                    margin-left: 360px !important;
                    margin-right: 0 !important;
                }
                
                /* Agrandir le conteneur du feed */
                div[role="feed"] {
                    max-width: none !important;
                    width: 100% !important;
                    padding-right: 20px !important;
                }
                
                /* Ajuster les posts pour qu'ils utilisent toute la largeur disponible */
                div[role="feed"] > div {
                    max-width: none !important;
                    width: 100% !important;
                }
            `;
        }

        style.textContent = css;
        document.head.appendChild(style);
    }

    function contientPhraseBloquee(texte) {
        const texteNormalise = texte.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return phrasesABloquer.some(phrase =>
            texteNormalise.includes(phrase.toLowerCase())
        );
    }

    function masquerPost(element) {
        if (!element || elementsMarques.has(element)) return false;
        // Sécurité : ne jamais masquer <body> ou <html>
        if (element === document.body || element === document.documentElement) {
            console.warn('Sécurité : tentative de masquage de <body> ou <html> bloquée');
            return false;
        }
        // Marquage permanent
        element.setAttribute('data-blocked-by-script', 'true');
        element.classList.add('script-blocked-post');
        elementsMarques.add(element);

        // Styles de masquage multiples pour résistance
        element.style.setProperty('display', 'none', 'important');
        element.style.setProperty('visibility', 'hidden', 'important');
        element.style.setProperty('height', '0px', 'important');
        element.style.setProperty('overflow', 'hidden', 'important');
        element.style.setProperty('opacity', '0', 'important');
        element.style.setProperty('max-height', '0px', 'important');

        // Observer si l'élément est modifié pour le re-masquer
        const elementObserver = new MutationObserver(function () {
            if (element.style.display !== 'none') {
                element.style.setProperty('display', 'none', 'important');
                element.style.setProperty('visibility', 'hidden', 'important');
            }
        });

        elementObserver.observe(element, {
            attributes: true,
            attributeFilter: ['style', 'class']
        });

        // Debug: informations sur l'élément masqué
        console.log('Post bloqué et marqué:', {
            element: element,
            tagName: element.tagName,
            classes: element.className,
            dimensions: `${element.offsetWidth}x${element.offsetHeight}`,
            textLength: (element.textContent || '').length,
            hasDataTestId: element.hasAttribute('data-testid'),
            hasDataPagelet: element.hasAttribute('data-pagelet')
        });

        return true;
    }

    function trouverPostParent(element) {
        // APPROCHE SIMPLIFIÉE : avec les menus actions, on a déjà de bons conteneurs
        // Cette fonction ne fait plus que des vérifications de sécurité basiques

        // Sécurités de base
        if (!element || element === document.body || element === document.documentElement) {
            console.warn('Élément invalide ou critique détecté');
            return null;
        }

        // Si l'élément a déjà une taille raisonnable, on le garde
        if (element.offsetHeight > 80 && element.offsetHeight < 800 &&
            element.offsetWidth > 300 && element.children.length <= 20) {
            console.log('✅ Élément déjà approprié (via menu actions):', {
                hauteur: element.offsetHeight,
                largeur: element.offsetWidth,
                enfants: element.children.length
            });
            return element;
        }

        // Sinon, remonter juste un niveau pour améliorer
        const parent = element.parentElement;
        if (parent && parent !== document.body && parent !== document.documentElement &&
            parent.offsetHeight > element.offsetHeight &&
            parent.offsetHeight < 1000 &&
            parent.offsetWidth < window.innerWidth * 0.8) {

            console.log('✅ Parent amélioré trouvé:', {
                hauteur: parent.offsetHeight,
                largeur: parent.offsetWidth,
                enfants: parent.children.length
            });
            return parent;
        }

        return element; // Retourner l'élément original si pas d'amélioration
    }

    function scannerPosts() {
        // Vérifier si le script est actif
        if (!scriptActif) {
            console.log('🛑 Scanner désactivé - script en pause');
            return;
        }

        // D'abord, re-masquer tous les posts déjà identifiés comme bloqués
        document.querySelectorAll('[data-blocked-by-script="true"]').forEach(element => {
            if (element.style.display !== 'none') {
                element.style.setProperty('display', 'none', 'important');
                element.style.setProperty('visibility', 'hidden', 'important');
            }
        });

        console.log('🔍 DEBUG : Début du scanner avec détection par menu actions...');

        // NOUVELLE APPROCHE : Utiliser les menus "trois points" comme indicateurs de posts
        const tousLesElements = new Set();

        // 1. Chercher tous les boutons de menu "Actions pour cette publication"
        const menusActions = document.querySelectorAll('div[aria-label*="Actions pour cette publication"], div[aria-label*="Actions for this post"], div[role="button"][aria-haspopup="menu"]:not([data-blocked-by-script="true"])');
        console.log('🔍 DEBUG : ' + menusActions.length + ' menus d\'actions trouvés');

        menusActions.forEach(menu => {
            // Remonter dans la hiérarchie pour trouver le conteneur du post
            let conteneurPost = menu;
            let niveaux = 0;
            const maxNiveaux = 8; // Chercher jusqu'à 8 niveaux

            while (conteneurPost && niveaux < maxNiveaux) {
                // Critères pour identifier un conteneur de post valide
                const estConteneurPost = (
                    conteneurPost.offsetHeight > 100 && // Au moins 100px de haut
                    conteneurPost.offsetHeight < 1200 && // Pas plus de 1200px
                    conteneurPost.offsetWidth > 300 && // Au moins 300px de large
                    conteneurPost.textContent.length > 50 && // Contenu substantiel
                    conteneurPost.children.length >= 2 && // Au moins 2 enfants
                    conteneurPost.children.length <= 30 // Pas plus de 30 enfants
                );

                if (estConteneurPost) {
                    const texte = conteneurPost.textContent || '';
                    if (contientPhraseBloquee(texte)) {
                        tousLesElements.add(conteneurPost);
                        console.log('🎯 DEBUG : Post avec phrase bloquée trouvé via menu:', {
                            hauteur: conteneurPost.offsetHeight,
                            largeur: conteneurPost.offsetWidth,
                            textLength: texte.length,
                            niveau: niveaux,
                            texte: texte.substring(0, 100) + '...'
                        });
                        break; // Sortir de la boucle une fois qu'on a trouvé le bon conteneur
                    }
                }

                conteneurPost = conteneurPost.parentElement;
                niveaux++;
            }
        });

        // 2. Méthode de fallback : Scanner les sélecteurs classiques
        const selecteursFallback = [
            'div[role="article"]:not([data-blocked-by-script="true"])',
            'div[data-testid]:not([data-blocked-by-script="true"])',
            'div[data-pagelet*="FeedUnit"]:not([data-blocked-by-script="true"])'
        ];

        selecteursFallback.forEach(selecteur => {
            try {
                const elements = document.querySelectorAll(selecteur);
                console.log(`🔍 DEBUG : Fallback "${selecteur}" -> ${elements.length} éléments`);

                elements.forEach(el => {
                    if (el.offsetHeight > 50 && el.offsetHeight < 1000 &&
                        el.offsetWidth > 200 && el.textContent.length > 20) {

                        const texte = el.textContent || '';
                        if (contientPhraseBloquee(texte)) {
                            tousLesElements.add(el);
                        }
                    }
                });
            } catch (e) {
                console.log('Erreur avec le sélecteur fallback:', selecteur, e);
            }
        });

        console.log('🔍 Scanner : ' + tousLesElements.size + ' éléments candidats avec phrases bloquées');

        // Traiter chaque élément trouvé
        let postsMasques = 0;
        tousLesElements.forEach(element => {
            // Éviter les éléments déjà traités
            if (elementsMarques.has(element)) return;

            const texte = element.textContent || element.innerText || '';

            if (texte && contientPhraseBloquee(texte)) {
                const texteSignature = texte.substring(0, 100);
                console.log('🎯 Phrase bloquée détectée:', texteSignature.substring(0, 50) + '...');

                // Masquer directement l'élément trouvé (déjà optimisé via les menus)
                if (masquerPost(element)) {
                    postsMasques++;
                    postsTraites.add(texteSignature);
                    console.log('✅ Post masqué via menu actions:', {
                        element: element,
                        hauteur: element.offsetHeight,
                        largeur: element.offsetWidth,
                        enfants: element.children.length
                    });
                } else {
                    console.log('❌ Échec du masquage:', element);
                }
            }
        });

        console.log('📊 Scanner terminé.', {
            candidatsAnalyses: tousLesElements.size,
            postsMasques: postsMasques,
            postsTraites: postsTraites.size
        });
    }

    function nettoyerElementsOrphelins() {
        // NETTOYAGE TRÈS LIMITÉ - seulement les "En voir plus" évidents
        const elementsEnVoirPlus = document.querySelectorAll('div[role="button"]:not([data-blocked-by-script="true"])');
        elementsEnVoirPlus.forEach(element => {
            const texte = element.textContent || '';
            if ((texte.trim() === 'En voir plus' || texte.trim() === 'See more') && texte.length < 20) {
                // Vérifier si cet élément appartient à un post qui devrait être bloqué
                let parent = element.parentElement;
                let niveaux = 0;

                while (parent && niveaux < 3) { // Seulement 3 niveaux max
                    const texteParent = parent.textContent || '';
                    if (texteParent && contientPhraseBloquee(texteParent) &&
                        parent.getAttribute('role') === 'article') { // DOIT être un article
                        masquerPost(element);
                        console.log('🧹 "En voir plus" orphelin masqué:', element);
                        break;
                    }
                    parent = parent.parentElement;
                    niveaux++;
                }
            }
        });

        console.log('🧹 Nettoyage orphelins terminé (mode strict)');
    }

    // Observer très réactif pour les changements
    const observer = new MutationObserver(function (mutations) {
        let nouveauxPosts = false;

        mutations.forEach(function (mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE &&
                        (node.textContent.length > 10 || node.querySelector('div'))) {
                        nouveauxPosts = true;
                    }
                });
            }
        });

        if (nouveauxPosts) {
            // Vérifier si le script est actif avant de scanner
            if (!scriptActif) return;

            // Scanner immédiatement et plusieurs fois
            setTimeout(scannerPosts, 10);
            setTimeout(scannerPosts, 100);
            setTimeout(scannerPosts, 500);
            // Ajouter le nettoyage des orphelins
            setTimeout(nettoyerElementsOrphelins, 200);
            setTimeout(nettoyerElementsOrphelins, 600);
        }
    });

    function initialiser() {
        console.log('Initialisation du bloqueur Facebook...');

        // Vérifier si le script est actif
        if (!scriptActif) {
            console.log('🛑 Script désactivé - initialisation annulée');
            return;
        }

        // Scanner initial multiple
        setTimeout(scannerPosts, 100);
        setTimeout(scannerPosts, 500);
        setTimeout(scannerPosts, 1000);
        setTimeout(scannerPosts, 2000);
        setTimeout(scannerPosts, 5000);

        // Nettoyage des orphelins
        setTimeout(nettoyerElementsOrphelins, 300);
        setTimeout(nettoyerElementsOrphelins, 1200);
        setTimeout(nettoyerElementsOrphelins, 3000);

        // Observer les changements
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Scanner très fréquent au début puis moins
        let scanCount = 0;
        const intervalId = setInterval(() => {
            if (!scriptActif) {
                clearInterval(intervalId);
                return;
            }
            scannerPosts();
            setTimeout(nettoyerElementsOrphelins, 100);
            scanCount++;
            if (scanCount > 20) {
                clearInterval(intervalId);
                // Passer à un scanner moins fréquent
                setInterval(() => {
                    if (scriptActif) {
                        scannerPosts();
                        setTimeout(nettoyerElementsOrphelins, 100);
                    }
                }, 5000);
            }
        }, 1000);

        // Scanner au scroll plus réactif
        let scrollTimeout;
        let lastScrollTop = 0;
        window.addEventListener('scroll', function () {
            if (!scriptActif) return;

            const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
            if (Math.abs(currentScrollTop - lastScrollTop) > 100) {
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    scannerPosts();
                    lastScrollTop = currentScrollTop;
                }, 100);
            }
        });

        console.log('Bloqueur Facebook activé');
    }

    // Interface utilisateur améliorée
    function creerInterface() {
        const container = document.createElement('div');
        container.style.cssText = `
            position: fixed;
            bottom: 10px;
            left: 10px;
            z-index: 10000;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 8px;
            border-radius: 8px;
            font-family: Arial, sans-serif;
            font-size: 12px;
            display: flex;
            gap: 5px;
            align-items: center;
        `;

        const boutonOnOff = document.createElement('button');
        boutonOnOff.innerHTML = scriptActif ? '🟢' : '🔴';
        boutonOnOff.title = scriptActif ? 'Filtres activés - Cliquer pour désactiver' : 'Filtres désactivés - Cliquer pour activer';
        boutonOnOff.style.cssText = `
            background: ${scriptActif ? '#10b981' : '#ef4444'};
            color: white;
            border: none;
            padding: 8px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.3s ease;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        `;

        const boutonAjouter = document.createElement('button');
        boutonAjouter.innerHTML = '➕';
        boutonAjouter.title = 'Ajouter une phrase à bloquer';
        boutonAjouter.style.cssText = `
            background: #1877f2;
            color: white;
            border: none;
            padding: 8px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        `;

        const boutonAjouterTitre = document.createElement('button');
        boutonAjouterTitre.innerHTML = '⚡';
        boutonAjouterTitre.title = 'Ajouter automatiquement le titre du groupe/page';
        boutonAjouterTitre.style.cssText = `
            background: #f59e0b;
            color: white;
            border: none;
            padding: 8px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        `;

        const boutonVoir = document.createElement('button');
        boutonVoir.innerHTML = '👁️';
        boutonVoir.title = 'Voir et gérer les phrases bloquées';
        boutonVoir.style.cssText = `
            background: #8b5cf6;
            color: white;
            border: none;
            padding: 8px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        `;

        const boutonOptions = document.createElement('button');
        boutonOptions.innerHTML = '⚙️';
        boutonOptions.title = 'Options et paramètres';
        boutonOptions.style.cssText = `
            background: #6366f1;
            color: white;
            border: none;
            padding: 8px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        `;

        const boutonScanner = document.createElement('button');
        boutonScanner.innerHTML = '🔍';
        boutonScanner.title = 'Scanner maintenant';
        boutonScanner.style.cssText = `
            background: #42b883;
            color: white;
            border: none;
            padding: 8px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        `;

        const compteur = document.createElement('div');
        compteur.innerHTML = postsTraites.size;
        compteur.title = 'Nombre de posts bloqués';
        compteur.style.cssText = `
            background: #dc2626;
            color: white;
            padding: 4px 8px;
            border-radius: 10px;
            font-size: 11px;
            font-weight: bold;
            min-width: 16px;
            text-align: center;
        `;

        boutonOnOff.onclick = function () {
            // Basculer l'état
            scriptActif = !scriptActif;

            // Sauvegarder dans localStorage
            localStorage.setItem('fcb-script-actif', scriptActif.toString());

            // Feedback visuel immédiat
            boutonOnOff.innerHTML = scriptActif ? '🟢' : '🔴';
            boutonOnOff.title = scriptActif ? 'Filtres activés - Cliquer pour désactiver' : 'Filtres désactivés - Cliquer pour activer';
            boutonOnOff.style.background = scriptActif ? '#10b981' : '#ef4444';

            // Animation de feedback
            boutonOnOff.style.transform = 'scale(0.9)';
            setTimeout(() => {
                boutonOnOff.style.transform = 'scale(1)';
            }, 150);

            // Message utilisateur
            const message = scriptActif ? 'Filtres ACTIVÉS 🟢' : 'Filtres DÉSACTIVÉS 🔴';
            console.log(message);

            // Petite notification visuelle
            const notification = document.createElement('div');
            notification.textContent = message;
            notification.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: ${scriptActif ? '#10b981' : '#ef4444'};
                color: white;
                padding: 15px 30px;
                border-radius: 10px;
                font-size: 16px;
                font-weight: bold;
                z-index: 99999;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                animation: fadeInOut 2s ease-in-out;
            `;

            // Ajouter l'animation CSS
            const style = document.createElement('style');
            style.textContent = `
                @keyframes fadeInOut {
                    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                    20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                    80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                    100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                }
            `;
            document.head.appendChild(style);
            document.body.appendChild(notification);

            // Supprimer la notification après l'animation
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
                if (style.parentNode) {
                    style.parentNode.removeChild(style);
                }
            }, 2000);

            // Rafraîchir la page après un court délai
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        };

        boutonAjouter.onclick = function () {
            const nouvellePh = prompt('Ajouter une phrase à bloquer:', '');
            if (nouvellePh && nouvellePh.trim()) {
                const phrase = nouvellePh.trim();

                if (!phrasesABloquer.includes(phrase)) {
                    phrasesABloquer.push(phrase);
                    sauvegarderPhrases();
                    alert('Phrase ajoutée: ' + phrase);
                    elementsMarques = new WeakSet();
                    scannerPosts();
                } else {
                    alert('Cette phrase existe déjà');
                }
            }
        };

        boutonAjouterTitre.onclick = function () {
            const titreExtraits = extraireTitrePage();
            if (titreExtraits.length > 0) {
                let message = 'Titres détectés:\n\n';
                titreExtraits.forEach((titre, index) => {
                    message += `${index + 1}. ${titre}\n`;
                });
                message += '\nTapez le numéro du titre à ajouter (ou "tout" pour tous):';

                const choix = prompt(message, '1');
                if (choix) {
                    const titresAAjouter = [];

                    if (choix.toLowerCase() === 'tout') {
                        titresAAjouter.push(...titreExtraits);
                    } else {
                        const index = parseInt(choix) - 1;
                        if (index >= 0 && index < titreExtraits.length) {
                            titresAAjouter.push(titreExtraits[index]);
                        }
                    }

                    let ajouts = 0;
                    titresAAjouter.forEach(titre => {
                        if (!phrasesABloquer.includes(titre)) {
                            phrasesABloquer.push(titre);
                            ajouts++;
                        }
                    });

                    if (ajouts > 0) {
                        sauvegarderPhrases();
                        alert(`${ajouts} titre(s) ajouté(s) au blocage`);
                        elementsMarques = new WeakSet();
                        scannerPosts();
                    } else {
                        alert('Tous les titres sélectionnés existent déjà');
                    }
                }
            } else {
                alert('Aucun titre de groupe/page détecté sur cette page');
            }
        };

        boutonOptions.onclick = function (e) {
            e.preventDefault();
            e.stopPropagation();
            setTimeout(() => {
                creerMenuOptions();
            }, 100);
        };

        boutonVoir.onclick = function (e) {
            // Empêcher la propagation de l'événement
            e.preventDefault();
            e.stopPropagation();

            // Créer une fenêtre modale pour afficher les phrases avec boutons de suppression
            setTimeout(() => {
                creerFenetreGestion();
            }, 100);
        };

        boutonScanner.onclick = function () {
            elementsMarques = new WeakSet();
            textesBloquesCache.clear();
            postsTraites.clear();

            // Supprimer tous les marquages précédents
            document.querySelectorAll('[data-blocked-by-script="true"]').forEach(el => {
                el.removeAttribute('data-blocked-by-script');
                el.classList.remove('script-blocked-post');
                el.style.removeProperty('display');
                el.style.removeProperty('visibility');
                el.style.removeProperty('height');
                el.style.removeProperty('overflow');
                el.style.removeProperty('opacity');
                el.style.removeProperty('max-height');
            });

            console.log('=== SCAN MANUEL DÉMARRÉ ===');
            scannerPosts();
            setTimeout(() => {
                nettoyerElementsOrphelins();
                console.log('=== NETTOYAGE ORPHELINS TERMINÉ ===');
            }, 200);
            console.log('=== SCAN MANUEL TERMINÉ ===');
            compteur.innerHTML = postsTraites.size;
        };

        container.appendChild(boutonOnOff);
        container.appendChild(boutonAjouter);
        container.appendChild(boutonAjouterTitre);
        container.appendChild(boutonVoir);
        container.appendChild(boutonOptions);
        container.appendChild(boutonScanner);
        container.appendChild(compteur);

        document.body.appendChild(container);

        // Mettre à jour le compteur régulièrement
        setInterval(() => {
            compteur.innerHTML = postsTraites.size;
        }, 2000);
    }

    function extraireTitrePage() {
        const titres = new Set();

        // Sélecteurs pour différents types de titres Facebook
        const selecteursTitres = [
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
            '[aria-label]:not([data-blocked-by-script="true"])',
        ];

        selecteursTitres.forEach(selecteur => {
            try {
                const elements = document.querySelectorAll(selecteur);
                elements.forEach(element => {
                    let texte = '';

                    // Extraire le texte selon le type d'élément
                    if (element.hasAttribute('aria-label')) {
                        texte = element.getAttribute('aria-label');
                    } else {
                        texte = element.textContent || element.innerText || '';
                    }

                    // Nettoyer et valider le texte
                    texte = texte.trim();
                    if (texte &&
                        texte.length > 3 &&
                        texte.length < 100 &&
                        !texte.includes('·') &&
                        !texte.includes('ago') &&
                        !texte.includes('il y a') &&
                        !texte.includes('Posted') &&
                        !texte.includes('Publié') &&
                        !texte.match(/^\d+$/) && // Pas juste des chiffres
                        !texte.match(/^[.,:;!?]+$/) && // Pas juste de la ponctuation
                        !phrasesABloquer.includes(texte) // Pas déjà dans la liste
                    ) {
                        // Vérifier si c'est probablement un nom de groupe/page
                        const estProbablementUnTitre = (
                            texte.includes(' ') || // Au moins deux mots
                            texte.match(/^[A-Z]/) || // Commence par une majuscule
                            texte.length > 15 // Assez long pour être descriptif
                        );

                        if (estProbablementUnTitre) {
                            titres.add(texte);
                        }
                    }
                });
            } catch (e) {
                console.log('Erreur avec le sélecteur:', selecteur, e);
            }
        });

        // Recherche spécifique pour l'exemple donné
        try {
            const selecteurSpecifique = 'span.html-span.xdj266r.x14z9mp.xat24cr.x1lziwak.xexx8yu.xyri2b.x18d9i69.x1c1uobl.x1hl2dhg.x16tdsg8.x1vvkbs';
            const elementsSpecifiques = document.querySelectorAll(selecteurSpecifique);
            elementsSpecifiques.forEach(el => {
                const texte = el.textContent?.trim();
                if (texte && texte.length > 10 && !titres.has(texte)) {
                    titres.add(texte);
                }
            });
        } catch (e) {
            console.log('Erreur sélecteur spécifique:', e);
        }

        console.log('Titres extraits:', Array.from(titres));
        return Array.from(titres).slice(0, 10); // Limiter à 10 résultats
    }

    // Fonction pour créer le menu d'options
    function creerMenuOptions() {
        // Supprimer le menu existant si il existe
        const existant = document.getElementById('fcb-options-modal');
        if (existant) existant.remove();

        const modal = document.createElement('div');
        modal.id = 'fcb-options-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            z-index: 99999;
            display: flex;
            justify-content: center;
            align-items: center;
        `;

        const contenu = document.createElement('div');
        contenu.style.cssText = `
            background: white;
            padding: 20px;
            border-radius: 10px;
            max-width: 500px;
            max-height: 80%;
            overflow-y: auto;
            color: black;
            position: relative;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        `;

        const titre = document.createElement('h3');
        titre.textContent = '⚙️ Options et Paramètres';
        titre.style.cssText = 'margin-top: 0; color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px;';

        // Section options d'interface
        const sectionInterface = document.createElement('div');
        sectionInterface.innerHTML = '<h4 style="color: #666; margin-bottom: 15px; margin-top: 20px;">🖥️ Interface Facebook:</h4>';

        // Option supprimer colonne droite
        const optionColonneDroite = creerOptionCheckbox(
            'Masquer la colonne de droite',
            'Supprime la colonne de droite (publicités, suggestions) et agrandit le feed principal',
            options.supprimerColonneDroite,
            (checked) => {
                options.supprimerColonneDroite = checked;
                sauvegarderOptions();

                // Feedback visuel
                const feedback = document.createElement('div');
                feedback.textContent = checked ? '✅ Colonne droite masquée' : '❌ Colonne droite restaurée';
                feedback.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: ${checked ? '#10b981' : '#ef4444'};
                    color: white;
                    padding: 10px 20px;
                    border-radius: 8px;
                    z-index: 100000;
                    font-weight: bold;
                `;
                document.body.appendChild(feedback);

                setTimeout(() => {
                    if (feedback.parentNode) {
                        feedback.parentNode.removeChild(feedback);
                    }
                }, 2000);

                // Rafraîchir la page après un délai
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            }
        );

        sectionInterface.appendChild(optionColonneDroite);

        // Section futures options (pour l'extensibilité)
        const sectionAutres = document.createElement('div');
        sectionAutres.innerHTML = '<h4 style="color: #666; margin-bottom: 15px; margin-top: 20px;">🔮 Futures options:</h4>';

        const infoFutures = document.createElement('p');
        infoFutures.textContent = 'D\'autres options d\'interface et de filtrage seront ajoutées ici.';
        infoFutures.style.cssText = 'color: #999; font-style: italic; margin: 10px 0;';
        sectionAutres.appendChild(infoFutures);

        const boutonFermer = document.createElement('button');
        boutonFermer.textContent = 'Fermer';
        boutonFermer.style.cssText = `
            background: #666;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin-top: 20px;
            width: 100%;
        `;
        boutonFermer.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            modal.remove();
        };

        contenu.appendChild(titre);
        contenu.appendChild(sectionInterface);
        contenu.appendChild(sectionAutres);
        contenu.appendChild(boutonFermer);
        modal.appendChild(contenu);

        // Empêcher la fermeture accidentelle
        contenu.onclick = (e) => {
            e.stopPropagation();
        };

        // Fermer en cliquant à l'extérieur
        let modalPeutFermer = false;
        setTimeout(() => {
            modalPeutFermer = true;
        }, 200);

        modal.onclick = (e) => {
            if (e.target === modal && modalPeutFermer) {
                modal.remove();
            }
        };

        // Fermer avec Escape
        const fermerAvecEscape = (e) => {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', fermerAvecEscape);
            }
        };
        document.addEventListener('keydown', fermerAvecEscape);

        document.body.appendChild(modal);
        console.log('Menu d\'options créé');
    }

    // Fonction pour créer une option avec checkbox
    function creerOptionCheckbox(titre, description, etatInitial, onchange) {
        const container = document.createElement('div');
        container.style.cssText = `
            display: flex;
            align-items: flex-start;
            padding: 15px;
            margin: 10px 0;
            background: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #6366f1;
        `;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = etatInitial;
        checkbox.style.cssText = `
            margin-right: 15px;
            margin-top: 2px;
            transform: scale(1.2);
            cursor: pointer;
        `;

        const contenuTexte = document.createElement('div');
        contenuTexte.style.cssText = 'flex: 1;';

        const titreLigne = document.createElement('div');
        titreLigne.textContent = titre;
        titreLigne.style.cssText = `
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
            cursor: pointer;
        `;

        const descriptionLigne = document.createElement('div');
        descriptionLigne.textContent = description;
        descriptionLigne.style.cssText = `
            color: #666;
            font-size: 14px;
            line-height: 1.4;
        `;

        // Permettre de cliquer sur le titre pour toggle la checkbox
        titreLigne.onclick = () => {
            checkbox.checked = !checkbox.checked;
            checkbox.dispatchEvent(new Event('change'));
        };

        checkbox.onchange = () => {
            onchange(checkbox.checked);
        };

        contenuTexte.appendChild(titreLigne);
        contenuTexte.appendChild(descriptionLigne);
        container.appendChild(checkbox);
        container.appendChild(contenuTexte);

        return container;
    }

    // Fonction pour créer la fenêtre de gestion des phrases
    function creerFenetreGestion() {
        // Supprimer la fenêtre existante si elle existe
        const existante = document.getElementById('fb-blocker-modal');
        if (existante) existante.remove();

        const modal = document.createElement('div');
        modal.id = 'fb-blocker-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            z-index: 99999;
            display: flex;
            justify-content: center;
            align-items: center;
        `;

        const contenu = document.createElement('div');
        contenu.style.cssText = `
            background: white;
            padding: 20px;
            border-radius: 10px;
            max-width: 500px;
            max-height: 80%;
            overflow-y: auto;
            color: black;
            position: relative;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        `;

        const titre = document.createElement('h3');
        titre.textContent = 'Gestion des phrases bloquées';
        titre.style.cssText = 'margin-top: 0; color: #333;';

        const phrasesDefaut = phrasesABloquer.slice(0, 11);
        const phrasesPersonnalisees = phrasesABloquer.slice(11);

        // Section phrases par défaut
        const sectionDefaut = document.createElement('div');
        sectionDefaut.innerHTML = '<h4 style="color: #666; margin-bottom: 10px;">📋 Phrases par défaut:</h4>';
        phrasesDefaut.forEach(phrase => {
            const ligne = creerLignePhrase(phrase, false);
            sectionDefaut.appendChild(ligne);
        });

        // Section phrases personnalisées
        const sectionPerso = document.createElement('div');
        sectionPerso.innerHTML = '<h4 style="color: #666; margin-bottom: 10px; margin-top: 20px;">✏️ Vos phrases:</h4>';
        if (phrasesPersonnalisees.length === 0) {
            const vide = document.createElement('p');
            vide.textContent = 'Aucune phrase personnalisée';
            vide.style.color = '#999';
            sectionPerso.appendChild(vide);
        } else {
            phrasesPersonnalisees.forEach(phrase => {
                const ligne = creerLignePhrase(phrase, true);
                sectionPerso.appendChild(ligne);
            });
        }

        const boutonFermer = document.createElement('button');
        boutonFermer.textContent = 'Fermer';
        boutonFermer.style.cssText = `
            background: #666;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin-top: 20px;
        `;
        boutonFermer.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            modal.remove();
        };

        contenu.appendChild(titre);
        contenu.appendChild(sectionDefaut);
        contenu.appendChild(sectionPerso);
        contenu.appendChild(boutonFermer);
        modal.appendChild(contenu);

        // Empêcher la fermeture accidentelle
        contenu.onclick = (e) => {
            e.stopPropagation();
        };

        // Fermer en cliquant à l'extérieur (avec délai pour éviter la fermeture immédiate)
        let modalPeutFermer = false;
        setTimeout(() => {
            modalPeutFermer = true;
        }, 200);

        modal.onclick = (e) => {
            if (e.target === modal && modalPeutFermer) {
                modal.remove();
            }
        };

        // Fermer avec Escape
        const fermerAvecEscape = (e) => {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', fermerAvecEscape);
            }
        };
        document.addEventListener('keydown', fermerAvecEscape);

        document.body.appendChild(modal);

        console.log('Modal créé et ajouté au DOM');
    }

    function creerLignePhrase(phrase, supprimable) {
        const ligne = document.createElement('div');
        ligne.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px;
            margin: 5px 0;
            background: #f5f5f5;
            border-radius: 5px;
        `;

        const texte = document.createElement('span');
        texte.textContent = phrase;
        texte.style.cssText = 'flex: 1; font-size: 14px;';

        const boutonSuppr = document.createElement('button');
        boutonSuppr.innerHTML = '➖';
        boutonSuppr.title = supprimable ? 'Supprimer cette phrase' : 'Phrase par défaut (non supprimable)';
        boutonSuppr.style.cssText = `
            background: ${supprimable ? '#dc2626' : '#ccc'};
            color: white;
            border: none;
            padding: 4px 8px;
            border-radius: 3px;
            cursor: ${supprimable ? 'pointer' : 'not-allowed'};
            font-size: 12px;
        `;

        if (supprimable) {
            boutonSuppr.onclick = function () {
                if (confirm(`Supprimer la phrase: "${phrase}" ?`)) {
                    const index = phrasesABloquer.indexOf(phrase);
                    if (index > -1) {
                        phrasesABloquer.splice(index, 1);
                        sauvegarderPhrases();
                        ligne.remove();
                        alert('Phrase supprimée: ' + phrase);
                    }
                }
            };
        } else {
            boutonSuppr.disabled = true;
        }

        ligne.appendChild(texte);
        ligne.appendChild(boutonSuppr);
        return ligne;
    }

    // Démarrage
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            initialiser();
            // Appliquer les options CSS après l'initialisation
            setTimeout(appliquerOptionsCSS, 500);
        });
    } else {
        initialiser();
        // Appliquer les options CSS immédiatement
        setTimeout(appliquerOptionsCSS, 500);
    }

    setTimeout(creerInterface, 2000);

    // Style CSS pour forcer le masquage même si Facebook réapplique ses styles
    const style = document.createElement('style');
    style.textContent = `
        .script-blocked-post,
        [data-blocked-by-script="true"] {
            display: none !important;
            visibility: hidden !important;
            height: 0px !important;
            overflow: hidden !important;
            opacity: 0 !important;
            max-height: 0px !important;
        }
    `;
    document.head.appendChild(style);

})();