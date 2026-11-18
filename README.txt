XC DOORCODE PWA

Files:
- index.html, styles.css, app.js: application
- manifest.webmanifest: XC DoorCode install metadata and unique app ID
- xc-doorcode-sw.js: dedicated service worker with its own cache namespace
- icon.svg: XC-colour DoorCode app icon

BRANDING
CrossCountry-inspired palette: burgundy #A50034, gold #FFC72C, charcoal and white. The icon is an original door/access symbol. This is an independent utility and is not an official CrossCountry product.

RUN / INSTALL
A PWA must be served from HTTPS (or localhost); opening index.html directly will show the interface but installation and offline caching will not activate.

GitHub Pages:
1. Create a new GitHub repository.
2. Upload the contents of this folder to the repository root.
3. In Settings > Pages, deploy from the main branch and root folder.
4. Open the resulting HTTPS URL on your phone.
5. iPhone: Safari > Share > Add to Home Screen. Android: Chrome > menu > Install app.

SERVICE WORKER / UPDATES
This app registers xc-doorcode-sw.js, uses the unique cache namespace xc-doorcode-pwa-v1, and has the manifest ID xc-doorcode-pwa-v1. It checks for an update on app launch no more than once every 12 hours. The worker only removes old caches in its own xc-doorcode-pwa- namespace and does not clear unrelated app caches.

DATA & BACKUPS
Entries are stored in localStorage in the browser on that device. Export JSON regularly if you need a backup or want to move the directory to another device. Import replaces the current directory.

SECURITY
This is an offline personal directory, not a secure credential vault. Codes are not encrypted and may be visible to anyone with access to the device/browser profile. Protect the device and exported JSON files. Avoid storing high-security access credentials here.

Keypad note: CLEAR and ENTER are literal code tokens and are saved as part of the door code. The separate backspace key (⌫) removes the last character or token. Done transfers the composed sequence into the door-code field.

Version 4 update: Added X, Y, Z and C character keys to the custom door keypad. These are stored as literal code characters, like digits, * and #. CLEAR and ENTER remain literal keypad instructions.
