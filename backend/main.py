import sys

major, minor = sys.version_info[:2]
if (major, minor) < (3, 10):
    raise RuntimeError(
        f"Python 3.10+ required, current version: {sys.version}"
    )

from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from routes.v1 import all_v1_routers
from ws import router as ws_router

app = FastAPI(title="Restaurant API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://localhost:5174", 
        "http://127.0.0.1:5173",
        "http://localhost:3000",   
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_router = APIRouter(prefix="/api")

for router in all_v1_routers:
    api_router.include_router(router, prefix="/v1")

api_router.include_router(ws_router, prefix="/v1")

@api_router.get("/test")
async def test():
    return {"status": "ok"}


# mount API router
app.include_router(api_router)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)