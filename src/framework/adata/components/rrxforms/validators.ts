export default class Validators {

  static required(value: any) {
    if (Array.isArray(value) || typeof value === 'string' || value === 0) {
      if (value?.length > 0) return null;
    }
    if (Array.isArray(value)) {
      if (value.length) return null;
    } else if (value || value === 0) {
      return null;
    }
    return { required: true };
  }

  static minLength(minLength: number) {
    return (value: any) => {
      if (Array.isArray(value) || typeof value === 'string' || value === 0) {
        if (value?.length >= minLength) return null;
      }
      return { min_length: true };
    };
  }

  static minLengthOrNull(minLength: number) {
    return (value: any) => {
      if (value === undefined || value === '') return null;
      if (Array.isArray(value) || typeof value === 'string' || value === 0) {
        if (value?.length >= minLength) return null;
      }
      return { min_length: true };
    };
  }

  static minMax(min: number, max: number) {
    return (value: any) => {
      if (Array.isArray(value) || typeof value === 'string' || value === 0) {
        if (value?.length >= min && value?.length <= max) return null;
      }
      return { min_max: true };
    };
  }

  static cid(value: any) {
    const re = /^\d{13}$/;
    if (value && re.test(value.toString())) {
      return null;
    }
    return { cid: true };
  }

  static numberAboveZeroOrEmpty(value: any) {
    const theValue = parseInt(value);
    if (value === undefined || value === null || value === '') return null;
    if (!isNaN(theValue) && theValue > 0) return null;
    return { invalid_number: true };
  }

  static laterThan(checkField: any) {
    return (value: any, formValue: any) => {
      if (Date.parse(value) <= Date.parse(formValue[checkField])) {
        return { later_than: true };
      }
      return null;
    };
  }

  static numberOnly(value: any) {
    if (/^\d+$/.test(value)) {
      return null;
    }
    return { number_only: true };
  }
}
