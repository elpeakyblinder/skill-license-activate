# Validación de comportamiento

Elige casos según las fronteras cambiadas. Para una implementación nueva, cubre el conjunto relevante; para una corrección puntual, prueba su comportamiento y las regresiones cercanas. No ejecutes todas las pruebas físicas o de infraestructura por una edición de copy.

Usa reloj inyectado, almacenamiento aislado, claves exclusivas de prueba y tenants sintéticos. Desactiva la carga accidental de credenciales productivas en runners y verifica el destino antes de pruebas con infraestructura. No crees licencias reales para validar fixtures.

## Verificación y política

| Caso | Resultado observable |
|---|---|
| Documento auténtico en contexto correcto | Concede únicamente los derechos definidos |
| Alterar payload, firma o clave | Rechazo sin persistir nuevos permisos |
| Algoritmo/tipo no permitido o clave no confiable | Rechazo aunque el objeto sea parseable |
| Producto, entorno, audiencia o tenant distinto | No autoriza al consumidor actual |
| Binding de instalación/dispositivo distinto | Rechazo cuando el modelo exige ese binding |
| Campos duplicados, exceso de tamaño/profundidad, overflow | Rechazo acotado en tiempo y memoria |
| Momento anterior, exacto y posterior a cada frontera | Resultado coherente con el intervalo definido |
| Final comercial anterior al final técnico | No extiende el contrato por gracia accidental |
| Control verificado nuevo y licencia antigua válida | Prevalece el control según la política |
| Funcionalidad o límite crítico desconocido | No se concede una capacidad que el cliente no sabe limitar |
| Revisión inferior; igual con mismo mensaje; igual con otro mensaje | Rechazo; idempotencia; conflicto, respectivamente |
| Rotación de clave, revocación y confianza desactualizada | Comportamiento previsto sin regresar a claves antiguas |

Mantén un corpus común de bytes firmados, payload esperado y resultado para cada lenguaje/runtime. Incluye negativos criptográficos del perfil elegido. Que una firma positiva pase en dos bibliotecas no demuestra equivalencia de rechazo.

## Activación y cupos

- Dos intentos distintos por el último cupo: se admite solo la capacidad disponible.
- Mismo intento enviado simultáneamente y tras un timeout: produce una sola transición comercial recuperable.
- Misma idempotencia con otro contenido, cuenta o producto: conflicto o rechazo; no revela el resultado del otro sujeto.
- Primeras activaciones concurrentes: fijan una única vigencia según la regla comercial.
- Fallo después de reservar, antes/después de emitir y antes/después de devolver resultado: no deja cupos eternamente perdidos ni autoriza doble uso.
- Reinstalación y pérdida/cambio de identidad: siguen recuperación verificable; no consumen o liberan cupo por una suposición de la UI.
- Suspensión/revocación de una activación y de toda la licencia: afecta el alcance esperado sin cruzar tenants.
- Rotación de credencial comercial: bloquea nuevas solicitudes con la credencial anterior; define por separado qué ocurre con activaciones ya emitidas.

Las carreras requieren transacciones reales de prueba o un simulador que modele sus garantías; un mock secuencial no las valida.

## Red, estado y recuperación

| Fallo inyectado | Invariante a comprobar |
|---|---|
| Timeout con resultado remoto ya confirmado | Recupera el intento; no duplica activación |
| Respuesta falsa o malformada | Conserva evidencia previa; no confirma éxito |
| Escritura fallida tras respuesta verificada | Mantiene operación recuperable y no muestra éxito duradero |
| Terminación antes/después de reemplazo del snapshot | Reinicia con estado anterior completo o nuevo completo |
| Disco lleno, permiso denegado o fallo de descifrado | No eleva privilegios ni activa fallback permisivo |
| Servicio/IPC ausente, suplantado o reiniciado | No inventa permisos; invalida capacidades de una generación anterior cuando aplica |
| Reloj atrasado/adelantado, suspensión o arranque nuevo | No prolonga ventanas ni compara contadores incompatibles |
| Respuesta idempotente vieja usada como tiempo fresco | No renueva el ancla temporal |
| Copia de documentos/estado a otra identidad | Rechazo conforme al binding y protección elegidos |
| Snapshot completo de VM restaurado | Documenta si se detecta o si queda fuera de la garantía |

