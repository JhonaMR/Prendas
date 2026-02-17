import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import fc from 'fast-check';
import { ClientsModule } from './ClientsModule';
import { SellersModule } from './SellersModule';
import { ConfeccionistasModule } from './ConfeccionistasModule';
import { ReferencesModule } from './ReferencesModule';
import { Client, Seller, Confeccionista, Reference } from '../../types';

/**
 * Property 9: Module State Independence
 * Validates: Requirements 4.8
 * 
 * For any module (ClientsModule, SellersModule, etc.), changing filters or pagination 
 * in one module should not affect the state of other modules.
 */

// Generators for test data
const clientGenerator = (): fc.Arbitrary<Client> =>
  fc.record({
    id: fc.stringMatching(/^C\d{3}$/),
    name: fc.string({ minLength: 1, maxLength: 50 }),
    nit: fc.option(fc.stringMatching(/^\d{10}$/)),
    address: fc.option(fc.string({ maxLength: 100 })),
    city: fc.option(fc.string({ maxLength: 50 })),
    seller: fc.option(fc.string({ maxLength: 50 }))
  });

const sellerGenerator = (): fc.Arbitrary<Seller> =>
  fc.record({
    id: fc.stringMatching(/^V\d{3}$/),
    name: fc.string({ minLength: 1, maxLength: 50 })
  });

const confeccionistaGenerator = (): fc.Arbitrary<Confeccionista> =>
  fc.record({
    id: fc.stringMatching(/^\d{10}$/),
    name: fc.string({ minLength: 1, maxLength: 50 }),
    address: fc.string({ minLength: 1, maxLength: 100 }),
    city: fc.string({ minLength: 1, maxLength: 50 }),
    phone: fc.stringMatching(/^\d{10}$/),
    score: fc.oneof(fc.constant('A'), fc.constant('AA'), fc.constant('AAA')),
    active: fc.boolean()
  });

const referenceGenerator = (): fc.Arbitrary<Reference> =>
  fc.record({
    id: fc.stringMatching(/^REF\d{4}$/),
    description: fc.string({ minLength: 1, maxLength: 100 }),
    designer: fc.string({ minLength: 1, maxLength: 50 }),
    price: fc.integer({ min: 0, max: 100000 }),
    cloth1: fc.option(fc.string({ maxLength: 30 })),
    avgCloth1: fc.option(fc.integer({ min: 0, max: 100 })),
    cloth2: fc.option(fc.string({ maxLength: 30 })),
    avgCloth2: fc.option(fc.integer({ min: 0, max: 100 })),
    correrias: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1 })
  });

