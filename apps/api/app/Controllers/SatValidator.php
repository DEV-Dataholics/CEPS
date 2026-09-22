<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;

class SatValidator extends ResourceController
{
    /**
     * Consulta y extrae datos oficiales de la Cédula de Identificación Fiscal (CIF) del SAT.
     * Endpoint: GET /api/v1/sat/consultar?url=...
     */
    public function consultar()
    {
        $url = $this->request->getGet('url');

        if (!$url || !is_string($url)) {
            return $this->response->setStatusCode(400)->setJSON([
                'status'  => 'error',
                'message' => 'Parámetro url es requerido.',
            ]);
        }

        $url = trim($url);

        // Validación de seguridad para evitar SSRF hacia dominios no autorizados
        if (!preg_match('#^https://siat\.sat\.gob\.mx/app/qr/#i', $url)) {
            // Si no es la URL completa del SAT pero contiene el RFC en D3
            if (preg_match('/_([A-Z&Ñ]{4}\d{6}[A-Z0-9]{3})/i', $url, $matchRfc)) {
                return $this->response->setJSON([
                    'status'  => 'partial',
                    'rfc'     => strtoupper($matchRfc[1]),
                    'message' => 'URL no autorizada para consulta en vivo, RFC extraído de parámetro.',
                ]);
            }

            return $this->response->setStatusCode(400)->setJSON([
                'status'  => 'error',
                'message' => 'La URL proporcionada no corresponde al validador oficial del SAT.',
            ]);
        }

        // Extraer RFC de respaldo del parámetro D3
        $rfcRespaldo = '';
        if (preg_match('/_([A-Z&Ñ]{4}\d{6}[A-Z0-9]{3})/i', $url, $mRfcUrl)) {
            $rfcRespaldo = strtoupper($mRfcUrl[1]);
        }

        // Consultar HTML del SAT vía cURL
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL            => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 6,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_USERAGENT      => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            CURLOPT_HTTPHEADER     => [
                'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language: es-MX,es;q=0.9',
            ],
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => 0,
            CURLOPT_SSL_CIPHER_LIST => 'DEFAULT@SECLEVEL=0',
        ]);

        $html = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($html === false || $httpCode !== 200) {
            return $this->response->setJSON([
                'status'  => 'partial',
                'rfc'     => $rfcRespaldo,
                'message' => 'No se pudo contactar el portal del SAT en vivo (' . ($curlError ?: "HTTP {$httpCode}") . '), pero se extrajo el RFC del código QR.',
            ]);
        }

        // Helper para extraer campos etiquetados en las tablas del SAT
        $extractField = static function (string $label, string $content): string {
            $pattern = '/<span[^>]*>' . preg_quote($label, '/') . '<\/span><\/td>\s*<td[^>]*>([^<]*)<\/td>/i';
            if (preg_match($pattern, $content, $matches)) {
                return trim($matches[1]);
            }
            return '';
        };

        // Extraer RFC del cuerpo o del respaldo
        $rfc = '';
        if (preg_match('/El RFC:\s*([A-Z&Ñ0-9]{13})/i', $html, $mRfcBody)) {
            $rfc = strtoupper(trim($mRfcBody[1]));
        } else {
            $rfc = $rfcRespaldo;
        }

        $curp      = $extractField('CURP:', $html);
        $nombre    = $extractField('Nombre:', $html);
        $paterno   = $extractField('Apellido Paterno:', $html);
        $materno   = $extractField('Apellido Materno:', $html);
        $fechaNac  = $extractField('Fecha Nacimiento:', $html);
        $situacion = $extractField('Situación del contribuyente:', $html);

        $entidad   = $extractField('Entidad Federativa:', $html);
        $municipio = $extractField('Municipio o delegación:', $html);
        $colonia   = $extractField('Colonia:', $html);
        $tipoVia   = $extractField('Tipo de vialidad:', $html);
        $vialidad  = $extractField('Nombre de la vialidad:', $html);
        $numExt    = $extractField('Número exterior:', $html);
        $numInt    = $extractField('Número interior:', $html);
        $cp        = $extractField('CP:', $html);

        // Extraer Regímenes
        $regimenes = [];
        if (preg_match_all('/<td[^>]*><span[^>]*>Régimen:<\/span><\/td>\s*<td[^>]*>([^<]+)<\/td>/i', $html, $mReg)) {
            $regimenes = array_map('trim', $mReg[1]);
        }

        $calleNumero = trim("{$tipoVia} {$vialidad} #{$numExt}");
        if ($numInt) {
            $calleNumero .= " INT. {$numInt}";
        }

        $nombreCompleto = trim("{$nombre} {$paterno} {$materno}");

        return $this->response->setJSON([
            'status'          => 'ok',
            'rfc'             => $rfc,
            'curp'            => $curp,
            'nombre'          => $nombre,
            'apellidoPaterno' => $paterno,
            'apellidoMaterno' => $materno,
            'nombreCompleto'  => $nombreCompleto,
            'fechaNacimiento' => $fechaNac,
            'situacion'       => $situacion ?: 'ACTIVO',
            'domicilio'       => [
                'calle'             => $vialidad,
                'tipoVialidad'      => $tipoVia,
                'numeroExterior'    => $numExt,
                'numeroInterior'    => $numInt,
                'calleNumero'       => $calleNumero,
                'colonia'           => $colonia,
                'codigoPostal'      => $cp,
                'municipio'         => $municipio,
                'estado'            => $entidad,
                'direccionCompleta' => trim("{$calleNumero}, COL. {$colonia}, CP {$cp}, {$municipio}, {$entidad}"),
            ],
            'regimenes'       => $regimenes,
        ]);
    }
}
