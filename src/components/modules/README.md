# Módulos de Paginación

Este directorio contiene módulos reutilizables para mostrar datos con paginación. Cada módulo encapsula la lógica de paginación, búsqueda y presentación de datos en tablas.

## Módulos Disponibles

### ClientsModule
Muestra tabla de clientes con paginación de 25 registros por página.

```tsx
import { ClientsModule } from '@/components/modules';

<ClientsModule
  clients={clients}
  onEdit={(client) => handleEdit(client)}
  onDelete={(id) => handleDelete(id)}
  isLoading={false}
/>
```

**Props:**
- `clients: Client[]` - Array de clientes a mostrar
- `onEdit: (client: Client) => void` - Callback cuando se hace clic en editar
- `onDelete: (id: string) => void` - Callback cuando se hace clic en eliminar
- `isLoading?: boolean` - Estado de carga (opcional)

### SellersModule
Muestra tabla de vendedores con paginación de 25 registros por página.

```tsx
import { SellersModule } from '@/components/modules';

<SellersModule
  sellers={sellers}
  onEdit={(seller) => handleEdit(seller)}
  onDelete={(id) => handleDelete(id)}
/>
```

### ConfeccionistasModule
Muestra tabla de confeccionistas con paginación de 25 registros por página.

```tsx
import { ConfeccionistasModule } from '@/components/modules';

<ConfeccionistasModule
  confeccionistas={confeccionistas}
  onEdit={(conf) => handleEdit(conf)}
  onDelete={(id) => handleDelete(id)}
/>
```

### ReferencesModule
Muestra tabla de referencias con paginación de 50 registros por página.

```tsx
import { ReferencesModule } from '@/components/modules';

<ReferencesModule
  references={references}
  onEdit={(ref) => handleEdit(ref)}
  onDelete={(id) => handleDelete(id)}
/>
```

### DeliveryDatesModule
Muestra tabla de fechas de entrega con paginación de 30 registros por página.

```tsx
import { DeliveryDatesModule } from '@/components/modules';

<DeliveryDatesModule
  deliveryDates={deliveryDates}
  onEdit={(dd) => handleEdit(dd)}
  onDelete={(id) => handleDelete(id)}
/>
```

### ReceptionsModule
Muestra tabla de recepciones con paginación de 20 registros por página.

```tsx
import { ReceptionsModule } from '@/components/modules';

<ReceptionsModule
  receptions={receptions}
  onEdit={(reception) => handleEdit(reception)}
  onDelete={(id) => handleDelete(id)}
/>
```

### DispatchesModule
Muestra tabla de despachos con paginación de 20 registros por página.

```tsx
import { DispatchesModule } from '@/components/modules';

<DispatchesModule
  dispatches={dispatches}
  onEdit={(dispatch) => handleEdit(dispatch)}
  onDelete={(id) => handleDelete(id)}
/>
```

## Características Comunes

Todos los módulos incluyen:

1. **Búsqueda**: Campo de búsqueda que filtra los datos en tiempo real
2. **Paginación**: Navegación entre páginas con botones anterior/siguiente
3. **Cambio de tamaño de página**: Selector para cambiar la cantidad de registros por página
4. **Acciones**: Botones para editar y eliminar registros
5. **Estado de carga**: Indicador visual cuando se están cargando datos
6. **Mensaje vacío**: Mensaje cuando no hay datos que mostrar

## Hooks Utilizados

### usePaginationWithContext
Hook personalizado para manejar la lógica de paginación.

```tsx
import { usePaginationWithContext } from '@/hooks/usePaginationWithContext';

const { pagination, goToPage, setPageSize, getPaginatedData } = usePaginationWithContext(1, 25);

// pagination: { currentPage, pageSize, total, totalPages }
// goToPage(page): Navegar a una página específica
// setPageSize(size): Cambiar el tamaño de página
// getPaginatedData(data): Obtener datos paginados
```

## Componentes Utilizados

### PaginationComponent
Componente de paginación reutilizable.

```tsx
import { PaginationComponent } from '@/components/PaginationComponent';

<PaginationComponent
  currentPage={1}
  totalPages={10}
  pageSize={25}
  onPageChange={(page) => handlePageChange(page)}
  onPageSizeChange={(size) => handlePageSizeChange(size)}
  isLoading={false}
  pageSizeOptions={[10, 20, 25, 50]}
/>
```

### PaginatedTable
Componente wrapper para tablas con paginación.

```tsx
import { PaginatedTable } from '@/components/PaginatedTable';

<PaginatedTable
  currentPage={1}
  totalPages={10}
  pageSize={25}
  onPageChange={(page) => handlePageChange(page)}
  onPageSizeChange={(size) => handlePageSizeChange(size)}
  title="Mis Datos"
>
  {/* Contenido de la tabla */}
</PaginatedTable>
```

## Integración en Vistas

Para integrar un módulo en una vista:

```tsx
import { ClientsModule } from '@/components/modules';
import { useAppContext } from '@/context/useAppContext';

const MyView = () => {
  const { state } = useAppContext();
  
  const handleEdit = (client) => {
    // Lógica de edición
  };
  
  const handleDelete = (id) => {
    // Lógica de eliminación
  };
  
  return (
    <ClientsModule
      clients={state.clients}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );
};
```

## Tamaños de Página Predeterminados

- **Clientes**: 25 registros/página
- **Vendedores**: 25 registros/página
- **Confeccionistas**: 25 registros/página
- **Referencias**: 50 registros/página
- **Fechas de Entrega**: 30 registros/página
- **Recepciones**: 20 registros/página
- **Despachos**: 20 registros/página

## Testing

Cada módulo incluye tests unitarios que verifican:

- Renderizado correcto de la tabla
- Paginación funcional
- Búsqueda y filtrado
- Acciones (editar/eliminar)
- Casos edge (datos vacíos, carga, etc.)

Ejecutar tests:

```bash
npm test -- ClientsModule.test.tsx
```

## Validación de Requisitos

Los módulos validan los siguientes requisitos:

- **Requirement 3.1**: Clientes con 25 registros/página
- **Requirement 3.2**: Vendedores con 25 registros/página
- **Requirement 3.3**: Confeccionistas con 25 registros/página
- **Requirement 3.4**: Referencias con 50 registros/página
- **Requirement 3.5**: Fechas de Entrega con 30 registros/página
- **Requirement 3.6**: Recepciones con 20 registros/página
- **Requirement 3.7**: Despachos con 20 registros/página
- **Requirement 3.8**: Navegación entre páginas
- **Requirement 3.9**: Cambio de tamaño de página
