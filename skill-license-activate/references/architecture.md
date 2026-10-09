# Arquitectura y política

## Elegir la autoridad mínima suficiente

| Modalidad | Autoridad que concede derechos | Consecuencia |
|---|---|---|
| SaaS | Backend de confianza | Verifica el contrato al ejecutar operaciones; no necesitas una licencia local de dispositivo salvo requisito específico. |
| Aplicación online | Emisor remoto + autorización firmada temporal | Permite revocación en la siguiente consulta y una ventana acotada de desconexión. |
| Aplicación offline | Emisor privado + verificador local | Activación mediante intercambio de archivos; revocación y renovación requieren recibir material nuevo. |
| Servidor LAN | Autoridad local protegida + emisor remoto u offline | Centraliza decisiones y límites. Determina si se cuentan servidores, equipos registrados o usuarios concurrentes. |

Para un producto pequeño puede bastar una clave pública fijada y un documento firmado. Introduce manifiestos de claves, servicio separado, identidad criptográfica de dispositivo o verificación de paquetes cuando resuelvan una amenaza o necesidad concreta. No añadas esas piezas solo por parecer más robustas.

## Componentes y límites de confianza

Separa responsabilidades aunque no necesites procesos ni repositorios separados:

| Componente | Responsabilidad | No debe poder hacer |
|---|---|---|
| Consola del proveedor | Gestionar clientes y contratos mediante una API autorizada | Llevar una clave privada de emisión en JavaScript o conectarse a la base con credenciales de proveedor desde el navegador. |
| Autoridad/emisor | Validar reglas comerciales, reservar cupos, emitir documentos y auditar | Aceptar producto, tenant, cupo o fechas del cliente sin contrastarlos con sus registros. |
| Verificador | Validar bytes firmados, confianza y contexto esperado | Elegir una clave de confianza solo porque el documento la incluye. |
| Motor de política | Convertir evidencia verificada en acciones, funcionalidades y límites | Decidir a partir de claims deserializados que aún no fueron verificados. |
| Adaptadores | Obtener identidad, tiempo, red, almacenamiento e IPC | Fabricar resultados activos cuando falla un proveedor o adaptador. |
| Aplicación/UI | Aplicar y mostrar la decisión, conducir activación y recuperación | Ser la única barrera o permitir que el usuario escriba el estado de licencia. |

En clientes instalados, el sistema operativo y el administrador local pertenecen al límite de confianza que debes declarar. Un binario nativo o una clave no exportable aumentan resistencia a ciertas modificaciones; no hacen invulnerable al programa.

## Modelo comercial mínimo

Define entidades lógicas, sin imponer estas tablas o nombres al proyecto:

- **Cliente/tenant y producto:** alcance al que pertenecen derechos y operadores.
- **Contrato o término:** plan, cupo, inicio, final comercial, estado y condiciones de renovación.
- **Licencia:** conjunto de derechos; puede tener varias activaciones dentro del cupo.
- **Credencial de activación:** secreto revocable que el comprador presenta para iniciar el flujo. Guarda un verificador/hash apropiado al secreto aleatorio; no el valor recuperable para mostrarlo después.
- **Activación:** relación entre licencia e identidad autorizada, con estado y revisión.
- **Operación:** intento lógico con idempotencia, resultado y resolución de fallos parciales.
- **Documento emitido:** evidencia firmada, tipo, revisión y período técnico de uso.
- **Auditoría:** operador o dispositivo, alcance, acción, referencia, resultado y momento; sin secretos.

No confundas una instalación nueva con un equipo nuevo. Tampoco uses una huella parecida como prueba suficiente de que una reinstalación puede reclamar el cupo de otro registro. La política de recuperación debe combinar señales, prueba de posesión cuando exista y autorización apropiada.

Si la vigencia comienza en la primera activación, una única transición de la autoridad fija las fechas para toda la licencia. Un equipo adicional o un reintento hereda ese término. Si el negocio vende meses calendario, define zona horaria y regla para fin de mes; no sustituyas meses por una cantidad arbitraria de segundos.

Una licencia perpetua no implica soporte, actualizaciones o confianza criptográfica perpetuos. Define esos derechos por separado y explica al usuario cualquier revisión técnica obligatoria.

## Autorizar administración y relaciones

Antes de cambiar una operación comercial, traza sus entradas, actor, capacidad, objeto, efecto y prueba. Una matriz orientativa:

| Operación | Frontera que debes comprobar |
|---|---|
| Consultar licencia, equipos o historial | Alcance de lectura del actor, también en listados, exportaciones y resultados de operaciones pendientes |
| Cambiar término, cupo o estado | Capacidad específica de modificar esos derechos; editar datos descriptivos no la concede |
| Liberar o transferir una activación | Capacidad sobre la acción y pertenencia de esa activación a la licencia y cliente autorizados |
| Emitir o rotar una credencial | Permiso de emisión/rotación y destinatario autorizado; consultar una licencia no revela su secreto |

