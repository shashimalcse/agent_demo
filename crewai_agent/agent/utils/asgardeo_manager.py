import logging
import os
from typing import Dict, List, Optional
import uuid
import requests
from pydantic import BaseModel

logger = logging.getLogger(__name__)

class ChatThread(BaseModel):
    thread_id: str
    user_id: str

class AuthToken(BaseModel):
    id: str
    scopes: List[str]
    token: str

class AuthCode(BaseModel):
    user_id: str
    code: str
    scopes: List[str]

class AsgardeoManager:
    """
    Manages OAuth2 authentication flow and token management
    """

    def __init__(self):
        # Initialize OAuth2 configuration
        self.client_id = os.environ['CLIENT_ID']
        self.client_secret = os.environ['CLIENT_SECRET']
        self.token_url = os.environ['TOKEN_URL']
        self.authorize_url = os.environ['AUTHORIZE_URL']
        self.redirect_uri = os.environ['REDIRECT_URI']

        self.auth_codes: Dict[str, AuthCode] = {}  # Store AuthCode by session_id
        self.auth_tokens: Dict[str, AuthToken] = {}  # Store AuthToken by token_id

    def store_auth_code(self, user_id: str, code: str):
            """Store authentication code and user_id"""
            code_entry:AuthCode = self.get_auth_code(user_id)
            if not code_entry:
                raise ValueError("No auth code found for user")
            code_entry.code = code
            self.auth_codes[user_id] = code_entry

    def get_auth_code(self, user_id: str) -> Optional[AuthCode]:
        """Retrieve the AuthCode for a user_id"""
        return self.auth_codes.get(user_id)        

    def get_authorization_url(self, user_id: str, scopes: List[str] = ["openid"]) -> str:
            """
            Generate the authorization URL for the OAuth2 flow matching the exact format provided,
            with scopes passed as a list
            """
            try:

                scopes_str = " ".join(scopes)
                nonce = str(uuid.uuid4())[:16]

                authorization_url = (
                    f"{self.authorize_url}?"
                    f"client_id={self.client_id}&"
                    f"redirect_uri={self.redirect_uri}&"
                    f"scope={scopes_str}&" 
                    f"response_type=code&"
                    f"response_mode=query&"
                    f"state={nonce}&"
                    f"nonce={nonce}"
                )

                # Store auth code entry
                auth_code = AuthCode(user_id=user_id, code=None, scopes=scopes)
                self.auth_codes[self.get_token_key(user_id, scopes)] = auth_code
                return authorization_url
            except Exception as e:
                raise

    def fetch_user_token(self, user_id: str) -> str:
        """
        Exchange authorization code for access token
        """
        code_entry:AuthCode = self.get_auth_code(user_id)
        if not code_entry:
            raise ValueError("No auth code found for user")
        try:
            response = requests.post(
                self.token_url,
                data={
                    "grant_type": "authorization_code",
                    "code": code_entry.code,
                    "scope": " ".join(code_entry.scopes),
                    "redirect_uri": self.redirect_uri,
                    "client_id": self.client_id,
                    "client_secret": self.client_secret
                }
            )
            data = response.json()
            return data.get("access_token")
        except Exception as e:
            print(e)
            raise

    def fetch_app_token(self, scopes: List[str]) -> str:
        """
        Get an access token for the app
        """
        try:
            response = requests.post(
                self.token_url,
                data={
                    "grant_type": "client_credentials",
                    "scope": " ".join(scopes),
                    "client_id": self.client_id,
                    "client_secret": self.client_secret
                }
            )
            data = response.json()
            return data.get("access_token")
        except Exception as e:
            raise        

    def get_app_token(self, scopes: List[str]) -> str:
        """
        Get valid m2m token.
        """
        token_entry:AuthToken = self.auth_tokens.get(self.get_token_key("m2m", scopes))
        if token_entry:
            return token_entry.token
        fetch_token = self.fetch_app_token(scopes)
        token = AuthToken(id="m2m", scopes=scopes, token=fetch_token)
        self.auth_tokens[self.get_token_key("m2m", scopes)] = token
        return fetch_token
    
    def get_user_token(self, user_id: str, scopes: List[str]) -> str:
        """
        Get valid m2m token.
        """
        token_key = self.get_token_key(user_id, scopes)
        token_entry:AuthToken = self.auth_tokens[token_key]
        if token_entry:
            return token_entry.token
        fetch_token = self.get_user_token(scopes)
        token = AuthToken(id=user_id, scopes=scopes, token=fetch_token)
        self.auth_tokens[token_key] = token
        return fetch_token
    
    def get_token_key(self, id: str, scopes: List[str]) -> str:
        """
        Get token key from id and scopes
        """
        return id+'_'+"_".join(scopes)


asgardeo_manager = AsgardeoManager()
