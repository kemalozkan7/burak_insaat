const { db, slugify, savePhotos } = require("./db");

const U = (id, w = 1400) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

const tenders = [
  {
    title: "Bellapais Taş Ev Restorasyonu",
    location: "Girne – Çatalköy",
    year: 2024,
    description:
      "İhale ile alınan Bellapais eteklerindeki 1970'lerden kalma taş ev güçlendirilerek restore edildi. Orijinal taş doku korundu; çatı, tesisat ve iç mekân KKTC iklimine uygun hale getirildi.",
    before_image: U("photo-1568605114967-8130f3a36994"),
    after_image: U("photo-1600585154340-be6161a56a0c"),
    photos: [
      { before: U("photo-1568605114967-8130f3a36994"), image: U("photo-1600585154340-be6161a56a0c"), caption: "Restore edilen cephe ve giriş; taş doku korunarak çağdaş doğrama ve aydınlatma eklendi." },
      { before: U("photo-1484154218962-a197022b5858"), image: U("photo-1600210492486-724fe5c67fb0"), caption: "Salon: açık plan, doğal ışık ve yeni zemin kaplaması." },
      { before: U("photo-1556912173-46c336c7fd55"), image: U("photo-1600121848594-d8644e57abab"), caption: "Mutfak ve yemek alanı anahtar teslim yenilendi." }
    ]
  },
  {
    title: "Lapta Köy Evi Dönüşümü",
    location: "Girne – Lapta",
    year: 2025,
    description:
      "Kullanılamaz durumdaki Lapta köy evi ihale sonrası yenilendi. Açık mutfak ve teras eklenerek aile yaşamına uygun 3+1'e dönüştürüldü.",
    before_image: U("photo-1480074568708-e7b720bb3f09"),
    after_image: U("photo-1600596542815-ffad4c1539a9"),
    photos: [
      { before: U("photo-1480074568708-e7b720bb3f09"), image: U("photo-1600596542815-ffad4c1539a9"), caption: "Bahçe ve havuz cephesi restorasyon sonrası." },
      { before: U("photo-1503387762-592deb58ef4e"), image: U("photo-1600566753190-17f0baa2a6c3"), caption: "Üst kat teras ve yatak odası bağlantısı." },
      { before: U("photo-1493809842364-78817add7ffb"), image: U("photo-1600573472592-401b489a3cdc"), caption: "İç mekân: açık mutfak ve oturma alanı." }
    ]
  },
  {
    title: "Alsancak Sahil Evi",
    location: "Girne – Alsancak",
    year: 2023,
    description:
      "Denize yakın bakımsız ev güçlendirildi. Cephe, doğramalar ve peyzaj yenilendi; iç mekânda geniş cam yüzeylerle Girne körfezi öne çıkarıldı.",
    before_image: U("photo-1570129477492-45c003edd2be"),
    after_image: U("photo-1600607687939-ce8a6c25118c"),
    photos: [
      { before: U("photo-1570129477492-45c003edd2be"), image: U("photo-1600607687939-ce8a6c25118c"), caption: "Deniz manzaralı oturma alanı ve geniş cam yüzeyler." },
      { before: U("photo-1449844908441-8829872d2607"), image: U("photo-1512917774080-9991f1c4c750"), caption: "Dış cephe ve peyzaj yenilemesi." },
      { before: U("photo-1416331108676-a22ccb276e35"), image: U("photo-1613490493576-7fde63acd811"), caption: "Özel havuz ve akşam aydınlatması." }
    ]
  },
  {
    title: "Lefkoşa İş Hanı Konuta Çevirme",
    location: "Lefkoşa – Merkez",
    year: 2025,
    description:
      "İhale ile alınan eski iş hanı katları bağımsız dairelere dönüştürüldü. Yangın merdiveni, asansör ve enerji kimliği yeni yapıya uyarlandı.",
    before_image: U("photo-1486406146926-c627a92ad1ab"),
    after_image: U("photo-1460317442991-0ec209397118"),
    photos: [
      { before: U("photo-1486406146926-c627a92ad1ab"), image: U("photo-1460317442991-0ec209397118"), caption: "Konuta çevrilen katların yeni cephe dili." },
      { before: U("photo-1497366216548-37526070297c"), image: U("photo-1545324418-cc1a3fa10c00"), caption: "Daire içi: salon ve mutfak birleşimi." },
      { before: U("photo-1497366811353-6870744d04b2"), image: U("photo-1502672260266-1c1ef2d93688"), caption: "Örnek bağımsız bölüm, teslim standardı." }
    ]
  }
];

