# Ciclo de vida y recuperación

## Activación online

Un flujo orientativo, adaptable al protocolo existente:

1. Establece identidad de instalación y, si procede, dispositivo. La inicialización es explícita y distinguible de abrir una identidad existente.
2. Crea un intento lógico estable con idempotencia. Conserva protegido el material necesario para resolver un timeout o reinicio; no generes una operación comercial nueva por cada retry.
3. La autoridad verifica credencial, alcance, desafío/prueba si aplica y estado comercial. Reserva o confirma cupo bajo una transición atómica.
4. La autoridad fija el inicio comercial una sola vez cuando esa sea la regla y prepara un documento ligado a activación e intento.
5. El cliente verifica firma, confianza, alcance, derechos, tiempos y revisión. Persiste documento y metadatos necesarios de forma duradera antes de mostrar activación completada.
6. Un reintento recupera el resultado autorizado o continúa la operación pendiente, según el estado duradero de cada lado.

La clave de idempotencia está ligada a operación, sujeto, alcance y hash del intento. La misma clave con contenido distinto devuelve conflicto. No devuelvas resultados de otra cuenta porque coincide una cadena de idempotencia.

Distingue **reserva**, **confirmación** y **abandono** si necesitas varias etapas. Define vencimiento y limpieza de reservas y cómo resolver clientes tardíos sin exceder cupo. Si la firma ocurre fuera de la transacción de datos, diseña una máquina de operaciones/outbox o una compensación verificable. Una excepción después de reservar no puede dejar cupos perdidos indefinidamente ni documentos utilizables sin registro.

Si el servidor completó y el cliente perdió la respuesta, un endpoint de estado o un reintento autorizado recupera ese resultado. Si el cliente recibió y verificó pero falló la escritura, conserva el intento y no confirma éxito local. No reduzcas la revisión ni pidas una activación distinta para ocultar el fallo.

Consultar, continuar o cancelar una operación requiere acceso a esa operación; su identificador o clave de idempotencia no es una credencial. Un retry recupera la evidencia emitida, sin convertir su ventana temporal en una autorización nueva. Si el contrato cambió mientras tanto, devuelve/aplica el estado actual mediante el flujo autenticado correspondiente.

Cuando un job termina la emisión, conserva su sujeto, alcance y transición autorizada y comprueba el estado comercial aplicable antes de emitir o confirmar. Define qué sucede si se revocó el permiso del operador o la licencia mientras esperaba. No copies un booleano de autorización inicial como permiso ilimitado; ordena revocación y confirmación con las garantías de concurrencia del almacenamiento.

## Cupos y concurrencia

La autoridad decide el cupo con transacciones, restricciones y bloqueos/operaciones condicionales apropiados a su almacenamiento. Un `count` seguido de `insert` sin serialización permite superar el último cupo con dos clientes.

Cuenta los estados que reservan capacidad y define unicidad de activación viva por identidad comercial. Establece un orden estable de locks cuando varias entidades participan. Los tests deben ejecutar intentos simultáneos sobre el almacenamiento real de prueba, no solo mocks de una carrera.

En reinstalación, transferencia o cambio de hardware, define un flujo de recuperación explícito: evidencia requerida, verificación del titular, continuidad de derechos y resultado para el registro anterior. Una clave pública nueva no demuestra por sí sola que se trata del mismo equipo. Decide cuándo puede automatizarse y cuándo requiere soporte.

En licencias offline, liberar localmente no demuestra que todas las copias dejaron de funcionar. No reasignes capacidad suponiendo revocación instantánea del dispositivo desconectado; usa la política de caducidad, intercambio verificable y riesgo residual que el negocio acepte.

## Renovación técnica y comercial

Separa renovar el contrato de refrescar la autorización técnica. El refresh consulta la autoridad, aplica cambios y produce una nueva revisión/ventana, pero no crea un contrato comercial nuevo.

Usa timeouts, backoff con jitter y límites de reintento. Un error de red conserva solo los derechos ya verificados aún vigentes. La siguiente fecha de consulta y las ventanas de desconexión vienen del contrato/política; no se recalculan para prolongar uso cada vez que falla la red.

Una suspensión o revocación debe llegar como evidencia autenticada según el protocolo; no aceptes un texto sin verificar como permiso o control permanente. Una respuesta de error tampoco extiende ventanas ni repara identidad/reloj. Al volver la conexión, aplica la revisión más reciente antes de conceder uso adicional.

Las renovaciones comerciales preservan historia y auditan cambios. Define cómo se emiten derechos nuevos, qué ocurre con activaciones existentes y qué prevalece cuando llegan documentos fuera de orden.

## Offline completo

El cliente exporta una solicitud con identificador de intento, nonce, alcance, identidad pública y señales mínimas necesarias. Si hay clave de dispositivo, la solicitud prueba su posesión. Conserva el intento pendiente localmente.

El emisor privado verifica la solicitud, la autorización comercial y el cupo; no cree una solicitud solo porque está bien formada o firmada por una clave nueva. Emite un documento firmado ligado al intento y a la identidad que corresponda.

Al importar, verifica el límite de archivo, confianza, firma, versión, entorno/producto, vínculo de solicitud, identidad, vigencia y revisión antes de escribir. Una repetición del mismo resultado ya confirmado puede ser idempotente; un resultado distinto o viejo no reemplaza derechos nuevos. No consumas el intento pendiente hasta persistir correctamente el resultado.

