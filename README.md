# 🚫 Facebook Post Blocker - FCB Cleaner

**[🇫🇷 Version Française](README_FR.md)** | **🇺🇸 English Version**

A powerful UserScript for **Tampermonkey** that automatically blocks unwanted posts on Facebook, particularly group invitations and other spammy content.

## 📋 Project Description

**FCB Cleaner** is an advanced JavaScript script that runs directly in your browser via Tampermonkey. It monitors the Facebook feed in real-time and automatically hides posts containing specific phrases you don't want to see.

### 🎯 Key Features

- **Automatic blocking** of group invitation posts
- **Intuitive user interface** with control buttons
- **Customizable phrases** - add your own filters
- **Automatic detection** of group/page titles for quick blocking
- **Complete cleanup** - removes entire posts, not just parts
- **Resistant to Facebook changes** (automatic re-hiding)
- **Manual scanner** for immediate cleanup
- **Phrase management** with graphical interface

### 🔧 Default Blocked Phrases

The script automatically blocks posts containing:

- "vous invite" (you invite)
- "vous a invité" (invited you)
- "invite à rejoindre" (invite to join)
- "a rejoint le groupe" (joined the group)
- "invited you to join"
- "rejoindre ce groupe" (join this group)
- "join this group"
- "has joined the group"
- "healthy body"

## 🚀 Installation

### Prerequisites

1. **Compatible browser**: Chrome, Firefox, Edge, Safari
2. **Tampermonkey extension** installed ([Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) | [Firefox](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/))

### Script Installation

1. Copy the content of the `fcb.js` file
2. Open Tampermonkey in your browser
3. Click "Create a new script"
4. Paste the code and save (Ctrl+S)
5. The script will automatically activate on Facebook

## 🎮 Usage

### Control Interface

A toolbar appears at the bottom left of Facebook with:

- **➕** Add a custom phrase
- **⚡** Detect and automatically add group/page titles
- **👁️** View and manage all blocked phrases
- **🔍** Manually scan the page
- **[N]** Counter of blocked posts

### Adding Custom Phrases

1. Click the **➕** button
2. Type the phrase to block
3. The script will immediately start blocking posts containing this phrase

### Automatic Group Blocking

1. Visit a post from a group you want to block
2. Click **⚡** to automatically detect the group name
3. Select the group to block from the list

### Phrase Management

1. Click **👁️** to open the management window
2. View default and custom phrases
3. Delete custom phrases if necessary

## ⚙️ Technical Overview

### Script Architecture

- **Smart scanner**: detects posts via multiple CSS selectors
- **Climbing algorithm**: finds the correct parent container of the post
- **Resistant hiding**: applies multiple CSS hiding techniques
- **Mutation observer**: monitors DOM changes in real-time
- **Orphan cleanup**: removes residual fragments

### Detection Methods

1. **Facebook selectors**: `role="article"`, `data-testid`, `data-pagelet`
2. **Structural analysis**: size, number of children, content
3. **Smart climbing**: up to 20 levels in the DOM tree
4. **Contextual verification**: ensures target content is included

### Hiding Techniques

- `display: none !important`
- `visibility: hidden !important`
- `height: 0px !important`
- `opacity: 0 !important`
- Custom CSS classes
- Observers for automatic re-hiding

## 🛠️ Customization

### Modifying Default Phrases

Edit the `phrasesABloquer` array in the code:

```javascript
let phrasesABloquer = [
    "your phrase here",
    "another phrase",
    // ... add your phrases
];
```

### Adjusting Selectors

Modify the `selecteurs` array in the `scannerPosts()` function to target other elements.

### Configuring Delays

Adjust timeouts in the `initialiser()` function according to your machine's performance.

## 🐛 Troubleshooting

### Script Not Working

1. Check that Tampermonkey is enabled
2. Refresh the Facebook page
3. Check the developer console (F12) for logs

### Posts Not Blocked

1. Use the manual scanner (🔍)
2. Add more specific phrases
3. Check detection logs in the console

### Slow Performance

1. Reduce scan frequency in `setInterval`
2. Decrease `maxTentatives` in `trouverPostParent`

## 📝 Logs and Debug

The script generates detailed logs in the browser console:

- 🔍 Text detection to block
- ✅ Successfully hidden posts
- ❌ Hiding failures
- 🧹 Orphan element cleanup

## 🔄 Updates

To update the script:

1. Replace the code in Tampermonkey
2. Refresh Facebook
3. New features will be active immediately

## ⚠️ Warnings

- This script modifies Facebook's display but **collects no data**
- It works **client-side only** in your browser
- Custom phrases are stored **locally**
- Facebook may change its structure and affect script effectiveness

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the project
2. Create a branch for your feature
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

## 📄 License

This project is distributed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 📞 Support

If you encounter problems:

1. Check the **Troubleshooting** section above
2. Check existing issues
3. Open a new issue with complete details

---

**Note**: This script is a personal tool for improving the user experience on Facebook. It respects the terms of use by only modifying local display.
# facebook-cleaner
