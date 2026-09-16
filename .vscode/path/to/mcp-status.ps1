#!/usr/bin/env pwsh

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
                    serverInfo      = @{ name = 'status-local'; version = '1.0.0' }
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
                            name        = 'status'
                            description = 'Returns a Module 13 MCP verification status message'
                            inputSchema = @{
                                type       = 'object'
                                properties = @{}
                            }
                        }
                    )
                }
            }
        }
        'tools/call' {
            $toolName = $request.params.name
            if ($toolName -eq 'status') {
                Write-JsonRpc @{
                    jsonrpc = '2.0'
                    id      = $id
                    result  = @{
                        content = @(@{ type = 'text'; text = 'Module 13 MCP status server responded successfully.' })
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