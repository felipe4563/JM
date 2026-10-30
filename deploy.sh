#!/usr/bin/env bash
# Actualiza y redespliega JM Seguridad y Tecnología en el VPS.
# Uso: bash deploy.sh
#
# Qué hace:
#   1. Trae los últimos cambios de git (rama actual).
#   2. Descarga de ghcr.io las imágenes de ese commit. Las construye GitHub
#      Actions (.github/workflows/imagenes.yml) con cada push a main: el VPS
#      no construye nada, así que no gasta RAM ni CPU. Si Actions todavía no
#      terminó, espera hasta 15 minutos.
#   3. Recrea solo los contenedores que cambiaron.
#   4. Limpia las imágenes viejas de ESTE proyecto (no toca otros sistemas).
#
# Base de datos: database/jm_seguridad.sql se carga solo la primera vez
# (volumen mysql_data vacío). No hay migraciones automáticas: si cambia la
# estructura de las tablas, hay que aplicar el ALTER a mano:
#   docker compose exec -T mysql mysql -u root -p jm_seguridad < cambio.sql
#
# Volver a una versión anterior: TAG=<sha del commit> docker compose up -d
#
# No toca la config de nginx del sistema ni los certificados HTTPS: eso vive
# en /etc/nginx/ del VPS (plantilla en nginx/camarasjm.rusoft.dev.conf).

set -euo pipefail

# Todo va dentro de main: bash lee el script entero antes de ejecutarlo, así
# el git pull de abajo puede cambiar este mismo archivo sin romper la
# ejecución en curso.
main() {
  cd "$(dirname "${BASH_SOURCE[0]}")"

  if [ ! -f .env ]; then
    echo "Falta el archivo .env. Créalo con: cp .env.example .env  (y cambia las claves)"
    exit 1
  fi

  echo "==> Verificando que no haya cambios sin commitear en archivos versionados..."
  if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "Hay cambios locales sin commitear en el servidor. Abortando para no perderlos:"
    git status --porcelain --untracked-files=no
    exit 1
  fi

  local rama
  rama=$(git rev-parse --abbrev-ref HEAD)
  echo "==> Actualizando rama '$rama' desde origin..."
  git fetch origin
  git pull --ff-only origin "$rama"

  export TAG
  TAG=$(git rev-parse HEAD)
  echo "==> Descargando imágenes del commit ${TAG:0:7} desde ghcr.io..."
  local intento
  for intento in $(seq 1 30); do
    if docker compose pull --quiet api web 2>/dev/null; then
      break
    fi
    if [ "$intento" -eq 30 ]; then
      echo "Las imágenes del commit ${TAG:0:7} no aparecieron en ghcr.io."
      echo "Revisa GitHub -> Actions: el build pudo haber fallado."
      echo "Producción sigue con la versión anterior."
      exit 1
    fi
    echo "    Todavía no están (¿GitHub Actions sigue construyendo?). Reintento en 30 s... ($intento/30)"
    sleep 30
  done

  echo "==> Recreando contenedores con las imágenes nuevas..."
  docker compose up -d --no-build --remove-orphans

  # Solo las de este sistema (por la etiqueta que pone el workflow con la URL
  # del repo): las de los otros sistemas del VPS no se tocan. Las que usan
  # los contenedores en marcha tampoco.
  local repo
  repo=$(git remote get-url origin | sed -E 's#^git@github\.com:#https://github.com/#; s#\.git$##')
  echo "==> Limpiando imágenes viejas sin usar de $repo..."
  docker image prune -af --filter "label=org.opencontainers.image.source=$repo"

  echo "==> Estado actual de los servicios:"
  docker compose ps

  echo "==> Últimos logs de la API (Ctrl+C para salir):"
  docker compose logs -f --tail=50 api
}

main "$@"