El cliente no incorpora el emisor privado, su base comercial ni sus secretos. Puede requerir renovar confianza mediante un paquete firmado. Sin comunicación ni importación, no recibe suspensiones, revocaciones ni nuevas fechas del proveedor. La fecha de expiración también depende del modelo de tiempo confiable; declara los límites de rollback/snapshots.

Trata el archivo importado como entrada no confiable incluso antes de verificar su firma. La extensión y el MIME declarado no prueban su formato. Evita nombres/rutas controlados por el archivo; usa temporales privados cuando sean necesarios, sin ejecutarlos ni publicarlos. Si aceptas paquetes comprimidos, acota expansión y entradas y evita extracción fuera del destino. Son controles de manejo de archivos distintos de autenticar la licencia; véase [OWASP File Upload](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html).

## Servidor LAN

Define qué se licencia y cuenta: servidor, equipo cliente registrado, usuario o sesión concurrente. Una visita de navegador no equivale necesariamente a una activación; evita usar IP, cookie o pestaña como identidad estable por comodidad.

Una autoridad local protegida puede poseer la identidad y el estado y devolver decisiones al backend mediante IPC autenticado. La UI no administra sus permisos ni se conecta con credenciales de emisión a la autoridad remota. Protege también el registro/release de equipos y la comunicación LAN, con autenticación y TLS cuando corresponda.

Las operaciones remotas conservan sesión, rol y tenant, además de licencia. La caída del servicio local produce el comportamiento explícito de disponibilidad/recuperación, no un permiso activo inventado. Prueba arranque, reinicio y upgrade bajo la cuenta real del servicio; la sesión del desarrollador no reproduce esas condiciones.

## Persistencia local

Conserva evidencia firmada, confianza necesaria, identidad referenciada, revisiones máximas aceptadas, anclas de tiempo y operaciones pendientes según el diseño. No guardes simplemente `licensed=true`. Separa esa información de los datos del negocio y del material privado que debe custodiar el sistema operativo.

Protege confidencialidad e integridad y limita acceso al proceso autorizado. Después de descifrar, vuelve a verificar documentos y contexto: protección local y firma del emisor resuelven problemas distintos.

Serializa escritores. Escribe un candidato completo, sincroniza datos según garantías de la plataforma, reemplaza atómicamente y comprueba el resultado cuando sea necesario antes de confirmar éxito. El objetivo es conservar el estado anterior completo o el nuevo completo tras un crash, sin mezclar sus revisiones. Prueba el comportamiento real del filesystem; no presupongas durabilidad por llamar a `rename`.

La revisión máxima aceptada ayuda a rechazar replay. Si un atacante restaura a la vez todo el almacenamiento y el reloj de una VM, un checkpoint exclusivamente local puede retroceder con ellos. Una garantía más fuerte necesita una autoridad externa o soporte de plataforma apropiado. Cifrado y ACL no eliminan ese límite.

## Tiempo confiable

Dentro de un arranque, una observación firmada fresca puede anclar tiempo remoto a un contador monotónico. Tras reiniciar, no restes contadores de arranques distintos. Define tolerancia de pared, saltos hacia atrás/adelante, suspensión del sistema y qué ocurre si falta evidencia temporal.

Una respuesta cacheada o idempotente conserva su fecha original; no demuestra la hora actual. Si reparas tiempo, usa un desafío nuevo y una respuesta autenticada ligada al intento, acotada por una ventana de ida/vuelta y el mismo arranque. La cabecera HTTP `Date` no sustituye ese contrato.

Para sistemas siempre conectados puede bastar que el backend confiable evalúe las fechas. Para offline prolongado decide explícitamente qué confianza temporal y qué riesgo residual aceptas, sin prometer un reloj inviolable.

## Recuperación y transiciones

| Problema | Conducta |
|---|---|
| Archivo ausente en primera instalación | Inicialización explícita; distingue instalación nueva de pérdida de estado conocido |
| Estado corrupto o fallo de descifrado | Conserva evidencia y datos; limita operaciones y conduce recuperación |
| Clave existente inaccesible | Diagnostica identidad/permisos; no la recrees como fallback automático |
| Disco lleno o escritura interrumpida | No confirma éxito; conserva estado válido y operación pendiente |
| Documento viejo o misma revisión con contenido diferente | Rechaza el candidato y conserva el checkpoint vigente |
| Cambio legítimo de equipo | Transferencia/rehost verificable con efecto definido sobre la activación anterior |
| Confianza vencida o clave comprometida | Actualización o recuperación por el canal de confianza apropiado |

Para cambiar edición, modo, identidad o migrar estado, modela origen, destino y fase pendiente. Usa un journal recuperable si hay pasos no atómicos. No desactives el origen antes de validar la transición y no dejes ambos operativos si excede lo autorizado. Borrar un archivo no equivale a confirmar una liberación comercial.

Los diagnósticos incluyen código, versión, modo, estado y correlación segura. No incluyen claves, tokens, firmas de sesión ni seriales/huellas completas. Recuperar acceso no necesita conceder permisos amplios al filesystem ni convertir errores en activaciones gratuitas.

Minimiza señales de hardware y su retención según la necesidad de continuidad. Un hash estable puede seguir vinculando equipos; no lo describas como anónimo ni lo expongas en listados públicos. Si muestras nombres, motivos o notas recibidos del emisor, trátalos como texto no confiable y escápalos en el contexto de presentación.
