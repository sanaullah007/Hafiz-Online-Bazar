# Email + phone sign-in configuration

This Expo Android app uses Supabase Auth with persisted sessions.

1. Create a Supabase project at https://supabase.com/dashboard.
2. In Authentication > Providers, enable **Email**, and configure email confirmation and delivery.
3. In Authentication > Providers > Phone, enable Phone and configure an SMS provider and delivery limits. Phone login needs real SMS verification; without an SMS provider it cannot work.
4. In your local .env file (never commit secrets), or GitHub Actions/EAS build environment, set:
   - EXPO_PUBLIC_SUPABASE_URL
   - EXPO_PUBLIC_SUPABASE_ANON_KEY (public client key, not service_role secret).
5. Reinstall dependencies (npm install) and rebuild APK. For GitHub Actions, expose both environment variables during the Expo build.
6. Test signup, email confirmation, phone OTP, login, logout, password reset, and session persistence on a real Android device.

Never put the Supabase service_role key in this application. Supabase database row-level security must be configured separately before storing private customer profiles or orders.

Phone logins use the phone and password after verification. Password recovery for phone sends an SMS login code; implement password change via a signed-in user flow if needed. Email reset relies on correct email redirect/deep-link settings.

The marketplace catalog and orders are still demo-only; auth does not create a production backend for products or payments.
