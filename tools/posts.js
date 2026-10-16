/**
 * Blog articles and News & Events stories — the single source for:
 *   blogs.html / news.html listing cards (between <!-- posts:start --> / <!-- posts:end -->)
 *   one detail page per published post (blog-*.html, news-*.html)
 * Build: `npm run posts` (tools/build-posts.js), then partials are re-applied.
 *
 * CONTENT RULES (client checklist):
 * - Only facts already published on this site (product catalogue, product pages,
 *   About / Manufacturing / Infrastructure pages) or general, non-company-specific advice.
 * - No invented events, launches, figures or dates.
 *
 * PUBLISHING
 * - status: 'published' → built, listed and in the sitemap. Anything else is a draft:
 *   kept here, never built (an earlier generated page is removed by the build).
 * - date: 'YYYY-MM-DD' → the publication date (published posts default to PUBLISHED_ON below); it
 *   appears on the card and page. Without it, cards show the reading time instead.
 * - Events (cat 'events') need an `event` object with VERIFIED details before publishing:
 *   { name, start: 'YYYY-MM-DD', end?, venue, city, purpose, stand?, url? }
 *   The build refuses to publish an event without name, start, venue, city and purpose.
 *
 * image: base path under assets/images (sizes are found automatically) — use photos at
 *   least ~1000 px wide, the header image is shown full width
 * products: catalogue names (tools/product-catalogue.js) shown as product cards under the article
 * ai: true when the image is an AI-generated visual (flagged with data-todo, ?review only)
 * todo: review note (data-todo, visible with ?review only — never public)
 * readMin is worked out from the text.
 */

const catalogue = require('./product-catalogue');

const P = (c) => `products.html?category=${c}`;
// Link to a catalogue product: its own page, or its card on the Products page
const slug = (s) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const L = (name, label = name) => {
  const p = catalogue.find((x) => x.name === name);
  if (!p) throw new Error(`posts.js: "${name}" is not in tools/product-catalogue.js`);
  return `<a href="${p.page || `${P(p.cat)}#product-${slug(p.name)}`}">${label.replace(/&(?!amp;)/g, '&amp;')}</a>`;
};

