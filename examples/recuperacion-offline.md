# Escenario sintético: importación offline y estado perdido

[English](offline-recovery.md) | [Validación](../skill-license-activate/references/validation.md)

## Contexto

Una aplicación desconectada conserva una solicitud pendiente y recibe por un canal autorizado una licencia firmada. Durante la importación falla el almacenamiento; después se intenta importar un documento para otra identidad y se pierde acceso a la clave existente.

El escenario es hipotético. No contiene un formato real, claves, archivos de licencia ni resultados de ejecución.

## Decisiones que deben conservarse

La importación verifica formato acotado, confianza, firma, producto/entorno, vínculo del intento, identidad, vigencia y revisión antes de confirmar estado. La solicitud pendiente solo se consume cuando el resultado queda persistido.

Perder la clave no autoriza recrearla automáticamente ni cambiar el baseline. Un fallo de almacenamiento tampoco permite usar un booleano activo o un documento no verificado como respaldo. Los datos del negocio se conservan durante recuperación.

## Pruebas propuestas

| Prueba | Resultado esperado |
| --- | --- |
| Importación válida y persistencia completa | Concede solo derechos verificados; el intento queda resuelto |
| Corte antes/después del reemplazo duradero | Estado anterior completo o nuevo completo, sin combinación |
| Archivo de otro intento o identidad | Rechazo sin sustituir estado vigente |
| Misma licencia ya confirmada | Resultado idempotente según el contrato |
| Revisión anterior o igual con contenido diferente | Rechazo o conflicto sin bajar el checkpoint |
| Clave existente inaccesible | Recuperación explícita; no se crea otra identidad silenciosamente |
| Archivo excesivo o ruta manipulada | Rechazo acotado sin ejecución ni escritura fuera del destino |

Comprueba el estado al reiniciar y después de reparar almacenamiento o permisos; no solo el retorno de una función de importación. Usa recursos de prueba y no elimines claves reales para reproducir el caso.

## Límites y evidencia

Un cliente desconectado no recibe una revocación remota inmediatamente. La confianza temporal y la restauración completa de snapshots tienen límites que deben declararse. Ni este ejemplo ni la suite del paquete certifican una implementación offline.

Si se ejecuta, registra plataforma, método de custodia, almacenamiento, puntos de interrupción y resultados con datos sintéticos. Una corrección de documentación no equivale a esa evidencia.