const listings = [
  {
    title: "Alsancak Deniz Manzaralı 2+1",
    location: "Girne – Alsancak",
    type: "apartment",
    status: "sale",
    price: 185000,
    currency: "GBP",
    rooms: "2+1",
    area: 98,
    floor: "7 / 12",
    featured: 1,
    image: U("photo-1502672260266-1c1ef2d93688"),
    gallery: [U("photo-1502672260266-1c1ef2d93688"), U("photo-1600210492486-724fe5c67fb0"), U("photo-1600121848594-d8644e57abab")],
    description: "Site içinde, havuz ve otoparklı, tapusu hazır 2+1 daire. İngiltere yatırımcısına uygun."
  },
  {
    title: "Esentepe Özel Havuzlu Villa",
    location: "Girne – Esentepe",
    type: "villa",
    status: "sale",
    price: 690000,
    currency: "GBP",
    rooms: "4+1",
    area: 240,
    floor: "Müstakil",
    featured: 1,
    image: U("photo-1613490493576-7fde63acd811"),
    gallery: [U("photo-1613490493576-7fde63acd811"), U("photo-1600566753190-17f0baa2a6c3")],
    description: "Özel havuz, geniş bahçe ve kapalı garaj. Koçan hazır, anahtar teslim villa."
  },
  {
    title: "Girne Merkez 1+1 Kiralık",
    location: "Girne – Merkez",
    type: "apartment",
    status: "rent",
    price: 18000,
    currency: "TRY",
    rooms: "1+1",
    area: 55,
    floor: "3 / 5",
    featured: 0,
    image: U("photo-1522708323590-d24dbb6b0267"),
    gallery: [U("photo-1522708323590-d24dbb6b0267")],
    description: "Limana yürüme mesafesinde, eşyalı, klimalı kiralık 1+1."
  },
  {
    title: "İskele Long Beach İmarlı Arsa",
    location: "İskele – Long Beach",
    type: "land",
    status: "sale",
    price: 220000,
    currency: "GBP",
    rooms: "Arsa",
    area: 780,
    floor: "—",
    featured: 1,
    image: U("photo-1500382017468-9049fed747ef"),
    gallery: [U("photo-1500382017468-9049fed747ef")],
    description: "Konut imarlı, yol ve altyapısı olan arsa. Villa veya kat karşılığı proje için uygun."
  },
  {
    title: "Çatalköy 3+1 Aile Dairesi",
    location: "Girne – Çatalköy",
    type: "apartment",
    status: "sale",
    price: 245000,
    currency: "GBP",
    rooms: "3+1",
    area: 135,
    floor: "2 / 6",
    featured: 0,
    image: U("photo-1600573472592-401b489a3cdc"),
    gallery: [U("photo-1600573472592-401b489a3cdc"), U("photo-1600585154340-be6161a56a0c")],
    description: "Bellapais'e yakın, güney cepheli aile dairesi. Okul ve sahile kısa mesafe."
  },
  {
    title: "Girne Ziya Rızkı Cadde Üstü Dükkan",
    location: "Girne – Merkez",
    type: "commercial",
    status: "rent",
    price: 45000,
    currency: "TRY",
    rooms: "Dükkan",
    area: 72,
    floor: "Zemin",
    featured: 0,
    image: U("photo-1441986300917-64674bd600d8"),
    gallery: [U("photo-1441986300917-64674bd600d8")],
    description: "Yüksek vitrin cepheli, depolu zemin kat dükkan. Turizm ve perakende için uygun."
  }
];

