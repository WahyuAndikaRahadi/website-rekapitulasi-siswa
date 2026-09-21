<?php

namespace App\Jobs;

use App\Services\WhatsAppService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendWhatsAppFileJob implements ShouldQueue
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
        public string $fileBase64,
        public string $fileName,
        public string $mimeType = 'application/pdf',
        public string $caption = ''
    ) {}

    /**
     * Execute the job.
     */
    public function handle(WhatsAppService $whatsAppService): void
    {
        Log::info("[SendWhatsAppFileJob] Memproses pengiriman file WA {$this->fileName} ke {$this->phoneNumber}...");

        $result = $whatsAppService->sendFile(
            $this->phoneNumber,
            $this->fileBase64,
            $this->fileName,
            $this->mimeType,
            $this->caption
        );

        if (($result['status'] ?? '') !== 'success') {
            Log::warning("[SendWhatsAppFileJob] Pengiriman file ke {$this->phoneNumber} gagal: " . ($result['message'] ?? 'Unknown error'));
        } else {
            Log::info("[SendWhatsAppFileJob] Pengiriman file ke {$this->phoneNumber} berhasil selesai.");
        }
    }
}
