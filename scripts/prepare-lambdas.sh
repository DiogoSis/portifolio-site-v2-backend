#!/bin/bash
# Prepara pacotes Lambda consolidados renomeando arquivos para index.js

DIST_DIR="../dist/handlers"
LAMBDA_DIR=".terraform/lambdas-src"

cd terraform || exit 1

# Limpa e cria diretório
rm -rf "$LAMBDA_DIR"
mkdir -p "$LAMBDA_DIR"

# Lista de handlers consolidados
handlers=(
  "certificates"
  "formations"
  "projects"
  "knowledge"
)

echo "🔨 Preparando handlers consolidados..."
echo ""

# Para cada handler consolidado, cria diretório e copia como index.js
for handler in "${handlers[@]}"; do
  src_file="$DIST_DIR/$handler.js"
  dest_dir="$LAMBDA_DIR/$handler"
  
  if [ ! -f "$src_file" ]; then
    echo "❌ Erro: $src_file não encontrado"
    exit 1
  fi
  
  mkdir -p "$dest_dir"
  cp "$src_file" "$dest_dir/index.js"
  
  # Copia sourcemap se existir
  if [ -f "$DIST_DIR/$handler.js.map" ]; then
    cp "$DIST_DIR/$handler.js.map" "$dest_dir/index.js.map"
  fi
  
  echo "✓ Preparado: $handler ($(du -h "$src_file" | cut -f1))"
done

echo ""
echo "✅ Todos os ${#handlers[@]} handlers consolidados preparados em $LAMBDA_DIR"
echo "🎯 Redução: 16 handlers → 4 handlers (-75%)"