const blog = [
  {
    status: 'published',
    file: 'blog-detail.html', // original URL kept (also the page template for build-posts.js)
    cat: 'guides', catLabel: 'Product Guides',
    title: 'How to Choose the Right Entrance Mat for Your Building',
    crumb: 'Choosing an Entrance Mat',
    summary: "Traffic, weather and floor type all matter. Here's how to match the mat to the doorway.",
    description: 'Traffic, weather, floor type and cleaning all matter when choosing an entrance mat. A practical guide to rubber, coir and polypropylene entrance mats.',
    image: 'industries/retail', alt: 'Shoppers walking across a large entrance mat at a store',
    products: ['Universal Pattern Taper Edged', 'Octagonal Pattern Square Edged', 'Coco Rubber Mat', 'Welcome Stud Mat'],
    body: `
            <p class="t-lead">Most of the dirt and moisture inside a building comes in on people's shoes. The right entrance mat stops it at the door — protecting floors, reducing cleaning time and lowering the risk of slips. These five questions will help you choose one.</p>

            <h2>1. How busy is the entrance?</h2>
            <p>A home doorway might see a few dozen steps a day; a shop, station or hotel entrance can see thousands. Heavier traffic needs heavier mats. Thick rubber hollow mats — such as the ${L('Universal Pattern Square Edged', 'Universal Pattern')} in 22 mm or 16 mm — stay flat, resist wear and are less likely to creep across the floor than light mats.</p>
            <p>For very wide doorways, look for mats that can be joined. Universal Pattern mats are modular and link with ${L('Connector', 'connectors')} to cover larger floor areas.</p>

            <h2>2. Is it outdoors, under cover or inside?</h2>
            <p>Outside the door, mats face rain, mud and sun. Choose a mat that lets water drain away. <a href="${P('hollow-mats')}">Hollow rubber mats</a> have an open-hole design that wipes dirt off shoes and lets it fall through, and on the Universal Pattern a studded bottom enhances drainage and keeps the surface cleaner.</p>
            <p>${L('Polypropylene Mats')} are durable and weatherproof and suit both indoor and outdoor use. Natural coir and jute mats are better kept under cover, where they stay dry.</p>

            FIGURE

            <h2>3. Scrape first, then dry</h2>
            <p>The most effective entrances use more than one mat in sequence:</p>
            <ul>
              <li><strong>Outside — scrape.</strong> A tough mat removes grit and mud. <a href="${P('stud-mats')}">Stud mats</a>, covered with flexible rubber studs, are good at removing mud; ${L('Pin Mat Diamond', 'pin mats')} scrape footwear clean.</li>
              <li><strong>At the threshold — brush.</strong> Coir is hard, flexible and has excellent scrubbing action. A ${L('Coco Rubber Mat')} combines coir with a rubber backing for a hard-wearing, elegant finish.</li>
              <li><strong>Inside — finish.</strong> A lighter indoor mat catches what is left before people reach the main floor.</li>
            </ul>

            <h2>4. What floor will the mat sit on?</h2>
            <p>On polished stone or tiles, slipping is the main concern. Look for a textured surface: the ${L('Octagonal Pattern Square Edged', 'Octagonal Pattern')} hollow mat has a surface finish that does not slip even on highly polished floors. Where people step on and off the mat, a taper-edged mat such as the ${L('Universal Pattern Taper Edged')} gives a sloped edge instead of a step.</p>

            <h2>5. How will it be cleaned?</h2>
            <p>A mat only works if it is kept clean. Rubber mats can be lifted, shaken and washed, and open-hole designs make it easy to sweep or hose away trapped dirt. See our <a href="blog-mat-cleaning-and-maintenance.html">mat care guide</a> for routines that keep each material working.</p>

            <h3>Quick checklist</h3>
            <ul>
              <li>How many people use the entrance each day?</li>
              <li>Is the mat outdoors, under cover or indoors?</li>
              <li>Does water need to drain through the mat?</li>
              <li>What floor surface will the mat sit on?</li>
              <li>How wide is the doorway — do you need several mats joined together?</li>
            </ul>

            <blockquote>Not sure which mat fits? Send us the size of your entrance and how it is used — we'll suggest the right option.</blockquote>`,
    figure: { image: 'industries/home-entrance', alt: 'Coir door mat with rubber border at a modern house entrance', caption: 'Natural coir provides excellent scrubbing action at covered entrances.' },
  },
  {
    status: 'published',
    slug: 'rubber-coir-or-jute',
    cat: 'guides', catLabel: 'Product Guides',
    title: 'Rubber, Coir or Jute: Which Mat Material Is Right for You?',
    crumb: 'Rubber, Coir or Jute',
    summary: 'Three materials, three strengths. How rubber, coir and jute mats compare for wear, water, grip and looks.',
    description: 'Rubber, coir and jute floor mats compared — durability, drainage, scrubbing action, comfort and where each material works best.',
    image: 'industries/hospitality', alt: 'Large logo entrance mat in a hotel lobby',
    products: ['Universal Pattern Square Edged', 'Brush Mat', 'Jute Loop Mat', 'Polypropylene Mats'],
    body: `
            <p class="t-lead">Divine Rubber makes floor mats in three main materials — rubber, coir and jute — for homes, businesses, farms and industry. Each has its own strengths. Knowing them makes it much easier to choose.</p>

            <h2>Rubber: tough, washable and weatherproof</h2>
            <p>Rubber mats are the workhorses of the range. Ours are made from RSS-4 rubber, hand-searched micro crumb and internationally branded chemicals, giving mats that are durable, flexible, washable and weatherproof.</p>
            <ul>
              <li><strong>Best for:</strong> busy and wet entrances, kitchens, washrooms, workshops, stables and outdoor areas.</li>
              <li><strong>Strengths:</strong> drainage (open-hole <a href="${P('hollow-mats')}">hollow mats</a>), mud removal and cushioning (<a href="${P('stud-mats')}">stud mats</a>), and heavy-duty floors (<a href="${P('stable-cow-mats')}">stable mats and interlocking tiles</a>).</li>
              <li><strong>Care:</strong> lift, sweep, hose or wash with mild detergent.</li>
            </ul>

            <h2>Coir: natural scrubbing power</h2>
            <p>Coir is the fibre from coconut husks, and our facility sits close to Alleppey, India's coir town. Coir mats are hard, flexible and bio-degradable, and they provide excellent scrubbing action at the door.</p>
            <ul>
              <li><strong>Best for:</strong> covered entrances and doorways in homes, offices and hotels.</li>
              <li><strong>Strengths:</strong> stiff fibres brush grit off shoes; a rubber backing — as on the ${L('Coco Rubber Mat')} — adds weight and durability.</li>
              <li><strong>Care:</strong> shake or beat out grit, brush or vacuum, and let it dry fully if it gets wet.</li>
            </ul>

            <h2>Jute: a soft, natural texture</h2>
            <p>Jute brings a warm, natural look to interiors. Our eco-friendly jute range includes loop mats, rugs and carpets, hand-spun jute and dot mattings, as well as short-term erosion-control mats.</p>
            <ul>
              <li><strong>Best for:</strong> dry indoor spaces with light to moderate foot traffic — living rooms, bedrooms, hallways and calm reception areas.</li>
              <li><strong>Strengths:</strong> natural appearance, comfortable underfoot, eco-friendly.</li>
              <li><strong>Care:</strong> vacuum regularly and keep it dry; blot spills straight away.</li>
            </ul>

            <h2>At a glance</h2>
            <ul>
              <li><strong>Lots of water or spills?</strong> Rubber hollow mats.</li>
              <li><strong>Muddy footwear at a covered door?</strong> Coir, or a rubber stud mat outside.</li>
              <li><strong>A natural look indoors?</strong> Jute.</li>
              <li><strong>Indoors and outdoors in one design?</strong> Weatherproof ${L('Polypropylene Mats', 'polypropylene mats')}.</li>
            </ul>

            <p>Many entrances work best with a combination — a rubber or coir mat at the door and a jute rug further inside. Browse the <a href="${P('coir-jute')}">coir &amp; jute range</a> or the full <a href="products.html">product catalogue</a>.</p>`,
  },
  {
    status: 'published',
    slug: 'hollow-vs-stud-mats',
    cat: 'rubber-products', catLabel: 'Rubber Products',
    title: "Hollow Mats vs Stud Mats: What's the Difference?",
    crumb: 'Hollow vs Stud Mats',
    summary: 'Open holes for drainage or flexible studs for cushioning? How the two main rubber mat families compare.',
    description: 'Hollow rubber mats and stud mats compared — drainage, cushioning, mud removal, sizes and where each works best.',
    image: 'products/stud-surface-closeup', alt: 'Close-up of a studded rubber mat surface',
    products: ['Universal Pattern Square Edged', 'Restaurant Mat', 'Taper Edged Stud Mat', 'Pin Mat Diamond'],
    body: `
            <p class="t-lead">Rubber mats come in two main families. Both are tough and washable, but they solve different problems — one is built around drainage, the other around cushioning and scraping.</p>

            <h2>Hollow mats: built for drainage</h2>
            <p><a href="${P('hollow-mats')}">Hollow mats</a> have an open-hole top. As people walk across, dirt is wiped off their shoes and falls through the holes, and water drains away instead of pooling on the surface. On the ${L('Universal Pattern Square Edged', 'Universal Pattern')} mat, a studded bottom adds comfort and enhances drainage and cleanliness.</p>
            <p>The hollow range covers many patterns and sizes:</p>
            <ul>
              <li><strong>Universal Pattern</strong> — 22 mm and 16 mm, square- or taper-edged, in black, terracotta and green.</li>
              <li><strong>Octagonal Pattern</strong> — 22 mm, with a surface that does not slip even on highly polished floors.</li>
              <li><strong>Restaurant Mat</strong> — 3 ft × 3 ft, covers large areas without connectors.</li>
              <li><strong>Honeycomb, Grill and Ring 'O' mats</strong> — smaller formats from 40 × 60 cm.</li>
            </ul>
            <p>Hollow mats suit busy and wet places: entrances, restaurants, kitchens, washrooms and outdoor walkways. Many are modular — ${L('Connector', 'connectors')} join them to cover larger floors.</p>

            <h2>Stud mats: built for cushioning and scraping</h2>
            <p><a href="${P('stud-mats')}">Stud mats</a> are covered with flexible rubber studs that give an acupressure-like cushioning effect and are better at removing mud. The ${L('Taper Edged Stud Mat')} comes in six sizes from 40 × 70 cm to 80 × 140 cm, 1 cm thick, and the range also includes welcome, shoe, square and step mats.</p>
            <p>The ${L('Pin Mat Diamond')} uses flexible rubber pins with a diamond-pattern centre — the pins scrape footwear clean while the textured top adds grip.</p>

            FIGURE

            <h2>Side by side</h2>
            <ul>
              <li><strong>Water:</strong> hollow mats let it drain through; stud mats keep feet above a damp floor but do not drain.</li>
              <li><strong>Mud:</strong> stud and pin mats scrape it off well; hollow mats let loose dirt fall through.</li>
              <li><strong>Comfort:</strong> studs give a cushioning effect; a studded bottom does the same on Universal Pattern hollow mats.</li>
              <li><strong>Large areas:</strong> modular hollow mats with connectors, or <a href="${P('stable-cow-mats')}">interlocking tiles</a>.</li>
            </ul>

            <h2>Which should you choose?</h2>
            <ul>
              <li><strong>Lots of water or spills?</strong> Choose a hollow mat so liquid drains through.</li>
              <li><strong>Muddy footwear?</strong> Stud and pin mats scrape mud off well.</li>
              <li><strong>Steps?</strong> The narrow ${L('Step Mat')} (25 × 75 cm) fits stair treads.</li>
              <li><strong>Standing for long periods?</strong> Look at cushioned stud and anti-fatigue designs.</li>
            </ul>

            <blockquote>Still unsure? Tell us where the mat will go and how the area is used, and we'll recommend a design.</blockquote>`,
    figure: { image: 'products/pin-mat-diamond', alt: 'Rubber pin mat with a diamond-pattern centre', caption: 'Pin and stud mats use flexible rubber studs to scrape footwear clean.' },
  },
  {
    status: 'published',
    slug: 'how-rubber-mats-are-made',
    cat: 'manufacturing', catLabel: 'Manufacturing &amp; Technology',
    title: 'From Raw Rubber to Floor Mat: How Mats Are Made',
    crumb: 'How Rubber Mats Are Made',
    summary: 'Raw materials, mixing, forming, finishing and inspection — the journey of a rubber mat.',
    description: 'How a rubber floor mat is made, from RSS-4 rubber and micro crumb through mixing, sheeting, finishing, thickness inspection and dispatch.',
    image: 'factory/production-line', alt: 'Rubber sheeting machines with stacks of finished rubber mat rolls',
    products: ['Universal Pattern Square Edged', 'Diamond Top Runner', 'Interlocking Coin Mat'],
    body: `
            <p class="t-lead">A rubber mat looks simple, but it passes through several careful stages before it reaches a doorway, stable or kitchen floor. Here is how a mat takes shape at our facility in Eara, Neelamperoor, in Kerala's Alleppey District.</p>

            <h2>1. Raw materials</h2>
            <p>Our mats are made from RSS-4 rubber, hand-searched high-quality micro crumb and internationally branded chemicals. The facility sits about an hour from Kottayam, India's rubber town, close to the materials our mats are made from. Raw materials are stored on site, ready for production.</p>

            <h2>2. Mixing the compound</h2>
            <p>On the rubber mixing mill, rubber and additives are worked together into a uniform compound. Even mixing matters: it means every part of the finished mat behaves the same way underfoot.</p>

            <h2>3. Forming sheets and rolls</h2>
            <p>The sheeting line forms the compound into rubber sheets and rolls. Rolled products such as the ${L('Diamond Top Runner')} can later be cut to length for corridors and walkways.</p>

            FIGURE

            <h2>4. Shaping and finishing</h2>
            <p>In rubber mat manufacturing generally, the pattern — open holes, studs, diamonds or coins — is given to the mat as it is shaped, and the rubber is cured to give it strength and elasticity. Each mat is then finished to its specification: square-edged, taper-edged or interlocking, as on the ${L('Interlocking Coin Mat')}.</p>

            <h2>5. Thickness inspection</h2>
            <p>Finished mats are checked against the order specification, including thickness — the difference between, say, a 16 mm and a 22 mm ${L('Universal Pattern Square Edged', 'Universal Pattern')} mat matters to how it performs.</p>

            <h2>6. Storage, packing and dispatch</h2>
            <p>Approved mats are stored on site as organised stock, then packed and prepared for dispatch to customers in India and overseas. Our facility is about two hours from Cochin seaport and international airport.</p>

            <p>See the equipment and work areas on our <a href="infrastructure.html">Infrastructure</a> page, and how we approach quality on <a href="manufacturing-quality.html">Manufacturing &amp; Quality</a>.</p>`,
    figure: { image: 'factory/rolls-inspection', alt: 'Staff inspecting rubber mats beside rolls of matting', caption: 'Finished mats are checked against the order specification before packing.' },
  },
  {
    status: 'published',
    slug: 'what-makes-a-good-rubber-mat',
    cat: 'quality', catLabel: 'Quality &amp; Standards',
    title: 'What Makes a Good Rubber Mat? Five Things to Check',
    crumb: 'What Makes a Good Mat',
    summary: 'Material, thickness, surface, drainage and cleaning — what to look for before you buy.',
    description: 'Five things to check when buying a rubber floor mat: materials, thickness, surface grip, drainage and ease of cleaning.',
    image: 'factory/rolls-inspection', alt: 'Staff inspecting rubber mats beside rolls of matting',
    products: ['Octagonal Pattern Square Edged', 'Universal Pattern Square Edged', 'Diamond Top Stable Mat'],
    body: `
            <p class="t-lead">Two mats can look alike in a photo and perform very differently on the floor. These five checks help you tell them apart before you order.</p>

            <h2>1. What is it made of?</h2>
            <p>Ask about the raw materials. Our mats use RSS-4 rubber, hand-searched micro crumb and internationally branded chemicals — materials chosen for mats that are durable, flexible, washable and weatherproof. A mat made from poor compound can crack, harden or lose its shape early.</p>

            <h2>2. Is it thick enough for the job?</h2>
            <p>Thickness should match the traffic and the load:</p>
            <ul>
              <li><strong>Home doorways:</strong> a 1 cm <a href="${P('stud-mats')}">stud mat</a> is usually enough.</li>
              <li><strong>Busy entrances and work areas:</strong> heavier hollow mats in 16 mm or 22 mm.</li>
              <li><strong>Livestock:</strong> 17–18 mm <a href="${P('stable-cow-mats')}">stable mats</a>, such as the 4 ft × 6 ft ${L('Diamond Top Stable Mat')}.</li>
              <li><strong>Large heavy-duty floors:</strong> 20–22 mm interlocking tiles.</li>
            </ul>

            <h2>3. Does the surface grip?</h2>
            <p>A textured surface keeps feet — and hooves — steady. The ${L('Octagonal Pattern Square Edged', 'Octagonal Pattern')} mat has a surface finish that does not slip even on highly polished floors, and diamond-top and coin surfaces also give confident footing. Read more in our <a href="blog-slip-resistant-mats.html">slip resistance guide</a>.</p>

            <h2>4. Where does the water go?</h2>
            <p>In wet areas, water should drain through or away from the mat. Open-hole hollow mats let water and dirt fall through; on the ${L('Universal Pattern Square Edged', 'Universal Pattern')}, a studded bottom helps drainage too.</p>

            <h2>5. Is it easy to clean?</h2>
            <p>Good mats trap dirt but release it when cleaned. Rubber mats can be lifted, shaken, swept or hosed down. See our <a href="blog-mat-cleaning-and-maintenance.html">cleaning and maintenance guide</a>.</p>

            <h3>Before you order</h3>
            <ul>
              <li>Confirm the size, thickness and edge type you need.</li>
              <li>Check the colour options — some mats come in more than one colour.</li>
              <li>Ask about quantities and delivery for your location.</li>
            </ul>

            <blockquote>Need specifications for a particular mat? <a href="contact.html#enquiry">Ask our team</a> for sizes, thicknesses and colours.</blockquote>`,
  },
  {
    status: 'published',
    slug: 'industrial-workplace-matting',
    cat: 'applications', catLabel: 'Industry Applications',
    title: 'Rubber Matting for Factories, Warehouses and Workshops',
    crumb: 'Industrial Matting',
    summary: 'Heavy-duty floors, standing comfort and safer walkways — how rubber mats help in industrial workplaces.',
    description: 'How to choose rubber matting for industrial workplaces: heavy-duty interlocking floors, anti-fatigue mats for workstations and runners for walkways.',
    image: 'industries/warehouse', alt: 'Forklift working on a rubber-matted warehouse floor',
    products: ['Interlocking Coin Mat', 'Interlocking Tile Mat', 'Anti-Fatigue Bubble Mat', 'Diamond Top Runner'],
    body: `
            <p class="t-lead">Factories, warehouses and workshops are hard on floors — and on the people who work on them. The right rubber matting can cushion heavy-duty areas, ease long shifts at workstations and give walkways a surer footing.</p>

            <h2>Heavy-duty floor areas</h2>
            <p>Where a large area needs a durable, cushioned rubber floor, interlocking tiles can be laid — and lifted — one tile at a time:</p>
            <ul>
              <li><strong>${L('Interlocking Coin Mat')}</strong> — 1 m × 1 m tiles, 22 mm thick, with a coin design on both sides.</li>
              <li><strong>${L('Interlocking Tile Mat')}</strong> — 50 cm × 50 cm tiles, 20 mm thick, easy to handle and fit around corners and obstacles.</li>
            </ul>
            <p>Interlocking edges join the tiles into a continuous floor of any size, and individual tiles can be replaced if one area wears faster than the rest.</p>

            <h2>Workstations and production lines</h2>
            <p>Standing on a hard floor for a whole shift is tiring. The ${L('Anti-Fatigue Bubble Mat')} has a raised bubble surface that helps reduce strain on feet, legs and back, and is well suited to workstations, counters and production lines. Read more in our <a href="blog-anti-fatigue-mats-guide.html">anti-fatigue mats guide</a>.</p>

            FIGURE

            <h2>Corridors and walkways</h2>
            <p>The ${L('Diamond Top Runner')} is a rubber runner with a diamond-top surface, supplied in rolls that can be cut to length for corridors, walkways and long work areas. Custom colour and logo choices are available.</p>

            <h2>Wet and messy areas</h2>
            <p>Where water, oil or debris reach the floor — wash-down zones, canteens and loading areas — open-hole <a href="${P('hollow-mats')}">hollow mats</a> let liquid and dirt fall through so the walking surface stays cleaner.</p>

            <h2>Planning an industrial floor</h2>
            <ul>
              <li>Map the zones: heavy-duty floor, standing positions, walkways and wet areas.</li>
              <li>Measure each area so tiles and runners can be quantified.</li>
              <li>Decide where mats need to be lifted for cleaning or access.</li>
              <li>Ask about thickness and colour options for each zone.</li>
            </ul>

            <blockquote>Planning a larger floor? Send us the area sizes and how each zone is used, and we'll suggest a combination of mats.</blockquote>`,
    figure: { image: 'products/anti-fatigue-bubble-mat', alt: 'Anti-fatigue rubber mat with a raised bubble surface', caption: 'Raised rubber bubbles cushion feet where people stand for long periods.' },
  },
  {
    status: 'published',
    slug: 'stable-mats-for-livestock',
    cat: 'applications', catLabel: 'Industry Applications',
    title: 'Why Stable Mats Matter for Cattle and Horse Comfort',
    crumb: 'Stable Mats for Livestock',
    summary: 'Rubber stable mats cushion knees, hocks and udders and help keep stables hygienic.',
    description: 'Why rubber stable and cow mats help livestock comfort and hygiene, and how grooved, studded, diamond-top and interlocking stable mats differ.',
    image: 'products/diamond-top-stable-mat', alt: 'Diamond-top rubber stable mat',
    products: ['Diamond Top Stable Mat', 'Stable Mat – Grooved Bottom, Plain Amebic Top', 'Stable Mat – Studded Bottom, Amebic Top', 'Interlocking Stable Mat'],
    body: `
            <p class="t-lead">Bare concrete is hard on animals. Rubber stable mats give cows and horses a cushioned, sure-footed floor and make stables easier to keep clean.</p>

            <h2>Comfort and protection</h2>
            <p>Rubber flooring cushions animals' knees, hocks and udders and helps reduce foot problems compared with bare concrete. A textured top — such as the diamond-top surface — gives confident footing when animals stand, lie down and get up.</p>

            <h2>Hygiene</h2>
            <p>Divine Rubber stable mats are designed to help keep stables hygienic. A smooth or amebic top surface is easy to clean, and the rubber can be washed down regularly.</p>

            <h2>Choosing a stable mat</h2>
            <p>Our <a href="${P('stable-cow-mats')}">stable &amp; cow mats</a> differ mainly in their top surface and underside:</p>
            <ul>
              <li><strong>Grooved bottom, plain amebic top</strong> — grooved underside for stability, smooth top for easy cleaning; 4 ft × 6 ft in 17 mm and 18 mm.</li>
              <li><strong>Studded bottom, amebic top</strong> — studded underside with an amebic top; 4 ft × 6 ft, 18 mm.</li>
              <li><strong>${L('Diamond Top Stable Mat')}</strong> — heavy 4 ft × 6 ft × 17 mm mat with a diamond-top surface, in black.</li>
              <li><strong>Interlocking stable mats</strong> — join into larger continuous stable floors.</li>
            </ul>

            <h2>Planning the stall</h2>
            <ul>
              <li>Measure each stall or standing area; 4 ft × 6 ft mats make it simple to work out quantities.</li>
              <li>For large sheds, consider interlocking mats or ${L('Interlocking Coin Mat', 'interlocking coin tiles')} so the floor is continuous.</li>
              <li>Lay mats on a level, clean base so they sit flat.</li>
              <li>Wash mats down regularly as part of the stable routine.</li>
            </ul>

            <p>Stable mats are also used beyond farms — the same heavy rubber suits industrial floors and gyms. Browse the full <a href="${P('stable-cow-mats')}">stable &amp; cow mats</a> range.</p>`,
  },
  {
    status: 'published',
    slug: 'anti-fatigue-mats-guide',
    cat: 'guides', catLabel: 'Product Guides',
    title: 'Anti-Fatigue Mats: Comfort for People Who Stand at Work',
    crumb: 'Anti-Fatigue Mats',
    summary: 'Where anti-fatigue mats help most, and how to choose one for counters, workstations and production lines.',
    description: 'How anti-fatigue rubber mats reduce strain for people who stand at work, where to use them and how to choose between bubble, stud and hollow designs.',
    image: 'products/anti-fatigue-bubble-mat', alt: 'Anti-fatigue rubber mat with a raised bubble surface',
    products: ['Anti-Fatigue Bubble Mat', 'Rubber Anti-Fatigue Mat', 'Taper Edged Stud Mat'],
    body: `
            <p class="t-lead">Standing on a hard floor for a whole shift is tiring. An anti-fatigue mat puts a cushioned layer between feet and floor, so people can work more comfortably.</p>

            <h2>How they work</h2>
            <p>The ${L('Anti-Fatigue Bubble Mat')} has a raised bubble surface. The rubber bubbles create a cushioned, massaging surface that helps reduce strain on feet, legs and back during long shifts. Stud mats work in a similar way: flexible rubber studs give an acupressure-like cushioning effect.</p>

            <h2>Where they help most</h2>
            <ul>
              <li>Workstations and assembly benches</li>
              <li>Shop, bar and reception counters</li>
              <li>Production lines and packing areas</li>
              <li>Kitchens and food-preparation areas</li>
            </ul>

            <h2>Choosing the right design</h2>
            <ul>
              <li><strong>Dry standing positions:</strong> the Anti-Fatigue Bubble Mat, well suited to workstations, counters and production lines.</li>
              <li><strong>Hotels and commercial areas:</strong> the ${L('Rubber Anti-Fatigue Mat')} measures 1530 × 910 mm and is 14 mm thick.</li>
              <li><strong>Doorways and smaller spots:</strong> a 1 cm ${L('Taper Edged Stud Mat')}, in six sizes from 40 × 70 cm to 80 × 140 cm.</li>
              <li><strong>Wet areas:</strong> an open-hole <a href="${P('hollow-mats')}">hollow mat</a>, so liquid drains away from the standing surface.</li>
            </ul>

            <h2>Placing anti-fatigue mats</h2>
            <ul>
              <li>Cover the whole area where a person stands and moves, not just one spot.</li>
              <li>Make sure edges lie flat so they do not become a trip hazard.</li>
              <li>Keep walkways clear — mats belong at standing positions.</li>
            </ul>

            <h2>Keep it clean</h2>
            <p>Rubber anti-fatigue mats are washable — lift, sweep or wash them regularly so the surface stays comfortable and safe. Our <a href="blog-mat-cleaning-and-maintenance.html">mat care guide</a> has simple routines.</p>`,
  },
  {
    status: 'published',
    slug: 'coir-natural-fibre',
    cat: 'coir-jute', catLabel: 'Coir &amp; Jute',
    title: "Coir: Kerala's Natural Fibre at Your Doorstep",
    crumb: 'Coir Mats',
    summary: 'Why coir is still one of the best door-mat materials — hard-wearing, flexible and bio-degradable.',
    description: 'Why coir door mats work so well: natural, bio-degradable fibre with excellent scrubbing action, from brush mats to coco rubber mats and boucle matting.',
    image: 'industries/home-entrance', alt: 'Coir door mat with rubber border at a modern house entrance',
    products: ['Brush Mat', 'Coco Rubber Mat', 'Coir Matting Boucle', 'Hollander Mat'],
    body: `
            <p class="t-lead">Divine Rubber is based in Alleppey District — about an hour from Alleppey, India's coir town. Coir, the fibre from coconut husks, makes some of the most effective door mats there are.</p>

            <h2>Why coir works at the door</h2>
            <p>Coir mats are hard, flexible and bio-degradable, and they provide excellent scrubbing action — the stiff fibres brush dirt and grit off shoes before it reaches the floor inside.</p>

            <h2>The coir range</h2>
            <ul>
              <li><strong>${L('Brush Mat', 'Brush mats')}</strong> — coir brush mats with excellent scrubbing action.</li>
              <li><strong>${L('Coco Rubber Mat', 'Coco rubber mats')}</strong> — coir with a rubber backing: hard-wearing and elegant.</li>
              <li><strong>${L('Coco Rubber Matting')}</strong> — coir-and-rubber matting for larger areas.</li>
              <li><strong>${L('Coir Matting Boucle')}</strong> — a boucle-weave matting that is flexible, hard-wearing and bio-degradable.</li>
              <li><strong>Woven mats</strong> — creal, hollander, rope-weave and fibre mats in a choice of designs.</li>
            </ul>

            <h2>Where to use coir</h2>
            <p>Coir is at its best at covered entrances — front doors, porches, office and hotel doorways — where it can scrub shoes without sitting in standing water. For exposed, wet entrances, put a rubber <a href="${P('hollow-mats')}">hollow</a> or <a href="${P('stud-mats')}">stud mat</a> outside and coir just inside the door.</p>

            <h2>Caring for coir</h2>
            <ul>
              <li>Shake or beat the mat outdoors to release grit from the fibres.</li>
              <li>Brush or vacuum it regularly.</li>
              <li>Let a wet mat dry fully before using it again.</li>
            </ul>

            <h2>A natural choice</h2>
            <p>Because coir is a natural, bio-degradable fibre, it suits homes and businesses that prefer eco-friendly materials. Browse the <a href="${P('coir-jute')}">coir &amp; jute range</a> or compare materials in <a href="blog-rubber-coir-or-jute.html">Rubber, Coir or Jute</a>.</p>`,
  },
  {
    status: 'published',
    slug: 'jute-mats-and-rugs',
    cat: 'coir-jute', catLabel: 'Coir &amp; Jute',
    title: 'Jute Mats and Rugs for Natural Interiors',
    crumb: 'Jute Mats &amp; Rugs',
    summary: 'Eco-friendly jute loop mats, rugs and hand-spun matting for homes and quiet commercial spaces.',
    description: 'An introduction to eco-friendly jute mats, rugs and hand-spun jute matting, where to use them and how to care for them.',
    image: 'industries/residential-living', alt: 'Bright living room with natural, neutral furnishings',
    products: ['Jute Loop Mat', 'Jute Rugs & Carpets', 'Hand-spun Jute', 'Jute Dot Mattings'],
    body: `
            <p class="t-lead">Jute brings a warm, natural texture to a room. Alongside rubber and coir, Divine Rubber offers a range of eco-friendly jute products for homes and quiet commercial spaces.</p>

            <h2>The jute range</h2>
            <ul>
              <li><strong>${L('Jute Loop Mat', 'Jute loop mats')}</strong> — eco-friendly loop mats, in two designs.</li>
              <li><strong>${L('Jute Rugs & Carpets')}</strong> — for living spaces and bedrooms.</li>
              <li><strong>${L('Hand-spun Jute')}</strong> — hand-spun jute matting.</li>
              <li><strong>${L('Jute Dot Mattings')}</strong> — jute matting with a dot pattern.</li>
            </ul>
            <p>The range also includes short-term erosion-control mats for outdoor ground cover.</p>

            FIGURE

            <h2>Where jute works best</h2>
            <p>Jute is best indoors, in dry areas with light to moderate foot traffic — living rooms, bedrooms, hallways and calm reception areas. It pairs well with natural wood, cotton and linen.</p>
            <p>For wet or busy entrances, pair it with a rubber or coir mat at the door, so the jute further inside stays clean and dry.</p>

            <h2>Choosing a jute mat or rug</h2>
            <ul>
              <li><strong>Size:</strong> measure the space and leave a border of floor around the rug.</li>
              <li><strong>Texture:</strong> loop mats and hand-spun jute give a chunkier texture; dot mattings a finer pattern.</li>
              <li><strong>Traffic:</strong> keep jute away from doorways where grit and water come in.</li>
            </ul>

            <h2>Care</h2>
            <ul>
              <li>Vacuum regularly and keep jute dry.</li>
              <li>Blot spills straight away rather than rubbing them.</li>
            </ul>
            <p>See our <a href="blog-mat-cleaning-and-maintenance.html">mat care guide</a> for more tips, or browse the <a href="${P('coir-jute')}">coir &amp; jute range</a>.</p>`,
    figure: { image: 'about/expertise-jute-products', alt: 'Woven jute rug, partly rolled', caption: 'Jute adds a warm, natural texture to dry indoor spaces.' },
  },
  {
    status: 'published',
    slug: 'slip-resistant-mats',
    cat: 'applications', catLabel: 'Industry Applications',
    title: 'Slip Resistance: Choosing Mats for Wet and Polished Floors',
    crumb: 'Slip-Resistant Mats',
    summary: 'Texture, drainage and the right placement — how mats help reduce slips on wet and polished floors.',
    description: 'How to choose slip-resistant rubber mats for wet, greasy and highly polished floors — surface texture, drainage, placement and upkeep.',
    image: 'home/runners-mat', alt: 'Close-up of a person walking on a textured rubber mat',
    products: ['Octagonal Pattern Square Edged', 'Diamond Top Runner', 'Urinal Mat', 'Step Mat'],
    body: `
            <p class="t-lead">Slips happen where floors are wet, greasy or highly polished. The right mat gives feet something to grip and keeps liquid off the walking surface.</p>

            <h2>Choose a textured surface</h2>
            <p>Texture is the first line of defence. The ${L('Octagonal Pattern Square Edged', 'Octagonal Pattern')} mat has a surface finish that does not slip even on highly polished floors. Diamond-top surfaces — on the ${L('Diamond Top Runner')} and the diamond-top stable mat — and coin surfaces also give confident footing.</p>

            <h2>Keep liquid moving</h2>
            <p>Standing water makes any surface slippery. Open-hole <a href="${P('hollow-mats')}">hollow mats</a> let water drain through, so the surface people walk on stays drier — useful in kitchens, washrooms and outdoor entrances. Read more in our <a href="blog-drainage-mats-for-wet-areas.html">drainage mats guide</a>.</p>

            <h2>Place mats where the risk is</h2>
            <ul>
              <li><strong>Entrances</strong> — where rain and mud come in. Use a scraper mat outside and a drying mat inside.</li>
              <li><strong>Kitchens and food counters</strong> — where water and grease reach the floor.</li>
              <li><strong>Washrooms</strong> — the ${L('Urinal Mat')} is shaped for urinals and helps keep floors clean.</li>
              <li><strong>Steps and ramps</strong> — the narrow ${L('Step Mat')} (25 × 75 cm) fits stair treads.</li>
              <li><strong>Corridors</strong> — a runner cut to length covers the whole walking line.</li>
            </ul>

            FIGURE

            <h2>Make the mat itself safe</h2>
            <ul>
              <li><strong>Weight:</strong> heavier rubber mats stay flat and are less likely to shift.</li>
              <li><strong>Edges:</strong> a taper edge gives a sloped transition from floor to mat.</li>
              <li><strong>Size:</strong> a mat should be big enough that people step on it with both feet, not half on, half off.</li>
            </ul>

            <h2>Keep mats clean and flat</h2>
            <p>A dirty or curled mat can become a hazard itself. Regular cleaning keeps the texture working — see our <a href="blog-mat-cleaning-and-maintenance.html">mat care guide</a>.</p>`,
    figure: { image: 'industries/restaurant-kitchen', alt: 'Rubber anti-slip mats along a restaurant kitchen line', caption: 'Textured, open-hole mats help keep footing in busy, wet kitchens.' },
  },
  {
    status: 'published',
    slug: 'drainage-mats-for-wet-areas',
    cat: 'applications', catLabel: 'Industry Applications',
    title: 'Drainage Mats: Keeping Wet Areas Safe and Clean',
    crumb: 'Drainage Mats',
    summary: 'How open-hole rubber mats let water and dirt drain through in kitchens, washrooms and outdoor areas.',
    description: 'How open-hole drainage mats work and where to use them — kitchens, washrooms, entrances, playgrounds and outdoor areas.',
    image: 'industries/playground', alt: 'Hollow rubber safety matting in a children\'s playground',
    products: ['Universal Pattern Square Edged', 'Restaurant Mat', 'Urinal Mat', 'Connector'],
    body: `
            <p class="t-lead">In wet areas, a solid mat can trap water on top. Drainage mats are designed to let water — and dirt — pass straight through, keeping the walking surface cleaner and drier.</p>

            <h2>How drainage mats work</h2>
            <p>Hollow rubber mats have an open-hole top. Water and dirt fall through the holes instead of collecting on the surface. On the ${L('Universal Pattern Square Edged', 'Universal Pattern')} mat, a studded bottom enhances drainage and cleanliness and adds comfort underfoot.</p>

            <h2>Where to use them</h2>
            <ul>
              <li><strong>Restaurants and kitchens</strong> — the ${L('Restaurant Mat')} (3 ft × 3 ft) covers large areas without connectors.</li>
              <li><strong>Washrooms</strong> — the ${L('Urinal Mat')} is shaped for urinals and helps keep floors clean.</li>
              <li><strong>Entrances and walkways</strong> — hollow mats wipe shoes while rain drains away.</li>
              <li><strong>Playgrounds and outdoor areas</strong> — open-hole matting suits wet, exposed spaces.</li>
            </ul>

            FIGURE

            <h2>Covering larger areas</h2>
            <p>Universal Pattern mats are modular: ${L('Connector', 'connectors')} join them to cover larger floor areas. Sizes run from 60 × 40 cm up to 150 × 100 cm, in 16 mm and 22 mm thickness and in black, terracotta and green. A taper-edged version gives a sloped edge where people walk on and off.</p>

            <h2>Laying drainage mats</h2>
            <ul>
              <li>Lay on a firm, level surface so water can run away underneath.</li>
              <li>Where possible, place mats over or towards a floor drain.</li>
              <li>Leave access for lifting mats to clean the floor below.</li>
            </ul>

            <h2>Cleaning drainage mats</h2>
            <p>Because dirt falls through, drainage mats are easy to maintain: lift the mat, sweep or hose the floor underneath and rinse the mat itself before putting it back.</p>`,
    figure: { image: 'industries/restaurant-kitchen', alt: 'Rubber anti-slip mats along a restaurant kitchen line', caption: 'Open-hole mats let water and food waste drain away in busy kitchens.' },
  },
  {
    status: 'published',
    slug: 'commercial-kitchen-mats',
    cat: 'applications', catLabel: 'Industry Applications',
    title: 'Matting for Commercial Kitchens and Restaurants',
    crumb: 'Kitchen Mats',
    summary: 'Drainage, grip and comfort on long shifts — what a busy kitchen floor needs from its mats.',
    description: 'What commercial kitchens and restaurants need from floor mats: drainage, grip, comfort and easy cleaning — with mat suggestions for each area.',
    image: 'industries/restaurant-kitchen', alt: 'Chefs working on rubber kitchen mats',
    products: ['Restaurant Mat', 'Universal Pattern Square Edged', 'Anti-Fatigue Bubble Mat'],
    body: `
            <p class="t-lead">Kitchen floors deal with water, grease and long hours of standing. The right mats make them safer and more comfortable for the people who work there.</p>

            <h2>What a kitchen mat needs</h2>
            <ul>
              <li><strong>Drainage</strong> — open holes let water and food waste fall through.</li>
              <li><strong>Grip</strong> — a textured surface helps keep footing on wet floors.</li>
              <li><strong>Comfort</strong> — cushioning for staff who stand for whole shifts.</li>
              <li><strong>Easy cleaning</strong> — mats that can be lifted, washed and put back quickly.</li>
            </ul>

            <h2>Mats for each kitchen area</h2>
            <ul>
              <li><strong>Cooking lines and wash-up:</strong> the ${L('Restaurant Mat')} (3 ft × 3 ft) covers large areas without connectors and suits restaurants and kitchens.</li>
              <li><strong>Large or irregular floors:</strong> the ${L('Universal Pattern Square Edged', 'Universal Pattern')} hollow mat combines an open-hole top with a studded bottom for comfort and drainage, and joins with connectors.</li>
              <li><strong>Dry prep areas and counters:</strong> an ${L('Anti-Fatigue Bubble Mat')} reduces strain on feet, legs and back.</li>
              <li><strong>Front of house:</strong> an <a href="blog-detail.html">entrance mat</a> stops rain and grit at the door.</li>
            </ul>

            <h2>Daily care</h2>
            <ul>
              <li>Lift and rinse mats at the end of service.</li>
              <li>Clean the floor underneath, where food waste collects.</li>
              <li>Let mats dry before putting them back.</li>
            </ul>
            <p>More on wet areas in our <a href="blog-drainage-mats-for-wet-areas.html">drainage mats guide</a> and <a href="blog-slip-resistant-mats.html">slip resistance guide</a>.</p>`,
  },
  {
    status: 'published',
    slug: 'mat-cleaning-and-maintenance',
    cat: 'guides', catLabel: 'Product Guides',
    title: 'How to Clean and Maintain Rubber, Coir and Jute Mats',
    crumb: 'Mat Care Guide',
    summary: 'Simple routines that keep rubber, coir and jute mats clean, safe and looking good for longer.',
    description: 'Practical cleaning and maintenance tips for rubber, coir and jute floor mats — daily, weekly and deep-clean routines.',
    image: 'products/ornate-scroll-doormat', alt: 'Rubber door mat with an ornate scroll design at a front door',
    todo: 'General care advice — confirm against any product-specific care instructions',
    products: ['Universal Pattern Square Edged', 'Coco Rubber Mat', 'Jute Rugs & Carpets'],
    body: `
            <p class="t-lead">A clean mat works better and lasts longer. These general routines suit most rubber, coir and jute mats — always follow any care instructions supplied with a specific product.</p>

            <h2>Rubber mats</h2>
            <ul>
              <li>Shake or sweep off loose dirt regularly.</li>
              <li>Lift open-hole mats and sweep or hose the floor underneath.</li>
              <li>Wash with water and a mild detergent, rinse and let the mat dry.</li>
              <li>Lay mats flat so edges don't curl.</li>
            </ul>

            <h2>Coir mats</h2>
            <ul>
              <li>Shake or beat the mat outdoors to release grit from the fibres.</li>
              <li>Brush or vacuum regularly.</li>
              <li>Let wet mats dry fully before using them again.</li>
            </ul>

            <h2>Jute mats and rugs</h2>
            <ul>
              <li>Vacuum regularly and keep jute dry.</li>
              <li>Blot spills straight away rather than rubbing them.</li>
              <li>Use jute indoors; pair it with a rubber or coir mat at wet entrances.</li>
            </ul>

            <h2>A simple routine</h2>
            <ul>
              <li><strong>Daily (busy areas):</strong> shake or sweep entrance and kitchen mats.</li>
              <li><strong>Weekly:</strong> lift mats and clean the floor underneath.</li>
              <li><strong>As needed:</strong> wash rubber mats; brush and air coir; vacuum jute.</li>
            </ul>

            <h2>When to replace a mat</h2>
            <p>Replace a mat when its surface is worn smooth, its edges curl and won't lie flat, or it no longer stays in place — at that point it can become a hazard rather than a help.</p>

            <blockquote>Unsure how to care for a specific mat? <a href="contact.html#enquiry">Ask our team</a>.</blockquote>`,
  },
];

