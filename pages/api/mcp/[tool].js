// API Route für MCP Tools
// Leitet Requests an MCP Server weiter

export default async function handler(req, res) {
  const { tool } = req.query;

  // Importiere MCP Tools dynamisch
  const { executeMCPTool } = await import('../../../mcp-server/index.js');

  try {
    const result = await executeMCPTool(tool, req.body || {});
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
