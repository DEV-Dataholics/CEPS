<?php

use CodeIgniter\Router\RouteCollection;

/** @var RouteCollection $routes */
$routes->get('/', 'Home::index');

$routes->group('api/v1', static function ($routes) {
    $routes->get('health', 'Health::index');
    $routes->get('geocoding/reverse', 'Geocoding::reverse');
});
