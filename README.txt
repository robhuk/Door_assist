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
This app registers xc-doorcode-sw.js, uses the unique cache namespace xc-doorcode-pwa-v9 and manifest ID xc-doorcode-pwa-v9. It checks for an update every time the app is launched, bypassing the browser's HTTP cache for the service-worker script. If a new worker takes control while the app is open, the page reloads to use the updated files. The worker only removes old caches in its own xc-doorcode-pwa- namespace and does not clear unrelated app caches.

DATA & BACKUPS
Entries are stored in localStorage in the browser on that device. Export JSON regularly if you need a backup or want to move the directory to another device. Import replaces the current directory.

SECURITY
This is an offline personal directory, not a secure credential vault. Codes are not encrypted and may be visible to anyone with access to the device/browser profile. Protect the device and exported JSON files. Avoid storing high-security access credentials here.

Keypad note: CLEAR and ENTER are literal code tokens and are saved as part of the door code. The separate backspace key (⌫) removes the last character or token. Done transfers the composed sequence into the door-code field.

Version 4 update: Added X, Y, Z and C character keys to the custom door keypad. These are stored as literal code characters, like digits, * and #. CLEAR and ENTER remain literal keypad instructions.

PDF EXPORT
Open Settings > Export PDF. The print-ready table includes every location, door, keypad sequence, access note and last-updated date. Choose Save as PDF in the print dialog. It exports all locations, regardless of current filters or collapsed state.

VERSION 6 CHANGES
Page zoom is enabled (including double-tap and pinch zoom where supported by the browser). Every door code for each expanded location is displayed together on the location card; no door-selection dropdown is required. Locations can still be expanded and collapsed.

VERSION 7 CHANGES
Screen zoom is disabled using the viewport settings. Existing directory data is retained.


VERSION 8 CHANGES
When KEYPAD is selected for an existing saved door code, the app asks for confirmation before opening the keypad editor. Choosing Cancel leaves the saved code unchanged.


VERSION 9 CHANGES
The PWA now checks for service-worker updates on every launch rather than once every 12 hours. A newly activated update reloads the app so the latest application files are used. Existing local directory data remains stored under the same localStorage key.
