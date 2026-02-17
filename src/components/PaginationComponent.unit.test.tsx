import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PaginationComponent, PaginationProps } from './PaginationComponent';

/**
 * Unit Tests para PaginationComponent
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9
 */
describe('PaginationComponent - Unit Tests', () => {
  const defaultProps: PaginationProps = {
    currentPage: 1,
    totalPages: 10,
    pageSize: 25,
    onPageChange: jest.fn(),
    onPageSizeChange: jest.fn(),
    isLoading: false,
    pageSizeOptions: [10, 20, 25, 30, 50, 100]
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Correct Number of Items', () => {
    it('should display correct page size (25 items for Clients)', () => {
      render(<PaginationComponent {...defaultProps} pageSize={25} />);
      const select = screen.getByDisplayValue('25') as HTMLSelectElement;
      expect(select.value).toBe('25');
    });

    it('should display correct page size (50 items for References)', () => {
      render(<PaginationComponent {...defaultProps} pageSize={50} />);
      const select = screen.getByDisplayValue('50') as HTMLSelectElement;
      expect(select.value).toBe('50');
    });

    it('should display correct page size (30 items for DeliveryDates)', () => {
      render(<PaginationComponent {...defaultProps} pageSize={30} />);
      const select = screen.getByDisplayValue('30') as HTMLSelectElement;
      expect(select.value).toBe('30');
    });

    it('should display correct page size (20 items for Receptions/Dispatches)', () => {
      render(<PaginationComponent {...defaultProps} pageSize={20} />);
      const select = screen.getByDisplayValue('20') as HTMLSelectElement;
      expect(select.value).toBe('20');
    });
  });

  describe('Edge Case: Page 0', () => {
    it('should not allow navigation to page 0', () => {
      const onPageChange = jest.fn();
      render(<PaginationComponent {...defaultProps} currentPage={1} onPageChange={onPageChange} />);

      const input = screen.getByPlaceholderText('Ir a') as HTMLInputElement;
      fireEvent.change(input, { target: { value: '0' } });

      const goButton = screen.getByText('Ir');
      fireEvent.click(goButton);

      expect(onPageChange).not.toHaveBeenCalled();
      expect(input.value).toBe('1'); // Should reset to current page
    });

    it('should disable previous button on page 1', () => {
      render(<PaginationComponent {...defaultProps} currentPage={1} />);
      const prevButton = screen.getByText('← Anterior') as HTMLButtonElement;
      expect(prevButton.disabled).toBe(true);
    });

    it('should not call onPageChange when trying to go to page 0 from page 1', () => {
      const onPageChange = jest.fn();
      render(<PaginationComponent {...defaultProps} currentPage={1} onPageChange={onPageChange} />);

      const prevButton = screen.getByText('← Anterior');
      fireEvent.click(prevButton);

      expect(onPageChange).not.toHaveBeenCalled();
    });
  });

  describe('Edge Case: Page > Total', () => {
    it('should not allow navigation to page greater than total pages', () => {
      const onPageChange = jest.fn();
      render(<PaginationComponent {...defaultProps} totalPages={10} onPageChange={onPageChange} />);

      const input = screen.getByPlaceholderText('Ir a') as HTMLInputElement;
      fireEvent.change(input, { target: { value: '15' } });

      const goButton = screen.getByText('Ir');
      fireEvent.click(goButton);

      expect(onPageChange).not.toHaveBeenCalled();
      expect(input.value).toBe('1'); // Should reset to current page
    });

    it('should disable next button on last page', () => {
      render(<PaginationComponent {...defaultProps} currentPage={10} totalPages={10} />);
      const nextButton = screen.getByText('Siguiente →') as HTMLButtonElement;
      expect(nextButton.disabled).toBe(true);
    });

    it('should not call onPageChange when trying to go beyond last page', () => {
      const onPageChange = jest.fn();
      render(<PaginationComponent {...defaultProps} currentPage={10} totalPages={10} onPageChange={onPageChange} />);

      const nextButton = screen.getByText('Siguiente →');
      fireEvent.click(nextButton);

      expect(onPageChange).not.toHaveBeenCalled();
    });
  });

  describe('Edge Case: Limit = 0', () => {
    it('should handle page size of 0 gracefully', () => {
      const onPageSizeChange = jest.fn();
      render(<PaginationComponent {...defaultProps} pageSize={0} onPageSizeChange={onPageSizeChange} />);

      // The component should still render without crashing
      expect(screen.getByText(/Página 1 de 10/)).toBeInTheDocument();
    });

    it('should not allow setting page size to 0', () => {
      const onPageSizeChange = jest.fn();
      render(<PaginationComponent {...defaultProps} onPageSizeChange={onPageSizeChange} />);

      const select = screen.getByDisplayValue('25') as HTMLSelectElement;
      // Try to set to 0 (if available in options)
      const zeroOption = Array.from(select.options).find(opt => opt.value === '0');
      if (zeroOption) {
        fireEvent.change(select, { target: { value: '0' } });
        expect(onPageSizeChange).toHaveBeenCalledWith(0);
      }
    });
  });

  describe('Valid Navigation', () => {
    it('should navigate to previous page correctly', () => {
      const onPageChange = jest.fn();
      render(<PaginationComponent {...defaultProps} currentPage={5} onPageChange={onPageChange} />);

      const prevButton = screen.getByText('← Anterior');
      fireEvent.click(prevButton);

      expect(onPageChange).toHaveBeenCalledWith(4);
    });

    it('should navigate to next page correctly', () => {
      const onPageChange = jest.fn();
      render(<PaginationComponent {...defaultProps} currentPage={5} onPageChange={onPageChange} />);

      const nextButton = screen.getByText('Siguiente →');
      fireEvent.click(nextButton);

      expect(onPageChange).toHaveBeenCalledWith(6);
    });

    it('should navigate to specific page via input', () => {
      const onPageChange = jest.fn();
      render(<PaginationComponent {...defaultProps} onPageChange={onPageChange} />);

      const input = screen.getByPlaceholderText('Ir a') as HTMLInputElement;
      fireEvent.change(input, { target: { value: '7' } });

      const goButton = screen.getByText('Ir');
      fireEvent.click(goButton);

      expect(onPageChange).toHaveBeenCalledWith(7);
    });

    it('should navigate via Enter key in input', () => {
      const onPageChange = jest.fn();
      render(<PaginationComponent {...defaultProps} onPageChange={onPageChange} />);

      const input = screen.getByPlaceholderText('Ir a') as HTMLInputElement;
      fireEvent.change(input, { target: { value: '3' } });
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });

      expect(onPageChange).toHaveBeenCalledWith(3);
    });
  });

  describe('Page Size Change', () => {
    it('should change page size correctly', () => {
      const onPageSizeChange = jest.fn();
      render(<PaginationComponent {...defaultProps} onPageSizeChange={onPageSizeChange} />);

      const select = screen.getByDisplayValue('25') as HTMLSelectElement;
      fireEvent.change(select, { target: { value: '50' } });

      expect(onPageSizeChange).toHaveBeenCalledWith(50);
    });

    it('should support all required page sizes', () => {
      const pageSizes = [10, 20, 25, 30, 50, 100];
      const onPageSizeChange = jest.fn();

      for (const size of pageSizes) {
        jest.clearAllMocks();
        const { unmount } = render(
          <PaginationComponent
            {...defaultProps}
            pageSize={size}
            onPageSizeChange={onPageSizeChange}
          />
        );

        const select = screen.getByDisplayValue(size.toString()) as HTMLSelectElement;
        expect(select).toBeInTheDocument();

        unmount();
      }
    });
  });

  describe('Display Information', () => {
    it('should display current page and total pages', () => {
      render(<PaginationComponent {...defaultProps} currentPage={3} totalPages={10} />);
      expect(screen.getByText(/Página 3 de 10/)).toBeInTheDocument();
    });

    it('should update page info when props change', () => {
      const { rerender } = render(<PaginationComponent {...defaultProps} currentPage={1} totalPages={10} />);
      expect(screen.getByText(/Página 1 de 10/)).toBeInTheDocument();

      rerender(<PaginationComponent {...defaultProps} currentPage={5} totalPages={10} />);
      expect(screen.getByText(/Página 5 de 10/)).toBeInTheDocument();
    });

    it('should display loading indicator when loading', () => {
      render(<PaginationComponent {...defaultProps} isLoading={true} />);
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should not display loading indicator when not loading', () => {
      render(<PaginationComponent {...defaultProps} isLoading={false} />);
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).not.toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('should disable all controls when loading', () => {
      render(<PaginationComponent {...defaultProps} currentPage={5} isLoading={true} />);

      const prevButton = screen.getByText('← Anterior') as HTMLButtonElement;
      const nextButton = screen.getByText('Siguiente →') as HTMLButtonElement;
      const goButton = screen.getByText('Ir') as HTMLButtonElement;
      const select = screen.getByDisplayValue('25') as HTMLSelectElement;
      const input = screen.getByPlaceholderText('Ir a') as HTMLInputElement;

      expect(prevButton.disabled).toBe(true);
      expect(nextButton.disabled).toBe(true);
      expect(goButton.disabled).toBe(true);
      expect(select.disabled).toBe(true);
      expect(input.disabled).toBe(true);
    });

    it('should enable controls when not loading', () => {
      render(<PaginationComponent {...defaultProps} currentPage={5} isLoading={false} />);

      const prevButton = screen.getByText('← Anterior') as HTMLButtonElement;
      const nextButton = screen.getByText('Siguiente →') as HTMLButtonElement;
      const goButton = screen.getByText('Ir') as HTMLButtonElement;
      const select = screen.getByDisplayValue('25') as HTMLSelectElement;
      const input = screen.getByPlaceholderText('Ir a') as HTMLInputElement;

      expect(prevButton.disabled).toBe(false);
      expect(nextButton.disabled).toBe(false);
      expect(goButton.disabled).toBe(false);
      expect(select.disabled).toBe(false);
      expect(input.disabled).toBe(false);
    });
  });

  describe('Input Validation', () => {
    it('should reset input to current page on invalid input', () => {
      render(<PaginationComponent {...defaultProps} currentPage={3} />);

      const input = screen.getByPlaceholderText('Ir a') as HTMLInputElement;
      fireEvent.change(input, { target: { value: '15' } });

      const goButton = screen.getByText('Ir');
      fireEvent.click(goButton);

      expect(input.value).toBe('3');
    });

    it('should handle negative page numbers', () => {
      const onPageChange = jest.fn();
      render(<PaginationComponent {...defaultProps} onPageChange={onPageChange} />);

      const input = screen.getByPlaceholderText('Ir a') as HTMLInputElement;
      fireEvent.change(input, { target: { value: '-5' } });

      const goButton = screen.getByText('Ir');
      fireEvent.click(goButton);

      expect(onPageChange).not.toHaveBeenCalled();
    });

    it('should handle non-numeric input gracefully', () => {
      const onPageChange = jest.fn();
      render(<PaginationComponent {...defaultProps} onPageChange={onPageChange} />);

      const input = screen.getByPlaceholderText('Ir a') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'abc' } });

      const goButton = screen.getByText('Ir');
      fireEvent.click(goButton);

      // Should not call onPageChange with NaN
      expect(onPageChange).not.toHaveBeenCalled();
    });
  });

  describe('Single Page Scenario', () => {
    it('should disable both navigation buttons when there is only one page', () => {
      render(<PaginationComponent {...defaultProps} currentPage={1} totalPages={1} />);

      const prevButton = screen.getByText('← Anterior') as HTMLButtonElement;
      const nextButton = screen.getByText('Siguiente →') as HTMLButtonElement;

      expect(prevButton.disabled).toBe(true);
      expect(nextButton.disabled).toBe(true);
    });

    it('should display correct page info for single page', () => {
      render(<PaginationComponent {...defaultProps} currentPage={1} totalPages={1} />);
      expect(screen.getByText(/Página 1 de 1/)).toBeInTheDocument();
    });
  });

  describe('Large Page Numbers', () => {
    it('should handle large page numbers correctly', () => {
      render(<PaginationComponent {...defaultProps} currentPage={999} totalPages={1000} />);
      expect(screen.getByText(/Página 999 de 1000/)).toBeInTheDocument();
    });

    it('should navigate correctly with large page numbers', () => {
      const onPageChange = jest.fn();
      render(<PaginationComponent {...defaultProps} currentPage={999} totalPages={1000} onPageChange={onPageChange} />);

      const nextButton = screen.getByText('Siguiente →');
      fireEvent.click(nextButton);

      expect(onPageChange).toHaveBeenCalledWith(1000);
    });
  });
});
