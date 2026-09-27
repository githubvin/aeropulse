import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "AeroPulse BRICS"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", os.getenv("GEMINI_API_KEY", ""))
    
    # Atmospheric & Physics Simulation Defaults
    DEFAULT_LOOKBACK_HOURS: float = 3.0
    DEFAULT_CONE_ANGLE_DEG: float = 20.0
    DEFAULT_DIFFUSIVITY: float = 25.0  # m^2/s
    PBL_HEIGHT_DEFAULT: float = 500.0  # meters
    
    # Supported BRICS Corridors
    SUPPORTED_CORRIDORS: list[str] = [
        "indo-gangetic",
        "highveld-basin",
        "pan-amazonian",
        "jing-jin-ji",
        "eurasian-boreal"
    ]

settings = Settings()
