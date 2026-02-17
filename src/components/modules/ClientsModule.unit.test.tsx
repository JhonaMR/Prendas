import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ClientsModule } from './ClientsModule';
import { Client } from '../../types';

/**
 * Unit Tests for ClientsModule
 * Validates: Requirements 4.1, 4.5, 4.6, 4.7, 4.8
 */
describe('ClientsModule Unit Tests', () => {
  const mockClients: Client[] = Array.from({ length: 100 }, (_, i) => ({
    id: `C${String(i + 1).padStart(3, '0')}`,
    name: `Cliente ${i + 1}`,
    nit: `NIT${String(i + 1).padStart(5, '0')}`,
    address: `Dirección ${i + 1}`,
    city: `Ciudad ${i + 1}`,
    seller: `Vendedor ${i % 5}`
  }));

  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render clients module with table', () => {
      render(
        <ClientsModule
          clients={mockClients}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText(/Clientes \(100 total\)/)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Buscar por ID/)).toBeInTheDocument();
    });

    it('should display first page of clients (25 per page)', () => {
      render(
        <ClientsModule
          clients={mockClients}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      // Should show first 25 clients
      expect(screen.getByText('Cliente 1')).toBeInTheDocument();
      expect(screen.getByText('Cliente 25')).toBeInTheDocument();
      expect(screen.queryByText('Cliente 26')).not.toBeInTheDocument();
    });

    it('should display table headers', () => {
      render(
        <ClientsModule
          clients={mockClients}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('ID')).toBeInTheDocument();
      expect(screen.getByText('NIT')).toBeInTheDocument();
      expect(screen.getByText('Nombre')).toBeInTheDocument();
      expect(screen.getByText('Dirección')).toBeInTheDocument();
      expect(screen.getByText('Ciudad')).toBeInTheDocument();
      expect(screen.getByText('Vendedor')).toBeInTheDocument();
    });

    it('should display pagination controls', () => {
      render(
        <ClientsModule
          clients={mockClients}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText(/Página 1 de 4/)).toBeInTheDocument();
      expect(screen.getByText('← Anterior')).toBeInTheDocument();
      expect(screen.getByText('Siguiente →')).toBeInTheDocument();
    });

    it('should display client data in table rows', () => {
      render(
        <ClientsModule
          clients={mockClients}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      // Check that client data is displayed
      expect(screen.getByText('C001')).toBeInTheDocument();
      expect(screen.getByText('NIT00001')).toBeInTheDocument();
      expect(screen.getByText('Dirección 1')).toBeInTheDocument();
      expect(screen.getByText('Ciudad 1')).toBeInTheDocument();
    });
  });

  describe('Pagination', () => {
    it('should navigate to next page', () => {
      render(
        <ClientsModule
          clients={mockClients}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const nextButton = screen.getByText('Siguiente →');
      fireEvent.click(nextButton);

      expect(screen.getByText(/Página 2 de 4/)).toBeInTheDocument();
      expect(screen.getByText('Cliente 26')).toBeInTheDocument();
      expect(screen.queryByText('Cliente 1')).not.toBeInTheDocument();
    });

    it('should navigate to previous page', () => {
      render(
        <ClientsModule
          clients={mockClients}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const nextButton = screen.getByText('Siguiente →');
      fireEvent.click(nextButton);

      const prevButton = screen.getByText('← Anterior');
      fireEvent.click(prevButton);

      expect(screen.getByText(/Página 1 de 4/)).toBeInTheDocument();
      expect(screen.getByText('Cliente 1')).toBeInTheDocument();
    });

    it('should change page size', () => {
      render(
        <ClientsModule
          clients={mockClients}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const select = screen.getByDisplayValue('25') as HTMLSelectElement;
      fireEvent.change(select, { target: { value: '50' } });

      expect(screen.getByText(/Página 1 de 2/)).toBeInTheDocument();
    });

    it('should have correct page size options for clients', () => {
      render(
        <ClientsModule
          clients={mockClients}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const select = screen.getByDisplayValue('25') as HTMLSelectElement;
      const options = Array.from(select.options).map(opt => opt.value);
      
      expect(options).toContain('10');
      expect(options).toContain('20');
      expect(options).toContain('25');
      expect(options).toContain('50');
    });
  });

  describe('Search/Filters', () => {
    it('should filter clients by name', () => {
      render(
        <ClientsModule
          clients={mockClients}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const searchInput = screen.getByPlaceholderText(/Buscar por ID/);
      fireEvent.change(searchInput, { target: { value: 'Cliente 1' } });

      expect(screen.getByText('Cliente 1')).toBeInTheDocument();
      expect(screen.queryByText('Cliente 2')).not.toBeInTheDocument();
    });

    it('should filter clients by ID', () => {
      render(
        <ClientsModule
          clients={mockClients}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const searchInput = screen.getByPlaceholderText(/Buscar por ID/);
      fireEvent.change(searchInput, { target: { value: 'C001' } });

      expect(screen.getByText('Cliente 1')).toBeInTheDocument();
    });

    it('should filter clients by NIT', () => {
      render(
        <ClientsModule
          clients={mockClients}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const searchInput = screen.getByPlaceholderText(/Buscar por ID/);
      fireEvent.change(searchInput, { target: { value: 'NIT00001' } });

      expect(screen.getByText('Cliente 1')).toBeInTheDocument();
    });

    it('should reset to page 1 when searching', () => {
      render(
        <ClientsModule
          clients={mockClients}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      // Go to page 2
      const nextButton = screen.getByText('Siguiente →');
      fireEvent.click(nextButton);
      expect(screen.getByText(/Página 2 de 4/)).toBeInTheDocument();

      // Search
      const searchInput = screen.getByPlaceholderText(/Buscar por ID/);
      fireEvent.change(searchInput, { target: { value: 'Cliente 1' } });

      // Should be back on page 1
      expect(screen.getByText(/Página 1 de 1/)).toBeInTheDocument();
    });

    it('should show no results message when search has no matches', () => {
      render(
        <ClientsModule
          clients={mockClients}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const searchInput = screen.getByPlaceholderText(/Buscar por ID/);
      fireEvent.change(searchInput, { target: { value: 'NONEXISTENT' } });

      expect(screen.getByText(/No se encontraron clientes/)).toBeInTheDocument();
    });

    it('should be case-insensitive when filtering', () => {
      render(
        <ClientsModule
          clients={mockClients}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const searchInput = screen.getByPlaceholderText(/Buscar por ID/);
      fireEvent.change(searchInput, { target: { value: 'cliente 1' } });

      expect(screen.getByText('Cliente 1')).toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('should call onEdit when edit button is clicked', () => {
      render(
        <ClientsModule
          clients={mockClients}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const editButtons = screen.getAllByText('Editar');
      fireEvent.click(editButtons[0]);

      expect(mockOnEdit).toHaveBeenCalledWith(mockClients[0]);
    });

    it('should call onDelete when delete button is clicked', () => {
      render(
        <ClientsModule
          clients={mockClients}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const deleteButtons = screen.getAllByText('Eliminar');
      fireEvent.click(deleteButtons[0]);

      expect(mockOnDelete).toHaveBeenCalledWith(mockClients[0].id);
    });

    it('should call correct client data on edit', () => {
      render(
        <ClientsModule
          clients={mockClients}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const editButtons = screen.getAllByText('Editar');
      fireEvent.click(editButtons[5]); // Click 6th edit button

      expect(mockOnEdit).toHaveBeenCalledWith(mockClients[5]);
    });

    it('should call correct client ID on delete', () => {
      render(
        <ClientsModule
          clients={mockClients}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const deleteButtons = screen.getAllByText('Eliminar');
      fireEvent.click(deleteButtons[5]); // Click 6th delete button

      expect(mockOnDelete).toHaveBeenCalledWith(mockClients[5].id);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty clients list', () => {
      render(
        <ClientsModule
          clients={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText(/Clientes \(0 total\)/)).toBeInTheDocument();
      expect(screen.getByText(/No se encontraron clientes/)).toBeInTheDocument();
    });

    it('should handle single client', () => {
      render(
        <ClientsModule
          clients={[mockClients[0]]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText(/Página 1 de 1/)).toBeInTheDocument();
      expect(screen.getByText('Cliente 1')).toBeInTheDocument();
    });

    it('should handle loading state', () => {
      render(
        <ClientsModule
          clients={mockClients}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          isLoading={true}
        />
      );

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should handle clients with missing optional fields', () => {
      const clientsWithMissingFields: Client[] = [
        {
          id: 'C001',
          name: 'Cliente Sin Datos',
          nit: undefined,
          address: undefined,
          city: undefined,
          seller: undefined
        }
      ];

      render(
        <ClientsModule
          clients={clientsWithMissingFields}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('Cliente Sin Datos')).toBeInTheDocument();
      expect(screen.getAllByText('-').length).toBeGreaterThan(0); // For missing fields
    });

    it('should handle very long client names', () => {
      const clientsWithLongNames: Client[] = [
        {
          id: 'C001',
          name: 'A'.repeat(100),
          nit: 'NIT00001',
          address: 'Dirección 1',
          city: 'Ciudad 1',
          seller: 'Vendedor 1'
        }
      ];

      render(
        <ClientsModule
          clients={clientsWithLongNames}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('A'.repeat(100))).toBeInTheDocument();
    });

    it('should handle special characters in search', () => {
      const clientsWithSpecialChars: Client[] = [
        {
          id: 'C001',
          name: 'Cliente & Cia.',
          nit: 'NIT-00001',
          address: 'Dirección #1',
          city: 'Ciudad (Principal)',
          seller: 'Vendedor 1'
        }
      ];

      render(
        <ClientsModule
          clients={clientsWithSpecialChars}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const searchInput = screen.getByPlaceholderText(/Buscar por ID/);
      fireEvent.change(searchInput, { target: { value: '&' } });

      expect(screen.getByText('Cliente & Cia.')).toBeInTheDocument();
    });
  });
});
