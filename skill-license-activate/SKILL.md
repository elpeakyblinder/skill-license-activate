---
name: skill-license-activate
description: Diseñar, implementar o revisar activación y licenciamiento comercial de software, con licencias firmadas, cupos, renovaciones, uso online/offline y recuperación. Guía independiente del lenguaje con adaptación Rust/Windows y servidores LAN. Usar al añadir o corregir estos flujos; no para licencias legales de dependencias ni para autenticación de usuarios sin licenciamiento comercial.
license: CC-BY-NC-4.0
metadata:
  version: "0.1.0"
---

# License Activation Guide

Construye una autoridad de licencias verificable y una política explícita de uso. Adapta los patrones al proyecto y a sus reglas comerciales; Rust, Windows, un servicio local y una jerarquía de claves son opciones, no requisitos universales.

Esta guía contiene patrones generales y ejemplos sintéticos. No contiene un protocolo propietario ni requiere acceso al proyecto del que surgieron las ideas. Al usar código privado como referencia, extrae decisiones e invariantes; no copies secretos, dominios, identificadores, rutas internas, formatos exactos o procedimientos operativos a documentación reutilizable.

## Selecciona el trabajo

- **Auditoría:** inspecciona el alcance solicitado y entrega hallazgos con evidencia. Una revisión no autoriza por sí sola cambios de código, derechos comerciales o datos reales.
- **Diseño e implementación:** acuerda las decisiones comerciales que afectan al diseño, aplica el alcance autorizado y prueba casos permitidos, denegaciones y fallos parciales.
- **Diagnóstico de activación o recuperación:** sigue credencial -> intento -> autoridad -> documento -> persistencia -> decisión -> operación. Corrige la causa comprobada sin convertir una reparación en una activación nueva o un permiso adicional.
- **Revisión de un cambio:** traza la frontera alterada y sus entradas alternativas; distingue regresiones demostradas, hipótesis y comprobaciones pendientes.

Para cada operación del alcance, identifica actor, capacidad, licencia/objeto, entradas, efectos y prueba. Una activación que funciona o una suite antigua no demuestran la protección de los demás caminos.

## Comenzar por el contexto

Inspecciona los flujos existentes, los límites de confianza y las pruebas antes de editar. Conserva el gestor de paquetes, las convenciones y la autorización del proyecto. Distingue documentación histórica de comportamiento comprobado. No conviertas una corrección puntual en una reescritura del sistema.

Para un sistema nuevo, resuelve las decisiones que cambian el diseño. Pregunta solo lo que no puedas inferir y avanza trabajo independiente mientras tanto:

- **Unidad comercial:** usuario, equipo, instalación, servidor, concurrencia o consumo. Define qué cuenta, qué no cuenta y cómo se libera el cupo.
- **Vigencia:** inicio en compra o primera activación; duración calendario o segundos; suscripción, prueba o perpetua; renovación y transferencia.
- **Conectividad:** online obligatorio, autorización temporal con tolerancia a desconexión, offline completo o LAN con autoridad central.
- **Riesgo y disponibilidad:** qué acciones deben bloquearse, cómo preservar datos y qué puede hacer soporte cuando se pierde identidad, reloj o estado.
- **Plataforma:** quién ejecuta la verificación y dónde puedes proteger claves y estado. Un navegador público no custodia secretos del proveedor.

Registra supuestos reversibles. No inventes plazos de gracia, permisos de soporte, retención de datos ni exigencias de hardware como si fueran decisiones aprobadas.

## Referencias según la tarea

Lee únicamente las referencias que necesites:

| Trabajo | Referencia |
|---|---|
| Elegir arquitectura, entidades, autoridad y estados | [architecture.md](references/architecture.md) |
| Firmas, contratos, pruebas de dispositivo y rotación de claves | [protocol-and-trust.md](references/protocol-and-trust.md) |
| Activación, reintentos, cupos, offline, LAN y recuperación | [lifecycle-and-recovery.md](references/lifecycle-and-recovery.md) |
| Implementación con Rust o protección local en Windows | [rust-and-windows.md](references/rust-and-windows.md) |
| Verificar fronteras, carreras y fallos parciales | [validation.md](references/validation.md) |

En un proyecto nuevo, comienza por arquitectura. Antes de cambiar un formato firmado, lee protocolo y confianza. Antes de tocar cupos, renovación o persistencia, lee ciclo de vida. Para otro lenguaje, conserva las invariantes y sustituye los adaptadores.

## Invariantes esenciales

