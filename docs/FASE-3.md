# Fase 3: Rutinas y Entrenamientos

**Duración estimada:** 2-3 semanas  
**Estado:** ⏳ Pendiente  
**Requisito:** Completar Fase 2

---

## 3.1 Backend - Exercises & Routines

### Prisma Models (agregar)
- [ ] Modelo `Exercise`
- [ ] Modelo `Routine`
- [ ] Modelo `RoutineExercise`
- [ ] Modelo `MemberRoutine`
- [ ] Modelo `Workout`
- [ ] Modelo `WorkoutExercise`
- [ ] Ejecutar migración

### Exercises Routes `/api/exercises`
- [ ] `GET /` - Listar ejercicios del gym
- [ ] `POST /` - Crear ejercicio
- [ ] `PATCH /:id` - Actualizar
- [ ] `DELETE /:id` - Eliminar
- [ ] `GET /muscle-groups` - Listar grupos musculares

### Routines Routes `/api/routines`
- [ ] `GET /` - Listar rutinas
- [ ] `POST /` - Crear rutina
- [ ] `GET /:id` - Detalle con ejercicios
- [ ] `PATCH /:id` - Actualizar
- [ ] `DELETE /:id` - Eliminar
- [ ] `POST /:id/exercises` - Agregar ejercicio a rutina
- [ ] `DELETE /:id/exercises/:exerciseId` - Quitar ejercicio
- [ ] `POST /:id/assign` - Asignar a member
- [ ] `GET /member/:memberId` - Rutinas de un member

### Workouts Routes `/api/workouts`
- [ ] `GET /` - Mis entrenamientos (member)
- [ ] `POST /` - Iniciar entrenamiento
- [ ] `GET /:id` - Detalle con ejercicios
- [ ] `PATCH /:id` - Actualizar (finalizar)
- [ ] `POST /:id/exercises` - Agregar set realizado
- [ ] `GET /stats` - Estadísticas de entrenamientos

---

## 3.2 Frontend - Admin - Ejercicios y Rutinas

### Páginas
- [ ] `Exercises/List` - Lista de ejercicios
- [ ] `Exercises/Create` - Crear ejercicio
- [ ] `Exercises/Edit` - Editar ejercicio
- [ ] `Routines/List` - Lista de rutinas
- [ ] `Routines/Create` - Crear rutina
- [ ] `Routines/Edit` - Editar rutina (builder)
- [ ] `Routines/Assign` - Asignar a members

### Componentes
- [ ] `ExerciseForm` - Formulario de ejercicio
- [ ] `ExerciseCard` - Card de ejercicio
- [ ] `RoutineBuilder` - Constructor visual de rutina
- [ ] `DaySelector` - Selector de día de semana
- [ ] `ExerciseSelector` - Buscar y agregar ejercicios
- [ ] `SetsRepsInput` - Input para series/repeticiones
- [ ] `MemberSelector` - Seleccionar members para asignar

### Funcionalidades
- [ ] CRUD ejercicios con imagen
- [ ] Filtrar ejercicios por grupo muscular
- [ ] Crear rutina con ejercicios por día
- [ ] Configurar series, repeticiones, descanso
- [ ] Asignar rutina a uno o varios members
- [ ] Ver qué members tienen cada rutina

---

## 3.3 Frontend - App Cliente - Rutinas

### Páginas
- [ ] `MyRoutines` - Lista de mis rutinas asignadas
- [ ] `MyRoutines/View` - Ver rutina completa
- [ ] `MyRoutines/Workout` - Hacer entrenamiento
- [ ] `MyWorkouts` - Historial de entrenamientos
- [ ] `MyWorkouts/View` - Detalle de entrenamiento

### Componentes
- [ ] `RoutineCard` - Card de rutina
- [ ] `RoutineDay` - Ejercicios de un día
- [ ] `ExerciseDetail` - Detalle del ejercicio
- [ ] `WorkoutTracker` - Tracker de entrenamiento activo
- [ ] `SetInput` - Input para registrar set (peso, reps)
- [ ] `RestTimer` - Timer de descanso
- [ ] `WorkoutSummary` - Resumen al finalizar
- [ ] `WorkoutHistory` - Lista de entrenamientos pasados

### Funcionalidades
- [ ] Ver rutinas asignadas
- [ ] Ver ejercicios por día
- [ ] Ver detalle de ejercicio (imagen, descripción)
- [ ] Iniciar entrenamiento desde rutina
- [ ] Registrar peso y reps por cada set
- [ ] Timer de descanso configurable (30s, 60s, 90s, 120s)
- [ ] Marcar ejercicio como completado
- [ ] Finalizar y guardar entrenamiento
- [ ] Ver historial de entrenamientos
- [ ] Ver progreso en pesos levantados

---

## ✅ Criterios de Completado Fase 3

- [ ] Admin puede crear ejercicios con imágenes
- [ ] Admin puede crear rutinas con ejercicios por día
- [ ] Admin puede asignar rutinas a members
- [ ] Members pueden ver sus rutinas asignadas
- [ ] Members pueden hacer entrenamientos
- [ ] Timer de descanso funciona
- [ ] Historial de entrenamientos guardado

---

## 📝 Notas

- Incluir biblioteca de ejercicios predefinidos
- Considerar modo offline para entrenamientos
- El timer debe funcionar en background
