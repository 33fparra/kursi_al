export interface BlogPost {
  slug: string;
  lang: 'sq' | 'en';
  title: string;
  description: string;
  date: string;
  category: string;
  readMinutes: number;
  content: string;
}

export const BLOG_POSTS: BlogPost[] = [
  // ── Albanian posts ──────────────────────────────────────────────────────────
  {
    slug: 'bankate-me-te-mira-hipoteke-shqiperi-2025',
    lang: 'sq',
    title: 'Cilat banka ofrojnë hipotekën më të lirë në Shqipëri? (2025)',
    description: 'Krahasim i plotë i normave të hipotekës për bankat kryesore shqiptare. Raiffeisen, BKT, OTP dhe Tirana Bank — kush jep kushtet më të mira?',
    date: '2025-06-01',
    category: 'Hipoteka',
    readMinutes: 5,
    content: `
      <p>Zgjedhja e bankës së duhur për hipotekë është një nga vendimet financiare më të rëndësishme të jetës. Norma e interesit ndryshon midis bankave dhe ndikon drejtpërdrejt në shumën totale që do të paguani gjatë dekadave.</p>

      <h2>Bankat kryesore dhe normat e tyre (2025)</h2>
      <p>Bazuar në të dhënat tona të fundit, Raiffeisen Bank Albania ofron normën më konkurruese me <strong>5.50% vjetore</strong>, ndjekur nga BKT (Banka Kombëtare Tregtare) me <strong>5.75%</strong>. OTP Bank Albania është në 5.90%, ndërsa Tirana Bank (Intesa Sanpaolo) dhe Credins Bank ofrojnë 6.00–6.25%.</p>

      <h2>Si të zgjidhni bankën e duhur?</h2>
      <p>Norma e interesit është e rëndësishme, por nuk është e vetmja gjë që duhet të shikoni:</p>
      <ul>
        <li><strong>NKAP (Norma Kombëtare e Kostos)</strong> — kosto efektive totale e huasë, duke përfshirë tarifat administrative</li>
        <li><strong>Fleksibiliteti i ripagimit</strong> — mundësia e parapagimit pa penalitet</li>
        <li><strong>Monedha</strong> — hipoteka në ALL apo EUR? EUR ka norma më të ulëta por rrezik të kursit</li>
        <li><strong>Afati</strong> — 15, 20 apo 25 vjet ndikojnë ndjeshëm në këstit mujor dhe koston totale</li>
      </ul>

      <h2>Këshilla praktike</h2>
      <p>Para se të aplikoni, vizitoni të paktën 3 banka dhe kërkoni oferta me shkrim. Negocioni — shumë banka janë të gatshme të ulin normën ose të heqin tarifa për klientë me profil të mirë financiar. Llogarisni gjithmonë koston totale, jo vetëm këstit mujor.</p>

      <p>Provoni <a href="/albania/hipoteka">kalkulatoren tonë të hipotekës</a> për të krahasuar menjëherë këstit mujore sipas bankës dhe afatit të zgjedhur.</p>
    `,
  },
  {
    slug: 'pagat-mesatare-sipas-profesionit-shqiperi-2025',
    lang: 'sq',
    title: 'Pagat mesatare sipas profesionit në Shqipëri — 2025',
    description: 'Sa fitojnë programuesit, mjekët, avokitët dhe mësuesit në Shqipëri? Të dhëna nga INSTAT mbi pagat bruto dhe neto sipas sektorit.',
    date: '2025-05-15',
    category: 'Pagat',
    readMinutes: 4,
    content: `
      <p>Shqipëria po kalon ndryshime të rëndësishme ekonomike dhe tregun e punës. Pagat ndryshojnë ndjeshëm sipas sektorit, nivelit të arsimit dhe vendndodhjes. Kjo analizë mbështetet në të dhënat e INSTAT-it dhe vëzhgimet e tregut të punës.</p>

      <h2>Profesionet me paga më të larta (2025)</h2>
      <ul>
        <li><strong>Programues / Zhvillues IT</strong>: ~150,000 L/muaj bruto (rreth €1,360)</li>
        <li><strong>Mjek specialist</strong>: ~120,000 L/muaj bruto (rreth €1,090)</li>
        <li><strong>Avokat</strong>: ~110,000 L/muaj bruto (rreth €1,000)</li>
        <li><strong>Menaxher</strong>: ~100,000 L/muaj bruto (rreth €910)</li>
        <li><strong>Inxhinier</strong>: ~95,000 L/muaj bruto (rreth €860)</li>
      </ul>

      <h2>Sektori publik vs privat</h2>
      <p>Mësuesit dhe infermierët — sektorë kryesisht publikë — fitojnë mesatarisht 55,000–65,000 L/muaj bruto. Sektori privat, sidomos IT-ja dhe financat, ofron pagat e larta dhe është sektori me rritjen më të shpejtë në vendin e punës.</p>

      <h2>Tatimi dhe paga neto</h2>
      <p>Sistemi tatimor shqiptar është progresiv: 0% deri 30,000 L, 13% midis 30,001–150,000 L dhe 23% mbi 150,000 L. Shumica e punonjësve me paga mesatare paguajnë rreth 22–25% të pagës bruto si detyrime totale (tatim + kontribute).</p>

      <p>Llogarisni pagën tuaj neto me <a href="/albania/paga">kalkulatoren tonë</a> — futni pagën bruto dhe shihni saktësisht çfarë merrni dhe çfarë paguani.</p>
    `,
  },
  {
    slug: 'wise-ose-remitly-kush-eshte-me-i-lire-shqiperi',
    lang: 'sq',
    title: 'Wise ose Remitly: Cili është më i lirë për dërgesa drejt Shqipërisë?',
    description: 'Krahasim i detajuar midis Wise dhe Remitly për dërgimin e parave drejt Shqipërisë. Komisione, normat e këmbimit dhe shpejtësia e transferimit.',
    date: '2025-04-20',
    category: 'Remitancat',
    readMinutes: 4,
    content: `
      <p>Miliona shqiptarë të diasporës dërgojnë para çdo muaj drejt familjes. Zgjedhja e shërbimit të duhur mund t'ju kursejë dhjetëra euro çdo muaj.</p>

      <h2>Krahasimi kryesor: Wise vs Remitly</h2>
      <p><strong>Wise (ish-TransferWise)</strong> është zakonisht opsioni me koston më të ulët. Ai përdor kursin real të tregut (kursin mesatar ndërkombëtar) dhe merr komisione 0.5–1.5% sipas shumës. Nuk ka tarifa të fshehura — çfarë shihni është çfarë paguani.</p>

      <p><strong>Remitly</strong> ofron dy opsione: <em>Economy</em> (me kurs pak më të ulët por pa komision të dukshëm) dhe <em>Express</em> (me komision fiks por transferim i menjëhershëm). Për shuma të mëdha, Economy mund të jetë pak më e shtrenjtë se Wise.</p>

      <h2>Bankat tradicionale: shmangi nëse mundesh</h2>
      <p>Bankat tradicionale aplikojnë zakonisht spread 3–5% mbi kursin e tregut, plus tarifa fikse. Për 1,000 EUR, kjo mund të thotë 30–50 EUR humbje krahasuar me Wise — çdo muaj.</p>

      <h2>Rekomandimi ynë</h2>
      <p>Për shumat e zakonshme (100–2,000 EUR), <strong>Wise është opsioni i parë</strong>. Për transferime urgjente ose shuma shumë të vogla, Remitly Express mund të ketë kuptim. Gjithmonë krahasoni para se të dërgoni.</p>

      <p>Provoni <a href="/remitanca">kalkulatoren tonë të remitancave</a> — llogaritni saktësisht sa merr familja juaj me secilin ofrues.</p>
    `,
  },

  // ── English posts ────────────────────────────────────────────────────────────
  {
    slug: 'best-mortgage-rates-albania-2025',
    lang: 'en',
    title: 'Best Mortgage Rates in Albania in 2025 — Bank Comparison',
    description: 'A complete comparison of mortgage rates from Albania\'s main banks: Raiffeisen, BKT, OTP, Tirana Bank, Credins and ProCredit. Which bank offers the best deal?',
    date: '2025-06-01',
    category: 'Mortgage',
    readMinutes: 5,
    content: `
      <p>Choosing the right bank for a mortgage in Albania is one of the most important financial decisions you'll make. Interest rate differences between banks directly affect the total amount you'll pay over the coming decades.</p>

      <h2>Main banks and their current rates (2025)</h2>
      <p>Based on our latest data, <strong>Raiffeisen Bank Albania</strong> offers the most competitive rate at <strong>5.50% per year</strong>, followed by BKT (Banka Kombëtare Tregtare) at <strong>5.75%</strong>. OTP Bank Albania sits at 5.90%, while Tirana Bank (Intesa Sanpaolo) and Credins Bank offer 6.00–6.25%.</p>

      <h2>What to look for beyond the rate</h2>
      <p>The interest rate is important, but not the only factor:</p>
      <ul>
        <li><strong>APR (Annual Percentage Rate)</strong> — the true total cost including administrative fees</li>
        <li><strong>Repayment flexibility</strong> — the ability to make early payments without penalties</li>
        <li><strong>Currency</strong> — ALL or EUR? EUR mortgages typically have lower rates but carry exchange rate risk</li>
        <li><strong>Term</strong> — 15, 20 or 25 years significantly impact monthly payments and total cost</li>
      </ul>

      <h2>Practical tips</h2>
      <p>Before applying, visit at least 3 banks and request written offers. Negotiate — many banks are willing to reduce rates or waive fees for clients with strong financial profiles. Always calculate total cost, not just the monthly payment.</p>

      <p>Use our <a href="/en/albania/mortgage">mortgage calculator</a> to instantly compare monthly payments by bank and term.</p>
    `,
  },
  {
    slug: 'albania-vs-kosovo-cost-of-living-2025',
    lang: 'en',
    title: 'Albania vs Kosovo: Cost of Living and Salaries Compared (2025)',
    description: 'A side-by-side comparison of wages, banking, housing costs and purchasing power between Albania and Kosovo. Which country is more affordable to live in?',
    date: '2025-05-10',
    category: 'Comparison',
    readMinutes: 6,
    content: `
      <p>Albania and Kosovo share language and deep cultural ties, but their economic realities differ significantly. Whether you're considering relocation, investment or just curious about the differences, this comparison covers the key financial metrics.</p>

      <h2>Minimum wages</h2>
      <p><strong>Albania:</strong> 45,000 ALL/month (~€410). <strong>Kosovo:</strong> €400/month. On paper they're similar, but Kosovo's wage is in EUR, avoiding exchange rate uncertainty.</p>

      <h2>Average salaries by sector</h2>
      <p>Kosovo's IT and professional salaries tend to be slightly higher in EUR terms. An IT developer earns ~€1,500/month in Kosovo vs ~€1,360/month (150,000 L) in Albania. However, Albania's public sector often pays less in relative terms.</p>

      <h2>Mortgage rates</h2>
      <p>Kosovo's mortgage rates (4.5–5.5%) are slightly lower than Albania's (5.5–6.5%), partly because Kosovo uses the Euro, which reduces currency risk for banks. Both offer terms up to 30 years.</p>

      <h2>Tax systems</h2>
      <p>Both countries have progressive income tax. Albania's system goes from 0% to 23%. Kosovo's system is simpler with rates from 0% to 10%, though Kosovo employees also pay 5% pension contributions. Overall, Kosovo workers keep a higher percentage of their gross salary.</p>

      <h2>Conclusion</h2>
      <p>For pure financial efficiency, Kosovo has a slight edge: lower mortgage rates, simpler tax system and Euro stability. Albania, however, is a larger market with more economic momentum and EU candidate status potentially unlocking growth in the coming years.</p>

      <p>Explore the tools: <a href="/en/albania/">Albania financial tools</a> · <a href="/en/kosova/">Kosovo financial tools</a></p>
    `,
  },
];

export function getPostsByLang(lang: 'sq' | 'en'): BlogPost[] {
  return BLOG_POSTS.filter(p => p.lang === lang);
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find(p => p.slug === slug);
}
