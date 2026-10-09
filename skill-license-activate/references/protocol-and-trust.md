# Protocolo y confianza

## Credencial, licencia e identidad

Separa tres objetos:

- La **clave de activación** es un secreto comercial aleatorio para solicitar una activación. Usa un generador criptográfico y un presupuesto de entropía documentado. Un checksum ayuda con errores de escritura; no añade seguridad. Aplica límites de intentos y evita enumeración de clientes/licencias.
- El **documento de licencia** contiene derechos firmados por el proveedor. La firma acredita origen e integridad, no confidencialidad.
- La **identidad del dispositivo**, si el modelo la necesita, demuestra posesión de una clave propia. Esa clave no permite emitir licencias del proveedor.

La UI puede recoger la clave de activación sin retenerla. Evita URLs, logs, analytics, archivos temporales sin protección y mensajes de error que la incluyan. Limita su permanencia en memoria y persiste solo lo necesario para recuperar operaciones, bajo protección local adecuada. Si el valor es de baja entropía, no asumas que un hash rápido impide adivinación offline.

## Contrato firmado

Prefiere un formato establecido y una biblioteca mantenida, como JWS o COSE si encaja en el entorno. No diseñes primitivas criptográficas ni un framing nuevo sin una necesidad concreta. Si hay un protocolo existente, preserva su contrato y compatibilidad.

Antes de implementar, acuerda estos campos semánticos y cómo se autentican; los nombres son genéricos:

| Dato | Regla |
|---|---|
| Versión y tipo | Distinguir licencia, autorización temporal, control e información de claves |
| Emisor, producto, entorno y audiencia | Comparar contra valores esperados; no fiarse del documento para elegir su propio contexto |
| Licencia/activación y alcance | Vincular al sujeto o instalación cuando el modelo comercial lo requiera |
| Derechos y límites | Funcionalidades, cupos y condiciones que el receptor sabe aplicar |
| Revisión | Ordenar cambios en un alcance definido; detectar retroceso y conflictos |
| Tiempos | Emisión, comienzo, final comercial y técnico; próxima consulta si aplica |
| Identificador de clave y algoritmo | Resolver solo dentro de confianza autorizada y una política de algoritmos fija |
| Correlación de solicitud | Para respuestas de activación o recuperación, vincular el intento autorizado |

El consumidor necesita tres barreras: autenticidad de firma, validez semántica/contextual y autorización de política. Un `200 OK`, un JWT decodificable o una firma matemáticamente válida no completan las tres.

