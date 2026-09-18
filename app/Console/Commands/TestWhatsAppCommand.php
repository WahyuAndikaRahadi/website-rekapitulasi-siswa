<?php

namespace App\Console\Commands;

use App\Jobs\SendWhatsAppRekapJob;
use App\Services\WhatsAppService;
use Illuminate\Console\Command;

class TestWhatsAppCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'wa:test {number : Nomor WhatsApp tujuan (misal 08123456789)} {message? : Pesan yang ingin dikirim} {--queue : Kirim via async queue job}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Kirim pesan tes ke WhatsApp Gateway Node.js';

    /**
     * Execute the console command.
     */
    public function handle(WhatsAppService $service): int
    {
        $number = $this->argument('number');
        $message = $this->argument('message') ?? 'Halo! Ini adalah pesan tes dari Sistem Rekapitulasi Siswa SMKN 69 Jakarta.';
        $useQueue = $this->option('queue');

        $this->info("Menyiapkan pengiriman ke {$number}...");
        $this->line("Pesan: {$message}");

        if ($useQueue) {
            SendWhatsAppRekapJob::dispatch($number, $message);
            $this->info("✅ Job berhasil dimasukkan ke antrean queue (SendWhatsAppRekapJob).");
            return self::SUCCESS;
        }

        $response = $service->sendMessage($number, $message);

        if (($response['status'] ?? '') === 'success') {
            $this->info("✅ Pesan berhasil dikirim langsung via WhatsApp Gateway!");
            $this->line(json_encode($response, JSON_PRETTY_PRINT));
            return self::SUCCESS;
        }

        $this->error("❌ Gagal mengirim pesan via WhatsApp Gateway.");
        $this->line("Detail: " . ($response['message'] ?? 'Unknown error'));
        return self::FAILURE;
    }
}
