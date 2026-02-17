import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PaginationComponent, PaginationProps } from './PaginationComponent';

describe('PaginationComponent', () => {
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

  describe('Rendering', () => {
    it('should render pagination component with all elements', () => {
      render(<PaginationComponent {...defaultProps} />);
      
      expect(screen.getByText(/Página 1 de 10/)).toBeInTheDocument();
      expect(screen.getByText('← Anterior')).toBeInTheDocument();
      expect(screen.getByText('Siguiente →')).toBeInTheDocument();
      expect(screen.getByText('Ir')).toBeInTheDocument();
      expect(screen.getByDisplayValue('25')).toBeInTheDocument();
    });

    it('should display correct page info', () => {
      render(<PaginationComponent {...defaultProps} currentPage={5} totalPages={20} />);
      expect(screen.getByText(/Página 5 de 20/)).toBeInTheDocument();
    });

    it('should render page size selector with options', () => {
      render(<PaginationComponent {...defaultProps} />);
      const select = screen.getByDisplayValue('25') as HTMLSelectElement;
      expect(select).toBeInTheDocument();
      expect(select.options.length).toBe(6);
    });
  });

  describe('Navigation', () => {
    it('should disable previous button on first page', () => {
      render(<PaginationComponent {...defaultProps} currentPage={1} />);
      const prevButton = screen.getByText('← Anterior') as HTMLButtonElement;
      expect(prevButton.disabled).toBe(true);
    });

    it('should disable next button on last page', () => {
      render(<PaginationComponent {...defaultProps} currentPage={10} totalPages={10} />);
      const nextButton = screen.getByText('Siguiente →') as HTMLButtonElement;
      expect(nextButton.disabled).toBe(true);
    });

    it('should call onPageChange when previous button is clicked', () => {
      const onPageChange = jest.fn();
      render(<PaginationComponent {...defaultProps} currentPage={5} onPageChange={onPageChange} />);
      
      const prevButton = screen.getByText('← Anterior');
      fireEvent.click(prevButton);
      
      expect(onPageChange).toHaveBeenCalledWith(4);
    });

    it('should call onPageChange when next button is clicked', () => {
      const onPageChange = jest.fn();
      render(<PaginationComponent {...defaultProps} currentPage={5} onPageChange={onPageChange} />);
      
      const nextButton = screen.getByText('Siguiente →');
      fireEvent.click(nextButton);
      
      expect(onPageChange).toHaveBeenCalledWith(6);
    });

    it('should not call onPageChange when previous button is disabled', () => {
      const onPageChange = jest.fn();
      render(<PaginationComponent {...defaultProps} currentPage={1} onPageChange={onPageChange} />);
      
      const prevButton = screen.getByText('← Anterior');
      fireEvent.click(prevButton);
      
      expect(onPageChange).not.toHaveBeenCalled();
    });

    it('should not call onPageChange when next button is disabled', () => {
      const onPageChange = jest.fn();
      render(<PaginationComponent {...defaultProps} currentPage={10} totalPages={10} onPageChange={onPageChange} />);
      
      const nextButton = screen.getByText('Siguiente →');
      fireEvent.click(nextButton);
      
      expect(onPageChange).not.toHaveBeenCalled();
    });
  });

  describe('Go to Page', () => {
    it('should call onPageChange with valid page number', () => {
      const onPageChange = jest.fn();
      render(<PaginationComponent {...defaultProps} onPageChange={onPageChange} />);
      
      const input = screen.getByPlaceholderText('Ir a') as HTMLInputElement;
      fireEvent.change(input, { target: { value: '5' } });
      
      const goButton = screen.getByText('Ir');
      fireEvent.click(goButton);
      
      expect(onPageChange).toHaveBeenCalledWith(5);
    });

    it('should not call onPageChange with invalid page number (too high)', () => {
      const onPageChange = jest.fn();
      render(<PaginationComponent {...defaultProps} totalPages={10} onPageChange={onPageChange} />);
      
      const input = screen.getByPlaceholderText('Ir a') as HTMLInputElement;
      fireEvent.change(input, { target: { value: '15' } });
      
      const goButton = screen.getByText('Ir');
      fireEvent.click(goButton);
      
      expect(onPageChange).not.toHaveBeenCalled();
    });

    it('should not call onPageChange with invalid page number (zero)', () => {
      const onPageChange = jest.fn();
      render(<PaginationComponent {...defaultProps} onPageChange={onPageChange} />);
      
      const input = screen.getByPlaceholderText('Ir a') as HTMLInputElement;
      fireEvent.change(input, { target: { value: '0' } });
      
      const goButton = screen.getByText('Ir');
      fireEvent.click(goButton);
      
      expect(onPageChange).not.toHaveBeenCalled();
    });

    it('should call onPageChange when Enter key is pressed in input', () => {
      const onPageChange = jest.fn();
      render(<PaginationComponent {...defaultProps} onPageChange={onPageChange} />);
      
      const input = screen.getByPlaceholderText('Ir a') as HTMLInputElement;
      fireEvent.change(input, { target: { value: '5' } });
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });
      
      expect(onPageChange).toHaveBeenCalledWith(5);
    });

    it('should reset input to current page on invalid input', () => {
      const onPageChange = jest.fn();
      render(<PaginationComponent {...defaultProps} currentPage={3} onPageChange={onPageChange} />);
      
      const input = screen.getByPlaceholderText('Ir a') as HTMLInputElement;
      fireEvent.change(input, { target: { value: '15' } });
      
      const goButton = screen.getByText('Ir');
      fireEvent.click(goButton);
      
      expect(input.value).toBe('3');
    });
  });

  describe('Page Size Change', () => {
    it('should call onPageSizeChange when page size is changed', () => {
      const onPageSizeChange = jest.fn();
      render(<PaginationComponent {...defaultProps} onPageSizeChange={onPageSizeChange} />);
      
      const select = screen.getByDisplayValue('25') as HTMLSelectElement;
      fireEvent.change(select, { target: { value: '50' } });
      
      expect(onPageSizeChange).toHaveBeenCalledWith(50);
    });

    it('should display custom page size options', () => {
      const customOptions = [5, 15, 25];
      render(<PaginationComponent {...defaultProps} pageSizeOptions={customOptions} />);
      
      const select = screen.getByDisplayValue('25') as HTMLSelectElement;
      expect(select.options.length).toBe(3);
    });
  });

  describe('Loading State', () => {
    it('should disable all buttons when loading', () => {
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

    it('should show loading indicator when loading', () => {
      render(<PaginationComponent {...defaultProps} isLoading={true} />);
      
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle single page correctly', () => {
      render(<PaginationComponent {...defaultProps} currentPage={1} totalPages={1} />);
      
      const prevButton = screen.getByText('← Anterior') as HTMLButtonElement;
      const nextButton = screen.getByText('Siguiente →') as HTMLButtonElement;
      
      expect(prevButton.disabled).toBe(true);
      expect(nextButton.disabled).toBe(true);
    });

    it('should handle large page numbers', () => {
      render(<PaginationComponent {...defaultProps} currentPage={999} totalPages={1000} />);
      
      expect(screen.getByText(/Página 999 de 1000/)).toBeInTheDocument();
    });

    it('should update input when currentPage prop changes', () => {
      const { rerender } = render(<PaginationComponent {...defaultProps} currentPage={1} />);
      
      let input = screen.getByPlaceholderText('Ir a') as HTMLInputElement;
      expect(input.value).toBe('1');
      
      rerender(<PaginationComponent {...defaultProps} currentPage={5} />);
      
      input = screen.getByPlaceholderText('Ir a') as HTMLInputElement;
      expect(input.value).toBe('5');
    });
  });
});
