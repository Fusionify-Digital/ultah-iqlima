# Untuk Iqlima ♡

Web ulang tahun interaktif 3D untuk **Iqlima Fasha Rizqia** (27 Juli). Bertema pink & putih, dihiasi mawar, lily, serta kucing dan kelinci kecil.

## Alur

1. **Kunci** – masuk dengan tanggal & bulan lahir (format DDMM).
2. **Kado** – kotak kado 3D yang bisa dibuka.
3. **Kue** – tiup lilin angka umur dan lilin kecil (klik/ketuk, atau tiup ke mikrofon). Setelah padam, ada kembang api dan lentera permohonan.
4. **Galeri** – polaroid 3D bergantung di tali lampu. Ketuk untuk membalik dan membaca caption.
5. **Harapan** – kartu harapan sejumlah umur, bisa di-swipe.
6. **Surat** – surat yang mengetik sendiri, ditutup dengan kutipan.

Easter egg: klik kucing atau kelinci 5 kali berturut-turut.

## Teknologi

- [Vite](https://vite.dev) + [React](https://react.dev)
- [three.js](https://threejs.org), [@react-three/fiber](https://r3f.docs.pmnd.rs), [@react-three/drei](https://drei.docs.pmnd.rs), [@react-three/postprocessing](https://react-postprocessing.docs.pmnd.rs)
- [Motion](https://motion.dev) untuk animasi UI
- [canvas-confetti](https://github.com/catdad/canvas-confetti) untuk kembang api

## Menjalankan

```bash
npm install
npm run dev
```

Buka `http://localhost:5173`. Saat development, bisa langsung lompat ke satu tahap dengan `?stage=`, misalnya `?stage=cake`. Pilihan tahap: `gate`, `opening`, `cake`, `memories`, `reasons`, `letter`.

Build produksi:

```bash
npm run build
npm run preview
```

## Mengubah isi

Hampir semua teks ada di [`src/config.js`](src/config.js): tanggal lahir, nama, kode kunci, kalimat kucing/kelinci, caption foto, kartu harapan, dan isi surat. Umur dihitung otomatis dari tanggal lahir.

| Yang diubah | Caranya |
|---|---|
| Foto galeri | Taruh di `public/photos/`, lalu sesuaikan `memories.photos` di `config.js`. Foto otomatis dipotong kotak dari tengah. |
| Lagu | Taruh di `public/music.mp3` (atau ubah `music` di `config.js`). Lagu mulai diputar setelah kunci terbuka. |
| Gambar preview link | `public/og.png` (1200×630) |

## Email otomatis di hari ulang tahun

Tepat pukul **00:01 WIB tanggal 27 Juli**, email bergaya web ini (header ilustrasi, foto polaroid, kutipan, dan tombol ke web) dikirim ke dia dari Gmail-mu. Isinya diatur di bagian `email` pada `src/config.js`, dan umurnya dihitung otomatis.

Alurnya: [cron-job.org](https://cron-job.org) memanggil `/api/birthday-email`, lalu fungsi Vercel itu mengirim email lewat Gmail. Vercel Cron tidak dipakai, karena di paket gratis jadwalnya bisa meleset sampai 59 menit.

### 1. Buat App Password Gmail

Aktifkan Verifikasi 2 Langkah di akun Google, lalu buat App Password di [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords). Hasilnya 16 huruf.

### 2. Isi Environment Variables di Vercel

Masuk ke Project → Settings → Environment Variables (lihat juga [`.env.example`](.env.example)):

| Nama | Isi |
|---|---|
| `GMAIL_USER` | Alamat Gmail pengirim |
| `GMAIL_APP_PASSWORD` | App Password dari langkah 1 |
| `BIRTHDAY_EMAIL_TO` | Email dia |
| `TEST_EMAIL_TO` | (opsional) Penerima email tes. Kalau kosong, dikirim ke `GMAIL_USER` |
| `CRON_SECRET` | Kunci rahasia acak, misalnya hasil `openssl rand -hex 24` |

Setelah itu lakukan **Redeploy** supaya variabelnya terbaca.

### 3. Tes kirim ke emailmu sendiri

```bash
curl -H "Authorization: Bearer ISI_CRON_SECRET" "https://ultah-iqlima.studydate.id/api/birthday-email?test=1"
```

Dengan `?test=1`, email dikirim ke `TEST_EMAIL_TO` dan bisa dicoba kapan saja. Tanpa `?test=1`, email hanya terkirim ke dia kalau hari ini memang 27 Juli (WIB).

Bisa juga dari komputer: salin `.env.example` jadi `.env.local`, isi, lalu jalankan `npm run email:test`. Untuk melihat tampilannya saja tanpa mengirim, jalankan `npm run email:preview` (dev server harus menyala), lalu buka `email-preview.html`.

### 4. Jadwalkan di cron-job.org

Buat cronjob baru:

- **URL**: `https://ultah-iqlima.studydate.id/api/birthday-email`
- **Schedule**: pilih *Custom*, zona waktu **Asia/Jakarta**, menit `1`, jam `0`, tanggal `27`, bulan `Juli`
- **Advanced → Headers**: `Authorization` = `Bearer ISI_CRON_SECRET`

Tombol *Test run* di cron-job.org aman dipakai. Di luar 27 Juli, fungsinya hanya membalas "bukan hari ulang tahunnya" tanpa mengirim apa pun.

## Deploy

Live di [ultah-iqlima.studydate.id](https://ultah-iqlima.studydate.id), dideploy di [Vercel](https://vercel.com): import repo ini, framework terdeteksi otomatis sebagai Vite. URL preview link (`og:image`) diisi otomatis dari domain Vercel saat build. Untuk domain lain, set environment variable `SITE_URL`, misalnya `https://contoh.com`.
