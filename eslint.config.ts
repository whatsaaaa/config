import whatsaaaa from '@whatsaaaa/eslint-config'

// Each fixture is linted with its own config, by the fixture tests
export default whatsaaaa({ ignores: ['fixtures/**'] })
