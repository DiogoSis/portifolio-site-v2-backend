#!/bin/bash
# Prepara pacotes Lambda renomeando arquivos para index.js

DIST_DIR="../dist/handlers"
LAMBDA_DIR=".terraform/lambdas-src"

cd terraform || exit 1

# Limpa e cria diretório
rm -rf "$LAMBDA_DIR"
mkdir -p "$LAMBDA_DIR"

# Lista de handlers
handlers=(
  "certificates/getAll"
  "certificates/getById"
  "certificates/create"
  "certificates/update"
  "formations/getAll"
  "formations/getById"
  "formations/create"
  "formations/update"
  "projects/getAll"
  "projects/getById"
  "projects/create"
  "projects/update"
  "knowledge/getAll"
  "knowledge/getById"
  "knowledge/create"
  "knowledge/update"
)

# Para cada handler, cria diretório e copia como index.js
for handler in "${handlers[@]}"; do
  resource=$(echo "$handler" | tr '/' '-')
  src_file="$DIST_DIR/$handler.js"
  dest_dir="$LAMBDA_DIR/$resource"
  
  mkdir -p "$dest_dir"
  cp "$src_file" "$dest_dir/index.js"
  echo "✓ Preparado: $resource"
done

echo "✅ Todos os handlers preparados em $LAMBDA_DIR"
