// ============================================
// SERVICIO: Parser DXF para moldería textil
// Convierte entidades DXF a geometría normalizada
// Soporta: LINE, POLYLINE, TEXT
// ============================================

import DxfParser from 'dxf-parser';

// ── Tipos de salida normalizados ────────────────────────────────────────────

export interface DxfPoint {
    x: number;
    y: number;
}

export interface DxfLinea {
    tipo: 'linea';
    desde: DxfPoint;
    hasta: DxfPoint;
    capa: string;
}

export interface DxfPolilinea {
    tipo: 'polilinea';
    vertices: DxfPoint[];
    cerrada: boolean;
    capa: string;
}

export interface DxfTexto {
    tipo: 'texto';
    posicion: DxfPoint;
    texto: string;
    altura: number;
    rotacion: number;
    capa: string;
}

export type DxfEntidad = DxfLinea | DxfPolilinea | DxfTexto;

export interface DxfParseado {
    entidades: DxfEntidad[];
    bounds: {
        minX: number;
        minY: number;
        maxX: number;
        maxY: number;
        ancho: number;
        alto: number;
    };
}

// ── Parser principal ────────────────────────────────────────────────────────

export function parsearDxf(contenido: string): DxfParseado {
    const parser = new DxfParser();
    const dxf = parser.parseSync(contenido);

    const entidades: DxfEntidad[] = [];

    for (const ent of dxf.entities) {
        if (ent.type === 'LINE') {
            const v = ent.vertices as Array<{ x: number; y: number }>;
            if (v?.length >= 2) {
                entidades.push({
                    tipo: 'linea',
                    desde: { x: v[0].x, y: v[0].y },
                    hasta: { x: v[1].x, y: v[1].y },
                    capa: ent.layer ?? '0',
                });
            }
        } else if (ent.type === 'POLYLINE') {
            const verts = (ent.vertices as Array<{ x: number; y: number }>)
                .filter(v => typeof v.x === 'number' && typeof v.y === 'number')
                .map(v => ({ x: v.x, y: v.y }));

            if (verts.length >= 2) {
                entidades.push({
                    tipo: 'polilinea',
                    vertices: verts,
                    cerrada: !!(ent as any).shape,
                    capa: ent.layer ?? '0',
                });
            }
        } else if (ent.type === 'TEXT') {
            const sp = (ent as any).startPoint as { x: number; y: number };
            if (sp) {
                entidades.push({
                    tipo: 'texto',
                    posicion: { x: sp.x, y: sp.y },
                    texto: (ent as any).text ?? '',
                    altura: (ent as any).textHeight ?? 1,
                    rotacion: (ent as any).rotation ?? 0,
                    capa: ent.layer ?? '0',
                });
            }
        }
    }

    // Calcular bounding box sobre todas las coordenadas
    const todosX: number[] = [];
    const todosY: number[] = [];

    for (const e of entidades) {
        if (e.tipo === 'linea') {
            todosX.push(e.desde.x, e.hasta.x);
            todosY.push(e.desde.y, e.hasta.y);
        } else if (e.tipo === 'polilinea') {
            for (const v of e.vertices) {
                todosX.push(v.x);
                todosY.push(v.y);
            }
        } else if (e.tipo === 'texto') {
            todosX.push(e.posicion.x);
            todosY.push(e.posicion.y);
        }
    }

    const minX = Math.min(...todosX);
    const minY = Math.min(...todosY);
    const maxX = Math.max(...todosX);
    const maxY = Math.max(...todosY);

    return {
        entidades,
        bounds: {
            minX, minY, maxX, maxY,
            ancho: maxX - minX,
            alto: maxY - minY,
        },
    };
}

// ── Carga remota del archivo DXF ────────────────────────────────────────────

export async function cargarYParsearDxf(url: string): Promise<DxfParseado> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`No se pudo cargar el archivo: ${response.status} ${response.statusText}`);
    }
    const texto = await response.text();
    return parsearDxf(texto);
}
