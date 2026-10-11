# Definition of Done (DoD) — Catálogo de productos

La funcionalidad «Catálogo de productos» está **terminada solo cuando todo esto se cumple**. La lista se copia y se marca en la descripción del Pull Request; lo que no aplica a este parcial se deja indicado como N/A.

- [ ] Acceptance criteria met and verified: los cinco endpoints responden con los códigos y el formato de error del contrato, y la app hace el CRUD completo contra la API.
- [ ] Code merged to `main` via a reviewed, approved PR: PR desde `feature/catalogo-productos` hacia el `main` del propio fork, con descripción (la revisión la hace el docente).
- [ ] Unit + widget/UI tests added and passing: al menos dos pruebas unitarias del dominio y dos de la API con `startTestServer()`, y `npm test` pasa. Pruebas de interfaz: N/A en este parcial.
- [ ] Runs on **both** target platforms without regressions: N/A. La app se prueba en el navegador con `npm run dev`; el parcial no pide compilar para Android ni iOS.
- [ ] No new linter, type, or accessibility warnings introduced: `npm run lint` y `npm run build` terminan sin errores.
- [ ] Loading, empty, error, and offline states handled: la lista muestra carga, vacío, sin resultados y error con «Reintentar»; el detalle y el formulario muestran carga y error (incluido «no encontrado»). Sin conexión se ve el estado de error.
- [ ] Strings localized (no hardcoded user-facing text): N/A. La app es solo en español y el parcial no pide traducciones.
- [ ] Analytics / crash reporting events added where relevant: N/A. El parcial no usa analítica.
- [ ] Documentation updated (feature doc, ADR if an architectural decision was made): `docs/` completo, con el commit de documentación antes del primer commit de código, y README con cómo ejecutar y las dos secciones en inglés.
- [ ] No secrets in the repository: `.env` está ignorado por Git, solo se versiona `.env.example` y no hay claves ni contraseñas.

> Si algún punto no se cumple, la funcionalidad **no está terminada** y el PR se queda abierto.
