# Handoff: Add error/event logging to Laravel app

## Context

Laravel 12 project (Blade frontend, AdminLTE admin panel). Stack per `composer.json`:
PHP 8.2, `laravel/framework ^12.0`, `jeroennoten/laravel-adminlte ^3.16`,
`barryvdh/laravel-dompdf ^3.1`, `simplesoftwareio/simple-qrcode ^4.2`,
`barryvdh/laravel-debugbar` (dev), `laravel/pail` (dev).

**Important — do not confuse this with the existing audit system.** The app already
has a custom `App\Services\AuditLogService::log($action, $table, $id, $old, $new)`
used throughout the controllers (e.g. `AplFastTrackController`, `TukAdminController`,
`SignatureController`, `MukDocumentChecklistController`). That service writes to an
`AuditLog` **database table** and tracks business-record changes (who changed what
field, old value → new value) for the activity feed on the super-admin dashboard.

This task is **additive, not a replacement**: build a separate **file-based**
error/event log for debugging (exceptions, failed external calls, silent failure
points) using Laravel's built-in logging (Monolog) system. Keep the two systems
separate — do not route `EventLogService` calls into `AuditLog`, and do not remove
or touch existing `AuditLogService::log(...)` calls.

## Task 1 — Scaffolding (do this first, exact code already decided)

### 1a. `config/logging.php`

Add a new channel inside the existing `'channels' => [...]` array:

```php
'events' => [
    'driver' => 'daily',
    'path' => storage_path('logs/events.log'),
    'level' => 'debug',
    'days' => 30,
],
```

### 1b. `bootstrap/app.php`

The `withExceptions()` closure is currently empty:

```php
->withExceptions(function (Exceptions $exceptions): void {
    //
})->create();
```

Replace the empty body with:

```php
->withExceptions(function (Exceptions $exceptions): void {
    $exceptions->report(function (\Throwable $e) {
        $trace = collect($e->getTrace())
            ->take(15)
            ->map(fn ($frame) => ($frame['file'] ?? '[internal]') . ':' . ($frame['line'] ?? '?'))
            ->all();

        \Illuminate\Support\Facades\Log::channel('events')->error($e->getMessage(), [
            'exception' => get_class($e),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'trace' => $trace,
            'url' => request()->fullUrl(),
            'method' => request()->method(),
            'user_id' => auth()->id(),
            'role' => auth()->user()?->role,
            'ip' => request()->ip(),
            'input' => request()->except(['password', 'password_confirmation', '_token']),
        ]);
    });
})
```

`report()` adds to Laravel's default exception logging, it doesn't replace it — nothing
currently in `laravel.log` should be lost. This alone auto-captures every uncaught
exception app-wide with no per-controller changes. `file`/`line` show where the
exception was thrown; `trace` lists every file:line the call passed through to get
there (capped at 15 frames to keep entries readable — adjust if needed).

### 1c. New file — `app/Services/EventLogService.php`

```php
<?php

namespace App\Services;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class EventLogService
{
    public static function info(string $event, array $context = []): void
    {
        self::write('info', $event, $context);
    }

    public static function warning(string $event, array $context = []): void
    {
        self::write('warning', $event, $context);
    }

    public static function error(string $event, array $context = []): void
    {
        self::write('error', $event, $context);
    }

    private static function write(string $level, string $event, array $context): void
    {
        Log::channel('events')->{$level}($event, array_merge([
            'user_id' => Auth::id(),
            'role' => Auth::user()?->role,
            'ip' => request()?->ip(),
        ], $context));
    }
}
```

Naming/calling convention deliberately mirrors the existing `AuditLogService::log(...)`
style already used across the codebase, so it feels native to this project.

## Task 2 — Wire `EventLogService` into controllers

Go through the controllers below and add `EventLogService::error(...)` /
`::warning(...)` / `::info(...)` calls at points that are currently **silent
failure points** — i.e. places where something could go wrong but there's
no record of it happening. Do not wrap every line; be selective.

**Confirmed example already scoped** — `app/Http/Controllers/WilayahController.php`,
inside `cachedJson()`:

```php
if ($response->failed()) {
    EventLogService::error('wilayah_api_failed', [
        'path' => $path,
        'status' => $response->status(),
    ]);
    abort(502, 'Gagal mengambil data wilayah dari server eksternal.');
}
```

**Apply the same judgment to these controllers** (not yet reviewed in detail —
inspect each and use discretion):
- `app/Http/Controllers/ApplicationController.php`
- `app/Http/Controllers/AsesorController.php`
- `app/Http/Controllers/KomiteController.php`
- `app/Http/Controllers/MukCenterController.php` (PDF rendering via `ChromiumPdfService` — log render failures)
- `app/Http/Controllers/MukDocumentChecklistController.php` (PDF via `Barryvdh\DomPDF` — log render failures)
- `app/Http/Controllers/TukAdminController.php` (the `$myTuk->data['logsheet']` / `$myTuk->data['peralatan']` JSON-blob read/writes have no validation that the blob is well-formed — worth an `EventLogService::warning(...)` if a write produces unexpected shape)
- `app/Http/Controllers/AplFastTrackController.php`
- `app/Http/Controllers/SignatureController.php`

**Patterns worth flagging across the whole app** (grep for these):
- External HTTP calls (`Http::` facade usage) — log on failure/timeout, similar to `WilayahController`.
- PDF/document generation calls — log on exception or empty output.
- Anywhere writing into a JSON column (`$model->data = [...]`) instead of a proper relation — these fail silently if the shape drifts; log warnings when expected keys are missing.
- `DB::transaction()` blocks — if there's a `catch` that swallows the exception instead of letting it bubble to the global handler, add an explicit `EventLogService::error(...)` inside the catch.

## Out of scope

- Do not modify or extend `AuditLogService` or the `AuditLog` model/table.
- Do not add a log-viewer UI unless separately requested (a viable option later is `rap2hpoutre/laravel-log-viewer`, reading `storage/logs/*.log`, integrated as an AdminLTE page — not needed for this task).
- Do not change `LOG_LEVEL`/`LOG_CHANNEL` in `.env` — the new `events` channel is called explicitly via `Log::channel('events')`, not the default stack.

## Acceptance check

- `storage/logs/events.log` gets created and receives entries once any exception is thrown or an `EventLogService::*` call fires.
- Existing `AuditLogService::log(...)` calls and the `AuditLog` DB table are untouched.
- No changes to `.env` / `.env.example` were needed.
