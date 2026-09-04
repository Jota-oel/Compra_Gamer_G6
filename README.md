# Gamer compra

## Descripcion

Se plantea una servicio que permita la compra de componentes para PC o comprar directamente laptops, perifericos, etc.

Jovenes amantes del gamming y desarrolladores a los que le sobra la plata.

# Guia para un nuevo miembro del equipo

> git clone https://github.com/Jota-oel/Compra_Gamer_G6.git

### Flujo de trabajo de Git

- Ramas de característica (feature/)
- Rama de Desarrollo (production)
- Rama de Testing (testing)
- Rama Principal (main)

> Sin fallos: Se realiza el merge de testing a main (código listo para despliegue).

> Con fallos: Se rechaza el avance a main. Los correcciones (bugfix/) se aplican sobre desarrollo, se prueba nuevamente y se reintenta la integración.

### Formato de Commits (Conventional Commits)

Estructura obligatoria para el mensaje:

> < tipo > (< alcance >) : < descripción >

#### Tipos permitidos:

- feat

- fix

- docs

- style

- refactor

- test

### Gestión de Pull Requests (PR)

Ningún desarrollador puede hacer merge de su propio código directamente a desarrollo o testing.
Todo cambio requiere la aprobación de al menos 1 revisor asignado según la rotación del equipo.

| Creador | Revisor |
| ------- | ------- |
| Joel    | Máximo  |
| Máximo  | Jose    |
| José    | Agustín |
| Agustín | Joel    |
