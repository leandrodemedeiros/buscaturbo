-- ============================================================
-- BuscaTurbo — Schema para o Supabase
-- Execute este SQL em: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- 1. Tabela principal de veículos
CREATE TABLE IF NOT EXISTS public.vehicles (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_date     timestamptz NOT NULL DEFAULT now(),
  updated_date     timestamptz NOT NULL DEFAULT now(),
  created_by       text,                          -- email do usuário que criou

  -- Identificação
  title            text NOT NULL,
  brand            text NOT NULL,
  model            text NOT NULL,
  version          text,
  year_fabrication integer,
  year_model       integer NOT NULL,

  -- Preço e km
  price            numeric NOT NULL,
  mileage          numeric,

  -- Características técnicas
  fuel             text CHECK (fuel IN ('gasolina','etanol','flex','diesel','eletrico','hibrido')),
  transmission     text CHECK (transmission IN ('manual','automatico','automatizado','cvt')),
  color            text,
  doors            integer,
  engine           text,
  horsepower       numeric,
  torque           numeric,
  acceleration_0_100 numeric,
  top_speed        numeric,
  drivetrain       text CHECK (drivetrain IN ('fwd','rwd','awd','4wd')),
  platform         text,

  -- Classificação
  category         text NOT NULL CHECK (category IN ('passeio','colecionador','esportivo')),
  body_type        text CHECK (body_type IN ('sedan','hatch','suv','pickup','coupe','conversivel','wagon','van')),
  condition        text CHECK (condition IN ('novo','seminovo','usado')),
  seller_type      text CHECK (seller_type IN ('particular','loja','concessionaria')),

  -- Localização
  location_city    text,
  location_state   text,

  -- Arrays
  special_features text[],
  features         text[],
  images           text[],

  -- Destaque
  is_featured      boolean DEFAULT false
);

-- 2. Índices para performance nas buscas
CREATE INDEX IF NOT EXISTS vehicles_category_idx      ON public.vehicles (category);
CREATE INDEX IF NOT EXISTS vehicles_brand_idx         ON public.vehicles (brand);
CREATE INDEX IF NOT EXISTS vehicles_price_idx         ON public.vehicles (price);
CREATE INDEX IF NOT EXISTS vehicles_year_model_idx    ON public.vehicles (year_model);
CREATE INDEX IF NOT EXISTS vehicles_created_by_idx    ON public.vehicles (created_by);
CREATE INDEX IF NOT EXISTS vehicles_created_date_idx  ON public.vehicles (created_date DESC);
CREATE INDEX IF NOT EXISTS vehicles_is_featured_idx   ON public.vehicles (is_featured);

-- 3. Trigger para atualizar updated_date automaticamente
CREATE OR REPLACE FUNCTION public.set_updated_date()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_date = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS vehicles_updated_date ON public.vehicles;
CREATE TRIGGER vehicles_updated_date
  BEFORE UPDATE ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_date();

-- 4. Row Level Security (RLS)
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa pode VER os anúncios (marketplace público)
CREATE POLICY "Veículos são públicos para leitura"
  ON public.vehicles FOR SELECT
  USING (true);

-- Apenas o dono pode CRIAR seus anúncios
CREATE POLICY "Usuário autenticado cria veículos"
  ON public.vehicles FOR INSERT
  WITH CHECK (auth.jwt() ->> 'email' = created_by OR created_by IS NULL);

-- Apenas o dono pode EDITAR seus anúncios
CREATE POLICY "Dono edita seu veículo"
  ON public.vehicles FOR UPDATE
  USING (auth.jwt() ->> 'email' = created_by);

-- Apenas o dono pode DELETAR seus anúncios
CREATE POLICY "Dono deleta seu veículo"
  ON public.vehicles FOR DELETE
  USING (auth.jwt() ->> 'email' = created_by);

-- ============================================================
-- PRONTO! Agora configure o Storage (ver DEPLOY_GUIDE.md)
-- ============================================================