Comprueba persistencia y reinicio, además del resultado del método que escribe. Un test que solo constata que se llamó a `save` no demuestra durabilidad.

## Enforcement y administración

Prueba peticiones directas al backend, rutas alternativas, jobs, comandos nativos y funcionalidades premium. Ocultar un botón no demuestra bloqueo. Una operación necesita licencia y permiso de usuario; prueba también usuarios sin rol, recursos de otro tenant y cambios de sesión.

Para IPC/tickets/capacidades, prueba caller incorrecto, action/resource distinto, replay, expiración y cambio de generación. Verifica que los canales de recuperación no abran operaciones comerciales accidentalmente.

En la consola administrativa prueba autorización real de operador en cada acción: crear/renovar, emitir/rotar credenciales, suspender/revocar y liberar/transferir. La auditoría refleja el resultado duradero y no captura secretos. Verifica que el navegador y el cliente distribuido no contienen credenciales de proveedor.

Añade los casos pertinentes a la frontera cambiada:

| Caso | Evidencia |
|---|---|
| Actor de consulta envía cambios de cupo, término o estado por edición general | Rechazo de campos sensibles y derechos comerciales intactos |
| IDs existentes de licencia y activación pertenecen a clientes distintos | Rechazo sin lectura ni mutación del objeto ajeno |
| Otro actor consulta/continúa/cancela una operación pendiente conocida | No obtiene su resultado ni provoca efectos |
| Permiso de operador revocado con sesión abierta o job pendiente | Siguiente acción respeta la política de revocación definida |
| Cambia tenant, sesión o revisión con cachés calientes | No hereda decisiones o respuestas privadas anteriores |
| Se agota presupuesto, llega un stream excesivo o falta protección requerida | Error controlado antes de efectos o trabajo costoso |
| Archivo con nombre/ruta manipulados o expansión excesiva, si aplica | Sin escritura fuera del destino, ejecución ni publicación |
| Llamada directa sin Origin; credenciales de navegador sin CSRF cuando se requiere | Autorización y protección correspondientes siguen efectivas |

## Evitar pruebas de denegación engañosas

Usa un objeto existente y un body válido para probar falta de permiso; un 404 por ID inexistente o un error de validación no prueban aislamiento. Ejecuta middleware y guards reales, incluido CSRF cuando esa sea la frontera. Cada denegación tiene un caso permitido equivalente para detectar una corrección que bloquea a todos.

Comprueba estado persistido y ausencia de efectos: escrituras, reservas, firmas emitidas, archivos, jobs y llamadas externas. Una solicitud rechazada puede producir auditoría de seguridad acotada, pero no efectos comerciales. Verifica también rutas alternativas y efectos diferidos. Un código HTTP por sí solo no demuestra estas garantías.

Restaura reloj, autenticación, cachés y configuración modificados durante la prueba. Las carreras se prueban con el motor y garantías usados por la autoridad; una suite sobre otro motor no demuestra su serialización.

## Offline, LAN y distribución

- Offline: solicitud y licencia de otra identidad/intento, importación repetida, revisión vieja, archivo incompleto, renovación de confianza y ausencia total de red.
- LAN: definición de cupo aplicada, equipos concurrentes, autenticación de cliente y servicio, caída/reinicio del servicio y acceso directo al backend.
- Plataforma: cuenta real, permisos efectivos, reinicio, pérdida de identidad y variantes de custodia soportadas.
- Release: confianza correcta por entorno, ausencia de material privado/seeds de prueba utilizables y actualización interrumpida.

Preserva bases y archivos del usuario durante vencimiento y recuperación. Si se permite exportación/backup de salida, comprueba identidad del usuario y que no sirve para ejecutar operaciones fuera de ese permiso.

## Evidencia al entregar

Resume casos ejecutados, resultado y entorno, junto con límites pendientes. Distingue simulación, integración con almacenamiento/servicio, instalación y operación desplegada. Una suite verde no valida infraestructura ni hardware que no se probaron.

Antes de compartir una skill o guía derivada de un proyecto privado, revisa que no incluya secretos, endpoints reales, identificadores de claves, fingerprints, umbrales específicos, rutas internas, fixtures originales ni instrucciones para modificar controles. Los patrones genéricos y las limitaciones explicadas no deben convertirse en un mapa del producto de origen.
