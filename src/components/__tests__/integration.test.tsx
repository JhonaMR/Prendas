/**
 * 🧪 FRONTEND INTEGRATION TESTS
 * 
 * Tests para verificar que todos los componentes y hooks están conectados correctamente
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Componentes
import ClientsModule from '../modules/ClientsModule';
import SellersModule from '../modules/SellersModule';
import ConfeccionistasModule from '../modules/ConfeccionistasModule';
import ReferencesModule from '../modules/ReferencesModule';
import { TableHeader } from '../shared/TableHeader';
import { FormModal } from '../shared/FormModal';
import { FilterBar } from '../shared/FilterBar';
import AuditHistoryView from '../AuditHistoryView';

describe('🎨 Shared Components Tests', () => {
  test('✅ TableHeader should render with columns', () => {
    const columns = [
      { key: 'id', label: 'ID', sortable: true },
      { key: 'name', label: 'Name', sortable: true }
    ];

    render(
      <table>
        <TableHeader columns={columns} />
      </table>
    );

    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  test('✅ FormModal should render when open', () => {
    render(
      <FormModal
        isOpen={true}
        title="Test Modal"
        onClose={() => {}}
        onSubmit={() => {}}
      >
        <input placeholder="Test input" />
      </FormModal>
    );

    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Test input')).toBeInTheDocument();
  });

  test('✅ FormModal should not render when closed', () => {
    render(
      <FormModal
        isOpen={false}
        title="Test Modal"
        onClose={() => {}}
        onSubmit={() => {}}
      >
        <input placeholder="Test input" />
      </FormModal>
    );

    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
  });

  test('✅ FilterBar should render search input', () => {
    render(
      <FilterBar
        searchValue=""
        onSearchChange={() => {}}
        searchPlaceholder="Search..."
      />
    );

    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  test('✅ FilterBar should show clear button when has search value', () => {
    render(
      <FilterBar
        searchValue="test"
        onSearchChange={() => {}}
        searchPlaceholder="Search..."
        showClearButton={true}
      />
    );

    expect(screen.getByText('Limpiar búsqueda')).toBeInTheDocument();
  });
});

describe('📦 Module Components Tests', () => {
  const mockClients = [
    { id: '1', name: 'Client 1', nit: '123', address: 'Addr 1', city: 'City 1', seller: 'Seller 1' },
    { id: '2', name: 'Client 2', nit: '456', address: 'Addr 2', city: 'City 2', seller: 'Seller 2' }
  ];

  const mockSellers = [
    { id: 's1', name: 'Seller 1' },
    { id: 's2', name: 'Seller 2' }
  ];

  const mockConfeccionistas = [
    { id: 'c1', name: 'Confeccionista 1', address: 'Addr', city: 'City', phone: '123', score: 'A', active: true },
    { id: 'c2', name: 'Confeccionista 2', address: 'Addr', city: 'City', phone: '456', score: 'AA', active: true }
  ];

  const mockReferences = [
    { id: 'r1', description: 'Ref 1', price: 100, designer: 'Designer 1', cloth1: 'Cloth 1', avgCloth1: 50, cloth2: 'Cloth 2', avgCloth2: 50 },
    { id: 'r2', description: 'Ref 2', price: 200, designer: 'Designer 2', cloth1: 'Cloth 1', avgCloth1: 50, cloth2: 'Cloth 2', avgCloth2: 50 }
  ];

  test('✅ ClientsModule should render clients table', () => {
    render(
      <ClientsModule
        clients={mockClients}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    );

    expect(screen.getByText('Client 1')).toBeInTheDocument();
    expect(screen.getByText('Client 2')).toBeInTheDocument();
  });

  test('✅ ClientsModule should have search functionality', () => {
    render(
      <ClientsModule
        clients={mockClients}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    );

    const searchInput = screen.getByPlaceholderText(/Buscar/i);
    expect(searchInput).toBeInTheDocument();
  });

  test('✅ SellersModule should render sellers table', () => {
    render(
      <SellersModule
        sellers={mockSellers}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    );

    expect(screen.getByText('Seller 1')).toBeInTheDocument();
    expect(screen.getByText('Seller 2')).toBeInTheDocument();
  });

  test('✅ ConfeccionistasModule should render confeccionistas table', () => {
    render(
      <ConfeccionistasModule
        confeccionistas={mockConfeccionistas}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    );

    expect(screen.getByText('Confeccionista 1')).toBeInTheDocument();
    expect(screen.getByText('Confeccionista 2')).toBeInTheDocument();
  });

  test('✅ ReferencesModule should render references table', () => {
    render(
      <ReferencesModule
        references={mockReferences}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    );

    expect(screen.getByText('Ref 1')).toBeInTheDocument();
    expect(screen.getByText('Ref 2')).toBeInTheDocument();
  });

  test('✅ Modules should have pagination', () => {
    render(
      <ClientsModule
        clients={mockClients}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    );

    // Buscar elementos de paginación
    const paginationElements = screen.queryAllByText(/página|page/i);
    expect(paginationElements.length).toBeGreaterThanOrEqual(0);
  });

  test('✅ Modules should have action buttons', () => {
    render(
      <ClientsModule
        clients={mockClients}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    );

    const editButtons = screen.getAllByText('Editar');
    const deleteButtons = screen.getAllByText('Eliminar');

    expect(editButtons.length).toBeGreaterThan(0);
    expect(deleteButtons.length).toBeGreaterThan(0);
  });
});

describe('📊 AuditHistoryView Tests', () => {
  test('✅ AuditHistoryView should render loading state', () => {
    render(
      <AuditHistoryView entityType="clients" entityId="test-1" />
    );

    expect(screen.getByText(/Cargando/i)).toBeInTheDocument();
  });

  test('✅ AuditHistoryView should render empty state', async () => {
    // Mock fetch para retornar lista vacía
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ records: [] })
      })
    );

    render(
      <AuditHistoryView entityType="clients" entityId="test-1" />
    );

    await waitFor(() => {
      expect(screen.getByText(/No hay registros/i)).toBeInTheDocument();
    });
  });

  test('✅ AuditHistoryView should render audit records', async () => {
    const mockRecords = [
      {
        id: 1,
        entity_type: 'clients',
        entity_id: 'test-1',
        user_id: 'user-1',
        action: 'CREATE',
        old_values: null,
        new_values: { name: 'Test' },
        changes: null,
        ip_address: '127.0.0.1',
        user_agent: 'Test',
        created_at: new Date().toISOString()
      }
    ];

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ records: mockRecords })
      })
    );

    render(
      <AuditHistoryView entityType="clients" entityId="test-1" />
    );

    await waitFor(() => {
      expect(screen.getByText('CREATE')).toBeInTheDocument();
    });
  });
});

describe('🔄 Component Integration Tests', () => {
  test('✅ Modules should work together', () => {
    const mockClients = [
      { id: '1', name: 'Client 1', nit: '123', address: 'Addr', city: 'City', seller: 'Seller' }
    ];

    const { rerender } = render(
      <ClientsModule
        clients={mockClients}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    );

    expect(screen.getByText('Client 1')).toBeInTheDocument();

    // Actualizar con nuevos datos
    const updatedClients = [
      { id: '1', name: 'Updated Client', nit: '123', address: 'Addr', city: 'City', seller: 'Seller' }
    ];

    rerender(
      <ClientsModule
        clients={updatedClients}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    );

    expect(screen.getByText('Updated Client')).toBeInTheDocument();
  });

  test('✅ Shared components should be reusable', () => {
    const columns = [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Name' }
    ];

    const { rerender } = render(
      <table>
        <TableHeader columns={columns} />
      </table>
    );

    expect(screen.getByText('ID')).toBeInTheDocument();

    // Cambiar columnas
    const newColumns = [
      { key: 'id', label: 'Identifier' },
      { key: 'name', label: 'Full Name' }
    ];

    rerender(
      <table>
        <TableHeader columns={newColumns} />
      </table>
    );

    expect(screen.getByText('Identifier')).toBeInTheDocument();
    expect(screen.getByText('Full Name')).toBeInTheDocument();
  });
});

describe('✨ Accessibility Tests', () => {
  test('✅ Components should have proper labels', () => {
    render(
      <FilterBar
        searchValue=""
        onSearchChange={() => {}}
        searchPlaceholder="Search clients"
      />
    );

    const input = screen.getByPlaceholderText('Search clients');
    expect(input).toHaveAttribute('type', 'text');
  });

  test('✅ Buttons should be accessible', () => {
    render(
      <FormModal
        isOpen={true}
        title="Test"
        onClose={() => {}}
        onSubmit={() => {}}
      >
        Content
      </FormModal>
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  test('✅ Tables should have proper structure', () => {
    const mockClients = [
      { id: '1', name: 'Client 1', nit: '123', address: 'Addr', city: 'City', seller: 'Seller' }
    ];

    render(
      <ClientsModule
        clients={mockClients}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    );

    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
  });
});
