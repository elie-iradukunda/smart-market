# Fix for React Router Routes Not Working

## Problem
Routes like `https://topdesignltd.lanari.rw/dashboard/admin` return 404 errors.

## Root Cause
React Router handles routing on the client-side, but when you directly access a URL like `/dashboard/admin`, the server tries to find that file/folder. Since it doesn't exist, it returns 404.

## Solutions

### Option 1: Apache (.htaccess) - If using Apache/XAMPP

1. **Ensure `.htaccess` file exists in your deployed `dist/` folder** with this content:
```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]
```

2. **Enable mod_rewrite in Apache:**
   - Open `httpd.conf` in XAMPP
   - Find: `#LoadModule rewrite_module modules/mod_rewrite.so`
   - Remove the `#` to uncomment it
   - Find: `<Directory "D:/XAMPP/htdocs">` (or your htdocs path)
   - Change `AllowOverride None` to `AllowOverride All`
   - Restart Apache

3. **Verify the file is uploaded** to your server's root directory

### Option 2: Nginx - If using Nginx

Add this to your Nginx server block:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### Option 3: Express.js - If serving from Node.js

If your backend is serving the frontend, add this to your Express app:
```javascript
app.use(express.static('dist'));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
```

## Verification Steps

1. Build the frontend: `cd frontend && npm run build`
2. Check that `dist/.htaccess` exists
3. Upload the entire `dist/` folder to your server
4. Test: `https://topdesignltd.lanari.rw/dashboard/admin`

## Common Issues

- **.htaccess not working**: Check Apache error logs, ensure mod_rewrite is enabled
- **Still getting 404**: Verify the file is in the correct directory on the server
- **Using Nginx**: Use the Nginx configuration instead of .htaccess


