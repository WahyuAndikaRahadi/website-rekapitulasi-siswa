<?php

namespace Database\Seeders;

use App\Models\PoinMaster;
use Illuminate\Database\Seeder;

class PoinMasterSeeder extends Seeder
{
    public function run(): void
    {
        $pelanggaran = [
            ["nama" => "Tidak mengikuti kegiatan upacara/tidak tertib saat upacara", "poin" => -10],
            ["nama" => "Bergerombol/nongkrong di luar lingkungan sekolah", "poin" => -10],
            ["nama" => "Tidak menaati perintah guru dan tendik", "poin" => -10],
            ["nama" => "Tidak melaksanakan tugas yang diberikan oleh sekolah", "poin" => -10],
            ["nama" => "Melanggar atribut sekolah/tidak menggunakan atribut sekolah dengan lengkap", "poin" => -5],
            ["nama" => "Berbicara tidak sopan kepada teman, guru, tendik dan masyarakat", "poin" => -10],
            ["nama" => "Berkeliaran saat jam pelajaran atau pergantian jam pelajaran tanpa izin", "poin" => -10],
            ["nama" => "Memalsukan tanda tangan orangtua/guru/tendik", "poin" => -10],
            ["nama" => "Membawa orang luar tanpa izin guru piket", "poin" => -5],
            ["nama" => "Tidak menyampaikan amanat sekolah kepada orangtua", "poin" => -10],
            ["nama" => "Menggunakan uang KJP tidak sesuai aturan", "poin" => -10],
            ["nama" => "Menggunakan HP di sekolah tanpa izin guru", "poin" => -10],
            ["nama" => "Tidak melaksanakan salat dzuhur/jumat di sekolah", "poin" => -10],
            ["nama" => "Tidak melakukan sikap hormat bendera merah putih sesuai aturan baris-berbaris", "poin" => -10],
            ["nama" => "Tidak menyanyikan lagu Indonesia Raya, lagu nasional dan lagu rukun sama teman", "poin" => -10],
            ["nama" => "Tidak mengikuti pengucapan Pancasila", "poin" => -10],
            ["nama" => "Tidak mengikuti pengucapan visi/misi sekolah", "poin" => -10],
            ["nama" => "Tidak mengikuti pengucapan ikrar pelajar Indonesia", "poin" => -10],
            ["nama" => "Membawa/menghisap/mengedarkan rokok/vape di dalam/di luar sekolah", "poin" => -25],
            ["nama" => "Membawa/mengedarkan buku, gambar, CD, flashdisk porno dan sejenisnya", "poin" => -25],
            ["nama" => "Menggunakan kendaraan bermotor yang berknalpot tidak sesuai standar", "poin" => -5],
            ["nama" => "Buang air besar/kecil tidak pada tempatnya", "poin" => -5],
            ["nama" => "Tidak menjaga nama baik teman, guru, masyarakat, sekolah, baik melalui media cetak atau elektronik/dunia maya", "poin" => -25],
            ["nama" => "Merusak barang/kendaraan orang lain", "poin" => -25],
            ["nama" => "Tidak menjaga sarana prasarana dan lingkungan sekolah dengan baik", "poin" => -10],
            ["nama" => "Murid bertato/tindik", "poin" => -10],
            ["nama" => "Terlibat demonstrasi yang bersifat destruktif dan anarkis di sekolah maupun di luar sekolah", "poin" => -25],
            ["nama" => "Tidak mengikuti kegiatan ekstrakurikuler tanpa keterangan/izin Pembina", "poin" => -10],
            ["nama" => "Membentuk/mengikuti organisasi lain di luar lingkungan sekolah", "poin" => -25],
            ["nama" => "Memicu perkelahian antar teman sekolah, dengan sekolah lain dan kelompok masyarakat", "poin" => -100],
            ["nama" => "Melakukan tindakan anarkis (memalak, mencuri, berjudi, menipu) baik di lingkungan sekolah maupun di luar lingkungan sekolah", "poin" => -100],
            ["nama" => "Menghadang, melempar, membajak angkutan umum", "poin" => -100],
            ["nama" => "Membawa, mengedarkan minuman keras atau mabuk yang disebabkan oleh benda cair, padat, serbuk ataupun gas di dalam/di luar sekolah", "poin" => -100],
            ["nama" => "Melakukan tindakan penganiayaan terhadap teman, guru, dan tendik", "poin" => -100],
            ["nama" => "Melakukan tindakan asusila/pergaulan bebas, pelecehan seksual di lingkungan sekolah/di luar sekolah", "poin" => -100],
            ["nama" => "Melakukan dan menyebarkan porno aksi dan pornografi", "poin" => -100],
            ["nama" => "Terlibat penganiayaan, berkelahi, tawuran secara perorangan maupun kelompok", "poin" => -100],
            ["nama" => "Membawa, menggunakan, mengedarkan NAPZA", "poin" => -100],
            ["nama" => "Membawa, menyuruh, menggunakan senjata tajam/tumpul, senjata api, bahan peledak/gas tanpa seizin pihak berwajib", "poin" => -100],
            ["nama" => "Terlibat kriminalitas (penyebaran foto/video tak senonoh/kekerasan seksual berbasis elektronik/pengeroyokan dan penganiayaan/kepemilikan senjata tajam/aksi begal dan pemerasan/penipuan/doksing/tawuran antar-sekolah)", "poin" => -100],
            ["nama" => "Hamil dan menghamili", "poin" => -100],
            ["nama" => "Melakukan tindakan bullying secara verbal/non verbal kepada teman/guru/tendik", "poin" => -25],
            ["nama" => "Merusak fasilitas sarana dan prasarana sekolah", "poin" => -50],
            ["nama" => "Tidak menggunakan topi sekolah saat upacara", "poin" => -5],
            ["nama" => "Tidak menggunakan ikat pinggang logo SMKN 69 Jakarta", "poin" => -5],
            ["nama" => "Tidak menggunakan sepatu sesuai ketentuan peraturan", "poin" => -5],
            ["nama" => "Tidak menggunakan kaos kaki yang sesuai ketentuan peraturan", "poin" => -5],
            ["nama" => "Baju tidak rapi/dikeluarkan", "poin" => -5],
            ["nama" => "Ukuran baju ketat/dikecilkan", "poin" => -5],
            ["nama" => "Ukuran celana tidak sesuai aturan/dikecilkan", "poin" => -5],
            ["nama" => "Makan di kelas saat jam pelajaran", "poin" => -5],
            ["nama" => "Tidur di kelas saat jam pelajaran", "poin" => -5],
            ["nama" => "Membuat keributan/kegaduhan sehingga mengganggu KBM", "poin" => -5],
            ["nama" => "Tidak mengikuti kegiatan keibadahan tanpa izin", "poin" => -5],
            ["nama" => "Tidak mengikuti kegiatan literasi tanpa izin", "poin" => -5],
            ["nama" => "Tidak mengikuti kegiatan Jumat ibadah/Jumat sehat tanpa izin", "poin" => -5],
            ["nama" => "Keluar masuk ruangan di sekolah melalui jendela", "poin" => -5],
            ["nama" => "Memalsukan surat izin/tidak hadir sekolah", "poin" => -5],
            ["nama" => "Menggunakan sandal tidak sesuai ketentuan peraturan", "poin" => -5],
            ["nama" => "Terlambat datang ke sekolah", "poin" => -5],
            ["nama" => "Terlambat masuk kelas/bengkel/laboratorium/lapangan olahraga/upacara", "poin" => -5],
            ["nama" => "Tidak mengerjakan PR/tugas guru", "poin" => -5],
            ["nama" => "Tidak melaksanakan tugas piket", "poin" => -5],
            ["nama" => "Berolahraga bukan pada jam pelajaran/sesuai waktunya", "poin" => -5],
            ["nama" => "Tidak mengikuti kegiatan ekstrakurikuler tanpa keterangan", "poin" => -10],
            ["nama" => "Tidak mengikuti kegiatan hari-hari besar dan keagamaan", "poin" => -10],
            ["nama" => "Tidak masuk/hadir ke sekolah tanpa keterangan dan berkeliaran di sekitar sekolah", "poin" => -10],
            ["nama" => "Meninggalkan sekolah tanpa izin guru piket/wali kelas", "poin" => -10],
            ["nama" => "Tidak menggunakan pakaian seragam sesuai aturan bengkel/olahraga/Jumat sehat/Jumat ibadah sesuai ketentuan", "poin" => -10],
            ["nama" => "Rambut murid laki-laki tidak sesuai dengan aturan", "poin" => -5],
            ["nama" => "Rambut murid laki-laki/perempuan diwarnai/dicat", "poin" => -5],
            ["nama" => "Murid laki-laki menggunakan aksesoris yang dilarang (gelang, anting, cincin, kalung, topi)", "poin" => -5],
            ["nama" => "Tidak memakai atribut dan name tag sekolah", "poin" => -5],
            ["nama" => "Membuang sampah tidak sesuai jenisnya", "poin" => -5],
            ["nama" => "Memakai topi dan jaket di lingkungan sekolah", "poin" => -5],
            ["nama" => "Tidak memakai ikat pinggang sesuai aturan sekolah", "poin" => -5],
            ["nama" => "Melakukan corat-coret di tempat yang tidak semestinya (tembok/bangku/meja)", "poin" => -10],
            ["nama" => "Mencoret/membuat kotor buku perpustakaan", "poin" => -5],
            ["nama" => "Murid perempuan menggunakan lipstick, pensil alis, eyeliner, bedak, cushion, tone up, penjepit bulu mata, maskara, eyeshadow, serum", "poin" => -5],
            ["nama" => "Murid perempuan menggunakan perhiasan (gelang, kalung, dan cincin)", "poin" => -5],
            ["nama" => "Membuat, mengedarkan, menjual, memakai kaos/jaket atau atribut lainnya yang berlogo, bergambar atau bertuliskan yang mempunyai konotasi negatif terhadap nama baik sekolah", "poin" => -25]
        ];

        $penghargaan = [
            ["nama" => "Berperan aktif pada kegiatan sekolah (kepanitiaan)", "poin" => 5],
            ["nama" => "Berperan aktif sebagai pengurus kelas", "poin" => 5],
            ["nama" => "Berperan aktif sebagai pengurus ekstrakurikuler", "poin" => 5],
            ["nama" => "Berperan Satgas Pilah Sampah, Komposting, Urban Farming", "poin" => 5],
            ["nama" => "Berperan aktif sebagai pengurus OSIS/MPK", "poin" => 5],
            ["nama" => "Berprestasi di tingkat Sekolah", "poin" => 10],
            ["nama" => "Berprestasi di tingkat Kecamatan", "poin" => 15],
            ["nama" => "Berprestasi di tingkat Kabupaten/Kotamadya", "poin" => 25],
            ["nama" => "Berprestasi di tingkat Provinsi", "poin" => 50],
            ["nama" => "Berprestasi di tingkat Nasional", "poin" => 75],
            ["nama" => "Berprestasi di tingkat Internasional", "poin" => 100]
        ];

        foreach ($pelanggaran as $item) {
            PoinMaster::updateOrCreate(
                ['nama' => $item['nama'], 'kategori' => 'pelanggaran'],
                ['poin' => $item['poin'], 'is_active' => true]
            );
        }

        foreach ($penghargaan as $item) {
            PoinMaster::updateOrCreate(
                ['nama' => $item['nama'], 'kategori' => 'kebaikan'],
                ['poin' => $item['poin'], 'is_active' => true]
            );
        }
    }
}
