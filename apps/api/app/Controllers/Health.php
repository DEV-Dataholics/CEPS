<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;

class Health extends ResourceController
{
    public function index()
    {
        return $this->response->setJSON([
            'status'    => 'ok',
            'version'   => '1.0.0',
            'database'  => 'ceps_db',
            'timestamp' => date('c'),
        ]);
    }
}
