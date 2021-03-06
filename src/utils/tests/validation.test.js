import {
  isPositiveNumber,
  isValidMAC,
  validateDNS1123SubdomainValue,
  validateURL,
  validateContainer,
  getValidationObject,
  validateVmwareURL,
  validateBmcURL,
  validateVmLikeEntityName,
} from '../validations';
import {
  DNS1123_START_ERROR,
  DNS1123_END_ERROR,
  EMPTY_ERROR,
  DNS1123_TOO_LONG_ERROR,
  URL_INVALID_ERROR,
  END_WHITESPACE_ERROR,
  START_WHITESPACE_ERROR,
  BMC_PROTOCOL_ERROR,
  BMC_PORT_ERROR,
  VIRTUAL_MACHINE_EXISTS,
} from '../strings';
import { vm1, vm2 } from '../../tests/mocks/vm/vm_validation.mock';
import { validVmSettings } from '../../components/Wizard/CreateVmWizard/fixtures/VmSettingsTab.fixture';
import { NAMESPACE_KEY } from '../../components/Wizard/CreateVmWizard/constants';

const validatesEmpty = (validateFunction, message = EMPTY_ERROR) => {
  expect(validateFunction('')).toEqual(getValidationObject(message));
  expect(validateFunction(null)).toEqual(getValidationObject(message));
  expect(validateFunction(undefined)).toEqual(getValidationObject(message));
};

describe('validation.js - isPositiveNumber tests', () => {
  it('returns false for NaN', () => {
    expect(isPositiveNumber('abc')).toBeFalsy();
  });
  it('returns false for undefined and null', () => {
    expect(isPositiveNumber()).toBeFalsy();
    expect(isPositiveNumber(null)).toBeFalsy();
  });
  it('returns false for negative number', () => {
    expect(isPositiveNumber('-1')).toBeFalsy();
  });
  it('returns false for 0', () => {
    expect(isPositiveNumber('0')).toBeFalsy();
  });
  it('returns false for float', () => {
    expect(isPositiveNumber('1.2')).toBeFalsy();
    expect(isPositiveNumber('1,2')).toBeFalsy();
  });
  it('returns true for positive number', () => {
    expect(isPositiveNumber('1')).toBeTruthy();
  });
});

describe('validation.js - validateDNS1123SubdomainValue tests', () => {
  it('returns undefined for valid value', () => {
    expect(validateDNS1123SubdomainValue('abc')).toBeNull();
    expect(validateDNS1123SubdomainValue('1abc')).toBeNull();
    expect(validateDNS1123SubdomainValue('aab-c')).toBeNull();
    expect(validateDNS1123SubdomainValue('a'.repeat(253))).toBeNull();
  });
  it('returns warning for uppercase value', () => {
    expect(validateDNS1123SubdomainValue('Aabc')).toEqual(getValidationObject('Uppercase characters are not allowed.'));
  });
  it('returns message for too long value', () => {
    expect(validateDNS1123SubdomainValue('a'.repeat(254))).toEqual(getValidationObject(`${DNS1123_TOO_LONG_ERROR}.`));
  });
  it('returns message for empty value', () => {
    validatesEmpty(validateDNS1123SubdomainValue, `${EMPTY_ERROR}.`);
  });
  it('returns message for value which starts with invalid char', () => {
    expect(validateDNS1123SubdomainValue('_abc')).toEqual(
      getValidationObject('has to start with alphanumeric character. Underscore characters are not allowed.')
    );
    expect(validateDNS1123SubdomainValue('.abc')).toEqual(
      getValidationObject("has to start with alphanumeric character. '.' characters are not allowed.")
    );
    expect(validateDNS1123SubdomainValue('-abc')).toEqual(getValidationObject(`${DNS1123_START_ERROR}.`));
  });
  it('returns message for value which ends with invalid char', () => {
    expect(validateDNS1123SubdomainValue('abc_')).toEqual(
      getValidationObject('has to end with alphanumeric character. Underscore characters are not allowed.')
    );
    expect(validateDNS1123SubdomainValue('abc.')).toEqual(
      getValidationObject("has to end with alphanumeric character. '.' characters are not allowed.")
    );
    expect(validateDNS1123SubdomainValue('abc-')).toEqual(getValidationObject(`${DNS1123_END_ERROR}.`));
  });
  it('returns message for value which contains invalid char', () => {
    expect(validateDNS1123SubdomainValue('ab_c')).toEqual(
      getValidationObject('Underscore characters are not allowed.')
    );
    expect(validateDNS1123SubdomainValue('ab/c')).toEqual(getValidationObject("'/' characters are not allowed."));
    expect(validateDNS1123SubdomainValue('ab*c')).toEqual(getValidationObject("'*' characters are not allowed."));
    expect(validateDNS1123SubdomainValue('ab.c')).toEqual(getValidationObject("'.' characters are not allowed."));
  });
});

