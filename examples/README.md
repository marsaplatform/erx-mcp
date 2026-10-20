# ERX examples — أمثلة قابلة للتشغيل

Runnable examples against **Egypt Research Commons / مرصد مصر البحثي**.

- Hosted MCP endpoint: `https://egypt-research.marsaplatform.com/mcp`
- Hosted REST base: `https://egypt-research.marsaplatform.com/api/v1`
- The hosted MCP and REST API need a **free API key** (sign up at <https://egypt-research.marsaplatform.com/#signup>, then create a key in the dashboard). Export it as `ERX_API_KEY`. Self-hosted servers need no key.

See [`../docs/USAGE.md`](../docs/USAGE.md) for the full developer guide.

| File | What it does | Run |
|---|---|---|
| [`rest.sh`](./rest.sh) | curl calls: search, document, coverage, live data, RIS export | `./examples/rest.sh` |
| [`mcp-client.mjs`](./mcp-client.mjs) | Connects over Streamable HTTP with `@modelcontextprotocol/sdk`, lists tools, calls `egypt_search` | `node examples/mcp-client.mjs` |
| [`python_quickstart.py`](./python_quickstart.py) | stdlib-only `urllib` call to the REST search endpoint | `python3 examples/python_quickstart.py` |

## Point at a self-hosted instance

Each example accepts an environment override:

```bash
ERX_BASE=http://localhost:8080 ./examples/rest.sh
ERX_MCP_URL=http://localhost:8080/mcp node examples/mcp-client.mjs
ERX_BASE=http://localhost:8080 python3 examples/python_quickstart.py "حرية الصحافة"
```

Requirements: `bash` + `curl` (optionally `jq`) for `rest.sh`; Node `>=24` with the repo's
installed dependencies for `mcp-client.mjs`; Python `3` for `python_quickstart.py`.
