# Adapter Registry

Register the `local_llm` adapter in Paperclip's adapter registry.

In your Paperclip installation, locate `server/src/adapters/registry.ts` and add:

```typescript
import { localLlmAdapter } from '/app/adapter/dist/index.js';

// In the registry object:
local_llm: localLlmAdapter
```

The adapter reads its instructions files from `/app/instructions/` — ensure the
`instructions/` directory is mounted at that path (see `docker-compose.yml`).