const projects = [
  {
    slug: "alsancak-park-residence",
    title: "Alsancak Park Residence",
    location: "Girne – Alsancak",
    type: "residence",
    status: "ongoing",
    progress: 68,
    delivery: "2027 – Q2",
    rooms: "1+1 / 3+1",
    area: 95,
    units: 48,
    floors: 12,
    code: "BI-2401",
    featured: 1,
    image: U("photo-1460317442991-0ec209397118"),
    gallery: [U("photo-1460317442991-0ec209397118"), U("photo-1600210492486-724fe5c67fb0"), U("photo-1600121848594-d8644e57abab"), U("photo-1600573472592-401b489a3cdc")],
    summary: "Alsancak sahiline 400 m mesafede yükselen rezidans. Akıllı ev altyapısı, otel konseptli sosyal tesisler ve Girne körfezine bakan kat planlarıyla projenin tanıtımı.",
    features: ["Açık ve kapalı yüzme havuzu", "Fitness, sauna ve buhar odası", "Kapalı otopark ve jeneratör", "7/24 güvenlik", "Akıllı ev otomasyonu", "Çocuk oyun alanı"]
  },
  {
    slug: "esentepe-seaside-villas",
    title: "Esentepe Seaside Villaları",
    location: "Girne – Esentepe",
    type: "villa",
    status: "completed",
    progress: 100,
    delivery: "Teslim edildi",
    rooms: "4+1",
    area: 260,
    units: 8,
    floors: 3,
    code: "BI-2302",
    featured: 1,
    image: U("photo-1512917774080-9991f1c4c750"),
    gallery: [U("photo-1512917774080-9991f1c4c750"), U("photo-1613490493576-7fde63acd811"), U("photo-1600607687939-ce8a6c25118c")],
    summary: "Beşparmak Dağları ve denize bakan 8 müstakil villadan oluşan butik proje. Teslim edilmiş yaşam alanının mimarisi ve sosyal kurgusu burada anlatılır.",
    features: ["Özel yüzme havuzu", "Panoramik deniz manzarası", "Yerden ısıtma", "Özel bahçe", "Kapalı garaj"]
  },
  {
    slug: "gonyeli-life-apartmani",
    title: "Gönyeli Life Apartmanı",
    location: "Lefkoşa – Gönyeli",
    type: "apartment",
    status: "completed",
    progress: 100,
    delivery: "Teslim edildi",
    rooms: "3+1",
    area: 140,
    units: 24,
    floors: 6,
    code: "BI-2201",
    featured: 0,
    image: U("photo-1600566753190-17f0baa2a6c3"),
    gallery: [U("photo-1600566753190-17f0baa2a6c3"), U("photo-1600585154340-be6161a56a0c"), U("photo-1600573472592-401b489a3cdc")],
    summary: "Lefkoşa'ya kısa mesafede, aile yaşamına göre planlanmış 24 bağımsız bölümlü apartman. Tamamlanan projenin yerleşimi ve ortak alanları.",
    features: ["Yüzme havuzu", "Asansör", "Otopark", "Güvenlik", "Peyzajlı bahçe"]
  },
  {
    slug: "magusa-marina-suites",
    title: "Mağusa Marina Suites",
    location: "Gazimağusa – Merkez",
    type: "residence",
    status: "ongoing",
    progress: 35,
    delivery: "2027 – Q4",
    rooms: "1+1 / 2+1",
    area: 62,
    units: 64,
    floors: 9,
    code: "BI-2403",
    featured: 1,
    image: U("photo-1545324418-cc1a3fa10c00"),
    gallery: [U("photo-1545324418-cc1a3fa10c00"), U("photo-1600121848594-d8644e57abab"), U("photo-1600607687939-ce8a6c25118c")],
    summary: "Sur içi ve marinanın yakınında yükselen rezidans. Şantiye aşaması, kat kurgusu ve sosyal alanlar proje tanıtımında yer alır.",
    features: ["Infinity havuz", "Roof-top lounge", "Resepsiyon", "Fitness merkezi", "Marina'ya yürüme mesafesi"]
  },
  {
    slug: "lapta-garden-homes",
    title: "Lapta Garden Homes",
    location: "Girne – Lapta",
    type: "villa",
    status: "ongoing",
    progress: 82,
    delivery: "2026 – Q4",
    rooms: "3+1",
    area: 180,
    units: 12,
    floors: 2,
    code: "BI-2404",
    featured: 0,
    image: U("photo-1564013799919-ab600027ffc6"),
    gallery: [U("photo-1564013799919-ab600027ffc6"), U("photo-1600596542815-ffad4c1539a9")],
    summary: "Lapta'nın yeşil yamaçlarında, geniş bahçeli ikiz villalar. Proje, site düzeni ve teslim takvimiyle tanıtılır.",
    features: ["Ortak havuz", "Özel bahçe", "Kapalı otopark", "Site güvenliği"]
  },
  {
    slug: "catalkoy-panorama-residence",
    title: "Çatalköy Panorama Residence",
    location: "Girne – Çatalköy",
    type: "residence",
    status: "ongoing",
    progress: 52,
    delivery: "2027 – Q1",
    rooms: "2+1 / 3+1",
    area: 88,
    units: 40,
    floors: 10,
    code: "BI-2405",
    featured: 0,
    image: U("photo-1503387762-592deb58ef4e"),
    gallery: [U("photo-1503387762-592deb58ef4e"), U("photo-1600573472592-401b489a3cdc"), U("photo-1600121848594-d8644e57abab")],
    summary: "Beşparmak silueti ve Girne körfezinin aynı balkonda buluştuğu 10 katlı rezidans. İnşaat aşaması ve kat planları.",
    features: ["Açık havuz", "Fitness", "Kapalı otopark", "Güvenlik", "Çocuk oyun alanı", "Roof-top teras"]
  },
  {
    slug: "lefkosa-business-center",
    title: "Lefkoşa Business Center",
    location: "Lefkoşa – Merkez",
    type: "commercial",
    status: "completed",
    progress: 100,
    delivery: "Teslim edildi",
    rooms: "Ofis",
    area: 4200,
    units: 36,
    floors: 8,
    code: "BI-2102",
    featured: 0,
    image: U("photo-1486406146926-c627a92ad1ab"),
    gallery: [U("photo-1486406146926-c627a92ad1ab"), U("photo-1497366216548-37526070297c")],
    summary: "Dereboyu hattına yakın, A+ ofis standartlarında tamamlanmış iş merkezi. Bina kurgusu ve ortak alanlar.",
    features: ["A+ ofis", "Akıllı bina yönetimi", "Kapalı otopark", "Konferans salonu"]
  },
  {
    slug: "girne-prestij-konaklari",
    title: "Girne Prestij Konakları",
    location: "Girne – Merkez",
    type: "apartment",
    status: "completed",
    progress: 100,
    delivery: "Teslim edildi",
    rooms: "2+1",
    area: 110,
    units: 18,
    floors: 5,
    code: "BI-2303",
    featured: 1,
    image: U("photo-1600585154340-be6161a56a0c"),
    gallery: [U("photo-1600585154340-be6161a56a0c"), U("photo-1600210492486-724fe5c67fb0")],
    summary: "Liman ve çarşıya yürüme mesafesinde, yüksek tavanlı 18 dairelik tamamlanmış apartman projesi.",
    features: ["Geniş balkon", "Otopark", "Asansör", "Depo"]
  },
  {
    slug: "iskele-sky-tower",
    title: "İskele Sky Tower",
    location: "İskele – Long Beach",
    type: "residence",
    status: "soon",
    progress: 0,
    delivery: "2028",
    rooms: "1+1 / 4+1",
    area: 70,
    units: 120,
    floors: 22,
    code: "BI-2501",
    featured: 0,
    image: U("photo-1429497419816-9ca5cfb4571a"),
    gallery: [U("photo-1429497419816-9ca5cfb4571a")],
    summary: "Long Beach sahiline hakim, 22 katlı rezidansın konsept tanıtımı. İnşaat henüz başlamadı; ön bilgilendirme dönemi.",
    features: ["Deniz manzarası", "Sosyal tesis", "Ticari alanlar", "Ön bilgilendirme"]
  }
];

