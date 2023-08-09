import { CONFIG } from '../dynamicScenarios/envVars.js'
import { importXk6File } from './utilsXk6.js'

const file = importXk6File()

export function writeString(filePath, body) {
    if (CONFIG.ENABLE_FILE_WRITING) {
        checkXk6ExtensionAvailability()
        file.writeString(filePath, body)
    }
}

export function appendString(filePath, string) {
    if (CONFIG.ENABLE_FILE_WRITING) {
        checkXk6ExtensionAvailability()
        file.appendString(filePath, string)
    }
}

function checkXk6ExtensionAvailability() {
    if (!file) {
        throw new Error("'xk6-file' extension is required to write file!")
    }
}
