# Cómo Subir Aguacate AI a GitHub

## Opción 1: Usando GitHub CLI (gh)

### 1. Instalar GitHub CLI
```
powershell
# Usando winget (Windows)
winget install GitHub.cli

# O descargar desde: https://github.com/cli/cli/releases
```

### 2. Iniciar sesión en GitHub
```powershell
gh auth login
```
Sigue las instrucciones:
- Selecciona "GitHub.com"
- Selecciona "HTTPS"
- Selecciona "Login with a web browser"
- Copia el código de un solo uso
- Autoriza en el navegador

### 3. Crear repositorio y subir
```
powershell
cd "C:\Users\johnr\Aguacate AI\AguacateAI"

# Crear repositorio en GitHub
gh repo create aguacate-ai --public --source=. --push

# O si ya tienes un repositorio creado:
git remote add origin https://github.com/TU_USUARIO/aguacate-ai.git
git branch -M main
git push -u origin main
```

---

## Opción 2: Usando Git directamente

### 1. Instalar Git (si no lo tienes)
```
powershell
winget install Git.Git
```

### 2. Configurar Git
```
powershell
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"
```

### 3. Crear repositorio en GitHub.com
1. Ve a https://github.com/new
2. Nombre del repositorio: `aguacate-ai`
3. Selecciona "Public" o "Private"
4. No inicialices con README (usaremos el existente)
5. Click "Create repository"

### 4. Subir el proyecto
```
powershell
cd "C:\Users\johnr\Aguacate AI\AguacateAI"

# Inicializar git (si no está inicializado)
git init

# Agregar todos los archivos
git add .

# Crear commit inicial
git commit -m "Initial commit: Aguacate AI - App de análisis de aguacate con IA"

# Agregar origen remoto
git remote add origin https://github.com/TU_USUARIO/aguacate-ai.git

# Cambiar nombre de rama
git branch -M main

# Subir a GitHub
git push -u origin main
```

---

## Actualizar cambios existentes

```
powershell
# Agregar cambios
git add .

# Hacer commit
git commit -m "Descripción del cambio"

# Subir cambios
git push
```

---

## Notas Importantes

1. **Archivo .gitignore**: El proyecto ya incluye un `.gitignore` que excluye:
   - `node_modules/`
   - Archivos de npm/yarn
   - Archivos de compilación de Electron
   - Archivos del sistema

2. **Límite de tamaño**: GitHub tiene un límite de 100MB por archivo. Las imágenes/datos grandes deben usar Git LFS.

3. **Token de acceso**: Si usas autenticación por token:
   - Ve a Settings > Developer settings > Personal access tokens
   - Crea un nuevo token con permisos "repo"
   - Usa el token como contraseña

---

## Comandos rápidos para copiar y pegar

```
powershell
# Copia y pega estos comandos en PowerShell:

cd "C:\Users\johnr\Aguacate AI\AguacateAI"

git init

git add .

git commit -m "Initial commit: Aguacate AI - App de análisis de aguacate con IA"

git branch -M main

git remote add origin https://github.com/TU_USUARIO/aguacate-ai.git

git push -u origin main
```

Reemplaza `TU_USUARIO` con tu nombre de usuario de GitHub.