describe('validation.js - validateURL tests', () => {
  it('returns undefined for valid value', () => {
    expect(validateURL('http://hello.com')).toBeNull();
    expect(validateURL('http://hello.com/path/to/iso?aa=5&n=a')).toBeNull();
  });
  it('returns message for empty value', () => {
    validatesEmpty(validateURL);
  });
  it('returns message for value which starts or ends with whitespace character', () => {
    expect(validateURL(' http://hello.com')).toEqual(getValidationObject(START_WHITESPACE_ERROR));
    expect(validateURL('http://hello.com ')).toEqual(getValidationObject(END_WHITESPACE_ERROR));
  });
  it('returns message for invalid url', () => {
    expect(validateURL('abc')).toEqual(getValidationObject(URL_INVALID_ERROR));
    expect(validateURL('http://')).toEqual(getValidationObject(URL_INVALID_ERROR));
  });
});

describe('validation.js - validateContainer tests', () => {
  it('returns undefined for valid value', () => {
    expect(validateContainer('kubevirt/fedora-cloud-registry-disk-demo')).toBeNull();
  });
  it('returns message for empty value', () => {
    validatesEmpty(validateContainer);
  });
  it('returns message for value which starts or ends with whitespace character', () => {
    expect(validateContainer(' kubevirt/fedora-cloud-registry-disk-demo')).toEqual(
      getValidationObject(START_WHITESPACE_ERROR)
    );
    expect(validateContainer('kubevirt/fedora-cloud-registry-disk-demo ')).toEqual(
      getValidationObject(END_WHITESPACE_ERROR)
    );
  });
});

describe('validation.js - validateVmwareURL', () => {
  it('handles empty input', () => {
    validatesEmpty(validateVmwareURL);
  });
  it('handles whitespaces at start or end', () => {
    expect(validateVmwareURL(' http://hello.com')).toEqual(getValidationObject(START_WHITESPACE_ERROR));
    expect(validateVmwareURL('http://hello.com ')).toEqual(getValidationObject(END_WHITESPACE_ERROR));
  });
});

describe('validation.js - validateBmcURL', () => {
  it('handles empty input', () => {
    validatesEmpty(validateBmcURL);
  });

  it('starts with the correct protocol', () => {
    expect(validateBmcURL('ipmi://1.2.3.4:1234')).toBeNull();
    expect(validateBmcURL('idrac://1.2.3.4:1234')).toBeNull();
    expect(validateBmcURL('http://1.2.3.4:1234')).toEqual(getValidationObject(BMC_PROTOCOL_ERROR));
  });

  it('uses a numerical port', () => {
    expect(validateBmcURL('1.2.3.4:9000')).toBeNull();
    expect(validateBmcURL('ipmi://1.2.3.4:9000')).toBeNull();
    expect(validateBmcURL('1.2.3.4:abc')).toEqual(getValidationObject(BMC_PORT_ERROR));
    expect(validateBmcURL('ipmi://1.2.3.4:abc')).toEqual(getValidationObject(BMC_PORT_ERROR));
  });

  it('uses a valid hostname', () => {
    expect(validateBmcURL('1.2.3.4')).toBeNull();
    expect(validateBmcURL('example.com')).toBeNull();
    expect(validateBmcURL('@@@@')).toEqual(getValidationObject(URL_INVALID_ERROR));
  });
});