1. El proveedor conserva las claves privadas de emisión; el cliente distribuido recibe confianza pública. Una clave de activación permite solicitar autorización, no equivale a una licencia firmada.
2. Una firma válida no basta: comprueba propósito, producto, entorno, alcance comercial, identidad cuando corresponda, revisión y vigencia. El transporte TLS tampoco sustituye estas comprobaciones.
3. Una única política decide acciones, funcionalidades y límites. La UI muestra esa decisión; las operaciones reales la aplican en el backend, runtime, tareas y rutas alternativas.
4. Para operaciones de negocio, licenciamiento y autorización de usuarios son condiciones independientes: la operación requiere ambas. Activación y recuperación usan su propio mecanismo de autenticación según el diseño, sin exigir una licencia activa para obtenerla. Ningún flujo concede acceso a otra cuenta o cliente.
5. Cupos y primer inicio comercial se deciden atómicamente en la autoridad. Los reintentos del mismo intento recuperan su resultado; no crean otra activación ni reinician la vigencia.
6. Confirma éxito local solo después de verificar y persistir el resultado de forma duradera. Un fallo parcial conserva un estado recuperable, sin crear permisos adicionales.
7. Una desconexión puede conservar derechos previamente verificados dentro de su ventana autorizada. Un documento alterado, identidad perdida o estado corrupto no crean una nueva gracia.
8. Recuperar no significa borrar evidencia, recrear identidad silenciosamente, bajar revisiones o restaurar una licencia antigua. Se preservan datos y se sigue una transición verificable.
9. No prometas impedir toda modificación por un administrador del dispositivo ni revocar instantáneamente un cliente desconectado. Explica los límites del diseño seleccionado.
10. Configuración ausente, permiso desconocido o dependencia de protección requerida inaccesible impiden la operación protegida. Las excepciones de desarrollo son explícitas y no se activan por un error.

## Orden de implementación

Trabaja en incrementos que puedas comprobar:

1. Fija unidad comercial, estados, fronteras y contrato versionado con ejemplos de prueba.
2. Implementa verificación y política deterministas, separadas de red, reloj y almacenamiento.
3. Implementa la autoridad: autorización de operadores, emisión, cupos, idempotencia, renovaciones y auditoría.
4. Integra identidad y persistencia con recuperación de operaciones pendientes.
5. Aplica permisos donde ocurren las operaciones y conecta la UI con razones y acciones de recuperación.
6. Ejecuta pruebas negativas, concurrencia y reinicio; valida el artefacto distribuible y las condiciones reales de plataforma.

Reduce el alcance si el producto solo necesita un subconjunto. Para corregir un flujo existente, modifica el mínimo necesario manteniendo sus contratos y prueba la frontera afectada.

## Criterio de entrega

Deja una decisión de arquitectura breve, el contrato y estados del alcance implementado, las pruebas relevantes y un procedimiento de recuperación. En proyectos existentes, actualiza sus documentos establecidos en vez de crear duplicados.

Reporta comportamiento implementado, evidencia ejecutada y límites pendientes. Diferencia pruebas de librería, integración, instalación y operación real. No presentes una prueba local como evidencia de producción.

En auditorías entrega hallazgo, impacto, ubicación, evidencia, corrección sugerida y prueba propuesta. En implementaciones o diagnósticos entrega comportamiento corregido, casos comprobados, resultados y pendientes concretos. No inventes severidad, explotación ni validaciones que no ejecutaste.

Usa fixtures sintéticos y claves exclusivas de prueba. No leas ni publiques secretos para explicar el diseño. No emitas licencias comerciales, migres datos reales, rotes claves reales ni despliegues como consecuencia implícita de una tarea de diseño; esas acciones necesitan estar dentro del alcance autorizado.

## Autoría, licencia y aviso

© 2026 Guijosa Dev. Texto bajo [CC BY-NC 4.0](LICENSE): atribución, uso no comercial e indicación de cambios según sus términos. Permisos comerciales por separado: [devcharlying@gmail.com](mailto:devcharlying@gmail.com). Consulta el [texto jurídico oficial](https://creativecommons.org/licenses/by-nc/4.0/legalcode.es).

Creada a partir de experiencia personal; lee y evalúa las instrucciones antes de usarlas. Se proporciona tal cual, sin garantías de seguridad, exactitud o idoneidad. Los agentes pueden equivocarse: revisa sus acciones y resultados. En la máxima medida permitida por la ley aplicable, el autor y los colaboradores excluyen responsabilidad por daños derivados del uso del material. Esta exclusión no elimina derechos o responsabilidades que legalmente no puedan excluirse, ni modifica los términos de la licencia. No constituye asesoría profesional ni una garantía de inmunidad jurídica.

Quien utiliza la skill es responsable, dentro de su ámbito de actuación y control, de evaluar sus recomendaciones, configurar y supervisar al agente, validar los resultados y decidir qué optimizaciones, cambios o acciones autoriza y aplica. Delegar tareas a una IA no sustituye esa evaluación. Esta declaración no excluye responsabilidades que la ley no permita excluir ni modifica la licencia.
