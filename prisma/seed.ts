import { PrismaClient, ServiceCategory } from "@prisma/client";

const prisma = new PrismaClient();

const services = [
  {
    slug: "tugas-praktikum-it",
    name: "Tugas & Praktikum IT",
    tagline: "Modul praktikum, tugas coding, laporan.",
    description:
      "Tugas pemrograman, praktikum basis data, jaringan, sampai laporan resmi dengan format kampus. Dikirim lengkap dengan penjelasan alur kodenya supaya kamu siap kalau ditanya dosen.",
    category: ServiceCategory.AKADEMIK,
    priceFrom: 45000,
    turnaround: "1 sampai 3 hari",
    deliverables: [
      "Source code rapi plus komentar",
      "Laporan sesuai template kampus",
      "Sesi tanya jawab 30 menit",
    ],
    imageSeed: "titipit-praktikum-lab-komputer",
    featured: true,
    sortOrder: 1,
  },
  {
    slug: "skripsi-tugas-akhir",
    name: "Skripsi & Tugas Akhir",
    tagline: "Sistem informasi siap sidang.",
    description:
      "Pendampingan tugas akhir berbasis sistem: perancangan, pembuatan aplikasi, pengujian, sampai bab dokumentasi. Progres dikerjakan per milestone jadi kamu tetap paham isi sistemnya.",
    category: ServiceCategory.AKADEMIK,
    priceFrom: 1450000,
    turnaround: "3 sampai 8 minggu",
    deliverables: [
      "Aplikasi jalan di lokal dan hosting",
      "Diagram UML plus ERD",
      "Draft bab 3 dan bab 4",
      "Simulasi sidang",
    ],
    imageSeed: "titipit-skripsi-meja-kerja",
    featured: true,
    sortOrder: 2,
  },
  {
    slug: "web-aplikasi",
    name: "Web & Aplikasi",
    tagline: "Landing page, dashboard, aplikasi internal.",
    description:
      "Pembuatan website dan aplikasi untuk UMKM, komunitas, atau kebutuhan internal kantor. Stack modern, responsif di HP, dan sudah termasuk deploy ke hosting pilihan kamu.",
    category: ServiceCategory.DEVELOPMENT,
    priceFrom: 750000,
    turnaround: "1 sampai 4 minggu",
    deliverables: [
      "Desain plus implementasi frontend",
      "API dan basis data",
      "Deploy ke hosting kamu",
      "Panduan pemakaian",
    ],
    imageSeed: "titipit-web-development-monitor",
    featured: true,
    sortOrder: 3,
  },
  {
    slug: "bot-automasi",
    name: "Bot & Automasi",
    tagline: "WhatsApp bot, scraper, script kerja.",
    description:
      "Kerjaan berulang yang makan waktu kami ubah jadi script. Bot WhatsApp dan Telegram, scraper data, sinkronisasi spreadsheet, sampai laporan otomatis terjadwal.",
    category: ServiceCategory.DEVELOPMENT,
    priceFrom: 320000,
    turnaround: "3 sampai 10 hari",
    deliverables: [
      "Script atau bot siap pakai",
      "Konfigurasi di server kamu",
      "Log dan penanganan error",
    ],
    imageSeed: "titipit-automasi-terminal",
    featured: false,
    sortOrder: 4,
  },
  {
    slug: "ui-ux-aset-visual",
    name: "UI/UX & Aset Visual",
    tagline: "Mockup Figma, slide, poster akademik.",
    description:
      "Desain antarmuka aplikasi di Figma, presentasi sidang yang enak dibaca, sampai poster dan banner untuk lomba. Semua file sumber diserahkan, bukan cuma hasil ekspor.",
    category: ServiceCategory.DESIGN,
    priceFrom: 195000,
    turnaround: "2 sampai 7 hari",
    deliverables: [
      "File Figma dengan komponen",
      "Ekspor PNG dan PDF",
      "Dua putaran revisi",
    ],
    imageSeed: "titipit-desain-figma-warna",
    featured: false,
    sortOrder: 5,
  },
  {
    slug: "analisis-data",
    name: "Analisis Data & Machine Learning",
    tagline: "Olah data, model, visualisasi.",
    description:
      "Pengolahan dataset, uji statistik, pemodelan klasifikasi dan prediksi, sampai visualisasi yang bisa langsung dipakai di laporan. Notebook diserahkan beserta interpretasi hasilnya.",
    category: ServiceCategory.DATA,
    priceFrom: 385000,
    turnaround: "3 sampai 14 hari",
    deliverables: [
      "Notebook Python terdokumentasi",
      "Grafik siap pakai untuk laporan",
      "Ringkasan interpretasi hasil",
    ],
    imageSeed: "titipit-analisis-data-grafik",
    featured: false,
    sortOrder: 6,
  },
  {
    slug: "server-deploy-jaringan",
    name: "Server, Deploy & Jaringan",
    tagline: "VPS, Docker, konfigurasi jaringan.",
    description:
      "Setup VPS dari nol, deploy aplikasi dengan Docker, pasang domain dan SSL, sampai konfigurasi router dan simulasi topologi untuk tugas jaringan.",
    category: ServiceCategory.INFRA,
    priceFrom: 175000,
    turnaround: "1 sampai 5 hari",
    deliverables: [
      "Server terkonfigurasi plus SSL",
      "Dokumentasi akses dan perintah",
      "Pendampingan saat serah terima",
    ],
    imageSeed: "titipit-server-rak-jaringan",
    featured: false,
    sortOrder: 7,
  },
];

