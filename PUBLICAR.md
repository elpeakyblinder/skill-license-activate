# Publicar License Activation Guide

Guía del mantenedor para revisar y distribuir el repositorio y la carpeta instalable. Esta preparación local no publica archivos ni crea un remoto.

## Antes de publicar

- Lee la skill, las cinco referencias, ambos README, escenarios, licencia y changelog.
- El autor público es **Guijosa Dev** y el contacto es **devcharlying@gmail.com**, como en las otras skills del autor. Ese contacto queda visible en la distribución.
- Confirma que `skill-license-activate/` es autocontenida, lleva su `LICENSE` y conserva los avisos al copiarla por separado.
- Revisa que no contiene secretos, endpoints reales, umbrales internos, fixtures originales, rutas de la computadora ni un mapa del producto privado de origen.
- Conserva CC BY-NC 4.0 salvo decisión expresa y revisada. Mantén permisos comerciales separados y derechos de terceros identificados.
- No presentes avisos de responsabilidad como inmunidad jurídica. Antes de depender de ellos para limitar responsabilidad o vender permisos, revísalos con un profesional jurídico.
- No anuncies producción, compatibilidad, resistencia a copia o eficacia de agentes sin evidencia concreta.

## Validación local

1. Ejecuta `node --test tests/skill.test.mjs` y corrige los fallos.
2. Ejecuta `quick_validate.py skill-license-activate` con skill-creator cuando esté disponible.
3. Comprueba versión en `VERSION`, `metadata.version`, README, badges y changelog, así como igualdad de las licencias de raíz y paquete.
4. Revisa ambas portadas, navegación, tablas, enlaces y avisos en una vista Markdown. Los README no usan emojis.
5. Comprueba descubrimiento local, sin instalar: `pnpm dlx skills add . --list`.
6. Si cambió una integración, prueba el proyecto consumidor en un entorno aislado y reporta lo pendiente. La suite del paquete no valida firmas, cupos ni hardware de una aplicación.

## Preparar GitHub

El repositorio es [elpeakyblinder/skill-license-activate](https://github.com/elpeakyblinder/skill-license-activate). Comprueba que `git remote -v` apunta a ese destino antes de publicar.

Los README incluyen su comando de instalación y enlaces de atribución e Issues. Sube el contenido de esta carpeta a la raíz, incluida `.github/`; la skill instalable sigue dentro de `skill-license-activate/`. Tener un remoto configurado no significa que el contenido o una release ya estén publicados.

Antes de crear una release, revisa el diff, confirma el alcance, registra el commit y crea una etiqueta nueva. Usa la entrada correspondiente del changelog; no muevas ni reutilices etiquetas publicadas. La primera versión preparada es `0.1.0`, no una release ya publicada.

La versión usa `MAYOR.MENOR.PARCHE`: parches para correcciones acotadas, menores para capacidades nuevas y mayores para cambios incompatibles. Durante `0.x`, explica los cambios importantes de alcance. Un número de versión no es certificación técnica.

## Comprobar distribución remota

Después del push, comprueba la distribución con estos comandos:

```bash
pnpm dlx skills add elpeakyblinder/skill-license-activate --list
pnpm dlx skills add elpeakyblinder/skill-license-activate --skill skill-license-activate
```

El [CLI de Skills](https://github.com/vercel-labs/skills) admite orígenes locales y remotos. Prueba instalación en un proyecto temporal y confirma que licencia, metadatos y referencias acompañan a `SKILL.md`.

La detección no demuestra aplicación correcta. Antes de anunciar «probada en» un agente, ejecuta una tarea aislada y registra agente/modelo, versión, fecha, solicitud, resultado y efectos. Publicar GitHub no registra automáticamente la skill en catálogos.

## Contribuciones y ajustes

Comprueba [Issues](https://github.com/elpeakyblinder/skill-license-activate/issues), selector de plantillas y presentación de PR después de publicar. Configura protección de rama si la necesitas; estos archivos no cambian ajustes de GitHub ni crean bots por sí solos.

Una aportación bajo la licencia pública no concede automáticamente derechos comerciales adicionales. Acuerda los permisos necesarios con sus titulares antes de incluirla en una distribución comercial. No hay cobros, tarifas o participación de ingresos automáticos.

La licencia del material de esta guía y las licencias comerciales que implementa una aplicación son objetos distintos. No agregues términos CC BY-NC a documentos de cliente ni reclames el proyecto consumidor como efecto de instalar esta skill.

Los futuros componentes ejecutables de producto requieren decidir una licencia apropiada para software; esta distribución conserva el esquema de instrucciones y documentación de las skills del autor.