Para JWT/JWS, fija algoritmos permitidos, valida emisor y audiencia y usa reglas de validación distintas por tipo; no aceptes algoritmos ni claves arbitrarias del token. Sigue las recomendaciones de [RFC 8725](https://www.rfc-editor.org/rfc/rfc8725.html).

No incrustes un secreto HMAC compartido con el emisor en cada cliente para verificar licencias: quien lo extrae también puede producir documentos válidos. La verificación pública permite separar emisión y consumo.

## Bytes y parsers entre lenguajes

Define qué bytes están firmados. Para formatos que firman los bytes transmitidos, conserva esa representación; no parses y reserialices para verificar. Si el diseño elige JSON canónico, utiliza una implementación del contrato de canonicalización en todos los participantes, no simplemente ordenar claves. [RFC 8785](https://www.rfc-editor.org/rfc/rfc8785) define JCS, incluyendo restricciones numéricas y ordenamiento.

Aplica límites de tamaño, profundidad, colecciones y tiempos de procesamiento antes de asignaciones costosas. Rechaza campos duplicados y entradas ambiguas, y define política de campos desconocidos por versión. Comprueba overflow, unidades temporales y enteros representables en todos los lenguajes; con JavaScript, acuerda enteros seguros o cadenas decimales verificadas para valores mayores.

Documenta variantes de algoritmo, representación de claves y firmas y base64. Ed25519, Ed25519ph y ECDSA no son intercambiables; DER y una firma ECDSA de longitud fija tampoco. El perfil de aceptación debe coincidir entre implementaciones, incluidos casos inválidos y claves débiles. Mantén vectores comunes y evita que cada cliente interprete el estándar de manera diferente.

## Prueba de posesión y replay

Usa identidad criptográfica cuando copiar una credencial o archivo entre dispositivos sea una amenaza relevante. Una huella de hardware es una señal de continuidad con errores y sensibilidad de privacidad; no demuestra posesión de una clave ni es una identidad imposible de falsificar.

Un patrón de desafío/respuesta liga una firma de dispositivo a desafío impredecible, operación, producto/entorno, identidad, hash del intento y vigencia. El servidor comprueba que la clave pública pertenece al sujeto y que el desafío corresponde al intento; consume el desafío atómicamente con la transición o conserva un estado recuperable de la operación. En activación inicial también valida la credencial comercial y el registro autorizado de esa clave.

Un desafío usado no autoriza otra operación. Sin embargo, una repetición exacta de una operación ya completada puede recuperar su resultado mediante idempotencia. No mezcles esas dos reglas: ni dobles efectos al reintentar ni pérdida irrecuperable del resultado por consumir el desafío demasiado pronto.

El signer local debe autorizar operaciones tipadas, no ofrecer a procesos no confiables una función genérica para firmar bytes arbitrarios. Mantén las claves de proveedor, dispositivo, TLS y firma de paquetes separadas.

## Transporte y presupuesto de trabajo

Acota los bytes realmente recibidos antes del parseo, también en streams sin longitud declarada. Limita solicitudes de desafíos, intentos, operaciones pendientes y trabajo de verificación/firma. Una entrada bien formada puede agotar CPU, almacenamiento o capacidad del signer si no tiene presupuesto. Ajusta límites al producto y runtime; [OWASP API4](https://owasp.org/API-Security/editions/2023/en/0xa4-unrestricted-resource-consumption/) describe esta frontera de consumo.

Combina límites previos a autenticación con cuotas por sujeto/tenant cuando ya se conoce. Confirma el alcance real de los contadores en varias instancias o regiones; no presentes un contador local como cuota global estricta. Usa la IP del proxy de confianza y evita bloqueos globales de una licencia provocables por un desconocido.

Resuelve endpoints y fuentes de claves desde configuración de confianza. Un identificador de clave o URL recibido no autoriza rutas de archivos ni descargas arbitrarias; si hay descubrimiento remoto, valida destinos y redirecciones según la política. Verifica certificados TLS y no desactives su validación para resolver errores de conexión.

Para una consola web, CORS no autentica llamadas directas. Conserva CSRF cuando se usan credenciales enviadas automáticamente por el navegador; una prueba de dispositivo o idempotencia no lo sustituye. Evita cachés compartidas para respuestas con credenciales o resultados privados. La configuración ausente no habilita endpoints de prueba ni modos permisivos.

## Claves de confianza y rotación

Para un diseño simple, fija una clave pública y planea su sustitución mediante una actualización confiable. Si necesitas varios emisores o rotación sin reinstalar, considera una raíz pública fijada que autentique un conjunto versionado de claves.

Al resolver una clave, comprueba identidad, propósito, entorno, ventanas, estado y alcance. No confíes en una clave enviada junto al documento sin una cadena válida hasta la confianza fijada. La raíz privada no pertenece al cliente, al repositorio ni a la ejecución habitual del emisor.

Una política con estados de emisión, solo verificación y revocación necesita semántica explícita: cuándo deja de emitir una clave, qué documentos anteriores siguen verificándose y cuáles ya no son aceptables. Define superposición, caducidad de confianza y distribución de revocaciones antes de rotar.

Protege revisiones de documentos y conjuntos de claves contra retroceso. Una revisión idéntica solo es idempotente si coincide la identidad semántica autenticada; define si el hash cubre el mensaje firmado o una representación canónica. No deduzcas conflicto únicamente de bytes de firma que un algoritmo puede variar.

La rotación ordinaria parte de confianza vigente. La recuperación por compromiso de raíz necesita un canal independiente previamente confiable; una nueva clave autorizada solo por la raíz comprometida no resuelve el incidente. Elige custodia, backups cifrados y responsables proporcionales al riesgo.

Separa material de desarrollo, prueba y producción. Los seeds reproducibles de pruebas son públicos y no deben otorgar derechos en builds reales. El artefacto distribuible debe verificar su entorno y confianza de forma no controlable por una preferencia de UI.
