/**
 * asistenciaController.js
 * Módulo: Control de Asistencia
 * Gestiona empleados, configuración de horarios y registros diarios de asistencia.
 */

const { getDatabase } = require('../config/database');
const getPool = getDatabase;

// Horario semanal por defecto para empleados nuevos
const DEFAULT_WEEKLY_SCHEDULE = [
  { dia: 1, entrada: "08:00:00", salida: "18:00:00", horas_requeridas: 9.0 }, // Lunes
  { dia: 2, entrada: "08:00:00", salida: "18:00:00", horas_requeridas: 9.0 }, // Martes
  { dia: 3, entrada: "08:00:00", salida: "18:00:00", horas_requeridas: 9.0 }, // Miércoles
  { dia: 4, entrada: "08:00:00", salida: "18:00:00", horas_requeridas: 9.0 }, // Jueves
  { dia: 5, entrada: "08:00:00", salida: "18:00:00", horas_requeridas: 9.0 }, // Viernes
  { dia: 6, entrada: "08:00:00", salida: "12:00:00", horas_requeridas: 3.67 }, // Sábado (20 min descanso = 3h 40m = 3.67h)
  { dia: 0, entrada: null, salida: null, horas_requeridas: 0.0 }              // Domingo
];

/**
 * GET /api/asistencia/empleados
 * Obtener todos los empleados de asistencia con sus balances y rangos de fechas
 */
