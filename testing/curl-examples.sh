#!/bin/bash

# 🧪 GymApp API - Ejemplos de prueba con cURL
# Asegúrate de que el backend esté corriendo: cd backend && npm run dev

BASE_URL="http://localhost:3000"

echo "=========================================="
echo "  GymApp API - Test con cURL"
echo "=========================================="
echo ""

# 1. Health Check
echo "1️⃣  Health Check"
echo "---"
curl -s -X GET "$BASE_URL/health" | jq '.'
echo ""
echo ""

# 2. Login Super Admin
echo "2️⃣  Login Super Admin"
echo "---"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gymapp.com","password":"admin123"}')

echo "$RESPONSE" | jq '.'
TOKEN=$(echo "$RESPONSE" | jq -r '.data.token')
echo ""
echo "✅ Token guardado: ${TOKEN:0:50}..."
echo ""
echo ""

# 3. Dashboard - Métricas
echo "3️⃣  Dashboard - Métricas"
echo "---"
curl -s -X GET "$BASE_URL/api/super-admin/dashboard" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""
echo ""

# 4. Crear Gimnasio
echo "4️⃣  Crear Gimnasio"
echo "---"
GYM_RESPONSE=$(curl -s -X POST "$BASE_URL/api/super-admin/gyms" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Gym Olimpo",
    "email": "contacto@olimpo.com",
    "phone": "+51 999 888 777",
    "address": "Av. Principal 123, Lima",
    "adminName": "Carlos Pérez",
    "adminEmail": "admin@olimpo.com",
    "adminPassword": "password123"
  }')

echo "$GYM_RESPONSE" | jq '.'
GYM_ID=$(echo "$GYM_RESPONSE" | jq -r '.data.gym.id')
echo ""
echo "✅ Gym ID: $GYM_ID"
echo ""
echo ""

# 5. Listar Gimnasios
echo "5️⃣  Listar Gimnasios"
echo "---"
curl -s -X GET "$BASE_URL/api/super-admin/gyms" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""
echo ""

# 6. Ver Detalle de Gimnasio
if [ ! -z "$GYM_ID" ] && [ "$GYM_ID" != "null" ]; then
  echo "6️⃣  Ver Detalle de Gimnasio"
  echo "---"
  curl -s -X GET "$BASE_URL/api/super-admin/gyms/$GYM_ID" \
    -H "Authorization: Bearer $TOKEN" | jq '.'
  echo ""
  echo ""
fi

# 7. Actualizar Gimnasio
if [ ! -z "$GYM_ID" ] && [ "$GYM_ID" != "null" ]; then
  echo "7️⃣  Actualizar Gimnasio"
  echo "---"
  curl -s -X PATCH "$BASE_URL/api/super-admin/gyms/$GYM_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "phone": "+51 999 888 999"
    }' | jq '.'
  echo ""
  echo ""
fi

# 8. Login Admin Gym
echo "8️⃣  Login Admin Gym"
echo "---"
ADMIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@olimpo.com","password":"password123"}')

echo "$ADMIN_RESPONSE" | jq '.'
ADMIN_TOKEN=$(echo "$ADMIN_RESPONSE" | jq -r '.data.token')
echo ""
if [ ! -z "$ADMIN_TOKEN" ] && [ "$ADMIN_TOKEN" != "null" ]; then
  echo "✅ Admin Token guardado: ${ADMIN_TOKEN:0:50}..."
fi
echo ""
echo ""

# 9. Listar Facturas
echo "9️⃣  Listar Facturas"
echo "---"
curl -s -X GET "$BASE_URL/api/super-admin/invoices" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""
echo ""

# 10. Generar Facturas Mensuales
echo "🔟 Generar Facturas Mensuales"
echo "---"
curl -s -X POST "$BASE_URL/api/super-admin/invoices/generate" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""
echo ""

echo "=========================================="
echo "  ✅ Tests completados!"
echo "=========================================="
