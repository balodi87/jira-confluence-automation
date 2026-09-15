#!/usr/bin/env pwsh
# Minimal MCP server over stdio: exposes a single "echo" tool.

$ErrorActionPreference = 'Stop'

function Write-JsonRpc($obj) {
    $json = $obj | ConvertTo-Json -Depth 10 -Compress
    [Console]::Out.Write($json + "`n")
    [Console]::Out.Flush()
}

while ($true) {
    $line = [Console]::In.ReadLine()
    if ($null -eq $line) { break }
    if ([string]::IsNullOrWhiteSpace($line)) { continue }

    try {
        $request = $line | ConvertFrom-Json
    } catch {
        continue
    }

    $id = $request.id
    $method = $request.method

    switch ($method) {
        'initialize' {
            Write-JsonRpc @{
                jsonrpc = '2.0'
                id      = $id
                result  = @{
                    protocolVersion = '2024-11-05'
                    capabilities    = @{ tools = @{} }
                    serverInfo      = @{ name = 'echo-windows'; version = '1.0.0' }
                }
            }
        }
        'tools/list' {
            Write-JsonRpc @{
                jsonrpc = '2.0'
                id      = $id
                result  = @{
                    tools = @(
                        @{
                            name        = 'echo'
                            description = 'Echoes back the provided text'
                            inputSchema = @{
                                type       = 'object'
                                properties = @{ text = @{ type = 'string' } }
                                required   = @('text')
                            }
                        }
                    )
                }
            }
        }
        'tools/call' {
            $toolName = $request.params.name
            $text = $request.params.arguments.text
            if ($toolName -eq 'echo') {
                Write-JsonRpc @{
                    jsonrpc = '2.0'
                    id      = $id
                    result  = @{
                        content = @(@{ type = 'text'; text = $text })
                    }
                }
            } else {
                Write-JsonRpc @{
                    jsonrpc = '2.0'
                    id      = $id
                    error   = @{ code = -32601; message = "Unknown tool: $toolName" }
                }
            }
        }
        'notifications/initialized' {
            # no response needed for notifications
        }
        default {
            if ($id) {
                Write-JsonRpc @{
                    jsonrpc = '2.0'
                    id      = $id
                    error   = @{ code = -32601; message = "Method not found: $method" }
                }
            }
        }
    }
}