const getEmpleados = async (req, res) => {
  try {
    const pool = getPool();
    const { rows } = await pool.query(
      `SELECT 
        e.id, 
        e.nombre, 
        e.horario_habitual,
        MIN(r.fecha)::text as fecha_inicio,
        MAX(r.fecha)::text as fecha_fin,
        COALESCE(SUM(r.suma_resta), 0)::numeric as balance_total
      FROM public.asistencia_empleados e
      LEFT JOIN public.asistencia_registros r ON e.id = r.empleado_id
      GROUP BY e.id, e.nombre, e.horario_habitual
      ORDER BY LOWER(e.nombre) ASC`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('getEmpleados error:', err);
    res.status(500).json({ success: false, message: 'Error al obtener empleados de asistencia' });
  }
};

/**
 * Calcular horas trabajadas y balance en base a entradas, salidas y tiempos programados
 */
const calcularHorasRegistro = (horaEntrada, horaSalida, programadoEntrada, programadoSalida, horasComida, horasEsperadas) => {
  if (!horaEntrada || !horaSalida) {
    return {
      horasTrabajadas: null,
      balance: parseFloat((0 - (horasEsperadas || 0)).toFixed(2))
    };
  }

  // Limitar hora_entrada a la hora programada (si real es anterior a programada)
  let entradaEfectiva = horaEntrada;
  if (programadoEntrada) {
    // Si la entrada real es anterior a la programada, se ajusta al inicio de jornada
    if (horaEntrada < programadoEntrada) {
      entradaEfectiva = programadoEntrada;
    }
  }

  const parseTimeToSeconds = (timeStr) => {
    if (!timeStr) return 0;
    const parts = timeStr.split(':').map(Number);
    const h = parts[0] || 0;
    const m = parts[1] || 0;
    const s = parts[2] || 0;
    return h * 3600 + m * 60 + s;
  };

  const entradaSecs = parseTimeToSeconds(entradaEfectiva);
  const salidaSecs = parseTimeToSeconds(horaSalida);

  let diffSecs = salidaSecs - entradaSecs;
  if (diffSecs < 0) diffSecs += 24 * 3600; // Cruza medianoche

  let netHours = diffSecs / 3600;
  const comida = parseFloat(horasComida || 0);
  netHours = Math.max(0, netHours - comida);

  const horasTrabajadas = parseFloat(netHours.toFixed(2));
  const balance = parseFloat((horasTrabajadas - (horasEsperadas || 0)).toFixed(2));

  return { horasTrabajadas, balance };
};

/**
 * POST /api/asistencia/empleados
 * Crear o actualizar manualmente un empleado de asistencia
 */
const createOrUpdateEmpleado = async (req, res) => {
  const pool = getPool();
  try {
    const { id, nombre, horario_habitual } = req.body;
    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ success: false, message: 'El nombre es obligatorio' });
    }

    const schedule = horario_habitual || [];

    if (id) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Actualizar datos del empleado
        const { rows } = await client.query(
          `UPDATE public.asistencia_empleados
           SET nombre = $1, horario_habitual = $2, updated_at = NOW()
           WHERE id = $3 RETURNING *`,
          [nombre.trim(), JSON.stringify(schedule), id]
        );
        if (!rows.length) {
          await client.query('ROLLBACK');
          return res.status(404).json({ success: false, message: 'Empleado no encontrado' });
        }

        // Obtener registros de asistencia con turno 'Habitual' para este empleado
        const { rows: registros } = await client.query(
          `SELECT id, fecha::text, hora_entrada::text, hora_salida::text, horas_comida::numeric
           FROM public.asistencia_registros
           WHERE empleado_id = $1 AND turno = 'Habitual'`,
          [id]
        );

        // Recalcular y actualizar cada registro
        for (const reg of registros) {
          const [y, m, d] = reg.fecha.split('-').map(Number);
          const dateObj = new Date(y, m - 1, d);
          const diaSemana = dateObj.getDay(); // 0 = Domingo, 1 = Lunes...

          // Buscar el horario de este día en la nueva configuración
          const dayConfig = schedule.find(s => s.dia === diaSemana) || { dia: diaSemana, entrada: null, salida: null, horas_requeridas: 0 };
          
          const newExpected = dayConfig.horas_requeridas || 0;
          const newProgEntrada = dayConfig.entrada || null;
          const newProgSalida = dayConfig.salida || null;

          const { horasTrabajadas, balance } = calcularHorasRegistro(
            reg.hora_entrada,
            reg.hora_salida,
            newProgEntrada,
            newProgSalida,
            reg.horas_comida,
            newExpected
          );
          const calculatedSumaResta = balance < 0 || balance > 0.50 ? balance : 0.00;
 
          await client.query(
            `UPDATE public.asistencia_registros
             SET 
               horas_esperadas = $1,
               programado_entrada = $2,
               programado_salida = $3,
               horas_trabajadas = $4,
               balance = $5,
               suma_resta = $6,
               updated_at = NOW()
             WHERE id = $7`,
            [newExpected, newProgEntrada, newProgSalida, horasTrabajadas, balance, calculatedSumaResta, reg.id]
          );
        }

        await client.query('COMMIT');
        res.json({ success: true, data: rows[0] });
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } else {
      // Crear nuevo
      const { rows } = await pool.query(
        `INSERT INTO public.asistencia_empleados (nombre, horario_habitual)
         VALUES ($1, $2) RETURNING *`,
        [nombre.trim(), JSON.stringify(schedule)]
      );
      res.status(201).json({ success: true, data: rows[0] });
    }
  } catch (err) {
    console.error('createOrUpdateEmpleado error:', err);
    if (err.code === '23505') { // Violación de unicidad
      return res.status(400).json({ success: false, message: 'Ya existe un empleado registrado con ese nombre' });
    }
    res.status(500).json({ success: false, message: 'Error al procesar la información del empleado' });
  }
};

/**
 * DELETE /api/asistencia/empleados/:id
 * Eliminar empleado
 */
const deleteEmpleado = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();
    const { rowCount } = await pool.query(
      `DELETE FROM public.asistencia_empleados WHERE id = $1`,
      [id]
    );
    if (!rowCount) return res.status(404).json({ success: false, message: 'Empleado no encontrado' });
    res.json({ success: true });
  } catch (err) {
    console.error('deleteEmpleado error:', err);
    res.status(500).json({ success: false, message: 'Error al eliminar empleado' });
  }
};

/**
 * POST /api/asistencia/check-import
 * Recibe una lista de nombres de empleados y devuelve si existen y su última fecha de registro
 */
