# 📊 SaaS de Facturación para PYMEs - Resumen Técnico del Backend (Laravel 13 & MariaDB)

Este documento contiene la arquitectura completa, el diseño de la base de datos, el sistema de permisos jerárquicos y las decisiones técnicas para el backend del **SaaS de Facturación para PYMEs**. Esta API REST servirá de motor para la aplicación construida en **Next.js 16.2**.

---

## 🛠️ Stack Tecnológico & Decisiones Clave

| Capa | Tecnología | Propósito / Decisión de Diseño |
| :--- | :--- | :--- |
| **Framework** | **Laravel 13** (PHP 8.3+) | Velocidad de desarrollo, robustez en routing, sistema nativo de colas e integración inmediata. |
| **Base de Datos** | **MariaDB** | Rápida, compatible al 100% con MySQL, excelente rendimiento en lectura/escritura e indexación relacional. |
| **Autenticación** | **Laravel Sanctum** | Autenticación robusta basada en tokens para APIs tipo SPA sin la complejidad de OAuth2 completo. |
| **Mapeo de Datos**| **Eloquent ORM** | Aprovechando las novedades de Laravel 13, incluyendo **PHP 8.3 Attributes** para definir propiedades del modelo. |
| **Control de Roles**| **Spatie Laravel-Permission** | Estándar de la industria para definir roles, permisos directos e inyección en middlewares. |
| **Colas de Trabajo**| **Laravel Queues (Redis/Database)**| Procesamiento asíncrono en background para tareas pesadas (generación de PDFs, webhooks, correos). |
| **Generación PDF** | **Laravel-DomPDF** / **Snappy** | Generación directa desde vistas Blade en HTML sin la sobrecarga de un navegador headless como Puppeteer. |

---

## 📂 Estructura de Carpetas del Backend (Laravel 13)

Seguimos una organización limpia estructurada por módulos funcionales y dominios para facilitar el mantenimiento a gran escala:

```
app/
├── Http/
│   ├── Controllers/
│   │   ├── Auth/                  # Login, Registro, Onboarding
│   │   ├── ClientController.php   # CRUD de Clientes
│   │   ├── InvoiceController.php  # CRUD y acciones de Facturas
│   │   ├── PaymentController.php  # Iniciación de pagos (MercadoPago/Stripe)
│   │   └── WebhookController.php  # Receptor de eventos asíncronos (Pasarela)
│   └── Middleware/
│       ├── TenantResolver.php     # Detecta e inyecta el Tenant actual desde el token/request
│       └── CheckUserRole.php      # Verificación de permisos a nivel HTTP
├── Models/
│   ├── Tenant.php                 # Modelo de la empresa/organización
│   ├── User.php                   # Modelo del usuario con Tenant ID
│   ├── Client.php                 # Clientes del Tenant
│   ├── Invoice.php                # Cabecera de facturas
│   ├── InvoiceItem.php            # Detalle de líneas de facturas
│   └── Payment.php                # Historial de pagos
├── Traits/
│   └── BelongsToTenant.php        # Global Scope para aislamiento automático de consultas
├── Jobs/
│   ├── ProcessWebhookPayment.php  # Procesamiento de pagos en background
│   └── GenerateInvoicePdf.php     # Renderizado de PDF asíncrono
└── Mail/
    └── InvoicePaidMail.php        # Envío de correo de confirmación de pago
```

---

## 🔑 Aislamiento de Datos (Multi-Tenancy)

El multi-tenancy se implementa a nivel de **esquema único con aislamiento lógico** (Single Database, Multi-Tenant). Todas las tablas del negocio tienen una columna `tenant_id` que actúa como llave foránea a la tabla `tenants`.

### Implementación en Laravel 13

Para evitar que un cliente vea datos de otro por un olvido en el código SQL, utilizamos un **Global Scope** mediante un `Trait`:

