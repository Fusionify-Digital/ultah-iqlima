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

## Deploy

Dideploy di [Vercel](https://vercel.com): import repo ini, framework terdeteksi otomatis sebagai Vite. URL preview link (`og:image`) diisi otomatis dari domain Vercel saat build. Untuk domain lain, set environment variable `SITE_URL`, misalnya `https://contoh.com`.
