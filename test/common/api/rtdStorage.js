import http from 'k6/http'

const API_PREFIX = '/pagopastorage'
const AZURE_BLOB_STORAGE_X_MS_BLOB_TYPE_HEADER = 'BlockBlob'
const AZURE_BLOB_STORAGE_X_MS_VERSION_HEADER = '2020-12-06'

export function putBlob(baseUrl, params, container, blob, payload, sas) {
    params.headers['Content-Type'] = 'application/octect-stream'
    params.headers['x-ms-blob-type'] = AZURE_BLOB_STORAGE_X_MS_BLOB_TYPE_HEADER
    params.headers['x-ms-version'] = AZURE_BLOB_STORAGE_X_MS_VERSION_HEADER
    const res = http.put(
        `${baseUrl}${API_PREFIX}/${container}/${blob}?${sas}`,
        payload,
        params
    )
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(res, null, 2))
    return res
}