const withMap = (row) => ({
  ...row,
  map_query: row.map_query || (row.location ? `${row.location}, KKTC` : "")
});

const insertTender = db.prepare(`
  INSERT INTO tenders (slug, title, location, map_query, year, description, before_image, after_image, published)
  VALUES (@slug, @title, @location, @map_query, @year, @description, @before_image, @after_image, 1)
`);

const insertProject = db.prepare(`
  INSERT INTO projects (slug, title, location, map_query, type, status, progress, delivery, rooms, area, units, floors, code, summary, features, image, gallery, featured, published)
  VALUES (@slug, @title, @location, @map_query, @type, @status, @progress, @delivery, @rooms, @area, @units, @floors, @code, @summary, @features, @image, @gallery, @featured, 1)
`);

const insertListing = db.prepare(`
  INSERT INTO listings (slug, title, location, map_query, type, status, price, currency, rooms, area, floor, description, image, gallery, featured, published)
  VALUES (@slug, @title, @location, @map_query, @type, @status, @price, @currency, @rooms, @area, @floor, @description, @image, @gallery, @featured, 1)
`);

function backfillMaps(table) {
  db.prepare(`UPDATE ${table} SET map_query = location || ', KKTC' WHERE (map_query IS NULL OR map_query = '') AND location IS NOT NULL AND location != ''`).run();
}

