var checkType = function (value, validTypesOrValues)  {
  var validTypes, valideValues;

  // Validate type
  var validateType = function (value, types) {
    if (types === null) return true;
    if (!Array.isArray(types)) {
      throw new TypeError('`types` must be an Array.');
    }
    for (var i = 0; i < types.length; i += 1) {
      if (types[i] === 'array') {
        if (Array.isArray(value)) return true;
      } else if (types[i] === 'null') {
        if (value === null) return true;
      } else {
        if (typeof value === types[i]) return true;
      }
    }
    return false;
  };

  var validateValue = function (value, values) {
    if (values === null) return true;
    if (!Array.isArray(values)) {
      throw new TypeError('`values` must be an Array.');
    }
    for (var i = 0; i < values.length; i += 1) {
      if (values[i] === value){
        return true;
      }
    }
    return false;
  };

  var getPropertyValue = function (obj, propertyName) {
    if (obj[propertyName] === undefined) {
      return null;
    } else if (Array.isArray(obj[propertyName])) {
      return obj[propertyName];
    } else if (obj[propertyName]) {
      return [obj[propertyName]];
    } else {
      throw new TypeError('The `values` property must be an array');
    }
  };

  // Check the arguments
  if (Array.isArray(validTypesOrValues)) {
    validTypes = validTypesOrValues;
    validValues = null;
  } else if (typeof validTypesOrValues === 'object' && validTypesOrValues !== null) {
    if (validTypesOrValues.types === undefined && validTypesOrValues === undefined) {
      throw new Error('`validTypesOrValues` must have a `types` or `values` property');
    }
    validValues = getPropertyValue(validTypesOrValues, 'value');
    validTypes = getPropertyValue(validTypesOrValues, 'types');
  } else if (typeof validTypesOrValues === 'string') {
    validTypes = [validTypesOrValues];
    validValues = null;
  } else {
    throw new TypeError('`validTypesOrValues` must be an `Array`, `String` or `Object`');
  }

  // Compare
  if (!validateValue(value, validValues)) {
    throw new TypeError('Variable with value `' + value + '` expected to be of value `' + validValues + '`');
  }
  if (!validateType(value, validTypes)) {
    throw new TypeError('Variable of type `' + typeof value + '` expected to be of type `' + validTypes + '`');
  }
  return true;
};

module.exports = checkType;
