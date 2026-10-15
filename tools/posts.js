/**
 * Blog articles and News & Events stories — the single source for:
 *   blogs.html / news.html listing cards (between <!-- posts:start --> / <!-- posts:end -->)
 *   one detail page per post (blog-*.html, news-*.html)
 * Build: `npm run posts` (tools/build-posts.js), then partials are re-applied.
 *
 * CONTENT RULES (client checklist):
 * - Only facts already published on this site (product catalogue, product pages,
 *   About / Manufacturing pages) or general, non-company-specific advice.
 * - No invented events, launches, figures or dates. Every post is a DRAFT FOR REVIEW:
 *   cards show "Date to be confirmed", pages show "Draft for review" + data-todo until the client approves the
 *   text and sets a publication date (add `date: 'YYYY-MM-DD'` to a post to publish it —
 *   the date then appears on cards and pages).
 *
 * image: base path under assets/images (sizes are found automatically)
 * ai: true when the image is an AI-generated visual (flagged with data-todo)
 */

const P = (c) => `products.html?category=${c}`;

const blog = [
  {
    file: 'blog-detail.html', // original URL kept
    cat: 'guides', catLabel: 'Product Guides',
    title: 'How to Choose the Right Entrance Mat for Your Building',
    crumb: 'Choosing an Entrance Mat',
    summary: "Traffic, weather and floor type all matter. Here's how to match the mat to the doorway.",
    description: 'Traffic, weather, floor type and cleaning all matter when choosing an entrance mat. A practical guide to rubber, coir and polypropylene mats.',
    image: 'industries/retail', alt: 'Shoppers walking across a large entrance mat at a store',
    readMin: 4,
    body: `
            <p class="t-lead">Most of the dirt and moisture inside a building comes in on people's shoes. The right entrance mat stops it at the door — protecting floors, reducing cleaning time and lowering the risk of slips. Here's how to choose one.</p>

            <h2>1. Start with the traffic</h2>
            <p>A home doorway might see a few dozen steps a day; a shop, station or hotel entrance can see thousands. Heavier traffic needs heavier mats. Thick rubber mats — such as hollow mats in 16 mm or 22 mm — stay flat, resist wear and won't creep across the floor.</p>

            <h2>2. Think about the weather</h2>
            <p>Outside the door, mats face rain, mud and sun. Choose a mat that lets water drain away. <a href="${P('hollow-mats')}">Hollow rubber mats</a> have an open-hole design that wipes dirt off shoes and lets it fall through, while their studded bottom improves drainage and keeps the surface cleaner.</p>
            <p>For covered or indoor areas, <a href="${P('rag-rugs-pp')}">polypropylene mats</a> are durable and weatherproof, and suit both inside and outside use.</p>

            FIGURE

            <h2>3. Scrape first, then dry</h2>
            <p>The most effective entrances use more than one mat. A tough scraper mat outside removes grit and mud; a softer mat inside absorbs moisture. Coir mats are a good choice here — hard, flexible and hard-wearing, with excellent scrubbing action. <a href="${P('stud-mats')}">Stud mats</a>, covered with flexible rubber studs, are also effective at removing mud.</p>

            <h2>4. Match the mat to the floor underneath</h2>
            <p>On polished stone or tiles, slipping is the main concern. Look for a textured surface: octagonal-pattern hollow mats, for example, have a surface finish that doesn't slip even on highly polished floors.</p>

            <h2>5. Plan for cleaning</h2>
            <p>A mat only works if it's kept clean. Rubber mats can be lifted, shaken and washed, and open-hole designs make it easy to sweep or hose away trapped dirt.</p>

            <h3>Quick checklist</h3>
            <ul>
              <li>How many people use the entrance each day?</li>
              <li>Is the mat outdoors, under cover or indoors?</li>
              <li>Does water need to drain through the mat?</li>
              <li>What floor surface will the mat sit on?</li>
              <li>What size is the doorway — do you need several mats joined together?</li>
            </ul>

            <blockquote>Not sure which mat fits? Send us the size of your entrance and how it's used — we'll suggest the right option.</blockquote>`,
    figure: { image: 'industries/home-entrance', alt: 'Coir door mat with rubber border at a modern house entrance', caption: 'Natural coir provides excellent scrubbing action at home entrances.' },
  },
  {
    slug: 'hollow-vs-stud-mats',
    cat: 'rubber-products', catLabel: 'Rubber Products',
    title: "Hollow Mats vs Stud Mats: What's the Difference?",
    crumb: 'Hollow vs Stud Mats',
    summary: 'Open holes for drainage or flexible studs for cushioning? How the two main rubber mat families compare.',
    description: 'Hollow rubber mats and stud mats compared — drainage, cushioning, mud removal, sizes and where each works best.',
    image: 'products/stud-surface-closeup', alt: 'Close-up of a studded rubber mat surface',
    readMin: 4,
    body: `
            <p class="t-lead">Rubber mats come in two main families. Both are tough and washable, but they solve different problems — one is built around drainage, the other around cushioning and scraping.</p>

            <h2>Hollow mats: built for drainage</h2>
            <p><a href="${P('hollow-mats')}">Hollow mats</a> have an open-hole top. As people walk across, dirt is wiped off their shoes and falls through the holes, and water drains away instead of pooling on the surface. On the Universal Pattern mat, a studded bottom adds comfort and enhances drainage and cleanliness.</p>
            <p>Hollow mats suit busy and wet places: entrances, restaurants, kitchens, washrooms and outdoor walkways. Many are modular — <a href="${P('hollow-mats')}#product-connector">connectors</a> join them to cover larger floors, while the <a href="${P('hollow-mats')}#product-restaurant-mat">Restaurant Mat</a> covers large areas without connectors.</p>

            <h2>Stud mats: built for cushioning and scraping</h2>
            <p><a href="${P('stud-mats')}">Stud mats</a> are covered with flexible rubber studs that give an acupressure-like cushioning effect and are better at removing mud. The Taper Edged Stud Mat comes in six sizes from 40 × 70 cm to 80 × 140 cm, 1 cm thick, and the range includes welcome, shoe, square and step mats.</p>
            <p>Stud mats work well at doorways, on steps and anywhere people stand, wipe their feet or need a little extra comfort.</p>

            FIGURE

            <h2>Which should you choose?</h2>
            <ul>
              <li><strong>Lots of water or spills?</strong> Choose a hollow mat so liquid drains through.</li>
              <li><strong>Muddy footwear?</strong> Stud and pin mats scrape mud off well.</li>
              <li><strong>Large area to cover?</strong> Modular hollow mats with connectors, or interlocking tiles.</li>
              <li><strong>Standing for long periods?</strong> Look at cushioned stud and anti-fatigue designs.</li>
            </ul>

            <blockquote>Still unsure? Tell us where the mat will go and how the area is used, and we'll recommend a design.</blockquote>`,
    figure: { image: 'products/pin-mat-diamond', alt: 'Rubber pin mat with a diamond-pattern centre', caption: 'Pin and stud mats use flexible rubber studs to scrape footwear clean.' },
  },
  {
    slug: 'how-rubber-mats-are-made',
    cat: 'manufacturing', catLabel: 'Manufacturing &amp; Technology',
    title: 'From Raw Rubber to Floor Mat: How Mats Are Made',
    crumb: 'How Rubber Mats Are Made',
    summary: 'Raw materials, mixing, moulding, finishing and inspection — the journey of a rubber mat.',
    description: 'How a rubber floor mat is made, from RSS-4 rubber and micro crumb through mixing, moulding, finishing and inspection.',
    image: 'factory/production-line', alt: 'Rubber sheeting machines with stacks of finished rubber mat rolls',
    readMin: 4,
    todo: 'Process stages are a standard outline — confirm each step with the production team',
    body: `
            <p class="t-lead">A rubber mat looks simple, but it goes through several careful stages before it reaches a doorway, stable or kitchen floor. Here's an outline of how our mats are made at Eara, Neelamperoor, in Kerala's Alleppey District.</p>

            <h2>1. Raw materials</h2>
            <p>Our mats are made from RSS-4 rubber, hand-searched high-quality micro crumb and other internationally branded chemicals. Choosing the right raw materials is the first step towards a mat that is durable, flexible and weatherproof.</p>

            <h2>2. Compounding and mixing</h2>
            <p>Rubber and additives are blended into a uniform compound on mixing mills, so that every part of the finished mat behaves the same way.</p>

            <h2>3. Moulding and curing</h2>
            <p>The compound is moulded into the mat pattern — open holes, studs, diamonds or coins — and cured, which gives the rubber its strength and elasticity.</p>

            FIGURE

            <h2>4. Trimming and finishing</h2>
            <p>Edges are trimmed and each mat is finished to size, whether square-edged, taper-edged or interlocking.</p>

            <h2>5. Inspection, packing and dispatch</h2>
            <p>Finished mats are checked against the order specification, then packed for domestic delivery or export via Cochin port — about two hours from our facility.</p>

            <p>See more on our <a href="manufacturing-quality.html">Manufacturing &amp; Quality</a> page.</p>`,
    figure: { image: 'factory/rolls-inspection', alt: 'Staff inspecting rubber mats beside rolls of matting', caption: 'Finished mats are inspected before packing.' },
  },
  {
    slug: 'what-makes-a-good-rubber-mat',
    cat: 'quality', catLabel: 'Quality &amp; Standards',
    title: 'What Makes a Good Rubber Mat? Five Things to Check',
    crumb: 'What Makes a Good Mat',
    summary: 'Material, thickness, surface, drainage and cleaning — what to look for before you buy.',
    description: 'Five things to check when buying a rubber floor mat: materials, thickness, surface grip, drainage and ease of cleaning.',
    image: 'factory/rolls-inspection', alt: 'Staff inspecting rubber mats beside rolls of matting',
    readMin: 3,
    body: `
            <p class="t-lead">Two mats can look alike on a website and perform very differently on the floor. These five checks help you tell them apart.</p>

            <h2>1. What is it made of?</h2>
            <p>Ask about the raw materials. Our mats use RSS-4 rubber, hand-searched micro crumb and internationally branded chemicals — materials chosen for mats that are durable, flexible, washable and weatherproof.</p>

            <h2>2. Is it thick enough for the job?</h2>
            <p>Thickness should match the traffic. A 1 cm stud mat suits a home doorway; busy entrances and work areas call for heavier mats, such as hollow mats in 16 mm or 22 mm, or 17–18 mm stable mats for livestock.</p>

            <h2>3. Does the surface grip?</h2>
            <p>A textured surface keeps feet — and hooves — steady. The Octagonal Pattern mat, for example, has a surface finish that does not slip even on highly polished floors.</p>

            <h2>4. Where does the water go?</h2>
            <p>In wet areas, water should drain through or away from the mat. Open-hole hollow mats let water and dirt fall through; a studded underside helps drainage too.</p>

            <h2>5. Is it easy to clean?</h2>
            <p>Good mats trap dirt but release it when cleaned. Rubber mats can be lifted, shaken, swept or hosed down. See our <a href="blog-mat-cleaning-and-maintenance.html">cleaning and maintenance guide</a>.</p>

            <blockquote>Need specifications for a particular mat? <a href="contact.html#enquiry">Ask our team</a> for sizes, thicknesses and colours.</blockquote>`,
  },
  {
    slug: 'stable-mats-for-livestock',
    cat: 'applications', catLabel: 'Industry Applications',
    title: 'Why Stable Mats Matter for Cattle and Horse Comfort',
    crumb: 'Stable Mats for Livestock',
    summary: 'Rubber stable mats cushion knees, hocks and udders and help keep stables hygienic.',
    description: 'Why rubber stable and cow mats help livestock comfort and hygiene, and how grooved, studded and interlocking stable mats differ.',
    image: 'products/diamond-top-stable-mat', alt: 'Diamond-top rubber stable mat',
    readMin: 3,
    body: `
            <p class="t-lead">Bare concrete is hard on animals. Rubber stable mats give cows and horses a cushioned, sure-footed floor and make stables easier to keep clean.</p>

            <h2>Comfort and protection</h2>
            <p>Rubber flooring cushions animals' knees, hocks and udders and helps reduce foot problems compared with bare concrete. A textured top — such as the diamond-top surface — gives confident footing.</p>

            <h2>Hygiene</h2>
            <p>Divine Rubber stable mats are designed to help keep stables hygienic. A smooth or amebic top surface is easy to clean, and the rubber can be washed down regularly.</p>

            <h2>Choosing a stable mat</h2>
            <ul>
              <li><strong>Grooved bottom, plain amebic top</strong> — grooved underside for stability, smooth top for easy cleaning; 4 ft × 6 ft in 17 mm and 18 mm.</li>
              <li><strong>Studded bottom, amebic top</strong> — studded underside; 4 ft × 6 ft, 18 mm.</li>
              <li><strong><a href="product-diamond-top-stable-mat.html">Diamond Top Stable Mat</a></strong> — heavy 4 ft × 6 ft × 17 mm mat with a diamond-top surface.</li>
              <li><strong>Interlocking stable mats</strong> — join into larger continuous stable floors.</li>
            </ul>

            <p>Browse the full <a href="${P('stable-cow-mats')}">stable &amp; cow mats</a> range.</p>`,
  },
  {
    slug: 'anti-fatigue-mats-guide',
    cat: 'guides', catLabel: 'Product Guides',
    title: 'Anti-Fatigue Mats: Comfort for People Who Stand at Work',
    crumb: 'Anti-Fatigue Mats',
    summary: 'Where anti-fatigue mats help most, and how to choose one for counters, workstations and production lines.',
    description: 'How anti-fatigue rubber mats reduce strain for people who stand at work, and where to use them.',
    image: 'products/anti-fatigue-bubble-mat', alt: 'Anti-fatigue rubber mat with a raised bubble surface',
    readMin: 3,
    body: `
            <p class="t-lead">Standing on a hard floor for a whole shift is tiring. An anti-fatigue mat puts a cushioned layer between feet and floor.</p>

            <h2>How they work</h2>
            <p>The <a href="product-anti-fatigue-bubble-mat.html">Anti-Fatigue Bubble Mat</a> has a raised bubble surface. The rubber bubbles create a cushioned, massaging surface that helps reduce strain on feet, legs and back during long shifts. Stud mats work in a similar way: flexible rubber studs give an acupressure-like cushioning effect.</p>

            <h2>Where they help most</h2>
            <ul>
              <li>Workstations and assembly benches</li>
              <li>Shop and reception counters</li>
              <li>Production lines and packing areas</li>
              <li>Kitchens and food-preparation areas</li>
            </ul>

            <h2>Other options</h2>
            <p>For hotels and commercial areas, the <a href="${P('hollow-mats')}#product-rubber-anti-fatigue-mat">Rubber Anti-Fatigue Mat</a> measures 1530 × 910 mm and is 14 mm thick. In wet areas, consider an open-hole design so liquid drains away from the standing surface.</p>

            <h2>Keep it clean</h2>
            <p>Rubber anti-fatigue mats are washable — lift, sweep or wash them regularly so the surface stays comfortable and safe.</p>`,
  },
  {
    slug: 'coir-natural-fibre',
    cat: 'coir-jute', catLabel: 'Coir &amp; Jute',
    title: "Coir: Kerala's Natural Fibre at Your Doorstep",
    crumb: 'Coir Mats',
    summary: 'Why coir is still one of the best door-mat materials — hard-wearing, flexible and bio-degradable.',
    description: 'Why coir door mats work so well: natural, bio-degradable fibre with excellent scrubbing action, from brush mats to coco rubber mats.',
    image: 'industries/home-entrance', alt: 'Coir door mat with rubber border at a modern house entrance',
    readMin: 3,
    body: `
            <p class="t-lead">Divine Rubber is based in Alleppey District — close to Alleppey, India's coir town. Coir, the fibre from coconut husks, has been made into mats here for generations.</p>

            <h2>Why coir works at the door</h2>
            <p>Coir mats are hard, flexible and bio-degradable, and they provide excellent scrubbing action — the stiff fibres brush dirt and grit off shoes before it reaches the floor inside.</p>

            <h2>Choosing a coir mat</h2>
            <ul>
              <li><strong>Brush mats</strong> — for maximum scrubbing action at the door.</li>
              <li><strong>Coco rubber mats</strong> — coir with a rubber backing: hard-wearing and elegant.</li>
              <li><strong>Coir matting boucle</strong> — a flexible, hard-wearing woven matting for larger areas.</li>
              <li><strong>Woven mats</strong> — creal, hollander and rope-weave designs.</li>
            </ul>

            <h2>A natural choice</h2>
            <p>Because coir is a natural, bio-degradable fibre, it is a good fit for homes and businesses that prefer eco-friendly materials. Browse the <a href="${P('coir-jute')}">coir &amp; jute range</a>.</p>`,
  },
  {
    slug: 'jute-mats-and-rugs',
    cat: 'coir-jute', catLabel: 'Coir &amp; Jute',
    title: 'Jute Mats and Rugs for Natural Interiors',
    crumb: 'Jute Mats &amp; Rugs',
    summary: 'Eco-friendly jute loop mats, rugs and hand-spun matting for homes and quiet commercial spaces.',
    description: 'An introduction to eco-friendly jute mats, rugs and hand-spun jute matting, and where to use them.',
    image: 'products/studio/dj002-jute-rugs-and-carpets', ai: true, alt: 'Natural jute rug',
    readMin: 2,
    body: `
            <p class="t-lead">Jute brings a warm, natural texture to a room. Alongside rubber and coir, Divine Rubber offers a range of eco-friendly jute products.</p>

            <h2>The jute range</h2>
            <ul>
              <li><strong>Jute loop mats</strong> — eco-friendly loop mats in two designs.</li>
              <li><strong>Jute rugs &amp; carpets</strong> — for living spaces and bedrooms.</li>
              <li><strong>Hand-spun jute</strong> — hand-spun jute matting.</li>
              <li><strong>Jute dot mattings</strong> — jute matting with a dot pattern.</li>
            </ul>

            <h2>Where jute works best</h2>
            <p>Jute is best indoors, in dry areas with light to moderate foot traffic — living rooms, bedrooms, hallways and calm reception areas. For wet entrances, pair it with a rubber or coir mat at the door.</p>

            <h2>Care</h2>
            <p>Shake or vacuum jute regularly and keep it dry. See our <a href="blog-mat-cleaning-and-maintenance.html">mat care guide</a> for more tips, or browse the <a href="${P('coir-jute')}">coir &amp; jute range</a>.</p>`,
  },
  {
    slug: 'slip-resistant-mats',
    cat: 'applications', catLabel: 'Industry Applications',
    title: 'Slip Resistance: Choosing Mats for Wet and Polished Floors',
    crumb: 'Slip-Resistant Mats',
    summary: 'Texture, drainage and the right placement — how mats help reduce slips on wet and polished floors.',
    description: 'How to choose slip-resistant rubber mats for wet, greasy and highly polished floors.',
    image: 'products/octagonal-pattern-square-edged', alt: 'Octagonal-pattern square-edged rubber mat',
    readMin: 3,
    body: `
            <p class="t-lead">Slips happen where floors are wet, greasy or highly polished. The right mat gives feet something to grip and keeps liquid off the walking surface.</p>

            <h2>Choose a textured surface</h2>
            <p>Texture is the first line of defence. The <a href="${P('hollow-mats')}#product-octagonal-pattern-square-edged">Octagonal Pattern</a> mat has a surface finish that does not slip even on highly polished floors, and diamond-top and coin surfaces also give confident footing.</p>

            <h2>Keep liquid moving</h2>
            <p>Standing water makes any surface slippery. Open-hole <a href="${P('hollow-mats')}">hollow mats</a> let water drain through, so the surface people walk on stays drier — useful in kitchens, washrooms and outdoor entrances.</p>

            <h2>Place mats where the risk is</h2>
            <ul>
              <li>Entrances, where rain and mud come in</li>
              <li>Kitchens and food counters</li>
              <li>Washrooms — for example with a urinal mat</li>
              <li>Steps and ramps — a narrow step mat fits treads</li>
            </ul>

            <h2>Keep mats clean and flat</h2>
            <p>A dirty or curled mat can become a hazard itself. Heavier rubber mats stay flat, and regular cleaning keeps the texture working.</p>`,
  },
  {
    slug: 'drainage-mats-for-wet-areas',
    cat: 'applications', catLabel: 'Industry Applications',
    title: 'Drainage Mats: Keeping Wet Areas Safe and Clean',
    crumb: 'Drainage Mats',
    summary: 'How open-hole rubber mats let water and dirt drain through in kitchens, washrooms and outdoor areas.',
    description: 'How open-hole drainage mats work and where to use them — kitchens, washrooms, entrances and outdoor areas.',
    image: 'industries/playground', alt: 'Hollow rubber safety matting in a children\'s playground',
    readMin: 3,
    body: `
            <p class="t-lead">In wet areas, a solid mat can trap water on top. Drainage mats are designed to let water — and dirt — pass straight through.</p>

            <h2>How drainage mats work</h2>
            <p>Hollow rubber mats have an open-hole top. Water and dirt fall through the holes, and on designs such as the Universal Pattern mat a studded bottom enhances drainage and cleanliness by lifting the mat off the floor.</p>

            <h2>Where to use them</h2>
            <ul>
              <li><strong>Restaurants and kitchens</strong> — the <a href="${P('hollow-mats')}#product-restaurant-mat">Restaurant Mat</a> covers large areas without connectors.</li>
              <li><strong>Washrooms</strong> — the <a href="${P('hollow-mats')}#product-urinal-mat">Urinal Mat</a> is shaped for urinals and helps keep floors clean.</li>
              <li><strong>Entrances and walkways</strong> — hollow mats wipe shoes while rain drains away.</li>
              <li><strong>Outdoor areas</strong> — open-hole matting suits wet, exposed spaces.</li>
            </ul>

            FIGURE

            <h2>Cleaning drainage mats</h2>
            <p>Because dirt falls through, drainage mats are easy to maintain: lift the mat, sweep or hose the floor underneath and rinse the mat itself.</p>`,
    figure: { image: 'industries/restaurant-kitchen', alt: 'Rubber anti-slip mats along a restaurant kitchen line', caption: 'Open-hole mats let water and food waste drain away in busy kitchens.' },
  },
  {
    slug: 'commercial-kitchen-mats',
    cat: 'applications', catLabel: 'Industry Applications',
    title: 'Matting for Commercial Kitchens and Restaurants',
    crumb: 'Kitchen Mats',
    summary: 'Drainage, grip and comfort on long shifts — what a busy kitchen floor needs from its mats.',
    description: 'What commercial kitchens and restaurants need from floor mats: drainage, grip, comfort and easy cleaning.',
    image: 'industries/restaurant-kitchen', alt: 'Chefs working on rubber kitchen mats',
    readMin: 3,
    body: `
            <p class="t-lead">Kitchen floors deal with water, grease and long hours of standing. The right mats make them safer and more comfortable.</p>

            <h2>What a kitchen mat needs</h2>
            <ul>
              <li><strong>Drainage</strong> — open holes let water and food waste fall through.</li>
              <li><strong>Grip</strong> — a textured surface helps keep footing on wet floors.</li>
              <li><strong>Comfort</strong> — cushioning for staff who stand for whole shifts.</li>
              <li><strong>Easy cleaning</strong> — mats that can be lifted, washed and put back quickly.</li>
            </ul>

            <h2>Our suggestions</h2>
            <p>The <a href="${P('hollow-mats')}#product-restaurant-mat">Restaurant Mat</a> (3 ft × 3 ft) covers large areas without connectors and suits restaurants and kitchens. The <a href="product-detail.html">Universal Pattern</a> hollow mat combines an open-hole top with a studded bottom for comfort and drainage, and can be joined with connectors.</p>
            <p>For dry prep areas and counters, an <a href="product-anti-fatigue-bubble-mat.html">anti-fatigue mat</a> reduces strain on feet, legs and back.</p>

            <h2>Daily care</h2>
            <p>Lift and rinse mats at the end of service, clean the floor underneath and let mats dry before putting them back.</p>`,
  },
  {
    slug: 'mat-cleaning-and-maintenance',
    cat: 'guides', catLabel: 'Product Guides',
    title: 'How to Clean and Maintain Rubber, Coir and Jute Mats',
    crumb: 'Mat Care Guide',
    summary: 'Simple routines that keep rubber, coir and jute mats clean, safe and looking good for longer.',
    description: 'Practical cleaning and maintenance tips for rubber, coir and jute floor mats.',
    image: 'home/runners-mat', alt: 'Close-up of a person walking on a textured rubber mat',
    readMin: 3,
    todo: 'General care advice — confirm against any product-specific care instructions',
    body: `
            <p class="t-lead">A clean mat works better and lasts longer. These general routines suit most rubber, coir and jute mats.</p>

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
              <li>Vacuum or brush regularly.</li>
              <li>Let wet mats dry fully before using them again.</li>
            </ul>

            <h2>Jute mats and rugs</h2>
            <ul>
              <li>Vacuum regularly and keep jute dry.</li>
              <li>Blot spills straight away rather than rubbing them.</li>
              <li>Use jute indoors; pair it with a rubber or coir mat at wet entrances.</li>
            </ul>

            <blockquote>Unsure how to care for a specific mat? <a href="contact.html#enquiry">Ask our team</a>.</blockquote>`,
  },
];

