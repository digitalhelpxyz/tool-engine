TOOL ENGINE REPO (digitalhelpxyz/tool-engine)

WHAT IS IN HERE
manifest.json        tells the site which file is the newest for each pack
packs/image.v2.js    image tools (resize, crop, rotate, convert, compress, watermark, PDF and more)
packs/pdf.v1.js      PDF tools
packs/video.v1.js    video tools
packs/common.v1.js   common tools (word counter, case converter, password, QR, percentage, age, EMI, GST)
packs/seo.v1.js      SEO tools
packs/<name>.js      the same files without a version number (used only as a backup)

FIRST TIME SETUP
1. Upload manifest.json and the packs folder to the root of the GitHub repo (replace the old files).
2. Repo > Settings > Pages > Source: "Deploy from a branch", Branch: main, Folder: / (root), Save.
   This makes manifest.json available at https://digitalhelpxyz.github.io/tool-engine/manifest.json and it refreshes in about 10 minutes.
3. Restore the new tools-xyz-template.xml in Blogger (one time).

HOW TO UPDATE A TOOL LATER (no template change)
1. Make the new file with the next version number, for example packs/pdf.v2.js. Never edit an old versioned file.
2. Also copy it over packs/pdf.js (the backup copy).
3. Open manifest.json and change the line to "pdf": "packs/pdf.v2.js". Commit.
4. Within about 10 minutes visitors get the new version. Their browsers download it once and keep it.

HOW TO ADD A NEW GROUP OF TOOLS (for example Business Tools)
1. Make packs/business.v1.js and packs/business.js.
2. Add "business": "packs/business.v1.js" to manifest.json.
3. On each page use <div data-it-tool="business/sip">Loading tool...</div>
4. Make the hub page /p/business-tools.html and add it to the Blogger menu. Search, breadcrumbs and More tools find the hub by themselves.
The name before the slash (business) decides the pack and the hub: business -> packs/business... and /p/business-tools.html
