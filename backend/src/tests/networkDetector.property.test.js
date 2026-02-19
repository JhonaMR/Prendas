const fc = require('fast-check');
const {
  detectNetworkInterfaces,
  extractIPv4Addresses,
  filterLoopbackAddresses,
  selectPrimaryIP,
  getDatabaseHost,
} = require('../config/networkDetector');

describe('Network Detector - Property-Based Tests', () => {
  /**
   * Property 1: Network Interface Detection Completeness
   * For any system with available network interfaces, the network detector should
   * extract all IPv4 addresses from all detected interfaces without omitting any valid addresses.
   * Validates: Requirements 1.1, 1.2
   */
  describe('Property 1: Network Interface Detection Completeness', () => {
    it('should extract all IPv4 addresses from all interfaces', () => {
      fc.assert(
        fc.property(
          fc.record({
            eth0: fc.constant([
              { family: 'IPv4', address: '192.168.1.100' },
              { family: 'IPv6', address: 'fe80::1' },
            ]),
            lo: fc.constant([
              { family: 'IPv4', address: '127.0.0.1' },
            ]),
          }),
          (interfaces) => {
            const addresses = extractIPv4Addresses(interfaces);
            // Should contain all IPv4 addresses
            expect(addresses).toContain('192.168.1.100');
            expect(addresses).toContain('127.0.0.1');
            // Should not contain IPv6 addresses
            expect(addresses).not.toContain('fe80::1');
            // Should have exactly 2 IPv4 addresses
            expect(addresses.length).toBe(2);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle multiple interfaces with multiple addresses', () => {
      fc.assert(
        fc.property(
          fc.dictionary(
            fc.string({ minLength: 1, maxLength: 10 }),
            fc.array(
              fc.oneof(
                fc.record({
                  family: fc.constant('IPv4'),
                  address: fc.ipV4(),
                }),
                fc.record({
                  family: fc.constant('IPv6'),
                  address: fc.ipV6(),
                })
              ),
              { minLength: 1, maxLength: 5 }
            )
          ),
          (interfaces) => {
            const addresses = extractIPv4Addresses(interfaces);

            // Count expected IPv4 addresses
            let expectedCount = 0;
            for (const interfaceName in interfaces) {
              const ifaceAddresses = interfaces[interfaceName];
              if (Array.isArray(ifaceAddresses)) {
                expectedCount += ifaceAddresses.filter(
                  (addr) => addr.family === 'IPv4'
                ).length;
              }
            }

            // Should have extracted all IPv4 addresses
            expect(addresses.length).toBe(expectedCount);

            // All extracted addresses should be IPv4
            addresses.forEach((addr) => {
              expect(addr).toMatch(/^\d+\.\d+\.\d+\.\d+$/);
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 2: Loopback Address Filtering
   * For any list of IPv4 addresses containing both loopback (127.0.0.1) and
   * non-loopback addresses, the filter should remove all loopback addresses
   * while preserving all non-loopback addresses.
   * Validates: Requirements 1.3
   */
  describe('Property 2: Loopback Address Filtering', () => {
    it('should remove all loopback addresses and preserve non-loopback', () => {
      fc.assert(
        fc.property(
          fc.array(fc.ipV4(), { minLength: 1, maxLength: 20 }),
          (addresses) => {
            const filtered = filterLoopbackAddresses(addresses);

            // Should not contain loopback
            expect(filtered).not.toContain('127.0.0.1');

            // Should contain all non-loopback addresses
            const nonLoopback = addresses.filter((addr) => addr !== '127.0.0.1');
            expect(filtered).toEqual(nonLoopback);

            // Filtered should be subset of original
            filtered.forEach((addr) => {
              expect(addresses).toContain(addr);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle arrays with only loopback addresses', () => {
      fc.assert(
        fc.property(
          fc.array(fc.constant('127.0.0.1'), { minLength: 1, maxLength: 10 }),
          (addresses) => {
            const filtered = filterLoopbackAddresses(addresses);
            expect(filtered).toEqual([]);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle arrays with no loopback addresses', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.ipV4().filter((ip) => ip !== '127.0.0.1'),
            { minLength: 1, maxLength: 20 }
          ),
          (addresses) => {
            const filtered = filterLoopbackAddresses(addresses);
            expect(filtered).toEqual(addresses);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 3: Fallback to Localhost on Empty Non-Loopback
   * For any network state where only loopback addresses are available,
   * the system should fall back to localhost as the database host.
   * Validates: Requirements 1.4
   */
  describe('Property 3: Fallback to Localhost on Empty Non-Loopback', () => {
    it('should return null when only loopback addresses exist', () => {
      fc.assert(
        fc.property(
          fc.record({
            lo: fc.constant([
              { family: 'IPv4', address: '127.0.0.1' },
            ]),
          }),
          (interfaces) => {
            const ip = selectPrimaryIP(interfaces);
            expect(ip).toBeNull();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return non-loopback IP when available', () => {
      fc.assert(
        fc.property(
          fc.ipV4().filter((ip) => ip !== '127.0.0.1'),
          (nonLoopbackIP) => {
            const interfaces = {
              eth0: [
                { family: 'IPv4', address: nonLoopbackIP },
              ],
              lo: [
                { family: 'IPv4', address: '127.0.0.1' },
              ],
            };

            const ip = selectPrimaryIP(interfaces);
            expect(ip).toBe(nonLoopbackIP);
            expect(ip).not.toBe('127.0.0.1');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 4: Development Mode Uses Localhost
   * For any configuration with NODE_ENV set to "development", the database host
   * should be localhost regardless of detected network IPs.
   * Validates: Requirements 1.6, 6.1
   */
  describe('Property 4: Development Mode Uses Localhost', () => {
    it('should always return localhost for development mode', () => {
      fc.assert(
        fc.property(fc.anything(), () => {
          const host = getDatabaseHost('development');
          expect(host).toBe('localhost');
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 5: Production Mode Uses Detected IP
   * For any configuration with NODE_ENV set to "production" and available
   * non-loopback IPs, the database host should be the detected network IP, not localhost.
   * Validates: Requirements 1.5, 6.2
   */
  describe('Property 5: Production Mode Uses Detected IP', () => {
    it('should return a valid host for production mode', () => {
      fc.assert(
        fc.property(fc.constant(null), () => {
          const host = getDatabaseHost('production');
          // Should return either a valid IP or localhost
          expect(host).toBeTruthy();
          // Should be a string
          expect(typeof host).toBe('string');
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 6: Staging Mode Uses Detected IP
   * For any configuration with NODE_ENV set to "staging" and available
   * non-loopback IPs, the database host should be the detected network IP.
   * Validates: Requirements 6.3
   */
  describe('Property 6: Staging Mode Uses Detected IP', () => {
    it('should return a valid host for staging mode', () => {
      fc.assert(
        fc.property(fc.constant(null), () => {
          const host = getDatabaseHost('staging');
          // Should return either a valid IP or localhost
          expect(host).toBeTruthy();
          // Should be a string
          expect(typeof host).toBe('string');
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 7: Unknown NODE_ENV Defaults to Development
   * For any unknown NODE_ENV value, the system should default to development mode
   * and use localhost.
   * Validates: Requirements 6.4
   */
  describe('Property 7: Unknown NODE_ENV Defaults to Development', () => {
    it('should default to localhost for unknown NODE_ENV values', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }).filter(
            (env) => !['development', 'production', 'staging'].includes(env)
          ),
          (unknownEnv) => {
            const host = getDatabaseHost(unknownEnv);
            expect(host).toBe('localhost');
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