const news = [
  {
    file: 'news-detail.html', // original URL kept
    cat: 'company', catLabel: 'Company News',
    title: 'Introducing the New Divine Rubber Website',
    crumb: 'New Website',
    summary: 'A new home for our rubber, coir and jute range — with product pages, a product finder and easier enquiries.',
    description: 'The new Divine Rubber website brings together our rubber, coir and jute floor mats, with product pages, a product finder and easier enquiries.',
    image: 'home/runners-mat', alt: 'Person walking on a textured rubber floor mat',
    readMin: 2,
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
    slug: 'divine-rubber-since-2002',
    cat: 'company', catLabel: 'Company News',
    title: 'From Eara to Export Markets: Divine Rubber Since 2002',
    crumb: 'Since 2002',
    summary: "How a rubber matting unit in Kerala's Alleppey District grew into a supplier for homes, businesses, farms and export buyers.",
    description: 'Divine Rubber Products was established in 2002 at Eara, Neelamperoor, in Kerala — close to India\'s rubber town and coir town.',
    image: 'factory/mat-inspection', alt: 'Production floor with rolls of rubber matting and staff checking a mat',
    readMin: 2,
    body: `
            <p class="t-lead">Divine Rubber Products was established in 2002 at Eara, Neelamperoor, in the Alleppey District of Kerala, South India.</p>

            <h2>Rooted in Kerala's rubber and coir belt</h2>
            <p>Our location is about an hour from Kottayam, India's rubber town, and from Alleppey, its coir town — close to the raw materials our mats are made from — and about two hours from Cochin seaport and international airport.</p>

            <h2>What we make</h2>
            <p>We manufacture and export rubber, coir and jute floor mats for domestic, industrial, agricultural and special purposes, using RSS-4 rubber, hand-searched micro crumb and internationally branded chemicals.</p>

            <h2>Who we supply</h2>
            <p>We supply both the trade and end users — importers, distributors and businesses — and can supply almost every type of rubber matting. Read more <a href="about.html">about us</a>.</p>`,
  },
  {
    slug: 'raw-materials-durable-mats',
    cat: 'manufacturing', catLabel: 'Manufacturing',
    title: 'The Raw Materials Behind a Durable Mat',
    crumb: 'Raw Materials',
    summary: 'RSS-4 rubber, hand-searched micro crumb and branded chemicals — what goes into every Divine Rubber mat.',
    description: 'The raw materials used in Divine Rubber mats: RSS-4 rubber, hand-searched micro crumb and internationally branded chemicals.',
    image: 'factory/rubber-mill', alt: 'Two-roll rubber mixing mill',
    readMin: 2,
    body: `
            <p class="t-lead">A mat is only as good as what it's made from. Every Divine Rubber mat starts with carefully chosen raw materials.</p>

            <h2>What we use</h2>
            <ul>
              <li><strong>RSS-4 rubber</strong> — ribbed smoked sheet natural rubber.</li>
              <li><strong>Hand-searched, high-quality micro crumb.</strong></li>
              <li><strong>Internationally branded chemicals.</strong></li>
            </ul>

            <h2>Why it matters</h2>
            <p>Combined with up-to-date technology, these materials produce mats that are durable, flexible, washable, weatherproof and anti-fatigue — at a reasonable price.</p>

            <p>Learn more on our <a href="manufacturing-quality.html">Manufacturing &amp; Quality</a> page.</p>`,
  },
  {
    slug: 'spotlight-interlocking-tiles',
    cat: 'products', catLabel: 'Product Spotlight',
    title: 'Product Spotlight: Interlocking Coin and Tile Mats',
    crumb: 'Interlocking Mats',
    summary: 'Heavy rubber tiles that lock together to cover floors of any size — in 1 m and 50 cm formats.',
    description: 'Interlocking Coin Mat (1 m × 1 m × 22 mm) and Interlocking Tile Mat (50 cm × 50 cm × 20 mm) — rubber tiles that join into continuous floors.',
    image: 'products/interlocking-coin-mat', alt: 'Interlocking rubber coin mat tiles',
    readMin: 2,
    body: `
            <p class="t-lead">When a large area needs a durable, cushioned rubber floor, interlocking tiles can be laid — and lifted — one tile at a time.</p>

            <h2>Interlocking Coin Mat</h2>
            <p>Large <a href="product-interlocking-coin-mat.html">1 m × 1 m interlocking tiles</a>, 22 mm thick, with a coin design on both sides. Interlocking edges join the tiles into a continuous floor of any size.</p>

            <h2>Interlocking Tile Mat</h2>
            <p>Compact <a href="product-interlocking-tile-mat.html">50 cm × 50 cm tiles</a>, 20 mm thick, that are easy to handle and fit around corners and obstacles.</p>

            <h2>Where they fit</h2>
            <p>Both are tough, washable and give a textured surface for confident footing. Ask us about the best format for your floor.</p>`,
  },
  {
    slug: 'coir-and-jute-ranges',
    cat: 'products', catLabel: 'Product Spotlight',
    title: 'Natural Ranges: Coir and Jute from Kerala',
    crumb: 'Coir &amp; Jute Ranges',
    summary: 'Brush mats, coco rubber mats, boucle matting and eco-friendly jute — our natural-fibre ranges.',
    description: 'An overview of Divine Rubber coir and jute products — brush mats, coco rubber mats, boucle matting and jute mats and rugs.',
    image: 'products/studio/dc002-coco-rubber-mat', ai: true, alt: 'Coir mat with a rubber backing',
    readMin: 2,
    body: `
            <p class="t-lead">Alongside rubber matting, Divine Rubber offers natural coir and jute products — made close to Alleppey, India's coir town.</p>

            <h2>Coir</h2>
            <p>Hard, flexible and bio-degradable, coir mats provide excellent scrubbing action. The range includes brush mats, coco rubber mats (coir with a rubber backing — hard-wearing and elegant), coir matting boucle and woven creal, hollander and rope-weave mats.</p>

            <h2>Jute</h2>
            <p>Eco-friendly jute loop mats, jute rugs and carpets, hand-spun jute and jute dot mattings bring a natural texture to interiors.</p>

            <p>Browse the <a href="${P('coir-jute')}">coir &amp; jute range</a> or read <a href="blog-coir-natural-fibre.html">why coir works so well at the door</a>.</p>`,
  },
  {
    slug: 'exhibitions-and-trade-fairs',
    cat: 'events', catLabel: 'Events',
    title: 'Exhibitions and Trade Fairs: Meet Divine Rubber',
    crumb: 'Exhibitions',
    summary: 'Our exhibition and trade fair dates will be listed here once confirmed. Meanwhile, book a meeting with our team.',
    description: 'Divine Rubber exhibition and trade fair participation, and how to arrange a meeting with our team.',
    image: 'industries/hospitality', alt: 'Hotel lobby with a large logo entrance mat',
    readMin: 1,
    todo: 'No exhibitions confirmed yet — replace with real event details (name, dates, venue, stand) when available',
    aside: 'meeting',
    body: `
            <p class="t-lead">We'd like to meet the people who use and sell our mats. Confirmed exhibitions and trade fairs will be announced on this page with dates, venue and stand details.</p>

            <h2>Arrange a meeting</h2>
            <p>Importers, distributors and businesses can contact us at any time to discuss the range, samples, sizes, quantities and delivery. <a href="contact.html?type=meeting#enquiry">Book a meeting</a> and our team will get back to you.</p>`,
  },
];

// PLACEHOLDER DATES (user request 2026-10-15: "give any date as dummy").
// These are NOT real publication dates — every post is flagged data-todo
// "Placeholder date" until the client sets the real date. Newest first, in card order.
const DUMMY_BLOG = ['2026-10-06', '2026-09-29', '2026-09-22', '2026-09-15', '2026-09-08', '2026-09-01',
  '2026-08-25', '2026-08-18', '2026-08-11', '2026-08-04', '2026-07-28', '2026-07-21'];
const DUMMY_NEWS = ['2026-10-01', '2026-09-17', '2026-09-03', '2026-08-20', '2026-08-06', '2026-07-23'];
blog.forEach((post, i) => { if (!post.date) { post.date = DUMMY_BLOG[i]; post.dummyDate = true; } });
news.forEach((post, i) => { if (!post.date) { post.date = DUMMY_NEWS[i]; post.dummyDate = true; } });

module.exports = { blog, news };