Busca el objeto dentro del alcance autorizado y valida la relación cliente -> licencia -> activación/operación. Que todos los IDs existan no demuestra que puedan combinarse. Las consultas parametrizadas evitan otra clase de fallo, pero no sustituyen esta comprobación.

Define campos editables por acción; no vuelques un body completo sobre contrato o activación. Deriva titular, entorno y producto del contexto autorizado y contrasta cada cambio de vigencia, cupo, propietario o estado con su política. Protege también formularios generales, rutas antiguas y acciones masivas. Aplica reautenticación adicional únicamente cuando la política la requiera.

Estas decisiones siguen el principio de comprobar permisos por solicitud y recurso de [OWASP Authorization](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html).

## Decisión de política

La política recibe evidencia ya verificada y observaciones explícitas. Devuelve un resultado estructurado: estado, acciones, funcionalidades, límites, motivo, final comercial, final técnico y próxima consulta si procede.

Estados orientativos; combina o amplía según el producto:

| Estado | Operación comercial | Siguiente acción |
|---|---|---|
| Sin activar | No | Activación o importación |
| Activa | Según derechos | Operación normal |
| Gracia autorizada | Solo lo expresamente permitido | Reintentar renovación técnica |
| Vencida | No, salvo acceso de salida aprobado | Renovar contrato |
| Suspendida/revocada | No | Revisión del proveedor |
| Liberada | No con esa activación | Activación autorizada |
| Actualización requerida | Según política explícita | Actualizar confianza o aplicación |
| Recuperación | Solo acciones seguras definidas | Reparar identidad, tiempo o estado |

Define precedencia entre controles firmados, final comercial, identidad, integridad y reloj. Un control verificado más reciente no desaparece porque también haya una licencia antigua todavía vigente. Un error de red no equivale a una suspensión; una respuesta verificada de suspensión no se trata como una desconexión tolerable.

Usa UTC y unidades explícitas en el contrato técnico; fija límites temporales inclusivos/exclusivos. Un patrón sencillo es `inicio <= ahora < fin`. La gracia técnica nunca extiende el contrato comercial salvo que el negocio lo haya concedido expresamente. Renueva derechos mediante nueva evidencia de la autoridad, no sumando tiempo local a cada reinicio.

Una funcionalidad desconocida no concede permisos. Una extensión opcional desconocida puede ignorarse solo si el contrato la define así; un límite crítico desconocido exige rechazo o actualización, evitando que un cliente viejo opere sin aplicarlo.

## Aplicar decisiones en las operaciones

Construye un catálogo de acciones o una interfaz central de autorización. Cubre rutas HTTP, comandos nativos, IPC, WebSocket, jobs, CLI, exportaciones y tareas programadas según el producto. Comprueba licencia y autorización del usuario cerca de la operación real.

En operaciones largas, define si se autoriza al comenzar, por lote o antes de confirmar. Impide que decisiones en caché o tokens locales sigan concediendo uso indefinido tras cambiar la revisión o vencer su ventana.

Una caché de decisiones incluye el alcance pertinente: tenant, licencia/activación, revisión y contexto de actor cuando depende de él. Su vigencia no supera la evidencia que representa. Invalida cambios de permisos, sesión o contrato según el modelo; prueba la siguiente petición de una sesión abierta y los procesos persistentes. Nunca compartas por accidente decisiones o respuestas privadas entre clientes mediante una caché de proceso, CDN o proxy.

Si hay gateway/servicio local, evita que el backend acepte un acceso directo que elude su decisión. Cuando uses capacidades o tickets, liga cada uno a su consumidor, acción, recurso, duración y generación del runtime; limita repetición y verifica la identidad del interlocutor. El formato y la duración dependen del diseño seleccionado.

Licencia, sesión de usuario, rol, autorización del recurso y protección contra peticiones falsificadas siguen siendo controles distintos. Una marca de licencia en headers, cookie, localStorage o variable modificable por el usuario no sustituye ninguno de ellos.

## Datos del usuario y experiencia de recuperación

Antes de bloquear, define acceso a activación, soporte y, cuando corresponda, exportación o backup de salida. Esas excepciones requieren autorización del usuario y canales confiables; no abras la aplicación completa ni ejecutes código no verificado para obtener un backup.

El vencimiento no borra bases de datos, documentos ni respaldos del negocio. Los mensajes distinguen contrato vencido, servicio inaccesible, identidad no disponible y permiso de usuario insuficiente, y ofrecen una acción concreta. Los diagnósticos usan códigos estables; evita revelar detalles internos en pantallas públicas.
