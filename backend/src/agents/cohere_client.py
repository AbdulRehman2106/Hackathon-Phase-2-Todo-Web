"""
Cohere client service for AI chatbot.

This module provides a wrapper around the Cohere API with:
- API key management
- Retry logic for transient failures
- Timeout handling
- Structured logging
- Token usage tracking
"""

import os
import logging
import time
from typing import List, Dict, Any, Optional
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type
)
import cohere
from cohere.errors import TooManyRequestsError, ServiceUnavailableError

logger = logging.getLogger(__name__)


class CohereClient:
    """
    Cohere API client with retry logic and structured logging.

    This client is specifically configured for the AI chatbot use case
    with deterministic temperature and tool-calling support.
    """

    def __init__(self):
        """Initialize Cohere client with environment configuration."""
        self.api_key = os.getenv("COHERE_API_KEY")
        if not self.api_key:
            raise ValueError("COHERE_API_KEY not found in environment variables")

        self.model = os.getenv("COHERE_MODEL", "command-r-plus")
        self.temperature = float(os.getenv("COHERE_TEMPERATURE", "0.3"))
        self.max_tokens = int(os.getenv("COHERE_MAX_TOKENS", "2000"))
        self.timeout = int(os.getenv("COHERE_TIMEOUT", "30"))

        # Initialize Cohere client
        self.client = cohere.ClientV2(self.api_key)
        logger.info(f"Cohere client initialized with model: {self.model}")

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type((TooManyRequestsError, ServiceUnavailableError))
    )
    async def chat(
        self,
        messages: List[Dict[str, str]],
        tools: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        Send chat request to Cohere API with retry logic.

        Args:
            messages: List of message dictionaries with 'role' and 'content'
            tools: Optional list of tool definitions for tool-calling

        Returns:
            Dictionary containing response and tool calls (if any)

        Raises:
            Exception: If API call fails after retries
        """
        start_time = time.time()

        try:
            logger.info(f"Sending chat request to Cohere (model: {self.model})")
            logger.debug(f"Messages: {len(messages)}, Tools: {len(tools) if tools else 0}")

            response = self.client.chat(
                model=self.model,
                messages=messages,
                temperature=self.temperature,
                max_tokens=self.max_tokens,
                tools=tools if tools else None
            )

            latency = time.time() - start_time

            # Debug: Print full response structure
            logger.info(f"Cohere response received: {response}")
            logger.info(f"Response dict: {response.__dict__ if hasattr(response, '__dict__') else 'No dict'}")

            # Extract response content
            response_text = ""
            if hasattr(response, 'message') and hasattr(response.message, 'content') and response.message.content:
                for item in response.message.content:
                    if hasattr(item, 'text'):
                        response_text = item.text
                        break

            # Extract tool calls if present
            tool_calls = []
            if hasattr(response.message, 'tool_calls') and response.message.tool_calls:
                import json
                for tool_call in response.message.tool_calls:
                    try:
                        # Parse JSON string arguments into dictionary
                        arguments = json.loads(tool_call.function.arguments) if isinstance(tool_call.function.arguments, str) else tool_call.function.arguments
                        tool_calls.append({
                            "name": tool_call.function.name,
                            "parameters": arguments
                        })
                    except json.JSONDecodeError as e:
                        logger.error(f"Failed to parse tool call arguments: {e}")
                        continue

            # Log metrics
            logger.info(f"Cohere API call successful (latency: {latency:.2f}s)")
            if hasattr(response, 'usage'):
                logger.info(f"Token usage - Input: {response.usage.tokens.input_tokens}, "
                          f"Output: {response.usage.tokens.output_tokens}")

            return {
                "response": response_text,
                "tool_calls": tool_calls,
                "latency": latency
            }

        except TooManyRequestsError as e:
            logger.warning(f"Rate limit hit: {str(e)}")
            raise
        except ServiceUnavailableError as e:
            logger.error(f"Cohere service unavailable: {str(e)}")
            raise
        except Exception as e:
            import traceback
            logger.error(f"Cohere API call failed: {str(e)}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            raise

    def validate_tool_call(self, tool_call: Dict[str, Any]) -> bool:
        """
        Validate that a tool call has the required structure.

        Args:
            tool_call: Tool call dictionary to validate

        Returns:
            True if valid, False otherwise
        """
        if not isinstance(tool_call, dict):
            return False

        if "name" not in tool_call or "parameters" not in tool_call:
            return False

        if not isinstance(tool_call["name"], str):
            return False

        if not isinstance(tool_call["parameters"], dict):
            return False

        return True


# Global Cohere client instance
cohere_client = CohereClient()
