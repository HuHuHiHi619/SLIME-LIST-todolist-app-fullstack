$raw = [Console]::In.ReadToEnd()
try {
    $json = $raw | ConvertFrom-Json
    $path = $json.file_path
    if ($path -match '\.claude[/\\]history[/\\].+\.(md|txt|json)$') {
        Write-Host "BLOCKED: .claude/history is read-only. Use /task-done to archive."
        exit 1
    }
} catch {}
exit 0
