/**
 * Asset map: where every website image/video comes from.
 *
 * source "fig:<hash>"  = image embedded inside Divinerubber.fig (approved design)
 * source "<filename>"  = loose photo supplied in the project root
 *
 * widths = the responsive sizes generated (WebP). Edit this file and run
 * `npm run images` to regenerate. Original files are never modified.
 */
module.exports = {
  images: [
    // Brand
    { out: 'brand/divine-logo', source: 'fig:cc4a838e', widths: [424], keepAlpha: true },
    { out: 'brand/location-map', source: 'fig:ccc9a31d', widths: [781] },

    // Homepage hero / products from the design
    { out: 'products/diamond-top-runner-roll', source: 'fig:f873b5f7', widths: [864, 480], keepAlpha: true, quality: 90 },
    { out: 'home/runners-mat', source: 'fig:90345966', widths: [1920, 1200, 640] },
    { out: 'products/ornate-scroll-doormat', source: 'fig:2855f228', widths: [1248, 640], quality: 90 },
    { out: 'products/texture-mat', source: 'fig:6b9199c0', widths: [500], whiteBg: { tolerance: 38 }, quality: 90 },
    { out: 'products/urinal-mat', source: 'fig:0e0aa21f', widths: [502], keepAlpha: true, quality: 90 },

    // Industries / applications (approved design imagery)
    { out: 'industries/home-entrance', source: 'fig:57a132fe', widths: [1200, 640] },
    { out: 'industries/warehouse', source: 'fig:f2f29ee8', widths: [1920, 1200, 640] },
    { out: 'industries/hospitality', source: 'fig:980c5c23', widths: [1024, 640] },
    { out: 'industries/restaurant-kitchen', source: 'fig:24d16509', widths: [1024, 640] },
    { out: 'industries/gym-fitness', source: 'fig:7e525b16', widths: [1024, 640] },
    { out: 'industries/playground', source: 'fig:9ee8a4dc', widths: [1200, 640] },
    { out: 'industries/retail', source: 'fig:3504fecb', widths: [1920, 1200, 640] },
    { out: 'industries/marine-outdoor', source: 'fig:931b50a2', widths: [1024, 640] },
    { out: 'industries/residential-living', source: 'fig:b7d57e55', widths: [1920, 1200, 640] },

    // Factory (design imagery — TODO: replace with genuine factory photos when supplied)
    { out: 'factory/mat-inspection', source: 'fig:8b3b04ac', widths: [1920, 1200, 640] },
    { out: 'factory/rolls-inspection', source: 'fig:1ac443f9', widths: [1024, 640] },
    { out: 'factory/production-line', source: 'fig:24cf6a51', widths: [1024, 640] },
    // Close view of the sheeting machine (left of the production-line photo) — Manufacturing › Machines
    { out: 'factory/sheeting-machine', source: 'fig:24cf6a51', widths: [640], crop: { left: 0, top: 0.08, width: 0.62, height: 0.5 } },
    { out: 'factory/rubber-mill', source: 'fig:fd9f7a34', widths: [1280, 640] },

    // Infrastructure page — AI-GENERATED visuals (2×2 grid embedded in divine-infrastructure.html,
    // saved unchanged as source-images/ai/infrastructure-grid.png). NOT real Divine Rubber photos:
    // every use carries data-todo until the client supplies genuine facility photos.
    // Crops sit just inside the grid's 7px white gutter.
    { out: 'infra/roll-line', source: 'source-images/ai/infrastructure-grid.png', widths: [760, 480], crop: { left: 0, top: 0, width: 0.4948, height: 0.4922 } },
    { out: 'infra/mixing-rollers', source: 'source-images/ai/infrastructure-grid.png', widths: [760, 480], crop: { left: 0.5039, top: 0, width: 0.4948, height: 0.4922 } },
    { out: 'infra/warehouse-forklift', source: 'source-images/ai/infrastructure-grid.png', widths: [760, 480], crop: { left: 0, top: 0.5059, width: 0.4948, height: 0.4922 } },
    { out: 'infra/thickness-check', source: 'source-images/ai/infrastructure-grid.png', widths: [760, 480], crop: { left: 0.5039, top: 0.5059, width: 0.4948, height: 0.4922 } },

    // About › Three Promises — images supplied by the client
    { out: 'about/promise-quality', source: 'Quality.jpg', widths: [708, 480] },
    { out: 'about/promise-value', source: 'Value.jpg', widths: [702, 480] },
    { out: 'about/promise-prompt-delivery', source: 'Prompt-Delivery.jpg', widths: [704, 480] },

    // About › Our Core Expertise product photos (supplied 2026-10-14, ~500px originals)
    // Product studio visuals (AI-generated recreations supplied for design review — see the folder's READ-ME)
    { out: 'products/studio/dh001-universal-pattern-square-edged', source: 'Products/Divine-Rubber-All-Product-Studio-Images/Divine-Rubber-Studio-Images/Rubber-Hollow-Mats/DH001-Universal-Pattern-Square-Edged.jpg', widths: [640, 1066], trim: 241, quality: 82 },
    { out: 'products/studio/dh002-universal-pattern-taper-edged', source: 'Products/Divine-Rubber-All-Product-Studio-Images/Divine-Rubber-Studio-Images/Rubber-Hollow-Mats/DH002-Universal-Pattern-Taper-Edged.jpg', widths: [640], trim: 241, quality: 82 },
    { out: 'products/studio/dh004-ring-o-mat', source: 'Products/Divine-Rubber-All-Product-Studio-Images/Divine-Rubber-Studio-Images/Rubber-Hollow-Mats/DH004-Ring-O-Mat.jpg', widths: [640], trim: 241, quality: 82 },
    { out: 'products/studio/dh005-restaurant-mat', source: 'Products/Divine-Rubber-All-Product-Studio-Images/Divine-Rubber-Studio-Images/Rubber-Hollow-Mats/DH005-Restaurant-Mat.jpg', widths: [640], trim: 241, quality: 82 },
    { out: 'products/studio/dh006-rubber-anti-fatigue-mat', source: 'Products/Divine-Rubber-All-Product-Studio-Images/Divine-Rubber-Studio-Images/Rubber-Hollow-Mats/DH006-Rubber-Anti-Fatigue-Mat.jpg', widths: [640], trim: 241, quality: 82 },
    { out: 'products/studio/dh007-honeycomb-mat', source: 'Products/Divine-Rubber-All-Product-Studio-Images/Divine-Rubber-Studio-Images/Rubber-Hollow-Mats/DH007-Honeycomb-Mat.jpg', widths: [640], trim: 241, quality: 82 },
    { out: 'products/studio/dh008-grill-mat', source: 'Products/Divine-Rubber-All-Product-Studio-Images/Divine-Rubber-Studio-Images/Rubber-Hollow-Mats/DH008-Grill-Mat.jpg', widths: [640], trim: 241, quality: 82 },
    { out: 'products/studio/dh009-cast-iron-style-mat', source: 'Products/Divine-Rubber-All-Product-Studio-Images/Divine-Rubber-Studio-Images/Rubber-Hollow-Mats/DH009-Cast-Iron-Style-Mat.jpg', widths: [640], trim: 241, quality: 82 },
    { out: 'products/studio/dh010-connector', source: 'Products/Divine-Rubber-All-Product-Studio-Images/Divine-Rubber-Studio-Images/Rubber-Hollow-Mats/DH010-Connector.jpg', widths: [640], trim: 241, quality: 82 },
    { out: 'products/studio/ds001-taper-edged-stud-mat', source: 'Products/Divine-Rubber-All-Product-Studio-Images/Divine-Rubber-Studio-Images/Rubber-Stud-Mats/DS001-Taper-Edged-Stud-Mat.jpg', widths: [640], trim: 241, quality: 82 },
    { out: 'products/studio/ds002-welcome-stud-mat', source: 'Products/Divine-Rubber-All-Product-Studio-Images/Divine-Rubber-Studio-Images/Rubber-Stud-Mats/DS002-Welcome-Stud-Mat.jpg', widths: [640], trim: 241, quality: 82 },
    { out: 'products/studio/ds003-shoe-mat', source: 'Products/Divine-Rubber-All-Product-Studio-Images/Divine-Rubber-Studio-Images/Rubber-Stud-Mats/DS003-Shoe-Mat.jpg', widths: [640], trim: 241, quality: 82 },
    { out: 'products/studio/ds004-square-mat', source: 'Products/Divine-Rubber-All-Product-Studio-Images/Divine-Rubber-Studio-Images/Rubber-Stud-Mats/DS004-Square-Mat.jpg', widths: [640], trim: 241, quality: 82 },
    { out: 'products/studio/ds005-puppy-mat', source: 'Products/Divine-Rubber-All-Product-Studio-Images/Divine-Rubber-Studio-Images/Rubber-Stud-Mats/DS005-Puppy-Mat.jpg', widths: [640], trim: 241, quality: 82 },
    { out: 'products/studio/ds006-step-mat', source: 'Products/Divine-Rubber-All-Product-Studio-Images/Divine-Rubber-Studio-Images/Rubber-Stud-Mats/DS006-Step-Mat.jpg', widths: [640], trim: 241, quality: 82 },
    { out: 'products/studio/ds007-grooved-bottom-stable-mat', source: 'Products/Divine-Rubber-All-Product-Studio-Images/Divine-Rubber-Studio-Images/Stable-and-Cow-Mats/DS007-Grooved-Bottom-Stable-Mat.jpg', widths: [640], trim: 241, quality: 82 },
    { out: 'products/studio/ds008-studded-bottom-stable-mat', source: 'Products/Divine-Rubber-All-Product-Studio-Images/Divine-Rubber-Studio-Images/Stable-and-Cow-Mats/DS008-Studded-Bottom-Stable-Mat.jpg', widths: [640], trim: 241, quality: 82 },
    { out: 'products/studio/ds009-interlocking-stable-mat', source: 'Products/Divine-Rubber-All-Product-Studio-Images/Divine-Rubber-Studio-Images/Stable-and-Cow-Mats/DS009-Interlocking-Stable-Mat.jpg', widths: [640], trim: 241, quality: 82 },
    { out: 'products/studio/dc001-brush-mat', source: 'Products/Divine-Rubber-All-Product-Studio-Images/Divine-Rubber-Studio-Images/Coir-and-Jute/DC001-Brush-Mat.jpg', widths: [640], trim: 241, quality: 82 },
    { out: 'products/studio/dc002-coco-rubber-mat', source: 'Products/Divine-Rubber-All-Product-Studio-Images/Divine-Rubber-Studio-Images/Coir-and-Jute/DC002-Coco-Rubber-Mat.jpg', widths: [640], trim: 241, quality: 82 },
    { out: 'products/studio/dc003-coco-rubber-mattings-mat', source: 'Products/Divine-Rubber-All-Product-Studio-Images/Divine-Rubber-Studio-Images/Coir-and-Jute/DC003-Coco-Rubber-Mattings-Mat.jpg', widths: [640], trim: 241, quality: 82 },
    { out: 'products/studio/dc004-coir-matting-boucle', source: 'Products/Divine-Rubber-All-Product-Studio-Images/Divine-Rubber-Studio-Images/Coir-and-Jute/DC004-Coir-Matting-Boucle.jpg', widths: [640], trim: 241, quality: 82 },
    { out: 'products/studio/dc005-creal-mats', source: 'Products/Divine-Rubber-All-Product-Studio-Images/Divine-Rubber-Studio-Images/Coir-and-Jute/DC005-Creal-Mats.jpg', widths: [640], trim: 241, quality: 82 },
    { out: 'products/studio/dc006-creal-mat', source: 'Products/Divine-Rubber-All-Product-Studio-Images/Divine-Rubber-Studio-Images/Coir-and-Jute/DC006-Creal-Mat.jpg', widths: [640], trim: 241, quality: 82 },
    { out: 'products/studio/dc007-fibre-mat', source: 'Products/Divine-Rubber-All-Product-Studio-Images/Divine-Rubber-Studio-Images/Coir-and-Jute/DC007-Fibre-Mat.jpg', widths: [640], trim: 241, quality: 82 },
    { out: 'products/studio/dc008-fibre-f2', source: 'Products/Divine-Rubber-All-Product-Studio-Images/Divine-Rubber-Studio-Images/Coir-and-Jute/DC008-Fibre-F2.jpg', widths: [640], trim: 241, quality: 82 },
    { out: 'products/studio/dc009-fender', source: 'Products/Divine-Rubber-All-Product-Studio-Images/Divine-Rubber-Studio-Images/Coir-and-Jute/DC009-Fender.jpg', widths: [640], trim: 241, quality: 82 },
    { out: 'products/studio/dc010-hollander-mat', source: 'Products/Divine-Rubber-All-Product-Studio-Images/Divine-Rubber-Studio-Images/Coir-and-Jute/DC010-Hollander-Mat.jpg', widths: [640], trim: 241, quality: 82 },
    { out: 'products/studio/dc011-rope-jap-mat', source: 'Products/Divine-Rubber-All-Product-Studio-Images/Divine-Rubber-Studio-Images/Coir-and-Jute/DC011-Rope-Jap-Mat.jpg', widths: [640], trim: 241, quality: 82 },
    { out: 'products/studio/dj001-jute-loop-mat', source: 'Products/Divine-Rubber-All-Product-Studio-Images/Divine-Rubber-Studio-Images/Coir-and-Jute/DJ001-Jute-Loop-Mat.jpg', widths: [640], trim: 241, quality: 82 },
    { out: 'products/studio/dj002-jute-rugs-and-carpets', source: 'Products/Divine-Rubber-All-Product-Studio-Images/Divine-Rubber-Studio-Images/Coir-and-Jute/DJ002-Jute-Rugs-and-Carpets.jpg', widths: [640], trim: 241, quality: 82 },
    { out: 'products/studio/dj003-hand-spun-jute', source: 'Products/Divine-Rubber-All-Product-Studio-Images/Divine-Rubber-Studio-Images/Coir-and-Jute/DJ003-Hand-Spun-Jute.jpg', widths: [640], trim: 241, quality: 82 },
    { out: 'products/studio/dj004-jute-loop-mat', source: 'Products/Divine-Rubber-All-Product-Studio-Images/Divine-Rubber-Studio-Images/Coir-and-Jute/DJ004-Jute-Loop-Mat.jpg', widths: [640], trim: 241, quality: 82 },
    { out: 'products/studio/dj005-jute-dot-mattings', source: 'Products/Divine-Rubber-All-Product-Studio-Images/Divine-Rubber-Studio-Images/Coir-and-Jute/DJ005-Jute-Dot-Mattings.jpg', widths: [640], trim: 241, quality: 82 },
    { out: 'products/studio/dr001-rag-rugs', source: 'Products/Divine-Rubber-All-Product-Studio-Images/Divine-Rubber-Studio-Images/Rag-Rugs-and-Polypropylene/DR001-Rag-Rugs.jpg', widths: [640], trim: 241, quality: 82 },
    { out: 'products/studio/dr002-cotton-rag-rugs', source: 'Products/Divine-Rubber-All-Product-Studio-Images/Divine-Rubber-Studio-Images/Rag-Rugs-and-Polypropylene/DR002-Cotton-Rag-Rugs.jpg', widths: [640], trim: 241, quality: 82 },
    { out: 'products/studio/dp001-polypropylene-mat', source: 'Products/Divine-Rubber-All-Product-Studio-Images/Divine-Rubber-Studio-Images/Rag-Rugs-and-Polypropylene/DP001-Polypropylene-Mat.jpg', widths: [640], trim: 241, quality: 82 },
    // DH 003 product photo (client-supplied, replaces the old legacy photo)
    { out: 'products/octagonal-pattern-square-edged', source: 'Products/Octagonal-Pattern-Rubber-Mat.jpg', widths: [800], upscale: 2, trim: 244, quality: 90 },
    { out: 'about/expertise-octagonal-pattern', source: 'Octagonal-Pattern.jpg', widths: [490] },
    { out: 'about/expertise-universal-pattern', source: 'Universal-Pattern.jpg', widths: [490] },
    { out: 'about/expertise-stud-mat', source: 'Stud-Mat.jpg', widths: [490] },
    { out: 'about/expertise-stable-mat', source: 'Stable-Mat.jpg', widths: [490] },
    { out: 'about/expertise-coir-products', source: 'Coir-Products.jpg', widths: [490] },
    { out: 'about/expertise-jute-products', source: 'Jute-Product.jpg', widths: [490] },

    // Stock photos (Unsplash License — see source-images/unsplash/CREDITS.md)
    { out: 'stock/warehouse-pallet-stock', source: 'source-images/unsplash/warehouse-pallet-stock-afinis.jpg', widths: [1200, 640] },
    { out: 'stock/port-container-loading', source: 'source-images/unsplash/port-container-loading-illahi.jpg', widths: [1200, 640] },

    // Genuine product photographs supplied by the client
    // Second view of the Diamond Top Stable Mat (product page gallery)
    { out: 'products/diamond-top-stable-mat-curled', source: 'Curled Black Ribbed Rubber Mat.png', widths: [1200, 640], quality: 90 },
    { out: 'products/diamond-top-stable-mat', source: '4 ft x 6 ft x 17 mm  Diamond top.JPG', widths: [1600, 800, 480], whiteBg: { tolerance: 38 }, quality: 90 },
    { out: 'products/interlocking-coin-mat', source: '1 met x 1 met x 22 mm Inter locking  coin design both side (1).jfif', widths: [1080, 800, 480], quality: 90 },
    { out: 'products/interlocking-tile-mat', source: '50 cm x 50 cm  x 20 mm interlocking.jfif', widths: [560], whiteBg: { tolerance: 38 }, quality: 90 },
    { out: 'products/pin-mat-diamond', source: 'Pin Mat Diamond.jfif', widths: [1600, 800, 480], whiteBg: { tolerance: 38 }, quality: 90 },
    { out: 'products/anti-fatigue-bubble-mat', source: 'anti fatigu Bubble mats.JPG', widths: [1600, 800, 480], quality: 90 },
    { out: 'products/stud-surface-closeup', source: '62.JPG', widths: [1920, 1200, 640], quality: 90 }
  ],
  videos: [
    { out: 'factory-rubber-mill', source: 'fig:524f896f', width: 1280, audio: true },
    { out: 'runners-mat', source: 'fig:7391162e', width: 1280, audio: false },
    { out: 'factory-production-line', source: 'fig:2384eb99', width: 864, audio: false }
  ]
};