```php
namespace App\Traits;

use App\Models\Tenant;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

trait BelongsToTenant
{
    protected static function bootBelongsToTenant()
    {
        static::creating(function (Model $model) {
            if (auth()->check() && ! $model->tenant_id) {
                $model->tenant_id = auth()->user()->tenant_id;
            }
        });

        static::addGlobalScope('tenant', function (Builder $builder) {
            if (auth()->check()) {
                $builder->where('tenant_id', auth()->user()->tenant_id);
            }
        });
    }
}
```

> [!IMPORTANT]
> Al añadir `use BelongsToTenant;` en los modelos de negocio (`Client`, `Invoice`, etc.), Laravel inyectará automáticamente `WHERE tenant_id = ?` en todas las consultas (lecturas, actualizaciones y eliminaciones).

---

## 🗄️ Esquema Relacional de Base de Datos (MariaDB)

### 👥 1. Módulo de Identidad y Permisos

*   **`tenants`**: Almacena las empresas que pagan por el SaaS.
    *   `id` (BigInt, PK, Autoincremental)
    *   `name` (String, nombre comercial)
    *   `tax_id` (String, RUT / RFC / NIF)
    *   `email` (String)
    *   `status` (Enum: `active`, `suspended`)
    *   `created_at`, `updated_at` (Timestamps)
*   **`users`**: Administradores y trabajadores vinculados a una empresa.
    *   `id` (BigInt, PK)
    *   `tenant_id` (BigInt, FK -> tenants.id)
    *   `name` (String)
    *   `email` (String, Unique)
    *   `password` (String)
    *   `email_verified_at` (Timestamp)
    *   `created_at`, `updated_at` (Timestamps)
*   **`roles`**, **`permissions`**, **`model_has_roles`**, **`role_has_permissions`**: Tablas provistas por el paquete `spatie/laravel-permission` para resolver las jerarquías de permisos.

### 💼 2. Módulo de Negocio y Transacciones

*   **`clients`**: Clientes finales a quienes la PYME factura.
    *   `id` (BigInt, PK)
    *   `tenant_id` (BigInt, FK -> tenants.id, Index)
    *   `name` (String)
    *   `tax_id` (String, Identificador fiscal del cliente)
    *   `email` (String)
    *   `phone` (String)
    *   `address` (String)
    *   `created_at`, `updated_at` (Timestamps)
*   **`invoices`**: Cabeceras de las facturas emitidas.
    *   `id` (BigInt, PK)
    *   `tenant_id` (BigInt, FK -> tenants.id, Index)
    *   `client_id` (BigInt, FK -> clients.id)
    *   `invoice_number` (String, numeración correlativa por tenant)
    *   `issue_date` (Date)
    *   `due_date` (Date)
    *   `subtotal` (Decimal 12,2)
    *   `tax_rate` (Decimal 5,2)
    *   `tax_amount` (Decimal 12,2)
    *   `total` (Decimal 12,2)
    *   `currency` (String, e.g., 'CLP', 'USD')
    *   `status` (Enum: `draft`, `sent`, `paid`, `overdue`, `cancelled`)
    *   `notes` (Text)
    *   `created_at`, `updated_at` (Timestamps)
*   **`invoice_items`**: Desglose individual de cada concepto facturado.
    *   `id` (BigInt, PK)
    *   `invoice_id` (BigInt, FK -> invoices.id, On Delete Cascade)
    *   `description` (String)
    *   `quantity` (Decimal 8,2)
    *   `unit_price` (Decimal 12,2)
    *   `total` (Decimal 12,2, autocalculado: quantity * unit_price)
    *   `created_at`, `updated_at` (Timestamps)
