<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;

class Geocoding extends ResourceController
{
    public function reverse()
    {
        $lat = $this->request->getGet('lat');
        $lng = $this->request->getGet('lng');

        if ($lat === null || $lng === null || !is_numeric($lat) || !is_numeric($lng)) {
            return $this->response->setStatusCode(400)->setJSON([
                'status'  => 'error',
                'message' => 'Parámetros lat y lng requeridos y deben ser numéricos.',
            ]);
        }

        $lat = (float) $lat;
        $lng = (float) $lng;

        if ($lat < -90 || $lat > 90 || $lng < -180 || $lng > 180) {
            return $this->response->setStatusCode(400)->setJSON([
                'status'  => 'error',
                'message' => 'Coordenadas fuera de rango geográfico válido.',
            ]);
        }

        $url = sprintf(
            'https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=%F&lon=%F&addressdetails=1',
            $lat,
            $lng
        );

        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL            => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 4,
            CURLOPT_USERAGENT      => 'CEPS-PasoDelNorte-Recruitment/1.0 (info@ceps.mx)',
            CURLOPT_HTTPHEADER     => [
                'Accept: application/json',
                'Accept-Language: es-MX,es;q=0.9',
            ],
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => 0,
        ]);

        $rawResponse = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($rawResponse === false || $httpCode !== 200) {
            return $this->response->setJSON([
                'status'       => 'partial',
                'calleNumero'  => '',
                'colonia'      => '',
                'codigoPostal' => '',
                'ciudad'       => 'Ciudad Juárez',
                'estado'       => 'Chihuahua',
                'message'      => 'No se pudo contactar el servicio de geocodificación: ' . ($curlError ?: "HTTP {$httpCode}"),
            ]);
        }

        $data = json_decode($rawResponse, true);
        if (!$data || !isset($data['address'])) {
            return $this->response->setJSON([
                'status'       => 'ok',
                'calleNumero'  => '',
                'colonia'      => '',
                'codigoPostal' => '',
                'ciudad'       => 'Ciudad Juárez',
                'estado'       => 'Chihuahua',
                'displayName'  => $data['display_name'] ?? '',
            ]);
        }

        $addr = $data['address'];

        // Extraer calle y número
        $road = $addr['road'] ?? $addr['pedestrian'] ?? $addr['street'] ?? $addr['path'] ?? $addr['footway'] ?? '';
        $houseNumber = $addr['house_number'] ?? '';
        $calleNumero = '';
        if ($road && $houseNumber) {
            $calleNumero = "{$road} #{$houseNumber}";
        } elseif ($road) {
            $calleNumero = $road;
        }

        // Extraer colonia / fraccionamiento / barrio / zona industrial
        $colonia = $addr['neighbourhood']
            ?? $addr['suburb']
            ?? $addr['residential']
            ?? $addr['quarter']
            ?? $addr['subdivision']
            ?? $addr['city_district']
            ?? $addr['industrial']
            ?? $addr['village']
            ?? $addr['allotments']
            ?? '';

        // Extraer código postal
        $codigoPostal = $addr['postcode'] ?? '';

        // Ciudad y Estado
        $ciudad = $addr['city'] ?? $addr['town'] ?? $addr['county'] ?? 'Ciudad Juárez';
        $estado = $addr['state'] ?? 'Chihuahua';

        return $this->response->setJSON([
            'status'       => 'ok',
            'calleNumero'  => $calleNumero,
            'colonia'      => $colonia,
            'codigoPostal' => $codigoPostal,
            'ciudad'       => $ciudad,
            'estado'       => $estado,
            'displayName'  => $data['display_name'] ?? '',
        ]);
    }
}
