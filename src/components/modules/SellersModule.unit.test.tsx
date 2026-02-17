import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SellersModule } from './SellersModule';
import { Seller } from '../../types';

/**
 * Unit Tests for SellersModule
 * Validates: Requirements 4.2, 4.5, 4.6, 4.7, 4.8
 */
describe('SellersModule Unit Tests', () => {
  const mockSellers: Seller[] = Array.from({ length: 100 }, (_, i) => ({
    id: `V${String(i + 1).padStart(3, '0')}`,
    name: `Vendedor ${i + 1}`
  }));

  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render sellers module with table', () => {
      render(
        <SellersModule
          sellers={mockSellers}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText(/Vendedores \(100 total\)/)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Buscar por ID/)).toBeInTheDocument();
    });

    it('should display first page of sellers (25 per page)', () => {
      render(
        <SellersModule
          sellers={mockSellers}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('Vendedor 1')).toBeInTheDocument();
      expect(screen.getByText('Vendedor 25')).toBeInTheDocument();
      expect(screen.queryByText('Vendedor 26')).not.toBeInTheDocument();
    });

    it('should display table headers', () => {
      render(
        <SellersModule
          sellers={mockSellers}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('ID')).toBeInTheDocument();
      expect(screen.getByText('Nombre')).toBeInTheDocument();
      expect(screen.getByText('Acciones')).toBeInTheDocument();
    });

    it('should display pagination controls', () => {
      render(
        <SellersModule
          sellers={mockSellers}
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
        <SellersModule
          sellers={mockSellers}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const nextButton = screen.getByText('Siguiente →');
      fireEvent.click(nextButton);

      expect(screen.getByText(/Página 2 de 4/)).toBeInTheDocument();
      expect(screen.getByText('Vendedor 26')).toBeInTheDocument();
      expect(screen.queryByText('Vendedor 1')).not.toBeInTheDocument();
    });

    it('should navigate to previous page', () => {
      render(
        <SellersModule
          sellers={mockSellers}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const nextButton = screen.getByText('Siguiente →');
      fireEvent.click(nextButton);

      const prevButton = screen.getByText('← Anterior');
      fireEvent.click(prevButton);

      expect(screen.getByText(/Página 1 de 4/)).toBeInTheDocument();
      expect(screen.getByText('Vendedor 1')).toBeInTheDocument();
    });

    it('should change page size', () => {
      render(
        <SellersModule
          sellers={mockSellers}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const select = screen.getByDisplayValue('25') as HTMLSelectElement;
      fireEvent.change(select, { target: { value: '50' } });

      expect(screen.getByText(/Página 1 de 2/)).toBeInTheDocument();
    });
  });

  describe('Search/Filters', () => {
    it('should filter sellers by name', () => {
      render(
        <SellersModule
          sellers={mockSellers}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const searchInput = screen.getByPlaceholderText(/Buscar por ID/);
      fireEvent.change(searchInput, { target: { value: 'Vendedor 1' } });

      expect(screen.getByText('Vendedor 1')).toBeInTheDocument();
      expect(screen.queryByText('Vendedor 2')).not.toBeInTheDocument();
    });

    it('should filter sellers by ID', () => {
      render(
        <SellersModule
          sellers={mockSellers}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const searchInput = screen.getByPlaceholderText(/Buscar por ID/);
      fireEvent.change(searchInput, { target: { value: 'V001' } });

      expect(screen.getByText('Vendedor 1')).toBeInTheDocument();
    });

    it('should reset to page 1 when searching', () => {
      render(
        <SellersModule
          sellers={mockSellers}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const nextButton = screen.getByText('Siguiente →');
      fireEvent.click(nextButton);
      expect(screen.getByText(/Página 2 de 4/)).toBeInTheDocument();

      const searchInput = screen.getByPlaceholderText(/Buscar por ID/);
      fireEvent.change(searchInput, { target: { value: 'Vendedor 1' } });

      expect(screen.getByText(/Página 1 de 1/)).toBeInTheDocument();
    });

    it('should show no results message when search has no matches', () => {
      render(
        <SellersModule
          sellers={mockSellers}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const searchInput = screen.getByPlaceholderText(/Buscar por ID/);
      fireEvent.change(searchInput, { target: { value: 'NONEXISTENT' } });

      expect(screen.getByText(/No se encontraron vendedores/)).toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('should call onEdit when edit button is clicked', () => {
      render(
        <SellersModule
          sellers={mockSellers}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const editButtons = screen.getAllByText('Editar');
      fireEvent.click(editButtons[0]);

      expect(mockOnEdit).toHaveBeenCalledWith(mockSellers[0]);
    });

    it('should call onDelete when delete button is clicked', () => {
      render(
        <SellersModule
          sellers={mockSellers}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const deleteButtons = screen.getAllByText('Eliminar');
      fireEvent.click(deleteButtons[0]);

      expect(mockOnDelete).toHaveBeenCalledWith(mockSellers[0].id);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty sellers list', () => {
      render(
        <SellersModule
          sellers={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText(/Vendedores \(0 total\)/)).toBeInTheDocument();
      expect(screen.getByText(/No se encontraron vendedores/)).toBeInTheDocument();
    });

    it('should handle single seller', () => {
      render(
        <SellersModule
          sellers={[mockSellers[0]]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText(/Página 1 de 1/)).toBeInTheDocument();
      expect(screen.getByText('Vendedor 1')).toBeInTheDocument();
    });

    it('should handle loading state', () => {
      render(
        <SellersModule
          sellers={mockSellers}
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