*   **`payments`**: Transacciones financieras e integraciones de checkout.
    *   `id` (BigInt, PK)
    *   `tenant_id` (BigInt, FK -> tenants.id)
    *   `invoice_id` (BigInt, FK -> invoices.id)
    *   `payment_gateway` (Enum: `mercadopago`, `stripe`, `manual`)
    *   `transaction_id` (String, ID único de la pasarela de pago)
    *   `amount` (Decimal 12,2)
    *   `status` (Enum: `pending`, `approved`, `failed`, `refunded`)
    *   `paid_at` (Timestamp, Nullable)
    *   `created_at`, `updated_at` (Timestamps)

---

## 🛡️ Jerarquía de Roles & Permisos (RBAC)

Definimos cuatro roles principales para gestionar el acceso a los datos de la PYME de forma granulada:

| Rol | Propósito | Permisos Específicos |
| :--- | :--- | :--- |
| **`owner`** | Creador de la cuenta/empresa. | Acceso absoluto. CRUD de usuarios de la organización, suscripción al SaaS, edición de datos fiscales del Tenant, facturación y reportes. |
| **`admin`** | Administrador de operaciones de la PYME. | CRUD de clientes, CRUD de facturas, visualización de dashboard e importación/exportación de datos. *No puede editar la suscripción del Tenant ni eliminar otros admins/owners.* |
| **`billing`** | Encargado de facturación. | Crear, enviar y editar facturas (estado `draft` y `sent`), ver catálogo de clientes. *No puede ver gráficos globales de ingresos de la empresa ni eliminar datos históricos.* |
| **`viewer`** | Consultor o Contador externo. | Solo lectura (`GET`) en facturas, clientes y reportes. *Sin permisos de escritura, edición o eliminación de ningún tipo.* |

---

## 🚦 Matriz de Endpoints de la API

La API responde siempre con formatos JSON limpios. Todos los endpoints de negocio requieren que el usuario esté autenticado con Sanctum y pertenezca a un Tenant activo.

### 🔓 Auth & Onboarding (Público / Autenticado)
* `POST /api/v1/auth/register` : Crea un nuevo `Tenant` (empresa) y el usuario inicial con rol `owner`.
* `POST /api/v1/auth/login` : Autentica credenciales y retorna el token Sanctum + información del rol del usuario.
* `POST /api/v1/auth/logout` : Revoca el token actual de la sesión.

### 👥 Clientes (Filtro por Tenant automático)
* `GET /api/v1/clients` : Retorna la lista paginada de clientes. *(Permisos: `clients.view`)*
* `POST /api/v1/clients` : Crea un nuevo cliente. *(Permisos: `clients.create`)*
* `GET /api/v1/clients/{id}` : Detalle de un cliente específico. *(Permisos: `clients.view`)*
* `PUT /api/v1/clients/{id}` : Actualiza la información del cliente. *(Permisos: `clients.update`)*
* `DELETE /api/v1/clients/{id}` : Elimina un cliente. *(Permisos: `clients.delete`)*

### 📄 Facturas y Detalle
* `GET /api/v1/invoices` : Historial de facturas con filtros de estado y cliente. *(Permisos: `invoices.view`)*
* `POST /api/v1/invoices` : Registra una factura (incluye creación de `invoice_items` en lote). *(Permisos: `invoices.create`)*
* `GET /api/v1/invoices/{id}` : Detalle completo. *(Permisos: `invoices.view`)*
* `PUT /api/v1/invoices/{id}` : Edición de facturas en borrador (`draft`). *(Permisos: `invoices.update`)*
* `GET /api/v1/invoices/{id}/pdf` : Descarga directa del PDF o renderizado stream. *(Permisos: `invoices.view`)*

### 📈 Métricas de Dashboard (Solo lectura de agregaciones)
* `GET /api/v1/dashboard/summary` : Totales mensuales (Ingresos, Pendientes, Cobros del mes). *(Permisos: `reports.view`)*
* `GET /api/v1/dashboard/chart` : Datos listos para `Recharts` (línea de tiempo de ingresos de los últimos 6 meses). *(Permisos: `reports.view`)*

