-- Sinema & Dizi Yorum Platformu - Supabase Şeması
-- Bu SQL'i Supabase Dashboard > SQL Editor'da çalıştır

-- Profiller tablosu (auth.users'a bağlı)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null,
  avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Yorumlar tablosu
create table if not exists public.reviews (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  media_id integer not null,
  media_type text check (media_type in ('film', 'dizi')) not null,
  rating integer check (rating >= 1 and rating <= 10) not null,
  content text not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique(user_id, media_id, media_type)
);

-- İndeksler
create index if not exists reviews_media_idx on public.reviews(media_id, media_type);
create index if not exists reviews_user_idx on public.reviews(user_id);

-- RLS (Row Level Security) aç
alter table public.profiles enable row level security;
alter table public.reviews enable row level security;

-- Profil politikaları
create policy "Herkes profilleri görebilir"
  on public.profiles for select using (true);

create policy "Kullanıcı kendi profilini oluşturabilir"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Kullanıcı kendi profilini güncelleyebilir"
  on public.profiles for update using (auth.uid() = id);

-- Yorum politikaları
create policy "Herkes yorumları görebilir"
  on public.reviews for select using (true);

create policy "Giriş yapmış kullanıcı yorum ekleyebilir"
  on public.reviews for insert with check (auth.uid() = user_id);

create policy "Kullanıcı kendi yorumunu güncelleyebilir"
  on public.reviews for update using (auth.uid() = user_id);

create policy "Kullanıcı kendi yorumunu silebilir"
  on public.reviews for delete using (auth.uid() = user_id);

-- Yeni kullanıcı kaydında otomatik profil oluştur
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
