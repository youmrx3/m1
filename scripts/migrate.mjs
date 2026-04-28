📋 Supabase Setup Guide
========================

Your Supabase project is ready at:
https://vpwsgzpiwyhdfphrrexz.supabase.co

Follow these steps:

1. INITIALIZE DATABASE SCHEMA
   - Go to: https://app.supabase.com/project/vpwsgzpiwyhdfphrrexz/sql/new
   - Copy ALL content from: supabase/schema.sql in this project
   - Paste it into the SQL Editor
   - Click "Run" button
   - Check for any errors in the output

2. CREATE STORAGE BUCKET
   - Go to: Storage > Buckets in your Supabase dashboard
   - Create new bucket named "project_files"
   - Make it PUBLIC
   - Click "Save"

3. CREATE ADMIN USER
   - Go to: Authentication > Users in your Supabase dashboard
   - Click "Add user"
   - Enter email and password for the teacher/admin account
   - Click "Create user"

4. RESTART THE APP
   - The .env file is already configured
   - Refresh your browser or restart: npm run dev
   - Test at http://localhost:5173/admin/login

✅ You're all set!
