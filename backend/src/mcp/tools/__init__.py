"""
MCP Tools initialization and registration.

This module registers all MCP tools with the server on import.
"""

import logging
from src.mcp.server import mcp_server
from src.mcp.tools.add_task import add_task_tool
from src.mcp.tools.list_tasks import list_tasks_tool
from src.mcp.tools.complete_task import complete_task_tool
from src.mcp.tools.delete_task import delete_task_tool
from src.mcp.tools.update_task import update_task_tool

logger = logging.getLogger(__name__)


def register_all_tools():
    """Register all MCP tools with the server."""

    # Register add_task tool (User Story 1)
    mcp_server.register_tool(
        name=add_task_tool.name,
        description=add_task_tool.description,
        parameters=add_task_tool.parameters,
        function=add_task_tool.execute
    )

    # Register list_tasks tool (User Story 2)
    mcp_server.register_tool(
        name=list_tasks_tool.name,
        description=list_tasks_tool.description,
        parameters=list_tasks_tool.parameters,
        function=list_tasks_tool.execute
    )

    # Register complete_task tool (User Story 3)
    mcp_server.register_tool(
        name=complete_task_tool.name,
        description=complete_task_tool.description,
        parameters=complete_task_tool.parameters,
        function=complete_task_tool.execute
    )

    # Register delete_task tool (User Story 4)
    mcp_server.register_tool(
        name=delete_task_tool.name,
        description=delete_task_tool.description,
        parameters=delete_task_tool.parameters,
        function=delete_task_tool.execute
    )

    # Register update_task tool (User Story 5)
    mcp_server.register_tool(
        name=update_task_tool.name,
        description=update_task_tool.description,
        parameters=update_task_tool.parameters,
        function=update_task_tool.execute
    )

    logger.info("All 5 MCP tools registered successfully")


# Auto-register tools on import
register_all_tools()