const checkImport = async (req, res) => {
  try {
    const { nombres } = req.body;
    if (!Array.isArray(nombres) || !nombres.length) {
      return res.status(400).json({ success: false, message: 'Debe proporcionar una lista de nombres' });
    }

    const pool = getPool();

    // Query para obtener datos cruzados de la lista recibida
    const { rows } = await pool.query(
      `SELECT 
        val as nombre,
        EXISTS(SELECT 1 FROM public.asistencia_empleados WHERE LOWER(nombre) = LOWER(val)) as existe,
        (
          SELECT MAX(fecha)::text 
          FROM public.asistencia_registros r
          JOIN public.asistencia_empleados e ON e.id = r.empleado_id
          WHERE LOWER(e.nombre) = LOWER(val)
        ) as ultima_fecha,
        (
          SELECT horario_habitual 
          FROM public.asistencia_empleados 
          WHERE LOWER(nombre) = LOWER(val)
        ) as horario_habitual
      FROM unnest($1::text[]) as val`,
      [nombres]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('checkImport error:', err);
    res.status(500).json({ success: false, message: 'Error al validar importación' });
  }
};

/**
 * POST /api/asistencia/import
 * Recibe los datos de asistencia filtrados y los guarda/actualiza en lote
 */
const importAsistencia = async (req, res) => {
  const pool = getPool();
  const client = await pool.connect();
  try {
    const { registros } = req.body; // Array de objetos { nombre, fecha, entrada, salida, comida, horasTrabajadas, horasEsperadas, balance, turno }
    if (!Array.isArray(registros) || !registros.length) {
      return res.status(400).json({ success: false, message: 'No se recibieron registros para importar' });
    }

    await client.query('BEGIN');

    // Mapear nombres a IDs de empleados. Guardaremos caché local en la transacción.
    const empleadoCache = {};

    let insertados = 0;
    let actualizados = 0;

    for (const reg of registros) {
      if (!reg || !reg.nombre) {
        throw new Error(`Registro inválido o sin nombre: ${JSON.stringify(reg)}`);
      }
      const nombreLimpio = reg.nombre.trim();
      const nombreKey = nombreLimpio.toLowerCase();

      let empleadoId = empleadoCache[nombreKey];

      if (!empleadoId) {
        // Buscar empleado
        const { rows: findRows } = await client.query(
          `SELECT id FROM public.asistencia_empleados WHERE LOWER(nombre) = $1`,
          [nombreKey]
        );

        if (findRows.length > 0) {
          empleadoId = findRows[0].id;
        } else {
          // Crear empleado nuevo con el horario por defecto (vacio por defecto [])
          const { rows: createRows } = await client.query(
            `INSERT INTO public.asistencia_empleados (nombre, horario_habitual)
             VALUES ($1, $2) RETURNING id`,
            [nombreLimpio, JSON.stringify([])]
          );
          empleadoId = createRows[0].id;
        }
        empleadoCache[nombreKey] = empleadoId;
      }

      // Limpiar tiempos de manera segura (guiones, espacios vacíos, formatos no válidos)
      const cleanTime = (val) => {
        if (!val || typeof val !== 'string') return null;
        const trimmed = val.trim();
        if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(trimmed)) {
          return trimmed;
        }
        return null;
      };

      const entrada = cleanTime(reg.entrada);
      const salida = cleanTime(reg.salida);
      const programado_entrada = cleanTime(reg.programado_entrada);
      const programado_salida = cleanTime(reg.programado_salida);
      
      const balanceVal = reg.balance || 0;
      const suma_resta = balanceVal < 0 || balanceVal > 0.50 ? balanceVal : 0.00;
 
      try {
        await client.query(
          `INSERT INTO public.asistencia_registros 
            (empleado_id, fecha, turno, hora_entrada, hora_salida, horas_comida, horas_trabajadas, horas_esperadas, balance, programado_entrada, programado_salida, suma_resta)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
           ON CONFLICT (empleado_id, fecha) 
           DO UPDATE SET
             turno = EXCLUDED.turno,
             hora_entrada = EXCLUDED.hora_entrada,
             hora_salida = EXCLUDED.hora_salida,
             horas_comida = EXCLUDED.horas_comida,
             horas_trabajadas = EXCLUDED.horas_trabajadas,
             horas_esperadas = EXCLUDED.horas_esperadas,
             balance = EXCLUDED.balance,
             programado_entrada = EXCLUDED.programado_entrada,
             programado_salida = EXCLUDED.programado_salida,
             suma_resta = EXCLUDED.suma_resta,
             updated_at = NOW()`,
          [
            empleadoId,
            reg.fecha,
            reg.turno || 'Habitual',
            entrada,
            salida,
            reg.comida || 0,
            reg.horasTrabajadas,
            reg.horasEsperadas || 0,
            reg.balance || 0,
            programado_entrada,
            programado_salida,
            suma_resta
          ]
        );
      } catch (dbErr) {
        throw new Error(`Error insertando registro para ${nombreLimpio} el ${reg.fecha}: ${dbErr.message} (Detalle: ${dbErr.detail || 'Ninguno'})`);
      }

      insertados++;
    }

    await client.query('COMMIT');
    res.json({ success: true, message: `${insertados} registros importados exitosamente` });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('importAsistencia error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error al importar registros de asistencia: ' + err.message,
      error: err.message
    });
  } finally {
    client.release();
  }
};

