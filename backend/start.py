import os
import sys
import uvicorn


def resolve_port() -> int:
    raw = os.getenv('PORT', '8000').strip()
    try:
        port = int(raw)
    except ValueError:
        print(f"Invalid PORT value '{raw}'. Falling back to 8000.", file=sys.stderr)
        return 8000

    if 0 <= port <= 65535:
        return port

    print(f"PORT out of range ({port}). Falling back to 8000.", file=sys.stderr)
    return 8000


if __name__ == '__main__':
    uvicorn.run('app.main:app', host='0.0.0.0', port=resolve_port())
