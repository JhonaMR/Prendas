const os = require('os');

/**
 * Detect all available network interfaces on the machine
 * @returns {Object} Object with interface names as keys and address arrays as values
 */
function detectNetworkInterfaces() {
  return os.networkInterfaces();
}

/**
 * Extract IPv4 addresses from network interfaces
 * @param {Object} interfaces - Network interfaces object from os.networkInterfaces()
 * @returns {Array<string>} Array of IPv4 addresses
 */
function extractIPv4Addresses(interfaces) {
  const ipv4Addresses = [];

  for (const interfaceName in interfaces) {
    const addresses = interfaces[interfaceName];
    for (const address of addresses) {
      // Only extract IPv4 addresses (family === 'IPv4')
      if (address.family === 'IPv4') {
        ipv4Addresses.push(address.address);
      }
    }
  }

  return ipv4Addresses;
}

/**
 * Filter out loopback addresses (127.0.0.1)
 * @param {Array<string>} addresses - Array of IPv4 addresses
 * @returns {Array<string>} Array of non-loopback IPv4 addresses
 */
function filterLoopbackAddresses(addresses) {
  return addresses.filter(address => address !== '127.0.0.1');
}

/**
 * Select the primary IP address based on priority
 * Priority: Ethernet > WiFi > Other
 * @param {Object} interfaces - Network interfaces object
 * @returns {string|null} Selected IP address or null if only loopback available
 */
function selectPrimaryIP(interfaces) {
  // Extract all IPv4 addresses
  const allAddresses = extractIPv4Addresses(interfaces);

  // Filter out loopback addresses
  const nonLoopbackAddresses = filterLoopbackAddresses(allAddresses);

  // If we have non-loopback addresses, prioritize by interface type
  if (nonLoopbackAddresses.length > 0) {
    // Try to find Ethernet interface first (priority 1)
    for (const interfaceName in interfaces) {
      if (interfaceName.toLowerCase().includes('ethernet')) {
        const addresses = interfaces[interfaceName];
        for (const address of addresses) {
          if (address.family === 'IPv4' && address.address !== '127.0.0.1') {
            return address.address;
          }
        }
      }
    }

    // Try to find WiFi interface (priority 2)
    for (const interfaceName in interfaces) {
      if (interfaceName.toLowerCase().includes('wifi') || interfaceName.toLowerCase().includes('wlan')) {
        const addresses = interfaces[interfaceName];
        for (const address of addresses) {
          if (address.family === 'IPv4' && address.address !== '127.0.0.1') {
            return address.address;
          }
        }
      }
    }

    // Return the first non-loopback address found (priority 3)
    return nonLoopbackAddresses[0];
  }

  // No non-loopback addresses found, return null
  return null;
}

/**
 * Get the appropriate database host based on environment
 * @param {string} nodeEnv - NODE_ENV value (development, production, staging)
 * @returns {string} Database host (detected IP or localhost)
 */
function getDatabaseHost(nodeEnv) {
  // Get network interfaces
  const interfaces = detectNetworkInterfaces();

  // Select primary IP
  const detectedIP = selectPrimaryIP(interfaces);

  // Apply NODE_ENV-specific rules
  if (nodeEnv === 'production') {
    // In production, use detected IP if available, otherwise localhost
    return detectedIP || 'localhost';
  } else if (nodeEnv === 'staging') {
    // In staging, use detected IP if available, otherwise localhost
    return detectedIP || 'localhost';
  } else {
    // In development (or any other mode), use localhost by default
    return 'localhost';
  }
}

module.exports = {
  detectNetworkInterfaces,
  extractIPv4Addresses,
  filterLoopbackAddresses,
  selectPrimaryIP,
  getDatabaseHost,
};
