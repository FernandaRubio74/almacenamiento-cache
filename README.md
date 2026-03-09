# Proyecto: Almacenamiento Distribuido y Caché

Sistema de microservicios con Node.js, PostgreSQL y Redis desplegado en Docker.

## Arquitectura

- **App Principal** (puerto 3000): Servicio principal con endpoints para consultas a BD y caché
- **Servicio 2** (puerto 4000): Microservicio independiente que consulta Tabla 2
- **PostgreSQL** (puerto 5432): Base de datos con persistencia mediante volúmenes
- **Redis** (puerto 6379): Sistema de caché en memoria sin persistencia

## Requisitos Previos

- Docker Desktop instalado
- Node.js v18+ (para desarrollo local)
- Git

##  Instalación y Ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/FernandaRubio74/almacenamiento-cache.git
cd tarea3
```

### 2. Instalar dependencias 

```bash
npm install
```

### 3. Construir y levantar los contenedores



```bash
docker compose up --build
```

O en modo detached (segundo plano):

```bash
docker compose up -d --build
```

### 4. Verificar que los servicios estén corriendo

```bash
docker ps
```

Deberías ver 4 contenedores: `app-principal`, `app-service2`, `db1`, `redis_cache`

## Crear Datos en la Base de Datos

Las tablas se crean automáticamente al hacer la primera petición, pero se tienen que poblar:

### Conectarse a PostgreSQL

```bash
docker exec -it db1 psql -U user -d servicio1
```

### Crear Tabla 1

```sql
CREATE TABLE IF NOT EXISTS tabla1 (
    id SERIAL PRIMARY KEY, 
    name VARCHAR(50)
);

INSERT INTO tabla1 (name) VALUES 
    ('maria'),
    ('juan'),
    ('ana');
```

### Crear Tabla 2

```sql
CREATE TABLE IF NOT EXISTS tabla2 (
    id SERIAL PRIMARY KEY, 
    name VARCHAR(50),
    role VARCHAR(50),
    project VARCHAR(50)
);

INSERT INTO tabla2 (name, role, project) VALUES 
    ('Carlos', 'Developer', '3'),
    ('Laura', 'Designer', '2'),
    ('Pedro', 'DevOps', '2'),
    ('Sofia', 'Manager', '5');
```

### Salir de PostgreSQL

```sql
\q
```

## Endpoints Disponibles

### App Principal (localhost:3000)

| Endpoint | Descripción |
|----------|-------------|
| `GET /` | Página principal |
| `GET /se1` | Consulta Tabla 1 con caché de Redis (60 segundos) |
| `GET /se2` | Consulta Tabla 2 a través del Servicio 2 (formato HTML) |

### Servicio 2 (interno, no expuesto)

| Endpoint | Descripción |
|----------|-------------|
| `GET /bd` | Consulta directa a Tabla 2 (solo accesible desde app principal) |


### Probar Persistencia PostgreSQL

```bash
# Insertar datos
curl http://localhost:3000/se1

# Reiniciar PostgreSQL
docker restart db1

# Consultar - los datos persisten
curl http://localhost:3000/se1
```

### Ver datos en Redis (desde CLI)

```bash
# Conectar a Redis
docker exec -it redis_cache redis-cli

# Ver todas las claves
KEYS *

# Ver valor de una clave
GET tabla1_data

# Salir
exit
```

##  Detener el Proyecto

```bash
# Detener contenedores
docker compose down

# Detener y eliminar volúmenes ( borra datos de PostgreSQL)
docker compose down -v
```

## 📁 Estructura del Proyecto

```
tarea3/
├── app.js              # Servicio principal
├── servicio2.js        # Microservicio independiente
├── package.json        # Dependencias Node.js
├── dockerfile          # Imagen Docker para servicios Node
├── docker-compose.yml  # Orquestación de servicios
└── README.md          # Este archivo
```

##  Comandos Útiles

```bash
# Ver logs de un contenedor
docker logs app-principal
docker logs redis_cache

# Ver logs en tiempo real
docker logs -f app-principal

# Ejecutar comandos en contenedor
docker exec -it app-principal 

# Ver volúmenes
docker volume ls

# Inspeccionar volumen de PostgreSQL
docker volume inspect tarea3_db_data

# Reconstruir sin caché
docker compose build --no-cache
```

## Comunicación entre Servicios

Los servicios se comunican mediante la **red Docker interna**:

- `app.js` → `http://service2:4000/bd` (llama al Servicio 2)
- `app.js` → `database:5432` (PostgreSQL)
- `app.js` → `redis_cache:6379` (Redis)

Los nombres de los servicios actúan como hostnames dentro de Docker.

## Características Clave

**Microservicios**: Separación de responsabilidades entre app principal y servicio 2  
**Caché**: Redis reduce latencia en consultas frecuentes (sin persistencia)  
**Persistencia**: PostgreSQL con volúmenes para datos permanentes  
**Orquestación**: Docker Compose gestiona 4 contenedores  
**Comunicación HTTP**: Servicios se comunican por red interna Docker

