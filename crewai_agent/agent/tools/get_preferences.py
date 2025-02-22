from crewai.tools import BaseTool
from pydantic import BaseModel, Field

from schemas import CrewOutput, Response

class GetUserPreferencesTool(BaseTool):
    name: str = "Get User Preferences"
    description: str = "This tool processes nothing but it is used to return 'get_preferences' which is send to frontend to trigger the user preferences component. If check-in, check-out, location are not provided, it will return 'get_preferences' to frontend. Other wise skip this tool."

    def _run(self) -> CrewOutput:
        return CrewOutput(response=Response(), frontend_state="get_preferences").model_dump_json()