const seed = db.transaction(() => {
  const empty = db.prepare("SELECT COUNT(*) AS c FROM tenders").get().c === 0;
  const oldAlanya = db.prepare("SELECT COUNT(*) AS c FROM tenders WHERE location LIKE '%Alanya%'").get().c > 0;
  if (!empty && !oldAlanya && !process.argv.includes("--reset")) {
    tenders.forEach((t) => {
      const row = db.prepare("SELECT id FROM tenders WHERE slug = ?").get(slugify(t.title));
      if (!row) return;
      const photos = db.prepare("SELECT image, before_image FROM tender_photos WHERE tender_id = ?").all(row.id);
      const seedImages = (t.photos || []).map((p) => p.image);
      const matchesSeed = photos.length > 0 && photos.every((p) => seedImages.includes(p.image));
      const missingBefore = photos.some((p) => !p.before_image);
      if (t.photos && (photos.length < 2 || (matchesSeed && missingBefore))) savePhotos(row.id, t.photos);
    });
    if (db.prepare("SELECT COUNT(*) AS c FROM projects").get().c === 0) {
      projects.forEach((p) => insertProject.run({ ...withMap(p), features: JSON.stringify(p.features), gallery: JSON.stringify(p.gallery) }));
    }
    backfillMaps("tenders");
    backfillMaps("projects");
    backfillMaps("listings");
    console.log("Veritabanı KKTC verisi içeriyor; harita konumları kontrol edildi.");
    return;
  }
  db.exec("DELETE FROM tenders; DELETE FROM listings; DELETE FROM projects;");
  tenders.forEach((t) => {
    const info = insertTender.run({ ...withMap(t), slug: slugify(t.title) });
    if (t.photos) savePhotos(info.lastInsertRowid, t.photos);
  });
  projects.forEach((p) => insertProject.run({ ...withMap(p), features: JSON.stringify(p.features), gallery: JSON.stringify(p.gallery) }));
  listings.forEach((l) =>
    insertListing.run({ ...withMap(l), slug: slugify(l.title), gallery: JSON.stringify(l.gallery) })
  );
  console.log(`${tenders.length} ihale, ${projects.length} proje ve ${listings.length} emlak kaydı (KKTC) yazıldı.`);
});

seed();
console.log("Veritabanı hazır: data/burak.db");
