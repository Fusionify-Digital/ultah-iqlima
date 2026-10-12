import { getBirthdayInfo } from './lib/birthday.js'

// Ganti semua isi di file ini sesuai keinginanmu.
const birthDate = '2003-07-27'

export const birthday = getBirthdayInfo(birthDate)
const { age, dayMonth } = birthday
const [, month, day] = birthDate.split('-')

export const config = {
  name: 'Iqlima',
  fullName: 'Iqlima Fasha Rizqia',
  from: 'Aku',

  // Taruh file lagu di folder /public, misalnya public/music.mp3
  music: '/music.mp3',

  // Lilin kecil di sekeliling lilin angka umur
  candles: 6,

  // Halaman kunci di awal. Kodenya tanggal + bulan lahir (DDMM).
  gate: {
    code: `${day}${month}`,
    eyebrow: 'Halo, ada titipan buat kamu',
    title: 'Tapi sebelumnya, buktikan dulu kalau ini memang kamu',
    question: 'Tanggal & bulan lahirmu?',
    hint: 'Contoh: 1 Januari ditulis 0101',
    wrong: 'Hmm, kayaknya bukan itu. Coba lagi ya',
    button: 'Masuk',
  },

  // Kalimat yang muncul saat kucing / kelinci diklik (dipilih acak)
  critters: {
    cat: [
      'Meow! Selamat ulang tahun, Iqlima!',
      'Purr... kuenya wangi banget',
      'Boleh minta sepotong? Meow',
      'Pitanya pink, biar samaan sama kamu',
      'Aku jagain kadonya dari tadi lho',
    ],
    bunny: [
      'Hop hop! Happy birthday!',
      'Aku bawain mawar sama lily buat kamu',
      `Selamat ${age} tahun, semoga bahagia terus!`,
      'Peluk dulu dong',
      'Tiup lilinnya, tiup!',
    ],
    // Muncul kalau kucing / kelinci diklik 5 kali berturut-turut
    secret: {
      cat: 'Psst, kamu nemu rahasia! Hari ini semesta lagi sayang-sayangnya sama kamu',
      bunny: 'Rahasia ya: kamu jauh lebih hebat dari yang kamu kira',
    },
  },

  opening: {
    eyebrow: 'Untuk Iqlima Fasha Rizqia',
    title: 'Ada sesuatu kecil buat kamu di hari spesialmu',
    button: 'Buka kadonya',
  },

  cake: {
    eyebrow: `${dayMonth} · ${age} tahun`,
    title: 'Tiup lilinnya',
    doneTitle: `Selamat ulang tahun ke-${age}`,
    doneMessage: 'Semoga permohonanmu pelan-pelan jadi nyata.',
    next: 'Masih ada lagi',
  },

  wish: {
    prompt: 'Sekarang, tulis satu permohonan. Nanti dia terbang jadi lentera.',
    placeholder: 'Aku berharap...',
    button: 'Terbangkan',
    skip: 'Simpan dalam hati saja',
    flying: 'Permohonanmu sudah terbang. Tenang, nggak ada yang bisa baca, cuma semesta.',
  },

  // Foto di folder public/photos. Ganti file & caption sesuai keinginanmu
  // (boleh .jpg / .png, idealnya potret kotak atau 4:5).
  memories: {
    eyebrow: 'Si pemilik hari ini',
    title: 'Kamu, dalam bingkai',
    hint: 'Ketuk fotonya untuk lihat baliknya',
    next: 'Lanjut',
    photos: [
      { src: '/photos/1.jpg', caption: 'Senyum yang bikin hari jadi cerah' },
      { src: '/photos/2.jpg', caption: 'Bunganya cantik, tapi kalah sama yang pakai' },
      { src: '/photos/3.jpg', caption: 'Manyunnya lucu banget di sini' },
      { src: '/photos/4.jpg', caption: 'Semoga langkahmu selalu menuju hal-hal seindah langit ini' },
    ],
  },

  reasons: {
    eyebrow: `${age} harapan`,
    title: `Untuk umurmu yang ke-${age}`,
    hint: 'Geser kartunya, atau ketuk tombol di bawah',
    next: 'Ada surat buat kamu',
    end: 'dan semua hal baik lainnya',
    items: [
      'Semoga kamu selalu punya alasan untuk tersenyum, sekecil apa pun itu.',
      'Semoga kamu selalu sehat, badanmu dan juga hatimu.',
      'Semoga setiap doa yang kamu bisikkan pelan-pelan dikabulkan.',
      'Semoga kamu dikelilingi orang-orang yang tulus sayang sama kamu.',
      'Semoga rezekimu lancar, dari arah yang bahkan nggak kamu duga.',
      'Semoga kamu berani mengejar hal-hal yang kamu impikan.',
      'Semoga capekmu selalu terbayar dengan hasil yang manis.',
      'Semoga kamu ingat untuk istirahat setiap kali lelah.',
      'Semoga kamu makin sayang sama dirimu sendiri.',
      'Semoga hari-hari beratmu cepat lewat, dan yang indah lebih lama tinggal.',
      'Semoga kamu nggak pernah kehilangan rasa penasaranmu.',
      'Semoga keluargamu selalu sehat dan bahagia.',
      'Semoga kamu selalu dikuatkan saat sesuatu nggak berjalan sesuai rencana.',
      'Semoga tawamu selalu lebih banyak dari air matamu.',
      'Semoga kamu menemukan hal-hal baru yang bikin kamu jatuh cinta sama hidup.',
      'Semoga semua yang kamu kerjakan dimudahkan dan diberkahi.',
      'Semoga kamu selalu jadi dirimu sendiri, apa adanya.',
      'Semoga hatimu selalu tenang, apa pun yang terjadi di luar sana.',
      'Semoga harimu selalu seindah mawar dan lily kesukaanmu.',
      'Semoga kamu nggak pernah ragu kalau kamu itu berharga.',
      'Semoga rasa syukurmu selalu bikin kamu bahagia.',
      'Semoga tahun ini jadi bab paling indah dalam ceritamu.',
      `Dan semoga, di umur ${age} ini, kamu bahagia dengan caramu sendiri, Iqlima.`,
    ],
  },

  letter: {
    greeting: 'Hai, Iqlima,',
    paragraphs: [
      `Selamat ulang tahun yang ke-${age}, ya. Semoga tahun ini jadi tahun yang paling baik buat kamu.`,
      `Hari ini, ${dayMonth}, adalah harimu. Semoga di umur yang baru ini kamu makin bahagia, makin sehat, dan semua hal baik datang ke kamu tanpa perlu kamu kejar terlalu keras.`,
      'Semoga kamu selalu dikelilingi orang-orang yang tulus, dikuatkan di hari-hari yang berat, dan dimudahkan di setiap langkah yang kamu ambil.',
      'Semuanya sengaja dibuat serba pink dan putih, lengkap dengan mawar dan lily kesukaanmu. Kucing dan kelinci kecil itu anggap saja ikut mengucapkan selamat juga.',
      'Kalau suatu hari kamu merasa capek, ingat kalau kamu sudah sejauh ini, dan kamu jauh lebih kuat dari yang kamu kira.',
    ],
    // Kutipan yang muncul di akhir surat, satu baris per item
    quote: ['Cantikmu berasal dari bahagiamu,', 'dan bahagiamu berasal dari rasa syukurmu.'],
    closing: 'Selamat ulang tahun, sekali lagi.',
    signature: 'Aku',
  },
}
