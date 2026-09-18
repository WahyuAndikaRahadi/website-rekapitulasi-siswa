<?php

namespace App\Jobs;

use App\Services\WhatsAppService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendWhatsAppRekapJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Jumlah percobaan jika gagal.
     */
    public int $tries = 3;

    /**
     * Jeda waktu (detik) sebelum retry.
     */
    public int $backoff = 10;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public string $phoneNumber,
        public string $message
    ) {}

    /**
     * Execute the job.
     */
    public function handle(WhatsAppService $whatsAppService): void
    {
        Log::info("[SendWhatsAppRekapJob] Memproses pengiriman pesan WA ke {$this->phoneNumber}...");

        $result = $whatsAppService->sendMessage($this->phoneNumber, $this->message);

        if (($result['status'] ?? '') !== 'success') {
            Log::warning("[SendWhatsAppRekapJob] Pengiriman ke {$this->phoneNumber} gagal: " . ($result['message'] ?? 'Unknown error'));
            
            // Lempar exception jika ingin queue otomatis retry
            // throw new \Exception($result['message'] ?? 'WhatsApp Gateway failed');
        } else {
            Log::info("[SendWhatsAppRekapJob] Pengiriman ke {$this->phoneNumber} berhasil selesai.");
        }
    }
}
