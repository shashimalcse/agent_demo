from fastapi import Depends, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials, SecurityScopes
from jose import JWTError, jwt
from typing import List, Optional
from .constants import SCOPES

security = HTTPBearer()

def validate_scopes(
    security_scopes: SecurityScopes,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    if security_scopes.scopes:
        authenticate_value = f'Bearer scope="{security_scopes.scope_str}"'
    else:
        authenticate_value = "Bearer"

    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": authenticate_value},
    )

    try:
        token = credentials.credentials
        payload = jwt.decode(token, options={"verify_signature": False})
        token_scopes = payload.get("scopes", [])
        
        for scope in security_scopes.scopes:
            if scope not in token_scopes:
                raise HTTPException(
                    status_code=401,
                    detail="Not enough permissions",
                    headers={"WWW-Authenticate": authenticate_value},
                )
    except JWTError:
        raise credentials_exception
