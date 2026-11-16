from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

class ResearchLensException(Exception):
    def __init__(self, message: str, status_code: int = 400, details: dict = None):
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)

class ResourceNotFoundException(ResearchLensException):
    def __init__(self, resource: str, resource_id: str):
        super().__init__(f"{resource} with ID '{resource_id}' was not found.", status_code=404)

class PermissionDeniedException(ResearchLensException):
    def __init__(self, message: str = "You do not have permission to access or modify this resource."):
        super().__init__(message, status_code=403)

class DuplicateResourceException(ResearchLensException):
    def __init__(self, message: str = "A resource with these attributes already exists."):
        super().__init__(message, status_code=409)

async def app_exception_handler(request: Request, exc: ResearchLensException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "type": "about:blank",
            "title": exc.__class__.__name__,
            "status": exc.status_code,
            "detail": exc.message,
            "details": exc.details,
            "path": str(request.url.path),
        }
    )

async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "type": "about:blank",
            "title": "HTTPException",
            "status": exc.status_code,
            "detail": exc.detail,
            "path": str(request.url.path),
        }
    )

async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "type": "about:blank",
            "title": "ValidationError",
            "status": 422,
            "detail": "Invalid request parameters or payload structure.",
            "errors": exc.errors(),
            "path": str(request.url.path),
        }
    )
