/* =========================================================
   BURAK İNŞAAT – Taslak veri katmanı
   Gerçek projede bu veriler bir yönetim panelinden / API'den gelecektir.
   ========================================================= */

window.BI = window.BI || {};

BI.company = {
  name: "Burak İnşaat",
  slogan: "Sağlam temeller, değerli yaşamlar.",
  phone: "+90 500 000 00 00",
  phoneRaw: "+905000000000",
  whatsapp: "905000000000",
  email: "info@burakinsaat.com",
  address: "Örnek Mah. İnşaat Cad. No:1, Lefkoşa / KKTC",
  hours: "Pzt – Cmt: 09:00 – 18:30",
  founded: 2009,
  social: {
    instagram: "#",
    facebook: "#",
    linkedin: "#",
    youtube: "#"
  }
};

BI.locations = [
  "KKTC – Lefkoşa",
  "KKTC – Gazimağusa",
  "KKTC – Girne",
  "KKTC – Güzelyurt",
  "KKTC – İskele",
  "KKTC – Tatlısu",
  "KKTC – Esentepe",
  "KKTC – Bafra"
];

BI.statusLabels = {
  ongoing: "Devam Eden",
  completed: "Tamamlanan",
  sale: "Satılık",
  soon: "Yakında"
};

BI.typeLabels = {
  residence: "Rezidans",
  villa: "Villa",
  apartment: "Apartman",
  commercial: "Ticari"
};

