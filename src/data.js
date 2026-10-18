const U = (id, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const company = {
  name: "Burak İnşaat",
  slogan: "Sağlam temeller, değerli yaşamlar.",
  phone: "0548 888 62 42",
  phoneRaw: "05488886242",
  whatsapp: "9054888886242",
  email: "info@burakinsaat.com",
  address: "Ziya Rızkı Caddesi No:12, 99300 Girne / KKTC",
  hours: "Pzt – Cmt: 08:30 – 18:00",
  founded: 2009,
  mapQuery: "Girne Kuzey Kıbrıs",
  social: { instagram: "#", facebook: "#", linkedin: "#", youtube: "#" }
};

/** Click-to-chat for +90 548 888 62 42. wa.me is rejected by the desktop app. */
export function whatsappLink(text) {
  const url = new URL("https://api.whatsapp.com/send");
  url.searchParams.set("phone", company.whatsapp);
  if (text) url.searchParams.set("text", text);
  return url.toString();
}

export const locations = [
  "Girne – Merkez",
  "Girne – Alsancak",
  "Girne – Lapta",
  "Girne – Çatalköy",
  "Girne – Esentepe",
  "Lefkoşa – Merkez",
  "Lefkoşa – Gönyeli",
  "Gazimağusa – Merkez",
  "İskele – Long Beach"
];

export const statusLabels = {
  ongoing: "Devam Eden",
  completed: "Tamamlanan",
  soon: "Yakında"
};

export const typeLabels = {
  residence: "Rezidans",
  villa: "Villa",
  apartment: "Apartman",
  commercial: "Ticari"
};

export const listingStatus = { sale: "Satılık", rent: "Kiralık" };
export const listingTypes = { apartment: "Daire", villa: "Villa", land: "Arsa", commercial: "Ticari" };

export const services = [
  { icon: "building", title: "Konut Projeleri", text: "Arsa geliştirmeden anahtar teslime kadar rezidans, apartman ve villa projeleri.", detail: "Konsept tasarımdan ruhsata, kaba inşaattan ince işçiliğe kadar tüm süreci kendi ekiplerimizle yönetiyoruz. KKTC imar mevzuatına uygun teslim tarihi sözleşmeyle garanti edilir." },
  { icon: "handshake", title: "Kat Karşılığı İnşaat", text: "Arsa sahipleriyle şeffaf, sözleşmeye bağlı ve kazan-kazan modelinde ortaklık.", detail: "Arsanızın imar durumunu ücretsiz analiz ediyor, en yüksek getiriyi sağlayacak proje modelini sunuyoruz. Süreç noter onaylı sözleşme ile güvence altına alınır." },
  { icon: "refresh", title: "Kentsel Dönüşüm", text: "Riskli yapı tespiti, proje geliştirme ve yeni binaya güvenli geçiş danışmanlığı.", detail: "Depreme dayanıklı, enerji verimli yeni yapılar için maliklerle hukuki ve teknik süreçleri yürütüyoruz." },
  { icon: "brush", title: "Tadilat & Dekorasyon", text: "Mutfak, banyo, cephe ve komple iç mekân yenileme çözümleri.", detail: "3D görselleştirme ile başlayan, malzeme seçiminden son temizliğe kadar anahtar teslim yenileme." },
  { icon: "shield", title: "Satış Sonrası & Mülk Yönetimi", text: "Teslim sonrası garanti takibi, kiralama ve aidat yönetimi.", detail: "2 yıl işçilik garantisi, yurt dışı yatırımcı için kiralama yönetimi ve teknik bakım." },
  { icon: "compass", title: "Mimari & Statik Proje", text: "Uzman mimar ve mühendis ekibimizle ruhsata hazır proje çizimi.", detail: "Mimari, statik, mekanik ve elektrik projelerini tek çatı altında hazırlıyor; belediye süreçlerini sizin adınıza takip ediyoruz." }
];

export const process = [
  { step: "01", title: "Keşif & Analiz", text: "Arsa / bina ziyareti, imar ve zemin analizi, ihtiyaç toplantısı." },
  { step: "02", title: "Tasarım & 3D Görsel", text: "Konsept mimari tasarım, 3D görselleştirme ve maliyet planı." },
  { step: "03", title: "Ruhsat & Sözleşme", text: "Belediye ruhsat süreci, noter onaylı sözleşme ve teslim takvimi." },
  { step: "04", title: "İnşaat & Şantiye", text: "Haftalık ilerleme raporu ve fotoğraflı şantiye takibiyle şeffaf üretim." },
  { step: "05", title: "Teslim & Garanti", text: "İskân, anahtar teslimi ve 2 yıl işçilik garantisi." }
];

export const stats = [
  { value: 17, suffix: "+", label: "Yıllık Deneyim" },
  { value: 42, suffix: "", label: "Tamamlanan Proje" },
  { value: 1250, suffix: "+", label: "Teslim Edilen Konut" },
  { value: 186000, suffix: " m²", label: "İnşa Edilen Alan" }
];

export const testimonials = [
  { name: "Ahmet K.", role: "Alsancak Park Residence – Daire Sahibi", text: "İngiltere'den şantiye takip sistemiyle dairemizin her aşamasını izledik. Teslim tarihinde sapma olmadı." },
  { name: "Elif & Murat S.", role: "Esentepe Seaside Villaları", text: "Malzeme kalitesi ve işçilik beklentimizin üzerindeydi. Satış sonrası ekibi hâlâ tek telefonla ulaşılabilir." },
  { name: "Hüseyin D.", role: "Arsa Sahibi – Lapta, Kat Karşılığı", text: "Kat karşılığı sürecinde her şey sözleşmede yazdığı gibi ilerledi. KKTC'de şeffaf çalışan bir firma." }
];

export const team = [
  { name: "Burak Yılmaz", role: "Kurucu & Genel Müdür", img: U("photo-1560250097-0b93528c311a", 600) },
  { name: "Zeynep Aydın", role: "Baş Mimar", img: U("photo-1573496359142-b8d87734a5a2", 600) },
  { name: "Mehmet Kaya", role: "İnşaat Mühendisi / Şantiye Şefi", img: U("photo-1507003211169-0a1dd7228f2d", 600) }
];

export const milestones = [
  { year: "2009", text: "Burak İnşaat, Girne'de kuruldu. İlk apartman projesi teslim edildi." },
  { year: "2013", text: "İlk villa sitesi Alsancak–Lapta hattında; kat karşılığı modeliyle büyüme." },
  { year: "2017", text: "Lefkoşa'da ilk ticari proje: Lefkoşa Business Center." },
  { year: "2021", text: "Dijital şantiye takip sistemi yurt dışı yatırımcılar için açıldı." },
  { year: "2024", text: "1.000. konut teslimi ve İskele Sky Tower ön lansmanı." }
];

export const serviceBullets = [
  ["Ruhsattan iskâna tüm resmi süreç", "Haftalık fotoğraflı ilerleme raporu", "Sözleşmeli teslim tarihi"],
  ["Ücretsiz imar & getiri analizi", "Noter onaylı sözleşme", "Kat malikleri için şeffaf hakediş planı"],
  ["Riskli yapı tespiti (ücretsiz ön inceleme)", "Kira yardımı & taşınma desteği süreç yönetimi", "Depreme dayanıklı yeni yapı"],
  ["3D görselleştirme ile ön izleme", "Markalı malzeme & ustalık garantisi", "Anahtar teslim, temizlik dâhil"],
  ["2 yıl işçilik garantisi", "Kiralama & aidat yönetimi", "Teknik bakım ve arıza hizmeti"],
  ["Mimari + statik + mekanik + elektrik", "Belediye ruhsat takibi", "Enerji kimlik belgesi"]
];

export const serviceImgs = [
  "photo-1541888946425-d81bb19240f5", "photo-1560518883-ce09059eeffa", "photo-1460317442991-0ec209397118",
  "photo-1600210492486-724fe5c67fb0", "photo-1560250097-0b93528c311a", "photo-1503387762-592deb58ef4e"
];

export const fmtPrice = (p) => (p == null ? "Fiyat için arayın" : p.toLocaleString("tr-TR") + " €");
export const fmtMoney = (p, currency = "GBP") => {
  if (p == null) return "Fiyat için arayın";
  const map = { TRY: "₺", EUR: "€", USD: "$", GBP: "£" };
  return p.toLocaleString("tr-TR") + " " + (map[currency] || currency);
};

export const nav = [
  ["/", "Ana Sayfa", "home"],
  ["/projeler", "Projeler", "projects"],
  ["/ihaleler", "İhaleler", "tenders"],
  ["/emlaklar", "Emlaklar", "listings"],
  ["/hizmetler", "Hizmetler", "services"],
  ["/hakkimizda", "Hakkımızda", "about"],
  ["/iletisim", "İletişim", "contact"]
];
