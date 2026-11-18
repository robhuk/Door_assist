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
This app registers xc-doorcode-sw.js, uses the unique cache namespace xc-doorcode-pwa-v17 and manifest ID xc-doorcode-pwa-v17. It checks for an update every time the app is launched, bypassing the browser's HTTP cache for the service-worker script. If a new worker takes control while the app is open, the page reloads to use the updated files. The worker only removes old caches in its own xc-doorcode-pwa- namespace and does not clear unrelated app caches.

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


VERSION 10 CHANGES
Removed the KEYPAD button from location cards. Door codes are edited from the location Edit menu by selecting the relevant code field, which opens the custom keypad. Added COPY ALL to each location card; it copies the location name, every door name and code, and access notes where present. Individual COPY buttons remain available.


VERSION 11 CHANGES
Added a Sort locations selector with A–Z and Last updated options. Last updated sorts newest first, with alphabetical order used when timestamps match. Favourite locations remain prioritised in either sort mode. Existing saved data is preserved.


VERSION 12 CHANGES
Replaced the separate location action controls with a three-dot menu on each location. The menu provides Copy (copies the full location details and all door codes), Edit, and Delete. Delete asks for confirmation before removing the location and its door codes. Favourite control remains separate.


VERSION 13 CHANGES
Added an optional note field to every door entry. Door-specific notes are saved with each code, shown beneath that door in the location card, included in Copy All output and included in the PDF export as a separate column. Existing backups import with blank door notes when no note is present; existing saved data remains compatible.


VERSION 14 CHANGES
Added Export JPEG to each location's three-dot menu. It creates a downloadable, formatted JPEG image for that location, including every door name, code, door-specific note and location access note, with a confidentiality footer. Export is per location and does not depend on whether the location card is expanded or collapsed.


VERSION 15 CHANGES
All app modal popups (location editor, settings and keypad) have a visible X close control. PDF export is now a neutral Door Access Directory without app branding or references. The PDF includes only individual door notes, not location-level notes. The confidentiality warning remains and now advises that access codes should be changed regularly and whenever security may have been compromised.


VERSION 16 CHANGES
Export JPEG now opens an in-app preview modal with an X close button; use Save JPEG within the preview to download the image. Removed the individual large COPY buttons beside door codes. The Copy action remains available from the location three-dot menu.


VERSION 17
- JPEG export now uses the native device share sheet when file sharing is supported.
- On iPhone, choose “Save Image” in the iOS share sheet to save the JPEG into Photos.
- Other browsers retain a direct JPEG download fallback.
- The app cannot request unrestricted direct Photos-library access as a web app; iOS controls saving through its share sheet.

VERSION 18
- PDF export now opens an in-app preview with a visible close control.
- Create / Share PDF opens the device print options for the complete directory.
- Choose Save as PDF or the system share option to save or share the PDF.
- The PDF retains its A4 landscape table, repeat table headings and confidentiality warning.
