// CATATAN: teks di file ini harus sama dengan blok FAQPage (JSON-LD) di index.html.
export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Apa beda bunga flat dan bunga efektif?",
    answer:
      "Bunga flat dihitung dari pokok pinjaman awal dan nilainya sama setiap bulan sepanjang tenor. Bunga efektif (anuitas) dihitung dari sisa pokok yang terus menurun, sehingga untuk angka bunga yang sama total bunganya jauh lebih kecil. Karena itu bunga flat tidak bisa dibandingkan langsung dengan bunga efektif. Contohnya, pinjaman Rp100 juta selama 4 tahun dengan bunga flat 9% per tahun membayar total bunga Rp36 juta dan setara dengan bunga efektif sekitar 16% per tahun, sedangkan bunga efektif 9% hanya membayar total bunga sekitar Rp19,4 juta.",
  },
  {
    question: "Bagaimana cara menghitung cicilan kredit dengan bunga flat?",
    answer:
      "Cicilan per bulan = (pokok pinjaman + pokok pinjaman × bunga per tahun × lama pinjaman dalam tahun) ÷ jumlah bulan tenor. Contoh: pinjaman Rp100 juta, bunga flat 9% per tahun, tenor 4 tahun, maka cicilannya (Rp100 juta + Rp100 juta × 9% × 4) ÷ 48 = Rp2.833.333 per bulan.",
  },
  {
    question: "Bagaimana cara menghitung cicilan dengan bunga efektif (anuitas)?",
    answer:
      "Cicilan per bulan = P × r ÷ (1 − (1 + r)^−n), dengan P pokok pinjaman, r bunga per bulan (bunga tahunan ÷ 12), dan n jumlah bulan tenor. Cicilan tetap sama setiap bulan, tetapi porsi bunga mengecil dan porsi pokok membesar seiring waktu. Contoh: pinjaman Rp100 juta, bunga efektif 12% per tahun, tenor 4 tahun, cicilannya sekitar Rp2.633.384 per bulan.",
  },
  {
    question: "Berapa DP minimal untuk kredit kendaraan bermotor?",
    answer:
      "Besar DP ditentukan oleh bank atau perusahaan pembiayaan dan kebijakan yang berlaku, tergantung jenis kendaraan, profil nasabah, dan promo yang berjalan. Pada kalkulator ini Anda bebas mengatur persentase DP untuk melihat pengaruhnya terhadap cicilan, lalu pastikan angka sebenarnya dengan lembaga pembiayaan.",
  },
  {
    question: "Apa itu bunga fixed dan floating pada KPR?",
    answer:
      "Bunga fixed tetap selama periode tertentu, umumnya 1 sampai 5 tahun pertama, sehingga cicilan stabil. Setelah masa fixed berakhir, bunga beralih ke floating yang mengikuti suku bunga pasar dan kebijakan bank, sehingga cicilan bisa naik atau turun. Di tab KPR, Anda dapat mengatur lama masa fixed dan bunga floating setelahnya. Bila bunga floating dikosongkan, kalkulator memakai estimasi BI-Rate ditambah spread tertentu.",
  },
  {
    question: "Kapan refinancing kredit menguntungkan?",
    answer:
      "Refinancing menguntungkan bila penghematan bunga lebih besar daripada biaya yang timbul, yaitu pinalti pelunasan, selisih bunga flat dan efektif pada pinjaman lama, serta biaya admin atau provisi pinjaman baru. Bandingkan bunga dalam ukuran yang sama (bunga efektif setara) dan waspadai tenor baru yang lebih panjang, karena angsuran turun tetapi total bunga bisa naik. Tab Refinancing menghitung selisih tersebut untuk Anda.",
  },
  {
    question: "Berapa rasio cicilan yang aman terhadap penghasilan?",
    answer:
      "Pedoman umum, total cicilan tidak lebih dari 30% penghasilan bersih bulanan. Kalkulator ini menampilkan perkiraan penghasilan minimal agar rasio cicilan tetap di 30%.",
  },
  {
    question: "Apakah hasil simulasi sama dengan hitungan bank atau leasing?",
    answer:
      "Hasil simulasi adalah estimasi. Angka resmi bisa berbeda karena biaya administrasi, provisi, asuransi, biaya fidusia, pembulatan, dan kebijakan masing-masing lembaga. Minta tabel angsuran resmi sebelum menandatangani perjanjian kredit.",
  },
  {
    question: "Dari mana angka bunga rata-rata pasar di kalkulator?",
    answer:
      "Angka itu estimasi gabungan dari bunga yang dipublikasikan bank dan perusahaan pembiayaan, dikonversi ke bunga efektif bila perlu, dan diperbarui berkala. Ini bukan penawaran resmi dan bukan angka resmi per produk, jadi sesuaikan dengan penawaran yang Anda terima.",
  },
];
