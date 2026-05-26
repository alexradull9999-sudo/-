<?php
/**
 * БЕЗРАМ — Универсальный обработчик заявок на PHP
 * 
 * Данный скрипт обрабатывает заявки с сайта и отправляет их в:
 * 1. Telegram бот
 * 2. Discord вебхук
 * 3. На электронную почту (Email) через стандартную функцию mail()
 * 4. Битрикс24 CRM
 * 5. AmoCRM CRM
 * 6. Универсальный вебхук (Zapier, Make, etc.)
 * 7. Google Таблицы (Google Apps Script)
 * 
 * Скрипт поддерживает кросс-доменные запросы (CORS) и принимает
 * как JSON-данные (по умолчанию из React), так и стандартный x-www-form-urlencoded.
 */

// Разрешаем CORS-запросы (чтобы можно было слать запросы с любого домена/хоста в dev-режиме)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Cache-Control: no-cache, must-revalidate");
header("Content-Type: application/json; charset=utf-8");

// Если это OPTIONS запрос, просто возвращаем успешный статус пре-флайта
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

// Если это GET запрос, возвращаем статус активности скрипта
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode([
        "status" => "active", 
        "message" => "Этот PHP-обработчик активен. Для отправки заявки используйте метод POST."
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

// =========================================================================
// НАСТРОЙКИ ИНТЕГРАЦИЙ (Можно настроить тут или через переменные окружения)
// =========================================================================

// 1. Telegram
define('TELEGRAM_BOT_TOKEN', getenv('TELEGRAM_BOT_TOKEN') ?: '8097935111:AAHL0OaRb2TxdkI21t8ZaBmT_24kzM8hGPA'); // Замените на ваш токен бота
define('TELEGRAM_CHAT_ID', getenv('TELEGRAM_CHAT_ID') ?: '5874913931');   // Замените на ID вашего чата или канала

// 2. Discord Webhook
define('DISCORD_WEBHOOK_URL', getenv('DISCORD_WEBHOOK_URL') ?: 'https://discord.com/api/webhooks/1503981587342037032/ozZDR5YSbaX0UcPOfQ-itJR2oFAfdfVzh_TbfIT2YtHwIs6hO5am_dsFYXw2jZmSR5Up'); 

// 3. Настройки Почты (Email)
define('EMAIL_TO', getenv('EMAIL_TO') ?: 'alexradull9999@gmail.com');             // Кому отправлять письма
define('EMAIL_FROM', getenv('EMAIL_FROM') ?: 'no-reply@bezram.store'); // От кого (желательно на вашем домене)

// 4. Битрикс24 (Входящий вебхук, пример: https://b24-xxx.bitrix24.ru/rest/1/yyyyy)
define('BITRIX24_WEBHOOK_URL', getenv('BITRIX24_WEBHOOK_URL') ?: '');

// 5. AmoCRM (Ссылка на вебхук)
define('AMOCRM_WEBHOOK_URL', getenv('AMOCRM_WEBHOOK_URL') ?: '');

// 6. Generic Webhook (Zapier / Make / Webhook.site)
define('GENERIC_WEBHOOK_URL', getenv('GENERIC_WEBHOOK_URL') ?: '');

// 7. Google Таблицы (Google Apps Script Web App URL)
define('GOOGLE_SHEETS_WEBHOOK_URL', getenv('GOOGLE_SHEETS_WEBHOOK_URL') ?: 'https://script.google.com/macros/s/AKfycbzNEEa_VmqsGaV2JGuX_bnCvUccbQbAEBtSkGhrsIUU5l_nYKCDTbF_v_0nidGzRgkY/exec');


// =========================================================================
// ЧТЕНИЕ И КЛАССИФИКАЦИЯ ДАННЫХ ЗАПРОСА
// =========================================================================

// Читаем сырой JSON поток (из React/Vite fetch-запросов)
$inputRaw = file_get_contents('php://input');
$data = json_decode($inputRaw, true);

// Если JSON пустой, сработает фоллбек на стандартный $_POST массив
if (empty($data)) {
    $data = $_POST;
}

// Получаем и очищаем поля заявки
$phone = isset($data['phone']) ? trim(strip_tags($data['phone'])) : '';
$name = isset($data['name']) ? trim(strip_tags($data['name'])) : '';
$type = isset($data['type']) ? trim(strip_tags($data['type'])) : '';
$details = isset($data['details']) ? $data['details'] : '';
$source = isset($data['source']) ? trim(strip_tags($data['source'])) : '';

// Проверяем обязательное поле Phone
if (empty($phone)) {
    http_response_code(400);
    echo json_encode([
        "success" => false, 
        "error" => "Поле Телефон является обязательным для отправки."
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

// Форматируем детали (могут прийти в виде строки или JSON/массива квиза)
$detailsStr = '';
if (is_array($details)) {
    $detailsStr = json_encode($details, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
} else if (!empty($details)) {
    $detailsStr = $details;
} else {
    $detailsStr = 'Нет';
}

$currentDate = date('d.m.Y H:i:s');

// Шаблон сообщения для Telegram и Discord (Markdown)
$messageMarkdown = "🚀 *Новая заявка с сайта!*\n"
                 . "📌 *Источник:* " . ($source ?: 'Форма на сайте') . "\n"
                 . "👤 *Имя:* " . ($name ?: 'Не указано') . "\n"
                 . "📞 *Телефон:* " . ($phone ?: 'Не указано') . "\n"
                 . "🏠 *Объект:* " . ($type ?: 'Не указано') . "\n"
                 . "📝 *Детали:* " . $detailsStr . "\n"
                 . "🕒 *Время:* " . $currentDate;

// Шаблон простого текстового сообщения
$messageText = "Новая заявка со структурированной формы!\n"
             . "Источник: " . ($source ?: 'Форма на сайте') . "\n"
             . "Имя: " . ($name ?: 'Не указано') . "\n"
             . "Телефон: " . ($phone ?: 'Не указано') . "\n"
             . "Объект: " . ($type ?: 'Не указано') . "\n"
             . "Детали: " . $detailsStr . "\n"
             . "Время отправки: " . $currentDate . "\n";

$results = [
    "timestamp" => date('c')
];


// =========================================================================
// ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ ДЛЯ HTTP ЗАПРОСОВ (с поддержкой cURL и file_get_contents)
// =========================================================================
function makeRequest($url, $method = 'POST', $payload = null, $headers = []) {
    if (function_exists('curl_init')) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 15);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        
        // По умолчанию cURL сбросит метод на GET при 302, если не запретить авто-фоллоу напрямую.
        // Google Apps Script возвращает 302 перенаправление. Будем обрабатывать 302 перенаправление вручную или автоматически.
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_AUTOREFERER, true);
        
        // Для сохранения POST-метода при редиректе
        if (defined('CURLOPT_POSTREDIR')) {
            curl_setopt($ch, CURLOPT_POSTREDIR, 3); // 3 означает сохранять POST при 301/302/303
        }

        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POST, true);
            if ($payload) {
                curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
            }
        }
        
        if (!empty($headers)) {
            curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        }
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        return [
            'status' => $httpCode,
            'body' => $response
        ];
    } else {
        // Запасной вариант через потоковый контекст PHP
        $contextHeaders = "";
        foreach ($headers as $h) {
            $contextHeaders .= $h . "\r\n";
        }
        
        $options = [
            'http' => [
                'method'  => $method,
                'header'  => $contextHeaders . "Connection: close\r\n",
                'content' => $payload,
                'timeout' => 15,
                'ignore_errors' => true,
                'follow_location' => 1
            ]
        ];
        $context = stream_context_create($options);
        $response = @file_get_contents($url, false, $context);
        
        $httpCode = 500;
        if (isset($http_response_header) && !empty($http_response_header)) {
            preg_match('{HTTP\/\S+\s+(\d+)}', $http_response_header[0], $matches);
            if (isset($matches[1])) {
                $httpCode = intval($matches[1]);
            }
        }
        
        return [
            'status' => $httpCode,
            'body' => $response
        ];
    }
}


// =========================================================================
// ВЫПОЛНЕНИЕ ОТПРАВОК ПО АКТИВНЫМ КАНАЛАМ
// =========================================================================

// 1. Отправка в Telegram
if (!empty(TELEGRAM_BOT_TOKEN) && !empty(TELEGRAM_CHAT_ID) && TELEGRAM_BOT_TOKEN !== 'YOUR_TELEGRAM_BOT_TOKEN') {
    $tgUrl = "https://api.telegram.org/bot" . TELEGRAM_BOT_TOKEN . "/sendMessage";
    $payload = json_encode([
        'chat_id' => TELEGRAM_CHAT_ID,
        'text' => $messageMarkdown,
        'parse_mode' => 'Markdown'
    ]);
    
    $res = makeRequest($tgUrl, 'POST', $payload, ['Content-Type: application/json']);
    if ($res['status'] >= 200 && $res['status'] < 300) {
        $results['telegram'] = "sent";
    } else {
        $results['telegram'] = "error: Http " . $res['status'];
    }
} else {
    $results['telegram'] = "disabled: No Token/ChatID";
}

// 2. Отправка в Discord
if (!empty(DISCORD_WEBHOOK_URL) && DISCORD_WEBHOOK_URL !== 'YOUR_DISCORD_WEBHOOK_URL') {
    $payload = json_encode([
        'content' => "**Новая заявка с сайта!**\n" . str_replace('*', '', $messageMarkdown)
    ]);
    $res = makeRequest(DISCORD_WEBHOOK_URL, 'POST', $payload, ['Content-Type: application/json']);
    if ($res['status'] >= 200 && $res['status'] < 300) {
        $results['discord'] = "sent";
    } else {
        $results['discord'] = "error: Http " . $res['status'];
    }
}

// 3. Отправка Email-письма
if (!empty(EMAIL_TO) && EMAIL_TO !== 'YOUR_EMAIL_TO') {
    $to = EMAIL_TO;
    $subject = "=?utf-8?B?" . base64_encode("Новая заявка: " . ($name ?: $phone)) . "?=";
    $from = EMAIL_FROM !== 'YOUR_EMAIL_FROM' ? EMAIL_FROM : "no-reply@" . $_SERVER['HTTP_HOST'];
    
    // Заголовки для отправки UTF-8 HTML-письма
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type: text/html; charset=utf-8" . "\r\n";
    $headers .= "From: " . $from . "\r\n";
    $headers .= "Reply-To: " . $from . "\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
    
    $htmlContent = "<html>
    <head>
        <title>Новая заявка с сайта</title>
        <style>
            body { font-family: Arial, sans-serif; background-color: #f4f6f9; padding: 20px; }
            .card { background: white; border-radius: 8px; padding: 20px; border: 1px solid #e1e4e8; max-width: 600px; margin: 0 auto; }
            h2 { color: #0066cc; border-bottom: 2px solid #0066cc; padding-bottom: 10px; margin-top: 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            td { padding: 10px; border-bottom: 1px solid #eee; }
            .label { font-weight: bold; color: #444; width: 130px; }
            .value { color: #222; }
            .footer { font-size: 11px; color: #888; margin-top: 20px; text-align: center; }
        </style>
    </head>
    <body>
        <div class='card'>
            <h2>Заявка с сайта БЕЗРАМ</h2>
            <table>
                <tr><td class='label'>Имя:</td><td class='value'>" . htmlspecialchars($name ?: 'Не указано') . "</td></tr>
                <tr><td class='label'>Телефон:</td><td class='value'><b>" . htmlspecialchars($phone) . "</b></td></tr>
                <tr><td class='label'>Объект:</td><td class='value'>" . htmlspecialchars($type ?: 'Не указано') . "</td></tr>
                <tr><td class='label'>Источник:</td><td class='value'>" . htmlspecialchars($source ?: 'Форма на сайте') . "</td></tr>
                <tr><td class='label'>Детали:</td><td class='value'><pre style='margin:0; white-space:pre-wrap; font-family:inherit;'>" . htmlspecialchars($detailsStr) . "</pre></td></tr>
                <tr><td class='label'>Дата отправки:</td><td class='value'>" . $currentDate . "</td></tr>
            </table>
            <div class='footer'>Письмо отправлено автоматически веб-сервером " . htmlspecialchars($_SERVER['HTTP_HOST']) . "</div>
        </div>
    </body>
    </html>";
    
    // Попытка отправить письмо
    if (@mail($to, $subject, $htmlContent, $headers)) {
        $results['email'] = "sent";
    } else {
        $results['email'] = "error: Local mail() failed";
    }
}

// 4. Битрикс24 CRM
if (!empty(BITRIX24_WEBHOOK_URL)) {
    $bxUrl = rtrim(BITRIX24_WEBHOOK_URL, '/') . "/crm.lead.add.json";
    $payload = json_encode([
        'fields' => [
            'TITLE' => 'Заявка с сайта БЕЗРАМ (' . ($source ?: 'Форма') . ')',
            'NAME' => $name ?: 'Без имени',
            'PHONE' => [['VALUE' => $phone, 'VALUE_TYPE' => 'WORK']],
            'COMMENTS' => 'Объект: ' . ($type ?: '-') . "\nДетали: " . $detailsStr,
            'SOURCE_ID' => 'WEB'
        ]
    ]);
    $res = makeRequest($bxUrl, 'POST', $payload, ['Content-Type: application/json']);
    if ($res['status'] >= 200 && $res['status'] < 300) {
        $results['bitrix24'] = "sent";
    } else {
        $results['bitrix24'] = "error: Http " . $res['status'];
    }
}

// 5. AmoCRM Webhook
if (!empty(AMOCRM_WEBHOOK_URL)) {
    $payload = json_encode([
        'leads' => [
            'add' => [
                [
                    'name' => 'Заявка с сайта БЕЗРАМ',
                    'custom_fields' => [
                        ['id' => 12345, 'values' => [['value' => $phone]]] // Пример ID поля
                    ]
                ]
            ]
        ]
    ]);
    $res = makeRequest(AMOCRM_WEBHOOK_URL, 'POST', $payload, ['Content-Type: application/json']);
    if ($res['status'] >= 200 && $res['status'] < 300) {
        $results['amocrm'] = "sent";
    } else {
        $results['amocrm'] = "error: Http " . $res['status'];
    }
}

// 6. Generic Webhook (Zapier / Webhook.site)
if (!empty(GENERIC_WEBHOOK_URL)) {
    $payload = json_encode([
        'name' => $name,
        'phone' => $phone,
        'type' => $type,
        'details' => $details,
        'source' => $source,
        'timestamp' => $results['timestamp']
    ]);
    $res = makeRequest(GENERIC_WEBHOOK_URL, 'POST', $payload, ['Content-Type: application/json']);
    if ($res['status'] >= 200 && $res['status'] < 300) {
        $results['webhook'] = "sent";
    } else {
        $results['webhook'] = "error: Http " . $res['status'];
    }
}

// 7. Отправка в Google Sheets
if (!empty(GOOGLE_SHEETS_WEBHOOK_URL) && GOOGLE_SHEETS_WEBHOOK_URL !== 'YOUR_GOOGLE_SHEETS_WEBHOOK_URL') {
    $sheetsUrl = GOOGLE_SHEETS_WEBHOOK_URL;
    $payload = json_encode([
        'date' => $currentDate,
        'name' => $name ?: '',
        'phone' => $phone ?: '',
        'source' => $source ?: 'Website',
        'type' => $type ?: '',
        'details' => $detailsStr
    ]);

    // Google Apps Script веб-приложение принимает POST с Content-Type: text/plain или application/json,
    // но при перенаправлениях (302) может выдать ошибку 405 Method Not Allowed, если клиент не может правильно совершить редирект.
    // Запускаем ручную обработку Location при 302, чтобы сохранить метод POST.
    if (function_exists('curl_init')) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $sheetsUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: text/plain;charset=utf-8']);
        curl_setopt($ch, CURLOPT_TIMEOUT, 15);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_HEADER, true); // Нам нужны заголовки, чтобы увидеть Location редиректа вручную
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
        $headersText = substr($response, 0, $headerSize);
        curl_close($ch);
        
        // Извлекаем URL редиректа, если получен временный статус 302 / 301
        $redirectUrl = '';
        if ($httpCode === 301 || $httpCode === 302) {
            if (preg_match('/Location:\s*(.*)/i', $headersText, $matches)) {
                $redirectUrl = trim($matches[1]);
            }
        }
        
        // Если редирект есть, делаем повторный POST по новому адресу
        if (!empty($redirectUrl)) {
            $chRedirect = curl_init();
            curl_setopt($chRedirect, CURLOPT_URL, $redirectUrl);
            curl_setopt($chRedirect, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($chRedirect, CURLOPT_POST, true);
            curl_setopt($chRedirect, CURLOPT_POSTFIELDS, $payload);
            curl_setopt($chRedirect, CURLOPT_HTTPHEADER, ['Content-Type: text/plain;charset=utf-8']);
            curl_setopt($chRedirect, CURLOPT_TIMEOUT, 15);
            curl_setopt($chRedirect, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($chRedirect, CURLOPT_SSL_VERIFYHOST, false);
            curl_setopt($chRedirect, CURLOPT_FOLLOWLOCATION, true);
            
            $redirectResponse = curl_exec($chRedirect);
            $httpCode = curl_getinfo($chRedirect, CURLINFO_HTTP_CODE);
            curl_close($chRedirect);
        }
        
        if ($httpCode >= 200 && $httpCode < 300) {
            $results['google_sheets'] = "sent";
        } else {
            // Если возник 405 или другой статус, пишем подробную ошибку
            $results['google_sheets'] = "error: " . $httpCode;
        }
    } else {
        // Фоллбек на обычный stream context, если cURL отключен
        $options = [
            'http' => [
                'method' => 'POST',
                'header' => "Content-Type: text/plain;charset=utf-8\r\n",
                'content' => $payload,
                'timeout' => 15,
                'follow_location' => 1 // Google Sheet redirect auto-follow
            ]
        ];
        $context = stream_context_create($options);
        $response = @file_get_contents($sheetsUrl, false, $context);
        if ($response !== false) {
            $results['google_sheets'] = "sent";
        } else {
            $results['google_sheets'] = "error: post_failed";
        }
    }
} else {
    $results['google_sheets'] = "skipped: URL not set";
}


// =========================================================================
// ОТВЕТ КЛИЕНТУ В ФОРМАТЕ JSON
// =========================================================================
http_response_code(200);
echo json_encode([
    "success" => true,
    "results" => $results
], JSON_UNESCAPED_UNICODE);
exit();
