import { createStaffUser, getStaffByUsername } from './db';

async function main() {
  const username = 'CUAHANGXEMAYTUANPHAT';
  const existing = await getStaffByUsername(username);
  
  if (!existing) {
    console.log('[Seed] Creating admin user...');
    await createStaffUser({
      id: 'admin-001',
      username: username,
      password: 'ADMIN123123@@',
      name: 'Admin Tuấn Phát',
      role: 'super_admin',
      department: 'both'
    });
    console.log('[Seed] Admin user created successfully!');
  } else {
    console.log('[Seed] Admin user already exists.');
  }
}

main().catch(console.error);
