// Central place mapping a user's role to their landing dashboard route.
// Keeping this in one spot avoids scattered role ternaries across the app.
export const dashboardPathForRole = (role) => {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'owner':
      return '/owner/dashboard';
    case 'tenant':
    default:
      return '/tenant/dashboard';
  }
};