const U = (id, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

BI.projects = [
  {
    id: "golden-park-residence",
    title: "Golden Park Residence",
    location: "KKTC – Girne",
    type: "residence",
    status: "ongoing",
    progress: 68,
    delivery: "2027 – Q2",
    price: 185000,
    rooms: "2+1",
    area: 95,
    units: 48,
    floors: 12,
    code: "BI-2401",
    featured: true,
    image: U("photo-1460317442991-0ec209397118"),
    gallery: [
      U("photo-1460317442991-0ec209397118"),
      U("photo-1600210492486-724fe5c67fb0"),
      U("photo-1600121848594-d8644e57abab"),
      U("photo-1600573472592-401b489a3cdc")
    ],
    summary:
      "Denize 400 m mesafede, akıllı ev altyapısı ve 5 yıldızlı otel konseptinde sosyal tesisleriyle Girne'nin yeni yaşam merkezi.",
    features: [
      "Açık & kapalı yüzme havuzu",
      "Fitness, sauna ve buhar odası",
      "Kapalı otopark & jeneratör",
      "7/24 güvenlik ve kamera sistemi",
      "Akıllı ev otomasyonu",
      "Çocuk oyun alanı"
    ]
  },
  {
    id: "seaside-villas-esentepe",
    title: "Seaside Villaları",
    location: "KKTC – Esentepe",
    type: "villa",
    status: "sale",
    progress: 100,
    delivery: "Teslim edildi",
    price: 690000,
    rooms: "4+1",
    area: 260,
    units: 8,
    floors: 3,
    code: "BI-2302",
    featured: true,
    image: U("photo-1512917774080-9991f1c4c750"),
    gallery: [
      U("photo-1512917774080-9991f1c4c750"),
      U("photo-1613490493576-7fde63acd811"),
      U("photo-1600607687939-ce8a6c25118c"),
      U("photo-1600210492486-724fe5c67fb0")
    ],
    summary:
      "Akdeniz'e ve Beşparmak Dağları'na panoramik manzaralı, özel havuzlu ve bahçeli 8 adet müstakil villadan oluşan butik proje.",
    features: [
      "Özel yüzme havuzu",
      "Panoramik deniz manzarası",
      "Yerden ısıtma",
      "Özel bahçe & barbekü alanı",
      "Kapalı garaj",
      "Akıllı aydınlatma"
    ]
  },
  {
    id: "iskele-life-apartmani",
    title: "İskele Life Apartmanı",
    location: "KKTC – İskele",
    type: "apartment",
    status: "completed",
    progress: 100,
    delivery: "Teslim edildi",
    price: null,
    rooms: "3+1",
    area: 140,
    units: 24,
    floors: 6,
    code: "BI-2201",
    featured: false,
    image: U("photo-1600566753190-17f0baa2a6c3"),
    gallery: [
      U("photo-1600566753190-17f0baa2a6c3"),
      U("photo-1600585154340-be6161a56a0c"),
      U("photo-1600573472592-401b489a3cdc")
    ],
    summary:
      "Şehir merkezine yürüme mesafesinde, aile yaşamına uygun ferah planlı apartman projesi.",
    features: ["Yüzme havuzu", "Asansör", "Otopark", "Güvenlik", "Peyzajlı bahçe"]
  },
  {
    id: "girne-marina-suites",
    title: "Girne Marina Suites",
    location: "KKTC – Girne",
    type: "residence",
    status: "ongoing",
    progress: 35,
    delivery: "2027 – Q4",
    price: 142000,
    rooms: "1+1",
    area: 62,
    units: 64,
    floors: 9,
    code: "BI-2403",
    featured: true,
    image: U("photo-1545324418-cc1a3fa10c00"),
    gallery: [
      U("photo-1545324418-cc1a3fa10c00"),
      U("photo-1600121848594-d8644e57abab"),
      U("photo-1600607687939-ce8a6c25118c")
    ],
    summary:
      "Yatırım odaklı 1+1 ve 2+1 daireler; otel işletmeli kiralama garantisi seçeneğiyle Girne limanına 5 dakika mesafede.",
    features: [
      "Kiralama garantisi seçeneği",
      "Infinity havuz",
      "Roof-top lounge",
      "Resepsiyon & concierge",
      "Fitness merkezi"
    ]
  },
  {
    id: "bafra-garden-homes",
    title: "Bafra Garden Homes",
    location: "KKTC – Bafra",
    type: "villa",
    status: "ongoing",
    progress: 82,
    delivery: "2026 – Q4",
    price: 395000,
    rooms: "3+1",
    area: 180,
    units: 12,
    floors: 2,
    code: "BI-2404",
    featured: false,
    image: U("photo-1564013799919-ab600027ffc6"),
    gallery: [U("photo-1564013799919-ab600027ffc6"), U("photo-1600596542815-ffad4c1539a9")],
    summary:
      "Doğayla iç içe, geniş bahçeli ikiz villalardan oluşan sakin bir yaşam alanı. Bafra turizm bölgesine 2 km mesafe.",
    features: ["Ortak havuz", "Özel bahçe", "Kapalı otopark", "Site güvenliği"]
  },
  {
    id: "gazimağusa-panorama-residence",
    title: "Gazimağusa Panorama Residence",
    location: "KKTC – Gazimağusa",
    type: "residence",
    status: "ongoing",
    progress: 52,
    delivery: "2027 – Q1",
    price: 168000,
    rooms: "2+1",
    area: 88,
    units: 40,
    floors: 10,
    code: "BI-2405",
    featured: false,
    image: U("photo-1503387762-592deb58ef4e"),
    gallery: [U("photo-1503387762-592deb58ef4e"), U("photo-1600573472592-401b489a3cdc"), U("photo-1600121848594-d8644e57abab")],
    summary:
      "Gazimağusa'nın yükselen bölgesinde, tarihi sur ve deniz manzarasını aynı balkonda buluşturan 10 katlı rezidans.",
    features: ["Açık havuz", "Fitness", "Kapalı otopark", "Güvenlik", "Çocuk oyun alanı", "Roof-top teras"]
  },
  {
    id: "lefkosa-business-center",
    title: "Lefkoşa Business Center",
    location: "KKTC – Lefkoşa",
    type: "commercial",
    status: "completed",
    progress: 100,
    delivery: "Teslim edildi",
    price: null,
    rooms: "Ofis",
    area: 4200,
    units: 36,
    floors: 8,
    code: "BI-2102",
    featured: false,
    image: U("photo-1486406146926-c627a92ad1ab"),
    gallery: [U("photo-1486406146926-c627a92ad1ab"), U("photo-1497366216548-37526070297c")],
    summary:
      "A+ ofis standartlarında, LEED uyumlu cephe sistemine sahip modern iş merkezi.",
    features: ["A+ ofis", "Akıllı bina yönetimi", "Kapalı otopark", "Konferans salonu"]
  },
  {
    id: "guzelyurt-prestij-konaklari",
    title: "Güzelyurt Prestij Konakları",
    location: "KKTC – Güzelyurt",
    type: "apartment",
    status: "sale",
    progress: 100,
    delivery: "Hemen teslim",
    price: 245000,
    rooms: "2+1",
    area: 110,
    units: 18,
    floors: 5,
    code: "BI-2303",
    featured: true,
    image: U("photo-1600585154340-be6161a56a0c"),
    gallery: [U("photo-1600585154340-be6161a56a0c"), U("photo-1600210492486-724fe5c67fb0")],
    summary:
      "Güzelyurt'un tarihî merkezine 10 dakika, hemen teslim, yüksek tavanlı ve geniş balkonlu daireler.",
    features: ["Hemen teslim", "Geniş balkon", "Otopark", "Asansör", "Depo"]
  },
  {
    id: "tatlisu-sky-tower",
    title: "Tatlısu Sky Tower",
    location: "KKTC – Tatlısu",
    type: "residence",
    status: "soon",
    progress: 0,
    delivery: "2028",
    price: null,
    rooms: "1+1 / 4+1",
    area: 70,
    units: 120,
    floors: 22,
    code: "BI-2501",
    featured: false,
    image: U("photo-1429497419816-9ca5cfb4571a"),
    gallery: [U("photo-1429497419816-9ca5cfb4571a")],
    summary:
      "Tatlısu sahiline hakim, 22 katlı ikonik rezidans projemiz için ön talep toplanıyor.",
    features: ["Ön talep dönemi", "Deniz manzarası", "Sosyal tesis", "Ticari alanlar"]
  }
];

BI.services = [
  {
    icon: "building",
    title: "Konut Projeleri",
    text: "Arsa geliştirmeden anahtar teslime kadar rezidans, apartman ve villa projeleri.",
    detail:
      "Konsept tasarımdan ruhsata, kaba inşaattan ince işçiliğe kadar tüm süreci kendi ekiplerimizle yönetiyoruz. Her projede zaman planına ve bütçeye sadık kalıyor, teslim tarihini sözleşmeyle garanti ediyoruz."
  },
  {
    icon: "handshake",
    title: "Kat Karşılığı İnşaat",
    text: "Arsa sahipleriyle şeffaf, sözleşmeye bağlı ve kazan-kazan modelinde ortaklık.",
    detail:
      "Arsanızın imar durumunu ücretsiz analiz ediyor, en yüksek getiriyi sağlayacak proje modelini sunuyoruz. Tüm süreç noter onaylı sözleşme ve teslim takvimiyle güvence altına alınır."
  },
  {
    icon: "refresh",
    title: "Kentsel Dönüşüm",
    text: "Riskli yapı tespiti, proje geliştirme ve yeni binaya güvenli geçiş danışmanlığı.",
    detail:
      "Güncel yönetmeliğe uygun, enerji verimli yeni yapılar için kat malikleriyle birlikte tüm hukuki ve teknik süreçleri yürütüyoruz."
  },
  {
    icon: "brush",
    title: "Tadilat & Dekorasyon",
    text: "Mutfak, banyo, cephe ve komple iç mekân yenileme çözümleri.",
    detail:
      "3D görselleştirme ile başlayan, malzeme seçiminden son temizliğe kadar anahtar teslim yenileme hizmeti."
  },
  {
    icon: "shield",
    title: "Satış Sonrası & Mülk Yönetimi",
    text: "Teslim sonrası garanti takibi, kiralama ve aidat yönetimi.",
    detail:
      "Konutunuzu teslim ettikten sonra da yanınızdayız: 2 yıl işçilik garantisi, kiralama yönetimi ve teknik bakım hizmetleri."
  },
  {
    icon: "compass",
    title: "Mimari & Statik Proje",
    text: "Uzman mimar ve mühendis ekibimizle ruhsata hazır proje çizimi.",
    detail:
      "Mimari, statik, mekanik ve elektrik projelerini tek çatı altında hazırlıyor; belediye ve ruhsat süreçlerini sizin adınıza takip ediyoruz."
  }
];

BI.process = [
  { step: "01", title: "Keşif & Analiz", text: "Arsa / bina ziyareti, imar ve zemin analizi, ihtiyaç toplantısı." },
  { step: "02", title: "Tasarım & 3D Görsel", text: "Konsept mimari tasarım, 3D görselleştirme ve maliyet planı." },
  { step: "03", title: "Ruhsat & Sözleşme", text: "Belediye ruhsat süreci, noter onaylı sözleşme ve teslim takvimi." },
  { step: "04", title: "İnşaat & Şantiye", text: "Haftalık ilerleme raporu ve fotoğraflı şantiye takibiyle şeffaf üretim." },
  { step: "05", title: "Teslim & Garanti", text: "İskân, anahtar teslimi ve 2 yıl işçilik garantisi." }
];

BI.stats = [
  { value: 17, suffix: "+", label: "Yıllık Deneyim" },
  { value: 42, suffix: "", label: "Tamamlanan Proje" },
  { value: 1250, suffix: "+", label: "Teslim Edilen Konut" },
  { value: 186000, suffix: " m²", label: "İnşa Edilen Alan" }
];

BI.testimonials = [
  {
    name: "Ahmet K.",
    role: "Golden Park Residence – Daire Sahibi",
    text: "Şantiye takip sistemi sayesinde Almanya'dan bile dairemizin her aşamasını fotoğraflarla izledik. Teslim tarihinde tek gün sapma olmadı."
  },
  {
    name: "Elif & Murat S.",
    role: "Seaside Villaları – Villa Sahibi",
    text: "Malzeme kalitesi ve işçilik beklentimizin üzerindeydi. Satış sonrası ekibi hâlâ tek telefonla ulaşılabilir durumda."
  },
  {
    name: "Hüseyin D.",
    role: "Arsa Sahibi – Kat Karşılığı",
    text: "Kat karşılığı sürecinde her şey sözleşmede yazdığı gibi ilerledi. Şeffaflık konusunda Burak İnşaat'a güvenebilirsiniz."
  }
];

BI.team = [
  { name: "Burak Yılmaz", role: "Kurucu & Genel Müdür", img: U("photo-1560250097-0b93528c311a", 600) },
  { name: "Zeynep Aydın", role: "Baş Mimar", img: U("photo-1573496359142-b8d87734a5a2", 600) },
  { name: "Mehmet Kaya", role: "İnşaat Mühendisi / Şantiye Şefi", img: U("photo-1507003211169-0a1dd7228f2d", 600) }
];

BI.milestones = [
  { year: "2009", text: "Burak İnşaat, Kuzey Kıbrıs'ta kuruldu. İlk apartman projesi Lefkoşa'da teslim edildi." },
  { year: "2013", text: "İlk villa sitesi ve kat karşılığı modeliyle büyüme dönemi." },
  { year: "2017", text: "Lefkoşa merkezde ilk ticari proje: Lefkoşa Business Center." },
  { year: "2021", text: "Dijital şantiye takip sistemi devreye alındı." },
  { year: "2024", text: "1.000. konut teslimi ve 22 katlı Tatlısu Sky Tower ön lansmanı." }
];

BI.fmtPrice = (p) =>
  p == null ? "Fiyat için arayın" : p.toLocaleString("tr-TR") + " €";
