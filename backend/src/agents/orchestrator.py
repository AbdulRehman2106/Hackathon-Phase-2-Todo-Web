"""
Agent orchestrator for AI chatbot.

This module coordinates between Cohere API and MCP tools,
managing the conversation flow and tool execution.
"""

import logging
from typing import List, Dict, Any, Optional
from src.agents.cohere_client import cohere_client
from src.mcp.server import mcp_server

logger = logging.getLogger(__name__)


class AgentOrchestrator:
    """
    Orchestrates AI agent interactions with tool-calling support.

    This orchestrator:
    1. Sends messages to Cohere API
    2. Receives tool call decisions
    3. Validates and executes tools via MCP server
    4. Returns results to continue conversation
    """

    def __init__(self):
        self.cohere = cohere_client
        self.mcp = mcp_server

    async def run(
        self,
        messages: List[Dict[str, str]],
        user_id: int,
        db: Any = None
    ) -> Dict[str, Any]:
        """
        Run the agent with conversation history.

        Args:
            messages: List of conversation messages
            user_id: Authenticated user ID for tool execution
            db: Database session for tool execution

        Returns:
            Dictionary with response and tool execution results
        """
        try:
            # Get available tools from MCP server
            tools = self.mcp.list_tools()

            logger.info(f"Running agent with {len(messages)} messages and {len(tools)} tools")

            # Call Cohere API
            result = await self.cohere.chat(messages=messages, tools=tools)

            response_text = result["response"]
            tool_calls = result["tool_calls"]

            # If no tool calls, return response directly
            if not tool_calls:
                logger.info("No tool calls in response")
                return {
                    "response": response_text,
                    "tool_calls": [],
                    "tool_results": []
                }

            # Execute tool calls
            tool_results = []
            for tool_call in tool_calls:
                if not self.cohere.validate_tool_call(tool_call):
                    logger.warning(f"Invalid tool call structure: {tool_call}")
                    continue

                tool_name = tool_call["name"]
                parameters = tool_call["parameters"]

                # Inject user_id into parameters for security
                parameters["user_id"] = user_id

                try:
                    logger.info(f"Executing tool: {tool_name}")
                    tool_result = await self.mcp.execute_tool(tool_name, parameters, db=db)
                    tool_results.append({
                        "tool": tool_name,
                        "result": tool_result
                    })
                except Exception as e:
                    logger.error(f"Tool execution failed: {tool_name} - {str(e)}")
                    tool_results.append({
                        "tool": tool_name,
                        "result": {
                            "success": False,
                            "message": f"Tool execution failed: {str(e)}"
                        }
                    })

            # Generate final response incorporating tool results
            final_response = await self._generate_final_response(
                messages,
                response_text,
                tool_results
            )

            return {
                "response": final_response,
                "tool_calls": tool_calls,
                "tool_results": tool_results
            }

        except Exception as e:
            logger.error(f"Agent orchestration failed: {str(e)}")
            raise

    async def _generate_final_response(
        self,
        messages: List[Dict[str, str]],
        initial_response: str,
        tool_results: List[Dict[str, Any]]
    ) -> str:
        """
        Generate final response incorporating tool execution results.

        Args:
            messages: Original conversation messages
            initial_response: Initial AI response with tool calls
            tool_results: Results from tool executions

        Returns:
            Final response text
        """
        # If no tool results, return initial response
        if not tool_results:
            return initial_response

        # Build context with tool results
        tool_context = "\n".join([
            f"Tool {tr['tool']}: {tr['result'].get('message', 'Executed')}"
            for tr in tool_results
        ])

        # Create follow-up message to generate natural response
        follow_up_messages = messages + [
            {"role": "assistant", "content": initial_response},
            {"role": "user", "content": f"Tool execution results:\n{tool_context}\n\nProvide a natural language response to the user based on these results."}
        ]

        try:
            result = await self.cohere.chat(messages=follow_up_messages, tools=None)
            return result["response"]
        except Exception as e:
            logger.error(f"Failed to generate final response: {str(e)}")
            # Fallback to tool results summary
            return f"Operation completed. {tool_context}"


# Global orchestrator instance
orchestrator = AgentOrchestrator()
