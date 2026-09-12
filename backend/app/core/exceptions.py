from fastapi import HTTPException, status

class ServiceNotConfiguredError(HTTPException):
    def __init__(self, service_name: str):
        super().__init__(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail=f"Service '{service_name}' is not configured or not implemented."
        )

class ConfigurationError(HTTPException):
    def __init__(self, message: str):
        super().__init__(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Configuration error: {message}"
        )
