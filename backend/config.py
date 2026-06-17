from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
	database_url: str
	redis_url: str
	secret_key: str
	anthropic_api_key: str
	environment: str = "development"

	model_config = SettingsConfigDict(env_file=".env")

settings = Settings()