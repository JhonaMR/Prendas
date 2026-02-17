import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfeccionistasModule } from './ConfeccionistasModule';
import { Confeccionista } from '../../types';

/**
 * Unit Tests for ConfeccionistasModule
 * Validates: Requirements 4.3, 4.5, 4.6, 4.7, 4.8
 */
describe('ConfeccionistasModule Unit Tests', () => {
  const mockConfeccionistas: Confeccionista[] = Array.from({ length: 100 }, (_, i) => ({
    id: `${String(i + 1).padStart(10, '0')}`,
    name: `Confeccionista ${i + 1}`,
    phone: `${String(i + 1).padStart(10, '0')}`,
    score: Math.floor(Math.random() * 100),
    active: i % 2 === 0
  }));

  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render confeccionistas module with table', () => {
      render(
        <ConfeccionistasModule
          confeccionistas={mockConfeccionistas}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText(/Confeccionistas \(100 total\)/)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Buscar por cédula/)).toBeInTheDocument();
    });

    it('should display first page of confeccionistas (25 per page)', () => {
      render(
        <ConfeccionistasModule
          confeccionistas={mockConfeccionistas}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('Confeccionista 1')).toBeInTheDocument();
      expect(screen.getByText('Confeccionista 25')).toBeInTheDocument();
      expect(screen.queryByText('Confeccionista 26')).not.toBeInTheDocument();
    });

    it('should display table headers', () => {
      render(
        <ConfeccionistasModule
          confeccionistas={mockConfeccionistas}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('Cédula')).toBeInTheDocument();
      expect(screen.getByText('Nombre')).toBeInTheDocument();
      expect(screen.getByText('Teléfono')).toBeInTheDocument();
      expect(screen.getByText('Puntaje')).toBeInTheDocument();
      expect(screen.getByText('Estado')).toBeInTheDocument();
    });

    it('should display pagination controls', () => {
      render(
        <ConfeccionistasModule
          confeccionistas={mockConfeccionistas}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText(/Página 1 de 4/)).toBeInTheDocument();
      expect(screen.getByText('← Anterior')).toBeInTheDocument();
      expect(screen.getByText('Siguiente →')).toBeInTheDocument();
    });

    it('should display active/inactive status badges', () => {
      render(
        <ConfeccionistasModule
          confeccionistas={mockConfeccionistas}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const activeStatuses = screen.getAllByText(/Activo|Inactivo/);
      expect(activeStatuses.length).toBeGreaterThan(0);
    });
  });

  describe('Pagination', () => {
    it('should navigate to next page', () => {
      render(
        <ConfeccionistasModule
          confeccionistas={mockConfeccionistas}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const nextButton = screen.getByText('Siguiente →');
      fireEvent.click(nextButton);

      expect(screen.getByText(/Página 2 de 4/)).toBeInTheDocument();
      expect(screen.getByText('Confeccionista 26')).toBeInTheDocument();
      expect(screen.queryByText('Confeccionista 1')).not.toBeInTheDocument();
    });

    it('should navigate to previous page', () => {
      render(
        <ConfeccionistasModule
          confeccionistas={mockConfeccionistas}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const nextButton = screen.getByText('Siguiente →');
      fireEvent.click(nextButton);

      const prevButton = screen.getByText('← Anterior');
      fireEvent.click(prevButton);

      expect(screen.getByText(/Página 1 de 4/)).toBeInTheDocument();
      expect(screen.getByText('Confeccionista 1')).toBeInTheDocument();
    });

    it('should change page size', () => {
      render(
        <ConfeccionistasModule
          confeccionistas={mockConfeccionistas}
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
    it('should filter confeccionistas by name', () => {
      render(
        <ConfeccionistasModule
          confeccionistas={mockConfeccionistas}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const searchInput = screen.getByPlaceholderText(/Buscar por cédula/);
      fireEvent.change(searchInput, { target: { value: 'Confeccionista 1' } });

      expect(screen.getByText('Confeccionista 1')).toBeInTheDocument();
      expect(screen.queryByText('Confeccionista 2')).not.toBeInTheDocument();
    });

    it('should filter confeccionistas by ID (cédula)', () => {
      render(
        <ConfeccionistasModule
          confeccionistas={mockConfeccionistas}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const searchInput = screen.getByPlaceholderText(/Buscar por cédula/);
      fireEvent.change(searchInput, { target: { value: '0000000001' } });

      expect(screen.getByText('Confeccionista 1')).toBeInTheDocument();
    });

    it('should filter confeccionistas by phone', () => {
      render(
        <ConfeccionistasModule
          confeccionistas={mockConfeccionistas}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const searchInput = screen.getByPlaceholderText(/Buscar por cédula/);
      fireEvent.change(searchInput, { target: { value: '0000000001' } });

      expect(screen.getByText('Confeccionista 1')).toBeInTheDocument();
    });

    it('should reset to page 1 when searching', () => {
      render(
        <ConfeccionistasModule
          confeccionistas={mockConfeccionistas}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const nextButton = screen.getByText('Siguiente →');
      fireEvent.click(nextButton);
      expect(screen.getByText(/Página 2 de 4/)).toBeInTheDocument();

      const searchInput = screen.getByPlaceholderText(/Buscar por cédula/);
      fireEvent.change(searchInput, { target: { value: 'Confeccionista 1' } });

      expect(screen.getByText(/Página 1 de 1/)).toBeInTheDocument();
    });

    it('should show no results message when search has no matches', () => {
      render(
        <ConfeccionistasModule
          confeccionistas={mockConfeccionistas}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const searchInput = screen.getByPlaceholderText(/Buscar por cédula/);
      fireEvent.change(searchInput, { target: { value: 'NONEXISTENT' } });

      expect(screen.getByText(/No se encontraron confeccionistas/)).toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('should call onEdit when edit button is clicked', () => {
      render(
        <ConfeccionistasModule
          confeccionistas={mockConfeccionistas}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const editButtons = screen.getAllByText('Editar');
      fireEvent.click(editButtons[0]);

      expect(mockOnEdit).toHaveBeenCalledWith(mockConfeccionistas[0]);
    });

    it('should call onDelete when delete button is clicked', () => {
      render(
        <ConfeccionistasModule
          confeccionistas={mockConfeccionistas}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const deleteButtons = screen.getAllByText('Eliminar');
      fireEvent.click(deleteButtons[0]);

      expect(mockOnDelete).toHaveBeenCalledWith(mockConfeccionistas[0].id);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty confeccionistas list', () => {
      render(
        <ConfeccionistasModule
          confeccionistas={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText(/Confeccionistas \(0 total\)/)).toBeInTheDocument();
      expect(screen.getByText(/No se encontraron confeccionistas/)).toBeInTheDocument();
    });

    it('should handle single confeccionista', () => {
      render(
        <ConfeccionistasModule
          confeccionistas={[mockConfeccionistas[0]]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText(/Página 1 de 1/)).toBeInTheDocument();
      expect(screen.getByText('Confeccionista 1')).toBeInTheDocument();
    });

    it('should handle loading state', () => {
      render(
        <ConfeccionistasModule
          confeccionistas={mockConfeccionistas}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          isLoading={true}
        />
      );

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should handle confeccionistas with missing optional fields', () => {
      const confeccionistasWithMissingFields: Confeccionista[] = [
        {
          id: '0000000001',
          name: 'Confeccionista Sin Teléfono',
          phone: undefined,
          score: undefined,
          active: true
        }
      ];

      render(
        <ConfeccionistasModule
          confeccionistas={confeccionistasWithMissingFields}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('Confeccionista Sin Teléfono')).toBeInTheDocument();
      expect(screen.getByText('-')).toBeInTheDocument(); // For missing phone
    });
  });
});