/**
 * GET /api/asistencia/registros/:empleadoId
 * Obtener todos los registros de asistencia de un empleado
 */
const getRegistrosEmpleado = async (req, res) => {
  try {
    const { empleadoId } = req.params;
    const pool = getPool();

    // Obtener los datos del empleado con balance total
    const { rows: empRows } = await pool.query(
      `SELECT 
        id, 
        nombre, 
        horario_habitual,
        COALESCE((SELECT SUM(suma_resta) FROM public.asistencia_registros WHERE empleado_id = $1), 0)::numeric as balance_total
       FROM public.asistencia_empleados 
       WHERE id = $1`,
      [empleadoId]
    );

    if (!empRows.length) {
      return res.status(404).json({ success: false, message: 'Empleado no encontrado' });
    }

    const { rows: regRows } = await pool.query(
      `SELECT 
        id,
        empleado_id,
        fecha::text,
        turno,
        hora_entrada::text,
        hora_salida::text,
        horas_comida::numeric,
        horas_trabajadas::numeric,
        horas_esperadas::numeric,
        balance::numeric,
        programado_entrada::text,
        programado_salida::text,
        suma_resta::numeric
      FROM public.asistencia_registros
      WHERE empleado_id = $1
      ORDER BY fecha DESC`,
      [empleadoId]
    );

    res.json({
      success: true,
      empleado: empRows[0],
      registros: regRows
    });
  } catch (err) {
    console.error('getRegistrosEmpleado error:', err);
    res.status(500).json({ success: false, message: 'Error al obtener registros de asistencia' });
  }
};

/**
 * PUT /api/asistencia/registros/:id
 * Actualizar una fila de asistencia diaria manualmente
 */
const updateRegistroDia = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      turno, 
      hora_entrada, 
      hora_salida, 
      horas_comida, 
      horas_trabajadas, 
      horas_esperadas, 
      balance,
      programado_entrada,
      programado_salida,
      suma_resta
    } = req.body;
 
    const pool = getPool();
 
    // Limpiar tiempos de manera segura (guiones, espacios vacíos, formatos no válidos)
    const cleanTime = (val) => {
      if (!val || typeof val !== 'string') return null;
      const trimmed = val.trim();
      if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(trimmed)) {
        return trimmed;
      }
      return null;
    };
 
    const entrada = cleanTime(hora_entrada);
    const salida = cleanTime(hora_salida);
    const progEntrada = cleanTime(programado_entrada);
    const progSalida = cleanTime(programado_salida);
 
    let finalSumaResta = suma_resta;
    if (finalSumaResta === undefined || finalSumaResta === null) {
      const balanceVal = balance || 0;
      finalSumaResta = balanceVal < 0 || balanceVal > 0.50 ? balanceVal : 0.00;
    }
 
    const { rows } = await pool.query(
      `UPDATE public.asistencia_registros
       SET 
         turno = $1,
         hora_entrada = $2,
         hora_salida = $3,
         horas_comida = $4,
         horas_trabajadas = $5,
         horas_esperadas = $6,
         balance = $7,
         programado_entrada = $8,
         programado_salida = $9,
         suma_resta = $10,
         updated_at = NOW()
       WHERE id = $11 RETURNING *`,
      [
        turno || 'Habitual',
        entrada,
        salida,
        horas_comida || 0,
        horas_trabajadas,
        horas_esperadas || 0,
        balance || 0,
        progEntrada,
        progSalida,
        finalSumaResta,
        id
      ]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Registro de asistencia no encontrado' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('updateRegistroDia error:', err);
    res.status(500).json({ success: false, message: 'Error al actualizar el registro de asistencia' });
  }
};

module.exports = {
  getEmpleados,
  createOrUpdateEmpleado,
  deleteEmpleado,
  checkImport,
  importAsistencia,
  getRegistrosEmpleado,
  updateRegistroDia
};
