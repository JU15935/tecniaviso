
-- Activate the admin user and assign admin role
UPDATE public.profiles SET is_active = true, updated_at = now() WHERE id = '2c4614c0-6732-4761-9a62-3767df49bcb4';

INSERT INTO public.user_roles (user_id, role) VALUES ('2c4614c0-6732-4761-9a62-3767df49bcb4', 'admin') ON CONFLICT (user_id, role) DO NOTHING;