describe('validation.js - validateVmName', () => {
  const props = { virtualMachines: [vm1, vm2] };
  const vmSettings = validVmSettings;
  vmSettings[NAMESPACE_KEY].value = 'test-namespace';

  it('handles unique name', () => {
    expect(validateVmLikeEntityName('vm3', vmSettings, props)).toBeNull();
  });

  it('handles duplicate name', () => {
    expect(validateVmLikeEntityName('vm1', vmSettings, props)).toEqual(getValidationObject(VIRTUAL_MACHINE_EXISTS));
  });
});

describe('validation.js - isValidMAC', () => {
  const testConfig = [
    {
      title: 'returns true for a valid 6 octet MAC address with colon separator',
      mac: '01:23:45:67:89:ab',
      result: true,
    },
    {
      title: 'returns true for a valid 8 octet MAC address with colon separator',
      mac: '01:23:45:67:89:ab:cd:ef',
      result: true,
    },
    {
      title: 'returns true for a valid 20 octet MAC address with colon separator',
      mac: '01:23:45:67:89:ab:cd:ef:00:00:01:23:45:67:89:ab:cd:ef:00:00',
      result: true,
    },
    {
      title: 'returns true for a valid 6 octet MAC address with dash separator',
      mac: '01-23-45-67-89-ab',
      result: true,
    },
    {
      title: 'returns true for a valid 8 octet MAC address with dash separator',
      mac: '01-23-45-67-89-ab-cd-ef',
      result: true,
    },
    {
      title: 'returns true for a valid 20 octet MAC address with dash separator',
      mac: '01-23-45-67-89-ab-cd-ef-00-00-01-23-45-67-89-ab-cd-ef-00-00',
      result: true,
    },
    {
      title: 'returns true for a valid 3 quartet MAC address with period separator',
      mac: '0123.4567.89ab',
      result: true,
    },
    {
      title: 'returns true for a valid 4 quartet MAC address with period separator',
      mac: '0123.4567.89ab.cdef',
      result: true,
    },
    {
      title: 'returns true for a valid 10 quartet MAC address with period separator',
      mac: '0123.4567.89ab.cdef.0000.0123.4567.89ab.cdef.0000',
      result: true,
    },
    {
      title: 'returns true for a valid 8 octet MAC address with colon separator with uppercase characters',
      mac: '01:23:45:67:89:AB:CD:EF',
      result: true,
    },
    {
      title: 'returns true for a valid 8 octet MAC address with dash separator with uppercase characters',
      mac: '01-23-45-67-89-AB-CD-EF',
      result: true,
    },
    {
      title: 'returns true for a valid 4 quartet MAC address with period separator with uppercase characters',
      mac: '0123.4567.89AB.CDEF',
      result: true,
    },
    {
      title: 'returns false for an empty MAC address',
      mac: '',
      result: false,
    },
    {
      title: 'returns false for an invalid 2 octet MAC address with colon separator',
      mac: '01:23',
      result: false,
    },
    {
      title: 'returns false for an invalid 7 octet MAC address with colon separator',
      mac: '01:23:45:67:89:ab:cd',
      result: false,
    },
    {
      title: 'returns false for an invalid 9 octet MAC address with colon separator',
      mac: '01:23:45:67:89:ab:cd:ef:00',
      result: false,
    },
    {
      title: 'returns false for a MAC address with a non-hexidecimal character',
      mac: '01:23:45:67:89:ax',
      result: false,
    },
    {
      title: 'returns false for an invalid 5 quartet MAC address with period separator',
      mac: '0123.4567.89ab.cdef.0000',
      result: false,
    },
    {
      title: 'returns false for an invalid 11 quartet MAC address with period separator',
      mac: '0123.4567.89ab.cdef.0000.0123.4567.89ab.cdef.0000.0123',
      result: false,
    },
    {
      title: 'returns false for an invalid 6 octet MAC address with mixed separators',
      mac: '01:23-45-67:89:ab',
      result: false,
    },
  ];

  testConfig.forEach(c => {
    it(c.title, () => {
      expect(isValidMAC(c.mac)).toBe(c.result);
    });
  });
});
