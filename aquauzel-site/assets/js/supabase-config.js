/* ===================================================================
   AquaUzel — конфигурация Supabase.
   Эти значения ПУБЛИЧНЫЕ и безопасны для фронтенда:
   - URL проекта и anon-ключ предназначены для клиента;
   - доступ к данным ограничивается политиками RLS на стороне сервера
     (публичное чтение, запись только после входа администратора).
   Пароль администратора здесь НЕ хранится — вход проверяет Supabase Auth.

   Как заполнить: Supabase → Project Settings → API → Project URL и anon public key.
   Пока поля пустые — сайт работает на старом статическом прайсе (fallback).
   =================================================================== */
window.AQUA_SUPABASE = {
  url: "https://iscjjwahfvbtvzmgdtsm.supabase.co",       // напр. https://abcdefgh.supabase.co
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzY2pqd2FoZnZidHZ6bWdkdHNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2NzY1NTIsImV4cCI6MjA5NzI1MjU1Mn0.W_-6rvL4O7ogpMUss-2vwxP8UuJcuoJNIzl6XN3U2Cc",   // anon public key (длинная строка eyJ...)
  bucket: "product-images",
  // Служебный email для входа администратора (вы вводите его ОДИН раз при
  // создании пользователя в Supabase; на сайте вводится только пароль).
  adminEmail: "admin@aquauzel.kz"
};
