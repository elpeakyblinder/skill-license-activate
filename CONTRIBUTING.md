# Contribuir a License Activation Guide

Se aceptan correcciones, escenarios reproducibles, referencias, traducciones y revisiones en español o inglés. Cuando exista un repositorio publicado, puedes crear un fork y enviar una PR hacia `main`; no necesitas acceso de escritura.

## Elige el canal

| Necesidad | Canal |
| --- | --- |
| Instrucción ambigua, resultado incorrecto o enlace roto | Plantilla de [problema](.github/ISSUE_TEMPLATE/bug_report.md) con reproducción sintética |
| Nueva comprobación o adaptación de plataforma | Plantilla de [propuesta](.github/ISSUE_TEMPLATE/proposal.md); una PR directa sirve para cambios pequeños |
| Corrección de texto | PR breve |
| Información que expone secretos o un sistema real | [SECURITY.md](SECURITY.md), sin detalles públicos |

Las plantillas locales no habilitan Issues ni crean un remoto por sí mismas. Usa el canal privado si la distribución aún no tiene un repositorio público.

## Preparar una pull request

1. Lee [SKILL.md](skill-license-activate/SKILL.md), [LICENSE](LICENSE) y esta guía.
2. Mantén la propuesta centrada en un problema. No conviertas la política comercial o una limitación de plataforma particular en un requisito universal.
3. Coloca propósito, invariantes y selección de trabajo en `SKILL.md`; conserva detalles condicionales en `skill-license-activate/references/`. Copiar solo la carpeta interior debe seguir bastando para utilizarla.
4. Actualiza ambos README cuando cambie su contenido equivalente. Registra cambios de comportamiento bajo «Sin publicar» en [CHANGELOG.md](CHANGELOG.md).
5. Ejecuta comprobaciones proporcionales y reporta los resultados reales. Una errata no necesita pruebas de un servidor de licencias.
6. Completa la [plantilla de PR](.github/pull_request_template.md). Guijosa Dev decide qué se integra; no hay aceptación ni plazo garantizados.

El mantenedor prepara versiones, etiquetas y releases, salvo coordinación expresa. No cambies las condiciones de licencia como efecto secundario de una contribución.

## Reglas de instrucciones y escenarios

- Distingue requisitos del protocolo, decisiones comerciales, recomendaciones y observaciones empíricas.
- Usa documentación primaria para integraciones. Indica versiones y fecha cuando pueda cambiar el comportamiento; no copies textos extensos de terceros.
- Conserva alcance y autorización. Auditar no autoriza emisión real, migración, revocación, rotación, publicación o cambios en cuentas.
- Usa escenarios sintéticos. No incorpores nombres, endpoints, claves públicas concretas, identificadores, hashes, umbrales ni procedimientos de un producto privado como ejemplos generales.
- No incluyas código de bypass, extracción de secretos, exfiltración, instrucciones ocultas ni acciones ajenas al objetivo.
- No prometas imposibilidad de copia, revocación inmediata offline, eficacia equivalente entre modelos o ausencia de vulnerabilidades.
- Los ejemplos indican si son hipotéticos, si tienen una implementación disponible y qué se ejecutó. No conviertas resultados históricos en certificación actual.

## Evidencia proporcional

Para cambiar una instrucción que afecta comportamiento, incluye solicitud mínima, política comercial, plataforma/versiones, flujo observado, decisión esperada, prueba propuesta o ejecutada y límites. Usa tenants, credenciales y archivos sintéticos.

Comprueba el caso permitido y la denegación sin efectos cuando corresponda. Para carreras o durabilidad, aporta evidencia del almacenamiento y entorno adecuados; una revisión de texto no acredita ese comportamiento.

Para cambios en empaquetado, enlaces, metadatos o documentos:

```bash
node --test tests/skill.test.mjs
```

La suite usa el runner estándar de Node.js; fue verificada con Node.js 24. Ejecuta también `quick_validate.py` de skill-creator cuando esté disponible. Si modificas integración o código en un proyecto consumidor, ejecuta sus pruebas reales por separado.

Si usaste IA, revisa personalmente la aportación y explica sus límites. No adjuntes conversaciones completas ni datos de clientes.

## Idiomas

`README.md` es la referencia en español y `README.en.md` su traducción. La skill instalable permanece en español. Mantén también equivalentes los escenarios traducidos y los avisos legales. Las traducciones nuevas se enlazan cuando estén completas y revisadas; si falta sincronizar una existente, indícalo.

## Autoría y licencia de aportaciones

Confirma en la PR que tienes los derechos necesarios y que ofreces el material bajo **CC BY-NC 4.0**, la [licencia pública](LICENSE). Identifica contenido de terceros y obtén autorización si intervienen derechos de otra persona o empleador.

Conservas la autoría. La contribución no transfiere automáticamente copyright ni permisos comerciales adicionales a Guijosa Dev. Una incorporación comercial de material de terceros requiere un acuerdo separado con sus titulares. No existe CLA comercial, pago ni reparto de ingresos automático.

Estas reglas de recepción no modifican los derechos de la licencia sobre material ya publicado.

## Convivencia

Expón razones y evidencia con respeto. No se admiten acoso, discriminación, amenazas, spam o datos privados. El mantenedor puede cerrar propuestas fuera de alcance o limitar interacciones abusivas. Canal privado: [devcharlying@gmail.com](mailto:devcharlying@gmail.com).

La revisión comunitaria ayuda a mantener la guía; no certifica el licenciamiento de una aplicación. Consulta el [aviso de responsabilidad](README.md#aviso-de-responsabilidad).