---

## 💳 Flujo de Pagos & Integración (MercadoPago)

El backend de Laravel 13 expone el endpoint necesario para que el frontend de Next.js envíe al cliente a la pasarela de pago sin gestionar datos bancarios sensibles de forma directa.

### 1. Generación de Preferencia
El cliente en Next.js hace clic en "Pagar con MercadoPago".
```php
// app/Http/Controllers/PaymentController.php
use MercadoPago\Client\Preference\PreferenceClient;
use MercadoPago\MercadoPagoConfig;

public function processPayment(Invoice $invoice)
{
    MercadoPagoConfig::setAccessToken(config('services.mercadopago.token'));
    
    $client = new PreferenceClient();
    $preference = $client->create([
        'items' => [[
            'title'       => "Factura #{$invoice->invoice_number}",
            'quantity'    => 1,
            'unit_price'  => (float) $invoice->total,
            'currency_id' => $invoice->currency, // CLP, MXN, USD
        ]],
        'back_urls' => [
            'success' => config('app.frontend_url') . "/dashboard/invoices/{$invoice->id}?status=success",
            'failure' => config('app.frontend_url') . "/dashboard/invoices/{$invoice->id}?status=failed",
        ],
        'notification_url' => route('webhooks.mercadopago'),
        'external_reference' => (string) $invoice->id,
    ]);

    return response()->json(['checkout_url' => $preference->init_point]);
}
```

### 2. Procesamiento del Webhook asíncrono
MercadoPago envía un `POST` al backend cuando cambian los estados de la transacción. El endpoint responde en `< 2s` y delega a la cola:

```php
// app/Http/Controllers/WebhookController.php
public function handleMercadoPago(Request $request)
{
    if ($request->input('type') === 'payment') {
        // Encolar trabajo pesado para no bloquear el webhook
        ProcessWebhookPayment::dispatch($request->input('data.id'));
    }
    return response()->json(['status' => 'received'], 200);
}
```

---

## 📑 Generación de PDFs

Para evitar la carga de memoria RAM que conlleva levantar instancias de Chrome (como Puppeteer) en el servidor de producción, se implementa **Laravel-DomPDF**.

1. Se diseña una vista limpia en PHP Blade (`resources/views/pdf/invoice.blade.php`).
2. Se inyecta la información del modelo `Invoice` con sus relaciones cargadas (`client`, `items`).
3. Se compila y envía al frontend mediante un Stream:

```php
// app/Http/Controllers/InvoiceController.php
use Barryvdh\DomPDF\Facade\Pdf;

public function downloadPdf(Invoice $invoice)
{
    // Carga ansiosa para evitar problemas N+1 de base de datos
    $invoice->load(['client', 'items']);
    
    $pdf = Pdf::loadView('pdf.invoice', compact('invoice'))
              ->setPaper('a4', 'portrait');

    return $pdf->stream("factura-{$invoice->invoice_number}.pdf");
}
```

---

## 📅 Planificación de Sprints (8 Semanas)

*   **Semanas 1–2: Base & Auth**
    *   Creación de la base de datos MariaDB y migraciones de identidad.
    *   Implementación de Sanctum, endpoints de login, registro, onboarding de Tenant.
*   **Semanas 3–4: Clientes & Facturas (CRUD completo)**
    *   Endpoints REST con validaciones completas y paginación para Clientes.
    *   Creación de facturas con desglose de ítems correlativos.
*   **Semanas 5–6: PDF & Dashboard**
    *   Vistas Blade para factura en PDF y de descarga en stream.
    *   Endpoints de agregación SQL para el Dashboard (métricas de ventas mensuales).
*   **Semanas 7–8: Pagos, Exportación & QA**
    *   Integración de SDK de MercadoPago, Webhook seguro y Jobs asíncronos en cola.
    *   Endpoints para exportación de listados de facturas a CSV/Excel.
```,Description:
