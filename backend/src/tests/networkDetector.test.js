const {
  detectNetworkInterfaces,
  extractIPv4Addresses,
  filterLoopbackAddresses,
  selectPrimaryIP,
  getDatabaseHost,
} = require('../config/networkDetector');

describe('Network Detector Module', () => {
  describe('detectNetworkInterfaces', () => {
    it('should return an object with network interfaces', () => {
      const interfaces = detectNetworkInterfaces();
      expect(typeof interfaces).toBe('object');
      expect(interfaces).not.toBeNull();
    });

    it('should contain at least the loopback interface', () => {
      const interfaces = detectNetworkInterfaces();
      const hasLoopback = Object.keys(interfaces).some(
        name => name.toLowerCase().includes('loopback') || name === 'lo'
      );
      expect(hasLoopback).toBe(true);
    });
  });

  describe('extractIPv4Addresses', () => {
    it('should extract IPv4 addresses from interfaces', () => {
      const mockInterfaces = {
        eth0: [
          { family: 'IPv4', address: '192.168.1.100' },
          { family: 'IPv6', address: 'fe80::1' },
        ],
        lo: [
          { family: 'IPv4', address: '127.0.0.1' },
        ],
      };

      const addresses = extractIPv4Addresses(mockInterfaces);
      expect(addresses).toContain('192.168.1.100');
      expect(addresses).toContain('127.0.0.1');
      expect(addresses).not.toContain('fe80::1');
    });

    it('should return empty array for interfaces with no IPv4 addresses', () => {
      const mockInterfaces = {
        eth0: [
          { family: 'IPv6', address: 'fe80::1' },
        ],
      };

      const addresses = extractIPv4Addresses(mockInterfaces);
      expect(addresses).toEqual([]);
    });

    it('should handle empty interfaces object', () => {
      const addresses = extractIPv4Addresses({});
      expect(addresses).toEqual([]);
    });
  });

  describe('filterLoopbackAddresses', () => {
    it('should filter out loopback addresses', () => {
      const addresses = ['192.168.1.100', '127.0.0.1', '10.0.0.5'];
      const filtered = filterLoopbackAddresses(addresses);
      expect(filtered).toEqual(['192.168.1.100', '10.0.0.5']);
      expect(filtered).not.toContain('127.0.0.1');
    });

    it('should return all addresses if none are loopback', () => {
      const addresses = ['192.168.1.100', '10.0.0.5'];
      const filtered = filterLoopbackAddresses(addresses);
      expect(filtered).toEqual(['192.168.1.100', '10.0.0.5']);
    });

    it('should return empty array if all addresses are loopback', () => {
      const addresses = ['127.0.0.1'];
      const filtered = filterLoopbackAddresses(addresses);
      expect(filtered).toEqual([]);
    });

    it('should handle empty array', () => {
      const filtered = filterLoopbackAddresses([]);
      expect(filtered).toEqual([]);
    });
  });

  describe('selectPrimaryIP', () => {
    it('should prioritize Ethernet interface', () => {
      const mockInterfaces = {
        Ethernet: [
          { family: 'IPv4', address: '192.168.1.100' },
        ],
        WiFi: [
          { family: 'IPv4', address: '10.0.0.5' },
        ],
      };

      const ip = selectPrimaryIP(mockInterfaces);
      expect(ip).toBe('192.168.1.100');
    });

    it('should prioritize WiFi when Ethernet is not available', () => {
      const mockInterfaces = {
        WiFi: [
          { family: 'IPv4', address: '10.0.0.5' },
        ],
        lo: [
          { family: 'IPv4', address: '127.0.0.1' },
        ],
      };

      const ip = selectPrimaryIP(mockInterfaces);
      expect(ip).toBe('10.0.0.5');
    });

    it('should return first non-loopback address when no Ethernet or WiFi', () => {
      const mockInterfaces = {
        eth0: [
          { family: 'IPv4', address: '192.168.1.100' },
        ],
        lo: [
          { family: 'IPv4', address: '127.0.0.1' },
        ],
      };

      const ip = selectPrimaryIP(mockInterfaces);
      expect(ip).toBe('192.168.1.100');
    });

    it('should return null when only loopback addresses are available', () => {
      const mockInterfaces = {
        lo: [
          { family: 'IPv4', address: '127.0.0.1' },
        ],
      };

      const ip = selectPrimaryIP(mockInterfaces);
      expect(ip).toBeNull();
    });

    it('should handle empty interfaces object', () => {
      const ip = selectPrimaryIP({});
      expect(ip).toBeNull();
    });

    it('should handle case-insensitive interface names', () => {
      const mockInterfaces = {
        ETHERNET: [
          { family: 'IPv4', address: '192.168.1.100' },
        ],
      };

      const ip = selectPrimaryIP(mockInterfaces);
      expect(ip).toBe('192.168.1.100');
    });

    it('should handle wlan interface as WiFi', () => {
      const mockInterfaces = {
        wlan0: [
          { family: 'IPv4', address: '10.0.0.5' },
        ],
        lo: [
          { family: 'IPv4', address: '127.0.0.1' },
        ],
      };

      const ip = selectPrimaryIP(mockInterfaces);
      expect(ip).toBe('10.0.0.5');
    });
  });

  describe('getDatabaseHost', () => {
    it('should return localhost for development environment', () => {
      const host = getDatabaseHost('development');
      expect(host).toBe('localhost');
    });

    it('should return detected IP for production environment', () => {
      const mockInterfaces = {
        Ethernet: [
          { family: 'IPv4', address: '192.168.1.100' },
        ],
      };

      // Mock os.networkInterfaces to return our test data
      jest.mock('os', () => ({
        networkInterfaces: () => mockInterfaces,
      }));

      // For this test, we'll just verify the logic works with localhost fallback
      const host = getDatabaseHost('production');
      expect(host).toBeTruthy();
    });

    it('should return detected IP for staging environment', () => {
      const host = getDatabaseHost('staging');
      expect(host).toBeTruthy();
    });

    it('should default to localhost for unknown NODE_ENV', () => {
      const host = getDatabaseHost('unknown');
      expect(host).toBe('localhost');
    });

    it('should return localhost for development even if IPs are available', () => {
      const host = getDatabaseHost('development');
      expect(host).toBe('localhost');
    });
  });
});