const news = [
  {
    status: 'draft', // launch announcement — publish with the real launch date once the site is live
    file: 'news-detail.html', // original URL kept
    cat: 'company', catLabel: 'Company News',
    title: 'Introducing the New Divine Rubber Website',
    crumb: 'New Website',
    summary: 'A new home for our rubber, coir and jute range — with product pages, a product finder and easier enquiries.',
    description: 'The new Divine Rubber website brings together our rubber, coir and jute floor mats, with product pages, a product finder and easier enquiries.',
    image: 'home/runners-mat', alt: 'Person walking on a textured rubber floor mat',
    body: `
            <p class="t-lead">We've launched a new website to make it easier to explore our floor mats, find the right product and get in touch.</p>

            <h2>What's new</h2>
            <ul>
              <li><strong>A complete catalogue</strong> — our <a href="products.html">products</a> across five families: rubber hollow mats, rubber stud mats, stable &amp; cow mats, coir &amp; jute products, and rag rugs &amp; polypropylene mats.</li>
              <li><strong>Product pages</strong> with photos, key facts and specifications.</li>
              <li><strong>A product finder</strong> that suggests mats from a few quick questions.</li>
              <li><strong>Industry pages</strong> showing where each mat works best.</li>
              <li><strong>Simple enquiries</strong> — ask for sizes, quantities and pricing in one form.</li>
            </ul>

            <h2>Get in touch</h2>
            <p>Have a question about a product or an order? <a href="contact.html#enquiry">Contact our team</a>.</p>`,
  },
  {
    status: 'published',
    slug: 'divine-rubber-since-2002',
    cat: 'company', catLabel: 'Company News',
    title: 'From Eara to Export Markets: Divine Rubber Since 2002',
    crumb: 'Since 2002',
    summary: "How a rubber matting manufacturer in Kerala's Alleppey District supplies homes, businesses, farms and export buyers.",
    description: 'Divine Rubber Products was established in 2002 at Eara, Neelamperoor, in Kerala — close to India\'s rubber town and coir town — and manufactures and exports rubber, coir and jute floor mats.',
    image: 'factory/mat-inspection', alt: 'Production floor with rolls of rubber matting and staff checking a mat',
    products: ['Universal Pattern Square Edged', 'Diamond Top Stable Mat', 'Coco Rubber Mat', 'Jute Loop Mat'],
    body: `
            <p class="t-lead">Divine Rubber Products was established in 2002 at Eara, Neelamperoor, in the Alleppey District of Kerala, South India. Today we manufacture and export rubber, coir and jute floor mats for domestic, industrial, agricultural and special purposes.</p>

            <h2>Rooted in Kerala's rubber and coir belt</h2>
            <p>Our facility is about an hour from Kottayam, India's rubber town, and from Alleppey, its coir town — close to the raw materials our mats are made from — and about two hours from Cochin seaport and international airport.</p>

            <h2>What we make</h2>
            <p>Our range covers five product families:</p>
            <ul>
              <li><a href="${P('hollow-mats')}">Rubber hollow mats</a> — open-hole mats for drainage and entrances.</li>
              <li><a href="${P('stud-mats')}">Rubber stud mats</a> — cushioning, mud-removing stud and pin mats.</li>
              <li><a href="${P('stable-cow-mats')}">Stable &amp; cow mats</a> — heavy mats and interlocking tiles.</li>
              <li><a href="${P('coir-jute')}">Coir &amp; jute products</a> — natural-fibre mats, mattings and rugs.</li>
              <li><a href="${P('rag-rugs-pp')}">Rag rugs &amp; polypropylene mats</a> — for indoor and outdoor use.</li>
            </ul>

            <h2>How we make it</h2>
            <p>Our mats are made from RSS-4 rubber, hand-searched micro crumb and internationally branded chemicals. Combined with up-to-date technology, they produce mats that are durable, flexible, washable, weatherproof and anti-fatigue — at a reasonable price. Connected work areas cover material preparation, production, inspection, storage and dispatch; see our <a href="infrastructure.html">Infrastructure</a> page.</p>

            <h2>Who we supply</h2>
            <p>We supply both the trade and end users — importers, distributors and businesses — and can supply almost every type of rubber matting. Read more <a href="about.html">about us</a>.</p>`,
  },
  {
    status: 'published',
    slug: 'raw-materials-durable-mats',
    cat: 'manufacturing', catLabel: 'Manufacturing',
    title: 'The Raw Materials Behind a Durable Mat',
    crumb: 'Raw Materials',
    summary: 'RSS-4 rubber, hand-searched micro crumb and branded chemicals — what goes into every Divine Rubber mat.',
    description: 'The raw materials used in Divine Rubber mats — RSS-4 rubber, hand-searched micro crumb and internationally branded chemicals — and how they become finished mats.',
    image: 'factory/rubber-mill', alt: 'Two-roll rubber mixing mill',
    products: ['Universal Pattern Square Edged', 'Interlocking Tile Mat', 'Anti-Fatigue Bubble Mat'],
    body: `
            <p class="t-lead">A mat is only as good as what it's made from. Every Divine Rubber mat starts with carefully chosen raw materials.</p>

            <h2>What we use</h2>
            <ul>
              <li><strong>RSS-4 rubber</strong> — ribbed smoked sheet natural rubber.</li>
              <li><strong>Hand-searched, high-quality micro crumb.</strong></li>
              <li><strong>Internationally branded chemicals.</strong></li>
            </ul>
            <p>Our facility sits about an hour from Kottayam, India's rubber town, close to the source of the natural rubber our mats are made from.</p>

            <h2>From materials to mats</h2>
            <p>Raw materials are stored on site, ready for production. On the rubber mixing mill they are worked into a uniform compound, which the sheeting line forms into rubber sheets and rolls. Finished mats are checked against the order specification before they are stored, packed and dispatched.</p>

            <h2>Why it matters</h2>
            <p>Combined with up-to-date technology, these materials produce mats that are durable, flexible, washable, weatherproof and anti-fatigue — at a reasonable price. Read how the stages fit together in <a href="blog-how-rubber-mats-are-made.html">From Raw Rubber to Floor Mat</a>.</p>

            <p>Learn more on our <a href="manufacturing-quality.html">Manufacturing &amp; Quality</a> page.</p>`,
  },
  {
    status: 'published',
    slug: 'spotlight-interlocking-tiles',
    cat: 'products', catLabel: 'Product Spotlight',
    title: 'Product Spotlight: Interlocking Coin and Tile Mats',
    crumb: 'Interlocking Mats',
    summary: 'Heavy rubber tiles that lock together to cover floors of any size — in 1 m and 50 cm formats.',
    description: 'Interlocking Coin Mat (1 m × 1 m × 22 mm) and Interlocking Tile Mat (50 cm × 50 cm × 20 mm) — rubber tiles that join into continuous floors.',
    image: 'products/interlocking-coin-mat', alt: 'Interlocking rubber coin mat tiles',
    products: ['Interlocking Coin Mat', 'Interlocking Tile Mat', 'Interlocking Stable Mat'],
    body: `
            <p class="t-lead">When a large area needs a durable, cushioned rubber floor, interlocking tiles can be laid — and lifted — one tile at a time. Two formats in our range do exactly that.</p>

            <h2>Interlocking Coin Mat</h2>
            <p>Large ${L('Interlocking Coin Mat', '1 m × 1 m interlocking tiles')}, 22 mm thick, with a coin design on both sides. Interlocking edges join the tiles into a continuous floor of any size.</p>

            <h2>Interlocking Tile Mat</h2>
            <p>Compact ${L('Interlocking Tile Mat', '50 cm × 50 cm tiles')}, 20 mm thick, that are easy to handle and fit around corners and obstacles.</p>

            <h2>At a glance</h2>
            <ul>
              <li><strong>Coin Mat:</strong> 1 m × 1 m · 22 mm · coin design both sides · black</li>
              <li><strong>Tile Mat:</strong> 50 cm × 50 cm · 20 mm · interlocking edges · black</li>
            </ul>

            <h2>Where they fit</h2>
            <p>Both formats suit stables and cattle sheds, gyms and fitness areas, and industrial floors. Larger tiles cover open floors quickly; smaller tiles make it easier to work around posts, equipment and corners. For stalls, see also our <a href="${P('stable-cow-mats')}">interlocking stable mats</a>.</p>

            <p>Read more in <a href="blog-industrial-workplace-matting.html">Rubber Matting for Factories, Warehouses and Workshops</a>, or ask us about the best format for your floor.</p>`,
  },
  {
    status: 'published',
    slug: 'coir-and-jute-ranges',
    cat: 'products', catLabel: 'Product Spotlight',
    title: 'Natural Ranges: Coir and Jute from Kerala',
    crumb: 'Coir &amp; Jute Ranges',
    summary: 'Brush mats, coco rubber mats, boucle matting and eco-friendly jute — our natural-fibre ranges.',
    description: 'An overview of Divine Rubber coir and jute products — brush mats, coco rubber mats, boucle matting, woven coir mats and jute mats and rugs.',
    image: 'industries/home-entrance', alt: 'Coir door mat with rubber border at a modern house entrance',
    products: ['Brush Mat', 'Coco Rubber Mat', 'Jute Rugs & Carpets', 'Jute Dot Mattings'],
    body: `
            <p class="t-lead">Alongside rubber matting, Divine Rubber offers natural coir and jute products — made in Alleppey District, about an hour from Alleppey, India's coir town.</p>

            <h2>Coir</h2>
            <p>Hard, flexible and bio-degradable, coir mats provide excellent scrubbing action. The range includes:</p>
            <ul>
              <li>${L('Brush Mat', 'Brush mats')} and ${L('Coco Rubber Mat', 'coco rubber mats')} — coir with a rubber backing, hard-wearing and elegant.</li>
              <li>${L('Coco Rubber Matting')} and ${L('Coir Matting Boucle')} for larger areas.</li>
              <li>Woven creal, hollander, rope-weave and fibre mats.</li>
              <li>Coir fenders.</li>
            </ul>

            <h2>Jute</h2>
            <p>Eco-friendly jute loop mats, jute rugs and carpets, hand-spun jute and jute dot mattings bring a natural texture to interiors. The range also includes short-term erosion-control mats.</p>

            <h2>Choosing between them</h2>
            <p>Coir works hardest at covered entrances, where its stiff fibres scrub shoes clean. Jute is softer and best in dry indoor rooms. Our guide <a href="blog-rubber-coir-or-jute.html">Rubber, Coir or Jute</a> compares all three materials.</p>

            <p>Browse the <a href="${P('coir-jute')}">coir &amp; jute range</a> or read <a href="blog-coir-natural-fibre.html">why coir works so well at the door</a>.</p>`,
  },
  {
    status: 'draft', // no exhibitions confirmed — publish only with verified event details (see header)
    slug: 'exhibitions-and-trade-fairs',
    cat: 'events', catLabel: 'Events',
    title: 'Exhibitions and Trade Fairs: Meet Divine Rubber',
    crumb: 'Exhibitions',
    summary: 'Meet our team at an upcoming exhibition or trade fair.',
    description: 'Divine Rubber exhibition and trade fair participation, and how to arrange a meeting with our team.',
    image: 'industries/hospitality', alt: 'Hotel lobby with a large logo entrance mat',
    todo: 'No exhibitions confirmed yet — add a verified `event` (name, dates, venue, city, purpose, stand) before publishing',
    // event: { name: '', start: 'YYYY-MM-DD', end: 'YYYY-MM-DD', venue: '', city: '', purpose: '', stand: '', url: '' },
    body: `
            <p class="t-lead">We'd like to meet the people who use and sell our mats. At this event our team will present the rubber, coir and jute range and discuss samples, sizes, quantities and delivery.</p>

            <h2>Arrange a meeting</h2>
            <p>Importers, distributors and businesses can <a href="contact.html?type=meeting#enquiry">book a meeting</a> in advance and our team will get back to you.</p>`,
  },
];

// Publication date for the published posts, approved by the user on 2026-10-16
// (the day this content was written for the site). A post's own `date` overrides it.
const PUBLISHED_ON = '2026-10-16';

// Reading time from the text (about 200 words a minute)
for (const post of [...blog, ...news]) {
  if (post.status === 'published' && !post.date) post.date = PUBLISHED_ON;
  const words = post.body.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  post.readMin = Math.max(1, Math.round(words / 200));
}

module.exports = { blog, news };
