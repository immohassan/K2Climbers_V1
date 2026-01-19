# Troubleshooting Guide

## Prisma Generation Error on Windows

### Error: `EPERM: operation not permitted`

This error occurs when Prisma tries to generate the client but can't overwrite files that are locked by another process.

### Solutions (try in order):

#### 1. **Stop All Node Processes**
```powershell
# Stop any running Next.js dev server
# Press Ctrl+C in the terminal where npm run dev is running

# Or kill all node processes:
taskkill /F /IM node.exe
```

#### 2. **Close VS Code/IDE**
Sometimes your IDE locks the files. Close VS Code/Cursor completely and try again.

#### 3. **Delete .prisma Folder and Regenerate**
```powershell
# Delete the Prisma client folder
Remove-Item -Recurse -Force node_modules\.prisma

# Then regenerate
npm run db:generate
```

#### 4. **Run as Administrator**
```powershell
# Right-click PowerShell and "Run as Administrator", then:
cd D:\K2Climbers
npm run db:generate
```

#### 5. **Disable Antivirus Temporarily**
Some antivirus software locks DLL files. Temporarily disable it, run the command, then re-enable.

#### 6. **Clean Install**
```powershell
# Remove node_modules and reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
npm run db:generate
```

#### 7. **Use Prisma CLI Directly**
```powershell
npx prisma generate --schema=./prisma/schema.prisma
```

### Quick Fix Script

Create a file `fix-prisma.ps1`:
```powershell
# Stop node processes
taskkill /F /IM node.exe 2>$null

# Remove Prisma client
if (Test-Path "node_modules\.prisma") {
    Remove-Item -Recurse -Force node_modules\.prisma
}

# Regenerate
npm run db:generate
```

Run it with:
```powershell
.\fix-prisma.ps1
```

## Other Common Issues

### Database Connection Error
- Verify PostgreSQL is running
- Check DATABASE_URL in .env
- Ensure database exists: `CREATE DATABASE k2climbers;`

### Port Already in Use
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Module Not Found
```powershell
# Clear cache and reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm cache clean --force
npm install
```
