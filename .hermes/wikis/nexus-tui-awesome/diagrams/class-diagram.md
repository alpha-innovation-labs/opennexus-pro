# Class Diagram

## Core Types

```mermaid
classDiagram
    class CLIEntry {
        +argv: string[]
        +runCli(argv) Promise~number~
        +runCliWithApp(argv) Promise~void~
    }
    
    class Runtime {
        +argv: string[]
        +runApp(argv) Promise~void~
        +runBundledApp(argv) Promise~void~
        +runAppWithExtensionFactories(factories) Promise~void~
    }
    
    class ExtensionFactory {
        <<interface>>
        +name: string
        +onStart() Promise~void~
        +onStop() Promise~void~
    }
    
    class MiniAppManifest {
        +name: string
        +category: string
        +enabled: boolean
        +devOnly: boolean
        +features: string[]
    }
    
    class FeatureFlags {
        +extensions: Map~string, ExtensionConfig~
        +isExtensionEnabled(name) boolean
        +getFeatures(name) string[]
    }
    
    class TelemetryService {
        +sendEvent(event) Promise~void~
        +sendTelemetryEventSafely(event) Promise~void~
        +sanitizeAttributes(attributes) SanitizedAttributes
    }
    
    CLIEntry --> Runtime : delegates to
    Runtime --> ExtensionFactory : creates
    Runtime --> MiniAppManifest : resolves
    Runtime --> FeatureFlags : checks
    Runtime --> TelemetryService : reports
    ExtensionFactory <|-- CoreExtension
    ExtensionFactory <|-- ProExtension
    ExtensionFactory <|-- DevExtension
```

## Notes

- ExtensionFactory is the core abstraction; all extensions implement this interface
- Three extension tiers: Core, Pro, Dev — selected at compile time
- MiniAppManifest is read from JSON and used for CLI routing
- FeatureFlags provides runtime evaluation of enabled/disabled state
- TelemetryService is the single telemetry entry point with safe/error handling
