
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
//
// ==/UserScript==

/*
 *  FCB Cleaner (Facebook Content Blocker)
 *  - Instantly blocks Facebook group invites, spam, and unwanted posts.
 *  - Customizable: add your own phrases or group/page names to block.
 *  - Robust: adapts to Facebook layout changes, cleans up all post fragments.
 *  - Privacy-friendly: runs only in your browser, stores nothing online.
 *
 *  ➡️  To install or update, open this link in Tampermonkey:
 *  https://github.com/cadot-eu/facebook-cleaner/raw/main/fcb.js
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

    function contientPhraseBloquee(texte) {
        const texteNormalise = texte.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return phrasesABloquer.some(phrase =>
            texteNormalise.includes(phrase.toLowerCase())
        );
    }

    function masquerPost(element) {
        if (element && !elementsMarques.has(element)) {
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
        return false;
    }

    function trouverPostParent(element) {
        let parent = element;
        let tentatives = 0;
        const maxTentatives = 20; // Augmenter pour remonter plus haut

        console.log('🔎 Recherche du parent pour:', element);

        while (parent && parent !== document.body && tentatives < maxTentatives) {
            tentatives++;

            // Critères TRÈS sélectifs pour identifier un conteneur de post Facebook
            const estPostContainer = (
                // Attributs spécifiques Facebook (priorité absolue)
                parent.getAttribute('role') === 'article' ||
                parent.hasAttribute('data-pagelet') && parent.getAttribute('data-pagelet').includes('FeedUnit') ||
                parent.hasAttribute('data-testid') && parent.getAttribute('data-testid').includes('story') ||
                parent.classList.contains('userContentWrapper') ||
                // Nouveaux critères pour capturer les posts plus larges
                parent.hasAttribute('data-ft') ||
                (parent.getAttribute('data-testid') && parent.getAttribute('data-testid').includes('story_')) ||
                (parent.style.transform && parent.style.transform.includes('translateZ'))
            );

            // Critères de taille moins restrictifs pour capturer les posts complets
            const bonnesTailles = (
                parent.offsetHeight > 150 && parent.offsetHeight < 2000 && // Plage plus large
                parent.offsetWidth > 400 && parent.offsetWidth < 1500 &&
                parent.children.length >= 2 && parent.children.length <= 20
            );

            // Critères structurels pour identifier un post complet
            const structureDePost = (
                // Contient à la fois du texte et des éléments interactifs
                parent.textContent.length > 50 &&
                (parent.querySelector('[role="button"]') || parent.querySelector('button')) &&
                // N'est pas trop global (pas le feed entier)
                !parent.hasAttribute('id') &&
                // A des divs avec du style (structure Facebook typique)
                parent.querySelectorAll('div[style]').length > 3
            );

            if (estPostContainer || (bonnesTailles && structureDePost)) {
                // Vérifier si c'est vraiment un post complet et pas un conteneur global
                const aDesElementsDePost = (
                    parent.querySelector('img, svg, video') ||
                    parent.querySelector('[role="button"]') ||
                    parent.querySelector('a[href*="facebook.com"]') ||
                    parent.querySelector('button') ||
                    parent.querySelector('[tabindex]')
                );

                // Vérifier qu'il n'y a pas trop de texte (éviter les conteneurs globaux)
                const pasContainerGlobal = parent.textContent.length < 3000;

                // Nouvelle vérification : s'assurer qu'on a bien le conteneur du post entier
                const contientTexteCible = parent.textContent.toLowerCase().includes(element.textContent.toLowerCase().substring(0, 50));

                if (aDesElementsDePost && pasContainerGlobal && contientTexteCible) {
                    console.log('✅ Post parent trouvé à la tentative', tentatives, ':', {
                        element: parent,
                        hauteur: parent.offsetHeight,
                        largeur: parent.offsetWidth,
                        enfants: parent.children.length,
                        textLength: parent.textContent.length,
                        dataTestId: parent.getAttribute('data-testid'),
                        dataPagelet: parent.getAttribute('data-pagelet'),
                        role: parent.getAttribute('role'),
                        hasDataFt: parent.hasAttribute('data-ft'),
                        hasTransform: !!parent.style.transform
                    });
                    return parent;
                } else {
                    console.log('❌ Candidat rejeté à la tentative', tentatives, 'critères non remplis:', {
                        aDesElementsDePost,
                        pasContainerGlobal,
                        contientTexteCible
                    });
                }
            }

            parent = parent.parentElement;
        }

        console.log('⚠️ Aucun parent de post trouvé après', tentatives, 'tentatives');
        return null;
    }

    function scannerPosts() {
        // D'abord, re-masquer tous les posts déjà identifiés comme bloqués
        document.querySelectorAll('[data-blocked-by-script="true"]').forEach(element => {
            if (element.style.display !== 'none') {
                element.style.setProperty('display', 'none', 'important');
                element.style.setProperty('visibility', 'hidden', 'important');
            }
        });

        // Sélecteurs multiples pour capturer différents types de posts
        const selecteurs = [
            'div[role="article"]',
            'div[data-pagelet*="FeedUnit"]',
            'div[data-testid*="story"]',
            'div[data-ft]',
            '.userContentWrapper',
            'div[style*="transform"]',
            // Sélecteurs plus larges
            'div[dir="auto"] > div > div',
            'div[data-visualcompletion="ignore-dynamic"]',
            // Nouveaux sélecteurs pour capturer plus d'éléments
            'div[style*="translateZ"]',
            'div[data-testid]',
            'div[tabindex]'
        ];

        const tousLesElements = new Set();

        // Collecter tous les éléments possibles
        selecteurs.forEach(selecteur => {
            try {
                const elements = document.querySelectorAll(selecteur + ':not([data-blocked-by-script="true"])');
                elements.forEach(el => tousLesElements.add(el));
            } catch (e) {
                console.log('Erreur avec le sélecteur:', selecteur);
            }
        });

        // Scanner aussi tous les divs avec du texte (mais pas ceux déjà bloqués)
        const divs = document.querySelectorAll('div:not([data-blocked-by-script="true"])');
        divs.forEach(div => {
            const texte = div.textContent || '';
            if (texte.length > 20 && texte.length < 1000) {
                tousLesElements.add(div);
            }
        });

        // Traiter chaque élément
        tousLesElements.forEach(element => {
            // Éviter les éléments déjà traités
            if (elementsMarques.has(element)) return;

            const texte = element.textContent || element.innerText || '';

            if (texte && contientPhraseBloquee(texte)) {
                const texteSignature = texte.substring(0, 100);
                textesBloquesCache.add(texteSignature);
                console.log('🔍 Texte détecté à bloquer:', texteSignature);
                console.log('📍 Élément source:', element);

                // Utiliser la fonction intelligente pour trouver le bon parent de post
                const postParent = trouverPostParent(element);

                // IMPORTANT: Vérifier que le parent trouvé n'est pas identique à l'élément
                if (postParent && postParent !== element && masquerPost(postParent)) {
                    postsTraites.add(texteSignature);
                    console.log('✅ Post complet masqué via parent intelligent:', postParent);

                    // NOUVEAU: Masquer aussi tous les éléments frères qui pourraient être des fragments
                    if (postParent.parentElement) {
                        const elementsFreres = postParent.parentElement.children;
                        for (let frere of elementsFreres) {
                            if (frere !== postParent &&
                                frere.textContent &&
                                (frere.textContent.includes('En voir plus') ||
                                    frere.textContent.includes('See more') ||
                                    contientPhraseBloquee(frere.textContent))) {
                                masquerPost(frere);
                                console.log('✅ Élément frère masqué:', frere);
                            }
                        }
                    }

                } else if (element.offsetHeight > 50 || element.offsetWidth > 200) {
                    // Fallback : masquer l'élément lui-même s'il est assez grand
                    if (masquerPost(element)) {
                        postsTraites.add(texteSignature);
                        console.log('⚠️ Fallback : élément masqué directement:', element);

                        // NOUVEAU: Essayer de masquer le parent immédiat aussi
                        if (element.parentElement &&
                            element.parentElement.offsetHeight > element.offsetHeight) {
                            masquerPost(element.parentElement);
                            console.log('✅ Parent immédiat masqué aussi:', element.parentElement);
                        }
                    }
                } else {
                    console.log('❌ Aucun masquage effectué pour:', texteSignature);
                }
            }
        });

        // NOUVEAU: Scanner spécifiquement pour les éléments "En voir plus" orphelins
        const elementsEnVoirPlus = document.querySelectorAll('div:not([data-blocked-by-script="true"])');
        elementsEnVoirPlus.forEach(element => {
            const texte = element.textContent || '';
            if (texte.includes('En voir plus') || texte.includes('See more')) {
                // Vérifier si l'élément parent contient du texte bloqué
                let parent = element.parentElement;
                let niveaux = 0;
                while (parent && niveaux < 5) {
                    if (parent.textContent && contientPhraseBloquee(parent.textContent)) {
                        masquerPost(element);
                        console.log('✅ "En voir plus" orphelin masqué:', element);
                        break;
                    }
                    parent = parent.parentElement;
                    niveaux++;
                }
            }
        });
    }

    function nettoyerElementsOrphelins() {
        // Rechercher et masquer les éléments "En voir plus" orphelins
        const selecteursOrphelins = [
            'div[role="button"][tabindex="0"]',
            'div.x1i10hfl', // Classes communes des boutons Facebook
            'div[class*="x1qhh985"]'
        ];

        selecteursOrphelins.forEach(selecteur => {
            try {
                const elements = document.querySelectorAll(selecteur + ':not([data-blocked-by-script="true"])');
                elements.forEach(element => {
                    const texte = element.textContent || '';
                    if ((texte.includes('En voir plus') || texte.includes('See more')) && texte.length < 50) {
                        // Vérifier si cet élément appartient à un post qui devrait être bloqué
                        let parent = element.parentElement;
                        let trouve = false;
                        let niveaux = 0;

                        while (parent && niveaux < 8 && !trouve) {
                            const texteParent = parent.textContent || '';
                            if (texteParent && contientPhraseBloquee(texteParent)) {
                                masquerPost(element);
                                console.log('🧹 Nettoyage: "En voir plus" orphelin masqué:', element);
                                trouve = true;
                            }
                            parent = parent.parentElement;
                            niveaux++;
                        }
                    }
                });
            } catch (e) {
                console.log('Erreur nettoyage orphelins:', e);
            }
        });

        // Rechercher les fragments de texte restants
        const divsPotentiels = document.querySelectorAll('div[dir="auto"]:not([data-blocked-by-script="true"])');
        divsPotentiels.forEach(div => {
            const texte = div.textContent || '';
            if (texte.length > 10 && texte.length < 200 && contientPhraseBloquee(texte)) {
                // C'est potentiellement un fragment d'un post qu'on voulait bloquer
                masquerPost(div);
                console.log('🧹 Nettoyage: Fragment de texte masqué:', div);
            }
        });
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
            scannerPosts();
            setTimeout(nettoyerElementsOrphelins, 100);
            scanCount++;
            if (scanCount > 20) {
                clearInterval(intervalId);
                // Passer à un scanner moins fréquent
                setInterval(() => {
                    scannerPosts();
                    setTimeout(nettoyerElementsOrphelins, 100);
                }, 5000);
            }
        }, 1000);

        // Scanner au scroll plus réactif
        let scrollTimeout;
        let lastScrollTop = 0;
        window.addEventListener('scroll', function () {
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

        container.appendChild(boutonAjouter);
        container.appendChild(boutonAjouterTitre);
        container.appendChild(boutonVoir);
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
        document.addEventListener('DOMContentLoaded', initialiser);
    } else {
        initialiser();
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