const testimonials = [
  {
    name: "Rifqi Ananta",
    role: "Mahasiswa Sistem Informasi, Semarang",
    quote:
      "Modul praktikum basis data saya dikerjakan dua hari, dan yang bikin lega ada sesi penjelasan alurnya. Waktu asisten nanya, saya bisa jawab.",
    rating: 5,
    avatarSeed: "titipit-orang-rifqi",
    sortOrder: 1,
  },
  {
    name: "Salsabila Hanum",
    role: "Mahasiswa Teknik Informatika, Malang",
    quote:
      "Sistem tugas akhir saya digarap per milestone. Tiap minggu ada progres yang bisa saya tunjukkan ke dosen pembimbing.",
    rating: 5,
    avatarSeed: "titipit-orang-salsabila",
    sortOrder: 2,
  },
  {
    name: "Bagas Prakoso",
    role: "Pemilik Kopi Sudut Lima, Yogyakarta",
    quote:
      "Website pemesanan kedai saya jadi dalam 12 hari, termasuk domain dan hosting. Pesanan masuk lewat web sekarang sekitar 40 per minggu.",
    rating: 5,
    avatarSeed: "titipit-orang-bagas",
    sortOrder: 3,
  },
  {
    name: "Kadek Ayu Laksmi",
    role: "Staf Administrasi, Denpasar",
    quote:
      "Rekap laporan bulanan yang dulu tiga jam sekarang otomatis. Scriptnya jalan sendiri tiap Senin pagi.",
    rating: 5,
    avatarSeed: "titipit-orang-kadek",
    sortOrder: 4,
  },
  {
    name: "Fadhil Kurniawan",
    role: "Mahasiswa Teknik Komputer, Bandung",
    quote:
      "Topologi jaringan dan konfigurasi routernya dijelaskan sampai saya bisa ulangi sendiri di lab. Bukan cuma dikasih file jadi.",
    rating: 4,
    avatarSeed: "titipit-orang-fadhil",
    sortOrder: 5,
  },
  {
    name: "Nadine Tobing",
    role: "Ketua Divisi Lomba, Medan",
    quote:
      "Poster dan slide presentasi tim kami dibenahi dua hari sebelum deadline lomba. File Figma diserahkan jadi kami bisa ubah sendiri.",
    rating: 5,
    avatarSeed: "titipit-orang-nadine",
    sortOrder: 6,
  },
];

const faqs = [
  {
    question: "Apa saja yang saya terima setelah pesanan selesai?",
    answer:
      "Semua file sumber, bukan cuma hasil ekspor. Untuk pekerjaan coding kamu dapat source code beserta cara menjalankannya, dan untuk desain kamu dapat file Figma aslinya. Setiap pesanan juga dapat sesi penjelasan supaya kamu paham isi pekerjaannya.",
    sortOrder: 1,
  },
  {
    question: "Bagaimana cara pembayarannya?",
    answer:
      "Setelah brief kamu direview, kami kirim rincian harga. Pekerjaan di bawah 500 ribu dibayar penuh di awal, di atas itu bisa dua tahap: 50 persen sebagai tanda jadi dan sisanya saat serah terima. Transfer bank, QRIS, dan e-wallet diterima.",
    sortOrder: 2,
  },
  {
    question: "Kalau hasilnya belum sesuai, bisa revisi?",
    answer:
      "Bisa. Setiap paket sudah termasuk dua putaran revisi selama permintaannya masih dalam lingkup brief awal. Revisi di luar brief kami hitung sebagai penambahan pekerjaan dengan harga yang disepakati dulu.",
    sortOrder: 3,
  },
  {
    question: "Berapa lama pesanan saya diproses?",
    answer:
      "Brief masuk direview maksimal 6 jam pada hari kerja. Setelah harga disetujui, waktu pengerjaan mengikuti estimasi di tiap layanan. Untuk deadline mepet ada opsi kilat dengan biaya tambahan 40 persen.",
    sortOrder: 4,
  },
  {
    question: "Data dan identitas saya aman?",
    answer:
      "Kami tidak membagikan nama, kampus, atau isi pekerjaan kamu ke siapa pun, termasuk sebagai portofolio, kecuali kamu mengizinkan lewat pesan tertulis. Akses ke berkas dibatasi hanya untuk pengerjaan.",
    sortOrder: 5,
  },
  {
    question: "Bisa konsultasi dulu sebelum pesan?",
    answer:
      "Bisa dan gratis. Kirim brief singkat lewat formulir atau WhatsApp, kami balas dengan estimasi harga, waktu, dan catatan teknis. Kalau ternyata kebutuhannya tidak cocok dengan kami, kami bilang terus terang.",
    sortOrder: 6,
  },
];

async function main() {
  for (const service of services) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      create: service,
      update: service,
    });
  }
  console.log(`Layanan tersimpan: ${services.length}`);

  await prisma.testimonial.deleteMany();
  await prisma.testimonial.createMany({ data: testimonials });
  console.log(`Testimoni tersimpan: ${testimonials.length}`);

  await prisma.faq.deleteMany();
  await prisma.faq.createMany({ data: faqs });
  console.log(`FAQ tersimpan: ${faqs.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
