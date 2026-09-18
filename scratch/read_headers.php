<?php

require 'vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\IOFactory;

$filePath = 'docs/DATA PELANGGARAN MURID SMKN 69 JAKARTA .xlsx';
$spreadsheet = IOFactory::load($filePath);
$sheet = $spreadsheet->getSheetByName('DATA SELURUH (1)');

for ($row = 9; $row <= 16; $row++) {
    echo "ROW $row: ";
    $cols = [];
    foreach (range('A', 'Z') as $col) {
        $val = $sheet->getCell($col . $row)->getFormattedValue();
        if ($val !== null && $val !== '') {
            $cols[] = "[$col: $val]";
        }
    }
    echo implode(' ', $cols) . "\n";
}
