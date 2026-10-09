# Escenario sintético: último cupo y respuesta perdida

[English](concurrent-activation.md) | [Guía de ciclo de vida](../skill-license-activate/references/lifecycle-and-recovery.md)

## Contexto

Una aplicación instalada usa autorizaciones firmadas temporales. Una licencia sintética tiene un cupo disponible y su vigencia empieza en la primera activación. Dos dispositivos presentan intentos distintos mientras uno de ellos pierde la respuesta por un timeout.

Este escenario es una propuesta de reproducción. No proviene de un registro productivo ni acredita pruebas ejecutadas por esta guía. Los identificadores A y B son etiquetas de ejemplo, no credenciales.

## Riesgo

Separar `count` e `insert` sin una transición que serialice la decisión puede admitir ambos equipos. Crear otro intento tras cada timeout puede duplicar efectos o reiniciar el término. Consultar resultados solo con un ID conocido puede exponer la activación de otro cliente.

## Operación que debe trazarse

Credencial comercial -> intención estable -> validación de alcance -> reserva/confirmación atómica -> documento firmado -> persistencia del cliente -> decisión de uso.

Antes de emitir, la autoridad fija una única vigencia y comprueba estado comercial y cupo. El resultado queda ligado al intento, sujeto y alcance. Un timeout no demuestra que el servidor no completó.

## Pruebas propuestas

| Prueba | Resultado esperado |
| --- | --- |
| A y B compiten por el último cupo | La capacidad disponible no se supera |
| A reintenta el intento ya confirmado | Recupera el resultado sin una segunda activación |
| A reusa idempotencia con otro body | Conflicto, sin nuevos derechos |
| Otro cliente consulta el intento de A | Rechazo sin exponer resultado ni alterar cupo |
| El cliente verifica respuesta y falla al persistir | No muestra éxito duradero; conserva recuperación |
| La licencia se revoca con emisión pendiente | Se aplica la política y orden de concurrencia definidos |

Ejecuta carreras en almacenamiento aislado que reproduzca las garantías de la autoridad. Comprueba datos persistidos, documento emitido y estado después de reiniciar, además del HTTP. Incluye el caso permitido para evitar una solución que bloquea toda activación.

## Límites y evidencia

La suite de mantenimiento del repositorio no ejecuta estas pruebas. Al reproducirlas registra lenguaje, motor, versión, secuencia, resultado y entorno. No copies contratos, credenciales, documentos firmados reales o detalles del producto de origen al reporte.
