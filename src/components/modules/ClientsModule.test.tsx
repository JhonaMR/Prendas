import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ClientsModule } from './ClientsModule';
import { Client } from '../../types';

describe('ClientsModule', () => {
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
  });

  describe('Search', () => {
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
  });
});
