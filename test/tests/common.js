import { check } from 'k6';

export function CheckStatusOk(res) {
  const isOk = check(res, { 'HTTP status is 200': (r) => r.status === 200 });
  if (!isOk) {
    console.log(`Attempted ${res.headers['Ocp-Apim-Operationid']}. Unsuccessful. Response status ${res.status}. Please check trace ${res.headers['Ocp-Apim-Trace-Location']}`);
  }
}

export function CheckStatusCreated(res) {
  const isOk = check(res, { 'HTTP status is 201': (r) => r.status === 201 });
  if (!isOk) {
    console.log(`Attempted ${res.headers['Ocp-Apim-Operationid']}. Unsuccessful. Response status ${res.status}. Please check trace ${res.headers['Ocp-Apim-Trace-Location']}`);
  }
}

export function CheckStatusForbidden(res) {
  const isOk = check(res, { 'HTTP status is 401': (r) => r.status === 401 });
  if (!isOk) {
    console.log(`Attempted ${res.headers['Ocp-Apim-Operationid']}. Unsuccessful. Response status ${res.status}. Please check trace ${res.headers['Ocp-Apim-Trace-Location']}`);
  }
}

export function CheckStatusConflict(res) {
  const isOk = check(res, { 'HTTP status is 409': (r) => r.status === 409 });
  if (!isOk) {
    console.log(`Attempted ${res.headers['Ocp-Apim-Operationid']}. Unsuccessful. Response status ${res.status}. Please check trace ${res.headers['Ocp-Apim-Trace-Location']}`);
  }
}

export function CheckBodyLengthBetween(res, minLength, maxLength) {
  if (minLength > 0) {
    const isOk = check(res, {
      'body size is more than or equal to minLength': (r) => r.body.length >= minLength
    });
    if (!isOk) {
      console.log(`Response body length was ${res.body.length} (min ${maxLength})`);
    }
  }
  if (maxLength > 0) {
    const isOk = check(res, {
      'body size is less than or equal to maxLength': (r) => r.body.length <= maxLength
    });
    if (!isOk) {
      console.log(`Response body length was ${res.body.length} (max ${maxLength})`);
    }
  }
}

export function CheckBodyPgpPublicKey(res) {
  check(res, { 'Response body contains PGP public key header': (r) => r.body.includes('-----BEGIN PGP PUBLIC KEY BLOCK-----') });
}
