<?php

namespace App\Services;

use App\Models\Laporan;
use App\Models\Murid;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    protected string $gatewayUrl;

    public function __construct()
    {
        $this->gatewayUrl = rtrim(config('services.whatsapp.gateway_url', env('WA_GATEWAY_URL', 'http://localhost:3000')), '/');
    }

    /**
     * Helper untuk menormalisasi format nomor HP Indonesia menjadi standar internasional '628...'
     * Contoh: '08123456789' -> '628123456789', '+62 812-3456-789' -> '628123456789'
     */
    public static function formatPhoneNumber(?string $number): string
    {
        if (empty($number)) {
            return '';
        }

        // Hapus semua karakter non-angka
        $cleaned = preg_replace('/[^0-9]/', '', (string) $number);

        // Ubah awalan '0' menjadi '62'
        if (str_starts_with($cleaned, '0')) {
            $cleaned = '62' . substr($cleaned, 1);
        } elseif (str_starts_with($cleaned, '8')) {
            // Ubah awalan '8' menjadi '628'
            $cleaned = '62' . $cleaned;
        }

        return $cleaned;
    }

    /**
     * Kirim pesan teks ke WhatsApp Gateway Node.js
     */
    public function sendMessage(string $number, string $message): array
    {
        $formattedNumber = self::formatPhoneNumber($number);

        if (empty($formattedNumber)) {
            Log::warning('[WhatsAppService] Gagal mengirim pesan: nomor tujuan kosong.');
            return [
                'status'  => 'error',
                'message' => 'Nomor telepon tujuan tidak valid atau kosong.',
            ];
        }

        try {
            $url = "{$this->gatewayUrl}/send-message";

            $response = Http::timeout(10)->post($url, [
                'number'  => $formattedNumber,
                'message' => $message,
            ]);

            if ($response->successful()) {
                Log::info("[WhatsAppService] Pesan berhasil dikirim ke {$formattedNumber}");
                return [
                    'status'  => 'success',
                    'message' => 'Pesan berhasil dikirim via WhatsApp Gateway.',
                    'data'    => $response->json(),
                ];
            }

            Log::error("[WhatsAppService] Gateway merespon error: HTTP {$response->status()} - {$response->body()}");
            return [
                'status'  => 'error',
                'message' => 'Gateway WhatsApp gagal memproses pengiriman: ' . ($response->json('message') ?? $response->body()),
                'code'    => $response->status(),
            ];
        } catch (\Throwable $e) {
            Log::error("[WhatsAppService] Exception saat menghubungi WA Gateway: " . $e->getMessage());
            return [
                'status'  => 'error',
                'message' => 'Tidak dapat terhubung ke WhatsApp Gateway Server: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Kirim file/dokumen/PDF ke WhatsApp Gateway Node.js
     */
    public function sendFile(string $number, string $file, string $fileName, string $mimeType = 'application/pdf', string $caption = ''): array
    {
        $formattedNumber = self::formatPhoneNumber($number);

        if (empty($formattedNumber)) {
            Log::warning('[WhatsAppService] Gagal mengirim file: nomor tujuan kosong.');
            return [
                'status'  => 'error',
                'message' => 'Nomor telepon tujuan tidak valid atau kosong.',
            ];
        }

        try {
            $url = "{$this->gatewayUrl}/send-file";

            $response = Http::timeout(25)->post($url, [
                'number'   => $formattedNumber,
                'file'     => $file,
                'filename' => $fileName,
                'mimetype' => $mimeType,
                'caption'  => $caption,
            ]);

            if ($response->successful()) {
                Log::info("[WhatsAppService] File {$fileName} berhasil dikirim ke {$formattedNumber}");
                return [
                    'status'  => 'success',
                    'message' => 'File berhasil dikirim via WhatsApp Gateway.',
                    'data'    => $response->json(),
                ];
            }

            Log::error("[WhatsAppService] Gateway file merespon error: HTTP {$response->status()} - {$response->body()}");
            return [
                'status'  => 'error',
                'message' => 'Gateway WhatsApp gagal memproses pengiriman file: ' . ($response->json('message') ?? $response->body()),
                'code'    => $response->status(),
            ];
        } catch (\Throwable $e) {
            Log::error("[WhatsAppService] Exception saat menghubungi WA Gateway untuk kirim file: " . $e->getMessage());
            return [
                'status'  => 'error',
                'message' => 'Tidak dapat terhubung ke WhatsApp Gateway Server: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Buat format template pesan WhatsApp berdasarkan akumulasi poin & 4 Tahapan Pembinaan SMKN 69 Jakarta.
     */
    public function formatPelanggaranMessage(Murid $murid, Laporan $laporan, int $poinSebelumnya, int $poinSekarang): string
    {
        $namaMurid      = $murid->nama;
        $kelasMurid     = $murid->kelas->nama_kelas ?? '-';
        $nisMurid       = $murid->nis ?? '-';
        $tanggal        = $laporan->tanggal_kejadian ? $laporan->tanggal_kejadian->format('d-m-Y') : date('d-m-Y');
        $keterangan     = $laporan->keterangan ?? '-';
        $poinMasuk      = abs((int) $laporan->poin_diberikan);
        $kualifikasi    = $poinSekarang <= 25 ? 'Baik' : ($poinSekarang <= 74 ? 'Cukup' : 'Kurang');
        $tahapPembinaan = $poinSekarang >= 100 ? 'Tahap IV (Penanganan Khusus)'
            : ($poinSekarang >= 75 ? 'Tahap III (Peringatan III / K-3)'
            : ($poinSekarang >= 50 ? 'Tahap II (Peringatan II / K-2)'
            : ($poinSekarang >= 25 ? 'Tahap I (Peringatan I / K-1)' : 'Normal')));

        // 1. Deteksi Melewati Threshold Tahap IV (>= 100 Poin)
        if ($poinSekarang >= 100 && $poinSebelumnya < 100) {
            return "🚨 *PEMBERITAHUAN DARURAT: TAHAP IV (PENANGANAN KASUS BESAR / KEPUTUSAN AKHIR)* 🚨\n"
                . "SMKN 69 JAKARTA\n\n"
                . "Kepada Yth. Bapak/Ibu Orang Tua/Wali dari:\n"
                . "👤 *Nama Siswa*: {$namaMurid}\n"
                . "🏫 *Kelas*: {$kelasMurid}\n"
                . "🔢 *NIS*: {$nisMurid}\n\n"
                . "⚠️ *Pemberitahuan Penting:*\n"
                . "Berdasarkan catatan disiplin sekolah, ananda telah mencapai akumulasi *{$poinSekarang} Poin Pelanggaran* (Batas Maksimal 100 Poin).\n\n"
                . "📌 *Laporan Pelanggaran Terakhir* ({$tanggal}):\n"
                . "• Kejadian: {$keterangan}\n"
                . "• Tambahan Poin: +{$poinMasuk} Poin\n\n"
                . "📋 *Tindak Lanjut Tahap IV:*\n"
                . "Sesuai regulasi sekolah, penanganan ananda diambil alih langsung oleh *Wakabid Kesiswaan & Kepala Sekolah*.\n"
                . "Bapak/Ibu Orang Tua/Wali diwajibkan menghadiri *PANGGILAN KEEMPAT (KONFERENSI KASUS)* bersama Kepala Sekolah, Wakabid Kesiswaan, Tim BK, Kakom, dan Wali Kelas untuk menentukan tindakan tegas atau keputusan pengembalian murid kepada Orang Tua/Wali Murid.\n\n"
                . "Mohon segera berkoordinasi dengan pihak sekolah.\n"
                . "Terima kasih atas perhatian dan kerjasamanya.\n"
                . "_— Sistem Rekapitulasi & Pembinaan Siswa SMKN 69 Jakarta_";
        }

        // 2. Deteksi Melewati Threshold Tahap III (>= 75 Poin)
        if ($poinSekarang >= 75 && $poinSebelumnya < 75) {
            return "⚠️ *SURAT PEMBERITAHUAN TAHAP III: PEMBINAAN INTENSIF & KONSELING REFLEKTIF (K-3)* ⚠️\n"
                . "SMKN 69 JAKARTA\n\n"
                . "Kepada Yth. Bapak/Ibu Orang Tua/Wali dari:\n"
                . "👤 *Nama Siswa*: {$namaMurid}\n"
                . "🏫 *Kelas*: {$kelasMurid}\n"
                . "🔢 *NIS*: {$nisMurid}\n\n"
                . "Dengan hormat kami sampaikan bahwa akumulasi pelanggaran ananda telah mencapai *{$poinSekarang} Poin Pelanggaran* (Peringatan III / K-3).\n\n"
                . "📌 *Catatan Pelanggaran Baru* ({$tanggal}):\n"
                . "• Keterangan: {$keterangan}\n"
                . "• Poin Masuk: +{$poinMasuk} Poin\n"
                . "• Total Poin Pelanggaran: {$poinSekarang} Poin ({$kualifikasi})\n\n"
                . "📋 *Prosedur Pembinaan Tahap III:*\n"
                . "Siswa telah dirujuk ke *Guru BK/BP*. Wali Kelas dan Ketua Kompetensi Keahlian (Kakom) berkolaborasi dengan Guru BK/BP untuk melaksanakan *PEMANGGILAN ORANG TUA KETIGA* guna pembinaan intensif berupa konseling reflektif dan penyadaran perilaku, serta penandatanganan *Surat Pernyataan Bermaterai* yang diketahui oleh Wakabid Kesiswaan.\n\n"
                . "Harap menunggu jadwal resmi pemanggilan atau menghubungi pihak BK/Wali Kelas.\n"
                . "Terima kasih atas kerjasamanya.\n"
                . "_— Sistem Rekapitulasi & Pembinaan Siswa SMKN 69 Jakarta_";
        }

        // 3. Deteksi Melewati Threshold Tahap II (>= 50 Poin)
        if ($poinSekarang >= 50 && $poinSebelumnya < 50) {
            return "⚠️ *SURAT PEMBERITAHUAN TAHAP II: PENEGAKAN KEDISIPLINAN & PERUBAHAN KARAKTER (K-2)* ⚠️\n"
                . "SMKN 69 JAKARTA\n\n"
                . "Kepada Yth. Bapak/Ibu Orang Tua/Wali dari:\n"
                . "👤 *Nama Siswa*: {$namaMurid}\n"
                . "🏫 *Kelas*: {$kelasMurid}\n"
                . "🔢 *NIS*: {$nisMurid}\n\n"
                . "Kami informasikan bahwa akumulasi pelanggaran ananda telah mencapai *{$poinSekarang} Poin Pelanggaran* (Peringatan II / K-2).\n\n"
                . "📌 *Catatan Pelanggaran Baru* ({$tanggal}):\n"
                . "• Keterangan: {$keterangan}\n"
                . "• Poin Masuk: +{$poinMasuk} Poin\n"
                . "• Total Poin Pelanggaran: {$poinSekarang} Poin ({$kualifikasi})\n\n"
                . "📋 *Prosedur Penanganan Tahap II:*\n"
                . "Penanganan dilanjutkan ke tingkat *Program Keahlian (Kakom & Staf Kesiswaan)*. Wali Kelas akan melakukan *PEMANGGILAN KEDUA* terhadap Orang Tua/Wali (dicatat di Buku Pembinaan Wali Kelas) dan dikoordinasikan ke BK/Kesiswaan.\n\n"
                . "Mohon kesediaan Bapak/Ibu untuk mendampingi ananda dalam perbaikan sikap dan kedisiplinan.\n"
                . "Terima kasih.\n"
                . "_— Sistem Rekapitulasi & Pembinaan Siswa SMKN 69 Jakarta_";
        }

        // 4. Deteksi Melewati Threshold Tahap I (>= 25 Poin)
        if ($poinSekarang >= 25 && $poinSebelumnya < 25) {
            return "📢 *SURAT PEMBERITAHUAN TAHAP I: PEMBINAAN AWAL & PREVENTIF (K-1)* 📢\n"
                . "SMKN 69 JAKARTA\n\n"
                . "Kepada Yth. Bapak/Ibu Orang Tua/Wali dari:\n"
                . "👤 *Nama Siswa*: {$namaMurid}\n"
                . "🏫 *Kelas*: {$kelasMurid}\n"
                . "🔢 *NIS*: {$nisMurid}\n\n"
                . "Kami sampaikan bahwa ananda telah mencapai akumulasi kumulatif *{$poinSekarang} Poin Pelanggaran* (Peringatan I / K-1).\n\n"
                . "📌 *Catatan Pelanggaran Baru* ({$tanggal}):\n"
                . "• Keterangan: {$keterangan}\n"
                . "• Poin Masuk: +{$poinMasuk} Poin\n"
                . "• Total Poin Pelanggaran: {$poinSekarang} Poin ({$kualifikasi})\n\n"
                . "📋 *Tindak Lanjut Tahap I:*\n"
                . "Wali Kelas akan melakukan *PEMANGGILAN PERTAMA* terhadap Orang Tua/Wali (dicatat di Buku Pembinaan Wali Kelas). Alur penanganan dan pembinaan diinformasikan ke BK / Ketua Kompetensi Keahlian / Kesiswaan.\n\n"
                . "Dukungan dan perhatian Bapak/Ibu di rumah sangat dibutuhkan untuk perbaikan kedisiplinan ananda.\n"
                . "Terima kasih.\n"
                . "_— Sistem Rekapitulasi & Pembinaan Siswa SMKN 69 Jakarta_";
        }

        // 5. Template Standar Notifikasi Catatan Pelanggaran Biasa (Kecil/Besar)
        return "📋 *PEMBERITAHUAN CATATAN KEDISIPLINAN SISWA*\n"
            . "SMKN 69 JAKARTA\n\n"
            . "Kepada Yth. Bapak/Ibu Orang Tua/Wali dari:\n"
            . "👤 *Nama Siswa*: {$namaMurid}\n"
            . "🏫 *Kelas*: {$kelasMurid}\n"
            . "🔢 *NIS*: {$nisMurid}\n\n"
            . "Telah tercatat laporan kedisiplinan sebagai berikut:\n"
            . "📅 *Tanggal*: {$tanggal}\n"
            . "📝 *Keterangan*: {$keterangan}\n"
            . "⚠️ *Poin Pelanggaran*: +{$poinMasuk} Poin\n"
            . "📊 *Total Akumulasi Poin*: {$poinSekarang} Poin (Kategori: {$kualifikasi})\n"
            . "🛡️ *Status Pembinaan*: {$tahapPembinaan}\n\n"
            . "Catatan ini dikirimkan secara otomatis sebagai bentuk transparansi dan sinergi pembinaan karakter antara pihak sekolah dan orang tua murid.\n\n"
            . "Terima kasih atas perhatian dan kerjasamanya.\n"
            . "_— Sistem Rekapitulasi Siswa SMKN 69 Jakarta_";
    }

    /**
     * Buat format template pesan WhatsApp apresiasi prestasi / kebaikan siswa.
     */
    public function formatPrestasiMessage(Murid $murid, Laporan $laporan, int $poinSebelumnya, int $poinSekarang): string
    {
        $namaMurid  = $murid->nama;
        $kelasMurid = $murid->kelas->nama_kelas ?? '-';
        $nisMurid   = $murid->nis ?? '-';
        $tanggal    = $laporan->tanggal_kejadian ? $laporan->tanggal_kejadian->format('d-m-Y') : date('d-m-Y');
        $keterangan = $laporan->keterangan ?? '-';
        $poinMasuk  = abs((int) $laporan->poin_diberikan);

        return "🌟 *APRESIASI PRESTASI & PERILAKU POSITIF SISWA* 🌟\n"
            . "SMKN 69 JAKARTA\n\n"
            . "Kepada Yth. Bapak/Ibu Orang Tua/Wali dari:\n"
            . "👤 *Nama Siswa*: {$namaMurid}\n"
            . "🏫 *Kelas*: {$kelasMurid}\n"
            . "🔢 *NIS*: {$nisMurid}\n\n"
            . "Dengan bangga kami informasikan bahwa ananda telah mencatatkan apresiasi perilaku positif / prestasi di sekolah:\n"
            . "📅 *Tanggal*: {$tanggal}\n"
            . "🏆 *Keterangan*: {$keterangan}\n"
            . "✨ *Poin Apresiasi*: +{$poinMasuk} Poin\n"
            . "📊 *Total Akumulasi Poin Prestasi*: {$poinSekarang} Poin\n\n"
            . "Terima kasih atas bimbingan dan dukungan Bapak/Ibu di rumah. Semoga ananda terus berprestasi dan menjadi teladan bagi siswa lainnya.\n\n"
            . "_— Sistem Rekapitulasi Siswa SMKN 69 Jakarta_";
    }

    /**
     * Dispatch WhatsApp notification ke orang tua/wali murid untuk setiap laporan (kecil/besar/prestasi).
     */
    public function sendLaporanNotification(Murid $murid, Laporan $laporan, int $poinSebelumnya): void
    {
        $targetPhone = $murid->no_ortu ?? $murid->no_telp;
        if (empty($targetPhone)) {
            Log::info("[WhatsAppService] Tidak ada nomor telepon orang tua/murid untuk murid ID {$murid->id} ({$murid->nama})");
            return;
        }

        $freshMurid = $murid->fresh();
        if ($laporan->kategori === 'prestasi') {
            $poinSekarang = $freshMurid->poinPrestasi();
            $waMessage = $this->formatPrestasiMessage($freshMurid, $laporan, $poinSebelumnya, $poinSekarang);
        } else {
            $poinSekarang = $freshMurid->poinPelanggaran();
            $waMessage = $this->formatPelanggaranMessage($freshMurid, $laporan, $poinSebelumnya, $poinSekarang);
        }

        \App\Jobs\SendWhatsAppRekapJob::dispatch($targetPhone, $waMessage);
    }

    /**
     * Buat format template pesan WhatsApp resmi untuk Surat Pemanggilan Orang Tua (SP).
     */
    public function formatSuratPanggilanMessage(\App\Models\SuratPanggil $surat): string
    {
        $murid       = $surat->murid;
        $namaMurid   = $murid->nama ?? '-';
        $kelasMurid  = $murid->kelas->nama_kelas ?? '-';
        $nisMurid    = $murid->nis ?? '-';
        
        $tglPanggilan = $surat->tanggal_panggilan ? \Carbon\Carbon::parse($surat->tanggal_panggilan)->locale('id') : \Carbon\Carbon::now()->locale('id');
        $hariTanggal  = $tglPanggilan->translatedFormat('l, d F Y');

        return "✉️ *SURAT PEMANGGILAN ORANG TUA / WALI SISWA* ✉️\n"
            . "SMKN 69 JAKARTA\n\n"
            . "📄 *Nomor Surat*: {$surat->nomor_surat}\n"
            . "📌 *Perihal*: *{$surat->perihal}*\n\n"
            . "Kepada Yth. Bapak/Ibu Orang Tua/Wali dari:\n"
            . "👤 *Nama Siswa*: {$namaMurid}\n"
            . "🏫 *Kelas*: {$kelasMurid}\n"
            . "🔢 *NIS*: {$nisMurid}\n\n"
            . "Dengan hormat, sehubungan dengan penanganan tata tertib dan pembinaan kedisiplinan ananda, kami memohon kehadiran Bapak/Ibu pada:\n\n"
            . "📅 *Hari, Tanggal*: {$hariTanggal}\n"
            . "⏰ *Waktu*: {$surat->waktu}\n"
            . "📍 *Tempat*: {$surat->tempat}\n"
            . "👥 *Menemui*: *{$surat->nama_guru_menemui}*\n\n"
            . "Kami sangat mengharapkan kehadiran Bapak/Ibu tepat waktu demi kebaikan dan kelanjutan proses pembinaan ananda di sekolah.\n\n"
            . "Atas perhatian dan kerja sama yang baik, kami ucapkan terima kasih.\n"
            . "_— Sistem Rekapitulasi & Kesiswaan SMKN 69 Jakarta_";
    }

    /**
     * Dispatch WhatsApp notification Surat Pemanggilan Orang Tua (Dokumen PDF + Pesan) ke kontak orang tua/wali murid.
     */
    /**
     * Dispatch / Kirim WhatsApp notification Surat Pemanggilan Orang Tua (Dokumen PDF + Pesan) ke kontak orang tua/wali murid.
     */
    public function sendSuratPanggilanNotification(\App\Models\SuratPanggil $surat, bool $sync = false): bool
    {
        $murid = $surat->murid;
        if (! $murid) {
            return false;
        }

        $targetPhone = $murid->no_ortu ?? $murid->no_telp;
        if (empty($targetPhone)) {
            Log::info("[WhatsAppService] Tidak ada nomor telepon orang tua/murid untuk murid ID {$murid->id} ({$murid->nama})");
            return false;
        }

        $waMessage = $this->formatSuratPanggilanMessage($surat);

        try {
            // Render PDF Surat Pemanggilan Orang Tua
            $surat->loadMissing(['murid.kelas', 'guru']);
            $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('surat.panggilan', [
                'surat' => $surat,
            ])->setPaper('a4', 'portrait');

            $pdfContent = $pdf->output();
            $base64Pdf = base64_encode($pdfContent);
            $safeNomor = preg_replace('/[^a-zA-Z0-9_-]/', '-', $surat->nomor_surat);
            $fileName = "Surat_Pemanggilan_{$safeNomor}.pdf";

            if ($sync) {
                $res = $this->sendFile(
                    $targetPhone,
                    $base64Pdf,
                    $fileName,
                    'application/pdf',
                    $waMessage
                );
                return ($res['status'] ?? '') === 'success';
            }

            // Kirim Dokumen PDF via WhatsApp Gateway dengan caption pesan resmi
            \App\Jobs\SendWhatsAppFileJob::dispatch(
                $targetPhone,
                $base64Pdf,
                $fileName,
                'application/pdf',
                $waMessage
            );

            return true;
        } catch (\Throwable $e) {
            Log::error("[WhatsAppService] Gagal generate PDF untuk dikirim WA: " . $e->getMessage() . ". Mengirim pesan teks fallback.");
            if ($sync) {
                $res = $this->sendMessage($targetPhone, $waMessage);
                return ($res['status'] ?? '') === 'success';
            }
            \App\Jobs\SendWhatsAppRekapJob::dispatch($targetPhone, $waMessage);
            return true;
        }
    }
}

