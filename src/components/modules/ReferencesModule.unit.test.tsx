import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReferencesModule } from './ReferencesModule';
import { Reference } from '../../types';

/**
 * Unit Tests for ReferencesModule
 * Validates: Requirements 4.4, 4.5, 4.6, 4.7, 4.8
 */
describe('ReferencesModule Unit Tests', () => {
  const mockReferences: Reference[] = Array.from({ length: 100 }, (_, i) => ({
    id: `REF${String(i + 1).padStart(4, '0')}`,
    description: `Referencia ${i + 1}`,
    designer: `Diseñador ${i % 5}`,
    price: 10000 + i * 100,
    cloth1: `Tela ${i % 3}`,
    avgCloth1: Math.floor(Math.random() * 100),
    cloth2: `Tela ${(i + 1) % 3}`,
    avgCloth2: Math.floor(Math.random() * 100)
  }));

  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render references module with table', () => {
      render(
        <ReferencesModule
          references={mockReferences}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText(/Referencias \(100 total\)/)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Buscar por código/)).toBeInTheDocument();
    });

    it('should display first page of references (50 per page)', () => {
      render(
        <ReferencesModule
          references={mockReferences}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('Referencia 1')).toBeInTheDocument();
      expect(screen.getByText('Referencia 50')).toBeInTheDocument();
      expect(screen.queryByText('Referencia 51')).not.toBeInTheDocument();
    });

    it('should display table headers', () => {
      render(
        <ReferencesModule
          references={mockReferences}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('Código')).toBeInTheDocument();
      expect(screen.getByText('Descripción')).toBeInTheDocument();
      expect(screen.getByText('Diseñador')).toBeInTheDocument();
      expect(screen.getByText('Precio')).toBeInTheDocument();
      expect(screen.getByText('Tela 1')).toBeInTheDocument();
      expect(screen.getByText('Tela 2')).toBeInTheDocument();
    });

    it('should display pagination controls', () => {
      render(
        <ReferencesModule
          references={mockReferences}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText(/Página 1 de 2/)).toBeInTheDocument();
      expect(screen.getByText('← Anterior')).toBeInTheDocument();
      expect(screen.getByText('Siguiente →')).toBeInTheDocument();
    });

    it('should display price information', () => {
      render(
        <ReferencesModule
          references={mockReferences}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      // Check that prices are displayed (formatted with locale)
      const priceElements = screen.getAllByText(/\$\d+/);
      expect(priceElements.length).toBeGreaterThan(0);
    });
  });

  describe('Pagination', () => {
    it('should navigate to next page', () => {
      render(
        <ReferencesModule
          references={mockReferences}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const nextButton = screen.getByText('Siguiente →');
      fireEvent.click(nextButton);

      expect(screen.getByText(/Página 2 de 2/)).toBeInTheDocument();
      expect(screen.getByText('Referencia 51')).toBeInTheDocument();
      expect(screen.queryByText('Referencia 1')).not.toBeInTheDocument();
    });

    it('should navigate to previous page', () => {
      render(
        <ReferencesModule
          references={mockReferences}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const nextButton = screen.getByText('Siguiente →');
      fireEvent.click(nextButton);

      const prevButton = screen.getByText('← Anterior');
      fireEvent.click(prevButton);

      expect(screen.getByText(/Página 1 de 2/)).toBeInTheDocument();
      expect(screen.getByText('Referencia 1')).toBeInTheDocument();
    });

    it('should change page size', () => {
      render(
        <ReferencesModule
          references={mockReferences}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const select = screen.getByDisplayValue('50') as HTMLSelectElement;
      fireEvent.change(select, { target: { value: '100' } });

      expect(screen.getByText(/Página 1 de 1/)).toBeInTheDocument();
    });

    it('should have correct page size options for references', () => {
      render(
        <ReferencesModule
          references={mockReferences}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const select = screen.getByDisplayValue('50') as HTMLSelectElement;
      const options = Array.from(select.options).map(opt => opt.value);
      
      expect(options).toContain('20');
      expect(options).toContain('30');
      expect(options).toContain('50');
      expect(options).toContain('100');
    });
  });

  describe('Search/Filters', () => {
    it('should filter references by code', () => {
      render(
        <ReferencesModule
          references={mockReferences}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const searchInput = screen.getByPlaceholderText(/Buscar por código/);
      fireEvent.change(searchInput, { target: { value: 'REF0001' } });

      expect(screen.getByText('Referencia 1')).toBeInTheDocument();
      expect(screen.queryByText('Referencia 2')).not.toBeInTheDocument();
    });

    it('should filter references by description', () => {
      render(
        <ReferencesModule
          references={mockReferences}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const searchInput = screen.getByPlaceholderText(/Buscar por código/);
      fireEvent.change(searchInput, { target: { value: 'Referencia 1' } });

      expect(screen.getByText('Referencia 1')).toBeInTheDocument();
    });

    it('should filter references by designer', () => {
      render(
        <ReferencesModule
          references={mockReferences}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const searchInput = screen.getByPlaceholderText(/Buscar por código/);
      fireEvent.change(searchInput, { target: { value: 'Diseñador 0' } });

      // Should find references with designer 0 (indices 0, 5, 10, 15, 20, etc.)
      expect(screen.getByText('Referencia 1')).toBeInTheDocument();
    });

    it('should reset to page 1 when searching', () => {
      render(
        <ReferencesModule
          references={mockReferences}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const nextButton = screen.getByText('Siguiente →');
      fireEvent.click(nextButton);
      expect(screen.getByText(/Página 2 de 2/)).toBeInTheDocument();

      const searchInput = screen.getByPlaceholderText(/Buscar por código/);
      fireEvent.change(searchInput, { target: { value: 'Referencia 1' } });

      expect(screen.getByText(/Página 1 de 1/)).toBeInTheDocument();
    });

    it('should show no results message when search has no matches', () => {
      render(
        <ReferencesModule
          references={mockReferences}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const searchInput = screen.getByPlaceholderText(/Buscar por código/);
      fireEvent.change(searchInput, { target: { value: 'NONEXISTENT' } });

      expect(screen.getByText(/No se encontraron referencias/)).toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('should call onEdit when edit button is clicked', () => {
      render(
        <ReferencesModule
          references={mockReferences}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const editButtons = screen.getAllByText('Editar');
      fireEvent.click(editButtons[0]);

      expect(mockOnEdit).toHaveBeenCalledWith(mockReferences[0]);
    });

    it('should call onDelete when delete button is clicked', () => {
      render(
        <ReferencesModule
          references={mockReferences}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const deleteButtons = screen.getAllByText('Eliminar');
      fireEvent.click(deleteButtons[0]);

      expect(mockOnDelete).toHaveBeenCalledWith(mockReferences[0].id);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty references list', () => {
      render(
        <ReferencesModule
          references={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText(/Referencias \(0 total\)/)).toBeInTheDocument();
      expect(screen.getByText(/No se encontraron referencias/)).toBeInTheDocument();
    });

    it('should handle single reference', () => {
      render(
        <ReferencesModule
          references={[mockReferences[0]]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText(/Página 1 de 1/)).toBeInTheDocument();
      expect(screen.getByText('Referencia 1')).toBeInTheDocument();
    });

    it('should handle loading state', () => {
      render(
        <ReferencesModule
          references={mockReferences}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          isLoading={true}
        />
      );

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should handle references with missing optional fields', () => {
      const referencesWithMissingFields: Reference[] = [
        {
          id: 'REF0001',
          description: 'Referencia Sin Diseñador',
          designer: undefined,
          price: undefined,
          cloth1: undefined,
          avgCloth1: undefined,
          cloth2: undefined,
          avgCloth2: undefined
        }
      ];

      render(
        <ReferencesModule
          references={referencesWithMissingFields}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('Referencia Sin Diseñador')).toBeInTheDocument();
      expect(screen.getAllByText('-').length).toBeGreaterThan(0); // For missing fields
    });

    it('should display cloth information when available', () => {
      const referencesWithCloth: Reference[] = [
        {
          id: 'REF0001',
          description: 'Referencia Con Telas',
          designer: 'Diseñador 1',
          price: 50000,
          cloth1: 'Algodón',
          avgCloth1: 80,
          cloth2: 'Poliéster',
          avgCloth2: 20
        }
      ];

      render(
        <ReferencesModule
          references={referencesWithCloth}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText(/Algodón/)).toBeInTheDocument();
      expect(screen.getByText(/Poliéster/)).toBeInTheDocument();
    });
  });
});
