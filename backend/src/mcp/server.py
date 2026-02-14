"""
MCP (Model Context Protocol) Server for AI Chatbot.

This module initializes and manages MCP tools that the AI can use
to interact with the task management system.
"""

import logging
from typing import Dict, Any, Callable, List
from pydantic import BaseModel

logger = logging.getLogger(__name__)


class MCPTool(BaseModel):
    """Base model for MCP tool definition."""
    name: str
    description: str
    parameters: Dict[str, Any]
    function: Any  # Will be the actual callable


class MCPServer:
    """
    MCP Server managing tool registration and execution.

    This server acts as a registry for tools that the AI can invoke.
    All tools must be registered before they can be used.
    """

    def __init__(self, name: str = "todo-tools", version: str = "1.0.0"):
        self.name = name
        self.version = version
        self.tools: Dict[str, MCPTool] = {}
        logger.info(f"MCP Server initialized: {name} v{version}")

    def register_tool(
        self,
        name: str,
        description: str,
        parameters: Dict[str, Any],
        function: Callable
    ):
        """
        Register a new tool with the MCP server.

        Args:
            name: Tool name (must be unique)
            description: Human-readable description of what the tool does
            parameters: JSON schema describing the tool's parameters
            function: The actual function to execute when tool is called
        """
        if name in self.tools:
            logger.warning(f"Tool '{name}' already registered, overwriting")

        tool = MCPTool(
            name=name,
            description=description,
            parameters=parameters,
            function=function
        )
        self.tools[name] = tool
        logger.info(f"Registered tool: {name}")

    def get_tool(self, name: str) -> MCPTool:
        """Get a registered tool by name."""
        if name not in self.tools:
            raise ValueError(f"Tool '{name}' not found in MCP server")
        return self.tools[name]

    def list_tools(self) -> List[Dict[str, Any]]:
        """
        List all registered tools in Cohere-compatible format.

        Returns:
            List of tool definitions for Cohere API
        """
        return [
            {
                "name": tool.name,
                "description": tool.description,
                "parameter_definitions": tool.parameters
            }
            for tool in self.tools.values()
        ]

    async def execute_tool(
        self,
        tool_name: str,
        parameters: Dict[str, Any],
        db: Any = None
    ) -> Dict[str, Any]:
        """
        Execute a registered tool with given parameters.

        Args:
            tool_name: Name of the tool to execute
            parameters: Parameters to pass to the tool
            db: Database session to pass to the tool

        Returns:
            Tool execution result as dictionary
        """
        tool = self.get_tool(tool_name)

        try:
            logger.info(f"Executing tool: {tool_name} with params: {parameters}")
            # Pass database session to tool
            result = await tool.function(**parameters, db=db)
            logger.info(f"Tool {tool_name} executed successfully")
            return result
        except Exception as e:
            logger.error(f"Tool {tool_name} execution failed: {str(e)}")
            raise


# Global MCP server instance
mcp_server = MCPServer()
