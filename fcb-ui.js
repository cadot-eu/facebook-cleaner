// ==UserScript==
// @name         FCB UI - User Interface
// @namespace    https://github.com/cadot-eu/facebook-cleaner
// @version      2.0
// @description  UI module for Facebook Cleaner
// @author       FCB Cleaner Project
// @match        https://www.facebook.com/*
// @match        https://facebook.com/*
// @grant        none
// @run-at       document-start
// @require      fcb-config.js
// @require      fcb-storage.js
// @require      fcb-detection.js
// ==/UserScript==

window.FCB = window.FCB || {};

window.FCB.UI = {
    
    // Créer le menu flottant principal
    createFloatingMenu: function(stats, onToggle, onAddPhrase, onViewPhrases, onOpenOptions) {
        // Supprimer le menu existant
        const existing = document.getElementById('fcb-floating-menu');
        if (existing) existing.remove();

        const container = document.createElement('div');
        container.id = 'fcb-floating-menu';
        
        // Appliquer les styles depuis la config
        const menuStyles = window.FCB.Config.STYLES.FLOATING_MENU;
        Object.keys(menuStyles).forEach(property => {
            container.style[property] = menuStyles[property];
        });

        const title = document.createElement('div');
        title.innerHTML = '🛡️ <strong>FCB Cleaner</strong>';
        title.style.cssText = `
            text-align: center;
            margin-bottom: 12px;
            color: #1a73e8;
            font-weight: bold;
        `;

        // Bouton ON/OFF
        const toggleButton = document.createElement('button');
        toggleButton.textContent = stats.scriptActive ? '🟢 Actif' : '🔴 Inactif';
        toggleButton.style.cssText = `
            width: 100%;
            padding: 8px;
            margin-bottom: 8px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.2s;
            background: ${stats.scriptActive ? '#10b981' : '#ef4444'};
            color: white;
        `;
        toggleButton.onclick = onToggle;

        // Bouton Ajouter phrase
        const addButton = document.createElement('button');
        addButton.textContent = '➕ Ajouter phrase';
        addButton.style.cssText = this.getButtonStyles('#3b82f6');
        addButton.onclick = onAddPhrase;

        // Bouton Voir phrases
        const viewButton = document.createElement('button');
        viewButton.textContent = '📋 Voir phrases';
        viewButton.style.cssText = this.getButtonStyles('#6366f1');
        viewButton.onclick = onViewPhrases;

        // Bouton Options
        const optionsButton = document.createElement('button');
        optionsButton.textContent = '⚙️ Options';
        optionsButton.style.cssText = this.getButtonStyles('#8b5cf6');
        optionsButton.onclick = onOpenOptions;

        // Compteur de posts traités
        const counter = document.createElement('div');
        counter.textContent = `Posts traités: ${stats.processedPosts}`;
        counter.style.cssText = `
            text-align: center;
            font-size: 12px;
            color: #666;
            margin-top: 10px;
            padding: 6px;
            background: #f8f9fa;
            border-radius: 4px;
        `;

        container.appendChild(title);
        container.appendChild(toggleButton);
        container.appendChild(addButton);
        container.appendChild(viewButton);
        container.appendChild(optionsButton);
        container.appendChild(counter);

        document.body.appendChild(container);

        // Mettre à jour le compteur régulièrement
        setInterval(() => {
            counter.textContent = `Posts traités: ${window.FCB.Blocking.processedPosts.size}`;
        }, window.FCB.Config.TIMINGS.SCAN_INTERVAL);

        return container;
    },

    // Créer un bouton "Ajouter aux phrases bloquées" sur un post
    createAddTitleButton: function(post, title, onAdd) {
        // Éviter les doublons
        if (post.querySelector('.fcb-add-title-btn')) return null;
        
        // Ne pas ajouter aux posts masqués
        if (window.FCB.Detection.isAlreadyProcessed(post)) return null;

        const button = document.createElement('button');
        button.className = 'fcb-add-title-btn';
        button.innerHTML = '×';
        button.title = `Bloquer: "${title}"`;
        
        // Appliquer les styles depuis la config
        const buttonStyles = window.FCB.Config.STYLES.ADD_BUTTON;
        Object.keys(buttonStyles).forEach(property => {
            button.style[property] = buttonStyles[property];
        });

        // Effets hover
        button.onmouseover = () => {
            button.style.opacity = '1';
            button.style.transform = 'scale(1.1)';
            button.style.background = 'rgba(220, 38, 38, 1)';
        };
        button.onmouseout = () => {
            button.style.opacity = '0.8';
            button.style.transform = 'scale(1)';
            button.style.background = 'rgba(220, 38, 38, 0.9)';
        };

        button.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            onAdd(title, button);
        };

        return button;
    },

    // Créer le dialogue d'ajout de phrase
    createAddPhraseDialog: function(onAdd, onCancel) {
        const overlay = this.createModalOverlay();
        
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            background: white;
            padding: 25px;
            border-radius: 12px;
            max-width: 500px;
            color: black;
            font-family: system-ui, sans-serif;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        `;

        dialog.innerHTML = `
            <h3 style="margin: 0 0 20px 0; color: #dc2626;">➕ Ajouter une phrase à bloquer</h3>
            <p style="margin: 0 0 15px 0; color: #666;">
                Entrez une phrase, un nom de groupe ou de page à bloquer automatiquement :
            </p>
            <input type="text" id="fcb-phrase-input" placeholder="Ex: Groupe de vente, Invitations..." style="
                width: 100%;
                padding: 12px;
                border: 2px solid #ddd;
                border-radius: 6px;
                font-size: 14px;
                margin-bottom: 20px;
                box-sizing: border-box;
            ">
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button id="fcb-cancel-add" style="
                    padding: 10px 20px;
                    border: 2px solid #ddd;
                    background: white;
                    border-radius: 6px;
                    cursor: pointer;
                ">Annuler</button>
                <button id="fcb-confirm-add" style="
                    padding: 10px 20px;
                    border: none;
                    background: #dc2626;
                    color: white;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: bold;
                ">Ajouter</button>
            </div>
        `;

        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        const input = document.getElementById('fcb-phrase-input');
        const cancelBtn = document.getElementById('fcb-cancel-add');
        const confirmBtn = document.getElementById('fcb-confirm-add');

        input.focus();

        cancelBtn.onclick = () => {
            overlay.remove();
            onCancel && onCancel();
        };

        confirmBtn.onclick = () => {
            const phrase = input.value.trim();
            overlay.remove();
            onAdd && onAdd(phrase);
        };

        input.onkeypress = (e) => {
            if (e.key === 'Enter' && input.value.trim()) {
                confirmBtn.click();
            } else if (e.key === 'Escape') {
                cancelBtn.click();
            }
        };

        return overlay;
    },

    // Créer le dialogue d'édition de titre
    createEditTitleDialog: function(detectedTitle, onConfirm, onCancel) {
        const finalTitle = prompt(
            `Titre détecté :\n"${detectedTitle}"\n\nVous pouvez le modifier avant de l'ajouter aux phrases bloquées :\n(Cliquez Annuler pour ne rien faire)`,
            detectedTitle
        );

        if (finalTitle === null) {
            onCancel && onCancel();
            return;
        }

        if (!finalTitle.trim()) {
            alert('Le titre ne peut pas être vide');
            onCancel && onCancel();
            return;
        }

        onConfirm && onConfirm(finalTitle.trim());
    },

    // Créer le dialogue des options
    createOptionsDialog: function(options, onSave, onCancel) {
        const overlay = this.createModalOverlay();
        
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            background: white;
            padding: 25px;
            border-radius: 12px;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            color: black;
            font-family: system-ui, sans-serif;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        `;

        dialog.innerHTML = `
            <h3 style="margin: 0 0 20px 0; color: #1a73e8;">⚙️ Options et Paramètres</h3>
            <div style="margin-bottom: 20px;">
                <label style="display: flex; align-items: center; margin-bottom: 15px; cursor: pointer;">
                    <input type="checkbox" id="fcb-opt-reels" ${options.masquerReels ? 'checked' : ''} style="margin-right: 10px;">
                    <span><strong>Masquer les Reels</strong><br><small style="color: #666;">Cache automatiquement tous les posts Reels</small></span>
                </label>
                <label style="display: flex; align-items: center; margin-bottom: 15px; cursor: pointer;">
                    <input type="checkbox" id="fcb-opt-suggestions" ${options.masquerSuggestions ? 'checked' : ''} style="margin-right: 10px;">
                    <span><strong>Masquer "Personnes que vous pourriez connaître"</strong><br><small style="color: #666;">Cache les suggestions d'amis et pages similaires</small></span>
                </label>
                <label style="display: flex; align-items: center; margin-bottom: 15px; cursor: pointer;">
                    <input type="checkbox" id="fcb-opt-right-column" ${options.masquerColonneDroite ? 'checked' : ''} style="margin-right: 10px;">
                    <span><strong>Masquer la colonne de droite</strong><br><small style="color: #666;">Cache complètement la colonne de droite (publicités, suggestions)</small></span>
                </label>
            </div>
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button id="fcb-cancel-options" style="
                    padding: 10px 20px;
                    border: 2px solid #ddd;
                    background: white;
                    border-radius: 6px;
                    cursor: pointer;
                ">Annuler</button>
                <button id="fcb-save-options" style="
                    padding: 10px 20px;
                    border: none;
                    background: #1a73e8;
                    color: white;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: bold;
                ">Sauvegarder</button>
            </div>
        `;

        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        const cancelBtn = document.getElementById('fcb-cancel-options');
        const saveBtn = document.getElementById('fcb-save-options');

        cancelBtn.onclick = () => {
            overlay.remove();
            onCancel && onCancel();
        };

        saveBtn.onclick = () => {
            const newOptions = {
                masquerReels: document.getElementById('fcb-opt-reels').checked,
                masquerSuggestions: document.getElementById('fcb-opt-suggestions').checked,
                masquerColonneDroite: document.getElementById('fcb-opt-right-column').checked
            };
            overlay.remove();
            onSave && onSave(newOptions);
        };

        return overlay;
    },

    // Créer le dialogue de gestion des phrases
    createPhrasesDialog: function(phrases, onDelete, onClose) {
        const overlay = this.createModalOverlay();
        
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            background: white;
            padding: 25px;
            border-radius: 12px;
            max-width: 600px;
            max-height: 70vh;
            color: black;
            font-family: system-ui, sans-serif;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        `;

        const title = document.createElement('h3');
        title.textContent = '📋 Phrases bloquées';
        title.style.cssText = 'margin: 0 0 20px 0; color: #1a73e8;';

        const list = document.createElement('div');
        list.style.cssText = `
            max-height: 400px;
            overflow-y: auto;
            border: 1px solid #ddd;
            border-radius: 6px;
            padding: 10px;
            margin-bottom: 20px;
        `;

        // Séparer les phrases par défaut et personnalisées
        const defaultPhrases = window.FCB.Config.DEFAULT_BLOCKED_PHRASES;
        const customPhrases = phrases.slice(defaultPhrases.length);

        // Afficher les phrases par défaut
        if (defaultPhrases.length > 0) {
            const defaultSection = document.createElement('div');
            defaultSection.innerHTML = '<strong style="color: #666;">Phrases par défaut :</strong>';
            list.appendChild(defaultSection);

            defaultPhrases.forEach(phrase => {
                const item = document.createElement('div');
                item.style.cssText = 'padding: 5px 0; color: #888; font-style: italic;';
                item.textContent = `• ${phrase}`;
                list.appendChild(item);
            });
        }

        // Afficher les phrases personnalisées
        if (customPhrases.length > 0) {
            const customSection = document.createElement('div');
            customSection.innerHTML = '<strong style="color: #333; margin-top: 15px; display: block;">Phrases personnalisées :</strong>';
            list.appendChild(customSection);

            customPhrases.forEach((phrase, index) => {
                const item = document.createElement('div');
                item.style.cssText = `
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px 0;
                    border-bottom: 1px solid #eee;
                `;

                const text = document.createElement('span');
                text.textContent = phrase;
                text.style.cssText = 'flex: 1; margin-right: 10px;';

                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = '❌';
                deleteBtn.style.cssText = `
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-size: 12px;
                    padding: 4px 8px;
                    border-radius: 4px;
                    transition: background 0.2s;
                `;
                deleteBtn.onmouseover = () => deleteBtn.style.background = '#fee';
                deleteBtn.onmouseout = () => deleteBtn.style.background = 'none';
                deleteBtn.onclick = () => {
                    if (confirm(`Supprimer "${phrase}" ?`)) {
                        onDelete(defaultPhrases.length + index);
                        item.remove();
                    }
                };

                item.appendChild(text);
                item.appendChild(deleteBtn);
                list.appendChild(item);
            });
        } else {
            const empty = document.createElement('div');
            empty.textContent = 'Aucune phrase personnalisée ajoutée.';
            empty.style.cssText = 'color: #666; font-style: italic; margin-top: 10px;';
            list.appendChild(empty);
        }

        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Fermer';
        closeBtn.style.cssText = `
            padding: 10px 20px;
            border: none;
            background: #1a73e8;
            color: white;
            border-radius: 6px;
            cursor: pointer;
            font-weight: bold;
            display: block;
            margin: 0 auto;
        `;
        closeBtn.onclick = () => {
            overlay.remove();
            onClose && onClose();
        };

        dialog.appendChild(title);
        dialog.appendChild(list);
        dialog.appendChild(closeBtn);
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        return overlay;
    },

    // Utilitaires
    createModalOverlay: function() {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
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
        return overlay;
    },

    getButtonStyles: function(bgColor) {
        return `
            width: 100%;
            padding: 6px 12px;
            margin-bottom: 6px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 12px;
            transition: all 0.2s;
            background: ${bgColor};
            color: white;
        `;
    },

    // Ajouter un bouton à un post
    addButtonToPost: function(post, title, onAdd) {
        const titleContainer = post.querySelector('div[data-ad-rendering-role="profile_name"], h4, .x1heor9g');
        if (!titleContainer) return false;

        const button = this.createAddTitleButton(post, title, onAdd);
        if (!button) return false;

        // Trouver l'élément de titre et ajouter le bouton après
        const titleElement = titleContainer.querySelector('strong, b, a[role="link"]');
        if (titleElement && titleElement.parentNode) {
            titleElement.parentNode.insertBefore(button, titleElement.nextSibling);
        } else {
            titleContainer.appendChild(button);
        }

        return true;
    }
};
