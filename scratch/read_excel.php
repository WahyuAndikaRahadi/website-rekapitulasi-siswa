<?php

require 'vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\IOFactory;

$filePath = 'docs/DATA PELANGGARAN MURID SMKN 69 JAKARTA .xlsx';
$spreadsheet = IOFactory::load($filePath);

echo "Sheet Names:\n";
foreach ($spreadsheet->getSheetNames() as $name) {
    echo "- " . $name . "\n";
}

foreach ($spreadsheet->getSheetNames() as $name) {
    echo "\n================ SHEET: $name ================\n";
    $sheet = $spreadsheet->getSheetByName($name);
    $highestRow = min(15, $sheet->getHighestRow());
    $highestColumn = $sheet->getHighestColumn();

    for ($row = 1; $row <= $highestRow; $row++) {
        $rowData = [];
        for ($col = 'A'; $col <= $highestColumn; $col++) {
            $val = $sheet->getCell($col . $row)->getFormattedValue();
            if ($val !== null && $val !== '') {
                $rowData[] = "$col$row: $val";
            }
        }
        if (!empty($rowData)) {
            echo implode(" | ", $rowData) . "\n";
        }
    }
}
