import os
from typing import Optional
from dotenv import load_dotenv
from langchain_openai import AzureChatOpenAI
from crew import create_crew
from utils.chat_history import ChatHistory
from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import jwt
from jwt.exceptions import InvalidTokenError
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()
app = FastAPI(title="LLM Chat API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()
chat_histories = {}
model = AzureChatOpenAI(model_version='gpt-4o-2024-11-20', 
                                    azure_endpoint=os.environ['AZURE_API_BASE'], 
                                    api_key=os.environ['AZURE_API_KEY'],
                                    azure_deployment=os.environ["DEPLOYMENT_NAME"],
                                    api_version='2024-08-01-preview')

# JWT configuration
JWT_SECRET = "a-string-secret-at-least-256-bits-long"  # Move this to environment variables in production
JWT_ALGORITHM = "HS256"

def get_user_from_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload.get("sub")
    except InvalidTokenError:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token"
        )

class ChatMessage(BaseModel):
    message: str

class ChatRequest(BaseModel):
    message: str

class Response(BaseModel):
    chat_response: Optional[str] = None
    tool_response: Optional[dict] = None

class ChatResponse(BaseModel):
    response: Response
    frontend_state: str

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, user_id: str = Depends(get_user_from_token)):
    try:
        user_message = request.message
        if user_id not in chat_histories:
            chat_histories[user_id] = ChatHistory()

        chat_history = chat_histories[user_id]
        chat_history.add_user_message(user_message)

        messages = [
            {"role": "system", "content": "You are a helpful assistant. Provide a self-contained question that incorporates all relevant context from the conversation. Do not try to answer the user message. You just have to rephrase the current user query if it is missing any context. Do it by referring to the history only."}
        ] + chat_history.get_messages()
        response = model.invoke(messages)
        crew_response = create_crew(response)
        crew_dict = crew_response.to_dict()
        chat_response = crew_dict.get('response', {})
        frontend_state = crew_dict.get('frontend_state', {})
        tool_response = chat_response.get("tool_response", {})
        tool_response_dict = tool_response.to_dict() if hasattr(tool_response, 'to_dict') else tool_response
        response = Response(
            chat_response=chat_response.get("chat_response", ""),
            tool_response=tool_response_dict
        )
        return ChatResponse(response=response, frontend_state=frontend_state)
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
