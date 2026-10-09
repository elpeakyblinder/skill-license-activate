# Adaptación a Rust y Windows

Esta referencia es condicional. En Go, C#, Java, Python, TypeScript u otra plataforma, conserva separación de responsabilidades, contratos y pruebas; sustituye tipos, almacenamiento, transporte y custodia por equivalentes. No agregues Rust a un proyecto solo por usar esta skill.

## Límites de módulos en Rust

Una separación útil, sin imponer nombres ni número de crates:

- Protocolo: parsing limitado, tipos versionados y encodings.
- Verificación/política: confianza, contexto y decisiones deterministas.
- Adaptadores de plataforma: identidad, custodia, ACL, reloj y persistencia.
- Coordinador: transiciones, red, recuperación y emisión de decisiones.
- Integración: UI, IPC y aplicación de permisos a las operaciones.

El núcleo recibe reloj, confianza y observaciones explícitamente; evita que lea globals, red o filesystem por su cuenta. Permite simular fronteras de tiempo y fallos sin cambiar el reloj real de la máquina.

Usa tipos que distingan un documento recibido de uno verificado. Mantén campos/constructores de evidencia verificada fuera de consumidores no autorizados; deserializar no debe crear automáticamente un permiso. Centraliza `allows_action`/equivalente para no duplicar política por pantalla.

Modela transiciones y errores con enums. Da a presentación códigos estables y errores internos redactados. Evita `Debug` derivado en credenciales, solicitudes privadas y objetos con secretos; limita copias y limpia memoria cuando sea apropiado sin prometer eliminar todas las copias del sistema.

Si seleccionas `ed25519-dalek`, revisa la versión fijada y su perfil de verificación. `VerifyingKey::verify_strict` rechaza claves débiles y aplica controles adicionales; no supongas que cualquier `verify` en otro runtime acepta exactamente el mismo conjunto. Contrasta los vectores de ambos lados con la [documentación de VerifyingKey](https://docs.rs/ed25519-dalek/latest/ed25519_dalek/struct.VerifyingKey.html#method.verify_strict). No conviertas automáticamente un hash en Ed25519ph ni cambies variantes del protocolo.

Fija dependencias mediante el lockfile del proyecto y consulta la documentación de esas versiones. Aísla features de edición/entorno y comprueba combinaciones permitidas; una opción de compilación no sustituye validar los claims recibidos.

## Custodia del dispositivo en Windows

CNG/KSP puede custodiar una clave persistente y exponer una referencia opaca. Decide scope de usuario o máquina/servicio y preferencias de hardware según requisitos. Configura no exportabilidad y verifica los permisos efectivos, no solo los deseados. La arquitectura de proveedores está documentada en [Key Storage and Retrieval](https://learn.microsoft.com/en-us/windows/win32/seccng/key-storage-and-retrieval).

La elección de TPM o software se hace durante creación explícita según la política. Al reabrir una identidad existente, usa su proveedor y referencia exactos; un fallo no autoriza crear otra clave ni cambiar automáticamente a un proveedor menos protegido.

No exportabilidad evita ciertas extracciones, pero no prueba que un proceso que puede pedir firmas sea confiable. Comprueba identidad del caller y limita operaciones del signer. Si el servidor necesita garantía de hardware, una declaración `hardware_backed=true` del cliente no es atestación verificable.

Prueba alcance de usuario, cuenta de servicio, reinicio, equipo sin hardware requerido y pérdida de clave usando recursos de prueba. No ejecutes un reset de TPM real o elimines claves del usuario como smoke test.

## Estado protegido y servicio

DPAPI puede proteger un snapshot, pero el scope importa: con protección de máquina, otros usuarios de esa máquina pueden descifrar si obtienen el blob. Añade ACL sobre archivos y directorios y prueba la identidad que realmente los consume. Esta propiedad se documenta en [CryptProtectData](https://learn.microsoft.com/en-us/windows/win32/api/dpapi/nf-dpapi-cryptprotectdata).

Prueba ACL efectivas, herencia y permisos negativos para procesos que no deben acceder. Un servicio web, UI o usuario de otra sesión no debe heredar acceso de escritura o capacidad de firma solo por compartir la máquina. No soluciones un `Access denied` dando acceso a todos.

En IPC, autentica servidor y cliente y valida acción, recursos, tamaño y versión. Un nombre de pipe conocido o `localhost` no autentica al proceso remoto. Evita exponer por IPC material privado o una función genérica de firma.

Realiza inicialización costosa en la fase apropiada de arranque del servicio; no bloquees callbacks de control con red o creación de claves. Maneja reinicio/upgrade sin perder operaciones pendientes y comprueba readiness antes de consumir credenciales de arranque de un solo uso.

## Integridad de aplicación y distribución

La licencia firmada y la firma del instalador protegen objetos distintos. Si el modelo necesita integridad de runtime, define qué código ejecutable y configuración sensibles se verifican, quién verifica y cómo se actualiza la confianza. Evita mezclar archivos mutables del negocio con archivos de aplicación en el mismo inventario inmutable.

Una actualización segura verifica firma, producto, entorno, versión, inventario y ausencia de rutas inesperadas antes de activar el candidato. Define recuperación ante interrupción sin retroceder checkpoints de licencia. No cargues una librería o script antes de comprobarlo si esa comprobación es parte de la frontera de confianza.

Comprobar integridad desde un verificador que un administrador puede modificar conserva riesgo residual. Decide si este mecanismo merece su coste; no lo presentes como garantía total ni lo impongas a un SaaS cuyo backend ya es la autoridad.

## Verificación de la adaptación

Ejecuta suites dirigidas de protocolo/política, pruebas de persistencia con terminación de proceso y pruebas de integración de IPC. Usa `cargo test`, `cargo fmt --check` y `cargo clippy` según las convenciones existentes; respeta el gestor de paquetes de la aplicación para su frontend y backend.

La compilación en la sesión del desarrollador no valida un instalador LAN. Reporta por separado evidencia bajo cuenta de servicio, hardware real/VM, reinicio y artefacto distribuible. No anuncies compatibilidad con otros sistemas/OEM basándote solo en un entorno probado.