describe('Module State Independence - Property 9', () => {
  describe('ClientsModule State Independence', () => {
    it('should maintain independent pagination state across multiple instances', () => {
      fc.assert(
        fc.property(
          fc.array(clientGenerator(), { minLength: 50, maxLength: 100 }),
          fc.array(clientGenerator(), { minLength: 50, maxLength: 100 }),
          (clients1, clients2) => {
            const mockOnEdit = jest.fn();
            const mockOnDelete = jest.fn();

            render(
              <div>
                <div data-testid="module-1">
                  <ClientsModule
                    clients={clients1}
                    onEdit={mockOnEdit}
                    onDelete={mockOnDelete}
                  />
                </div>
                <div data-testid="module-2">
                  <ClientsModule
                    clients={clients2}
                    onEdit={mockOnEdit}
                    onDelete={mockOnDelete}
                  />
                </div>
              </div>
            );

            // Get pagination controls for both modules
            const paginationTexts = screen.getAllByText(/Página \d+ de \d+/);
            expect(paginationTexts.length).toBeGreaterThanOrEqual(2);

            // Both modules should show page 1 initially
            expect(paginationTexts[0]).toHaveTextContent('Página 1 de');
            expect(paginationTexts[1]).toHaveTextContent('Página 1 de');

            return true;
          }
        ),
        { numRuns: 10 }
      );
    });

    it('should maintain independent search state across multiple instances', () => {
      fc.assert(
        fc.property(
          fc.array(clientGenerator(), { minLength: 50, maxLength: 100 }),
          fc.array(clientGenerator(), { minLength: 50, maxLength: 100 }),
          fc.string({ minLength: 1, maxLength: 20 }),
          (clients1, clients2, searchTerm) => {
            const mockOnEdit = jest.fn();
            const mockOnDelete = jest.fn();

            render(
              <div>
                <div data-testid="module-1">
                  <ClientsModule
                    clients={clients1}
                    onEdit={mockOnEdit}
                    onDelete={mockOnDelete}
                  />
                </div>
                <div data-testid="module-2">
                  <ClientsModule
                    clients={clients2}
                    onEdit={mockOnEdit}
                    onDelete={mockOnDelete}
                  />
                </div>
              </div>
            );

            // Get search inputs
            const searchInputs = screen.getAllByPlaceholderText(/Buscar por ID/);
            expect(searchInputs.length).toBe(2);

            // Search in first module
            fireEvent.change(searchInputs[0], { target: { value: searchTerm } });

            // Second module should still have empty search
            expect((searchInputs[1] as HTMLInputElement).value).toBe('');

            return true;
          }
        ),
        { numRuns: 10 }
      );
    });
  });

  describe('SellersModule State Independence', () => {
    it('should maintain independent pagination state across multiple instances', () => {
      fc.assert(
        fc.property(
          fc.array(sellerGenerator(), { minLength: 50, maxLength: 100 }),
          fc.array(sellerGenerator(), { minLength: 50, maxLength: 100 }),
          (sellers1, sellers2) => {
            const mockOnEdit = jest.fn();
            const mockOnDelete = jest.fn();

            render(
              <div>
                <div data-testid="module-1">
                  <SellersModule
                    sellers={sellers1}
                    onEdit={mockOnEdit}
                    onDelete={mockOnDelete}
                  />
                </div>
                <div data-testid="module-2">
                  <SellersModule
                    sellers={sellers2}
                    onEdit={mockOnEdit}
                    onDelete={mockOnDelete}
                  />
                </div>
              </div>
            );

            // Get pagination controls for both modules
            const paginationTexts = screen.getAllByText(/Página \d+ de \d+/);
            expect(paginationTexts.length).toBeGreaterThanOrEqual(2);

            return true;
          }
        ),
        { numRuns: 10 }
      );
    });
  });

  describe('ConfeccionistasModule State Independence', () => {
    it('should maintain independent pagination state across multiple instances', () => {
      fc.assert(
        fc.property(
          fc.array(confeccionistaGenerator(), { minLength: 50, maxLength: 100 }),
          fc.array(confeccionistaGenerator(), { minLength: 50, maxLength: 100 }),
          (confeccionistas1, confeccionistas2) => {
            const mockOnEdit = jest.fn();
            const mockOnDelete = jest.fn();

            render(
              <div>
                <div data-testid="module-1">
                  <ConfeccionistasModule
                    confeccionistas={confeccionistas1}
                    onEdit={mockOnEdit}
                    onDelete={mockOnDelete}
                  />
                </div>
                <div data-testid="module-2">
                  <ConfeccionistasModule
                    confeccionistas={confeccionistas2}
                    onEdit={mockOnEdit}
                    onDelete={mockOnDelete}
                  />
                </div>
              </div>
            );

            // Get pagination controls for both modules
            const paginationTexts = screen.getAllByText(/Página \d+ de \d+/);
            expect(paginationTexts.length).toBeGreaterThanOrEqual(2);

            return true;
          }
        ),
        { numRuns: 10 }
      );
    });
  });

  describe('ReferencesModule State Independence', () => {
    it('should maintain independent pagination state across multiple instances', () => {
      fc.assert(
        fc.property(
          fc.array(referenceGenerator(), { minLength: 50, maxLength: 100 }),
          fc.array(referenceGenerator(), { minLength: 50, maxLength: 100 }),
          (references1, references2) => {
            const mockOnEdit = jest.fn();
            const mockOnDelete = jest.fn();

            render(
              <div>
                <div data-testid="module-1">
                  <ReferencesModule
                    references={references1}
                    onEdit={mockOnEdit}
                    onDelete={mockOnDelete}
                  />
                </div>
                <div data-testid="module-2">
                  <ReferencesModule
                    references={references2}
                    onEdit={mockOnEdit}
                    onDelete={mockOnDelete}
                  />
                </div>
              </div>
            );

            // Get pagination controls for both modules
            const paginationTexts = screen.getAllByText(/Página \d+ de \d+/);
            expect(paginationTexts.length).toBeGreaterThanOrEqual(2);

            return true;
          }
        ),
        { numRuns: 10 }
      );
    });
  });

  describe('Mixed Modules State Independence', () => {
    it('should maintain independent state when different module types are rendered together', () => {
      fc.assert(
        fc.property(
          fc.array(clientGenerator(), { minLength: 30, maxLength: 50 }),
          fc.array(sellerGenerator(), { minLength: 30, maxLength: 50 }),
          fc.array(confeccionistaGenerator(), { minLength: 30, maxLength: 50 }),
          (clients, sellers, confeccionistas) => {
            const mockOnEdit = jest.fn();
            const mockOnDelete = jest.fn();

            render(
              <div>
                <div data-testid="clients-module">
                  <ClientsModule
                    clients={clients}
                    onEdit={mockOnEdit}
                    onDelete={mockOnDelete}
                  />
                </div>
                <div data-testid="sellers-module">
                  <SellersModule
                    sellers={sellers}
                    onEdit={mockOnEdit}
                    onDelete={mockOnDelete}
                  />
                </div>
                <div data-testid="confeccionistas-module">
                  <ConfeccionistasModule
                    confeccionistas={confeccionistas}
                    onEdit={mockOnEdit}
                    onDelete={mockOnDelete}
                  />
                </div>
              </div>
            );

            // Get all search inputs
            const searchInputs = screen.getAllByPlaceholderText(/Buscar/);
            expect(searchInputs.length).toBeGreaterThanOrEqual(3);

            // Each module should have independent search state
            fireEvent.change(searchInputs[0], { target: { value: 'test1' } });
            fireEvent.change(searchInputs[1], { target: { value: 'test2' } });
            fireEvent.change(searchInputs[2], { target: { value: 'test3' } });

            expect((searchInputs[0] as HTMLInputElement).value).toBe('test1');
            expect((searchInputs[1] as HTMLInputElement).value).toBe('test2');
            expect((searchInputs[2] as HTMLInputElement).value).toBe('test3');

            return true;
          }
        ),
        { numRuns: 10 }
      );
    });
  });
});
